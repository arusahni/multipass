/* eslint-disable class-methods-use-this */
/* globals createElement, compareByField, removeIfExists */

/**
 * Get the best (prefix) match for a given site's path
 */
const getPathPrefixMatch = (sites, siteURL, defaultToShortest = false) => {
  const sitePath = new URL(siteURL).pathname.toUpperCase();
  const sorted = sites.sort((site1, site2) => {
    const path1 = new URL(site1.url).pathname.toUpperCase();
    const path2 = new URL(site2.url).pathname.toUpperCase();
    if (sitePath.startsWith(path1) && sitePath.startsWith(path2)) { // if both match
      return path2.length - path1.length; // sort by longest match
    } else if (sitePath.startsWith(path1)) {
      return -1; // keep Site 1 ahead of Site 2
    } else if (sitePath.startsWith(path2)) {
      return 1; // swap Site 1 after Site 2
    }
    return path1.length - path2.length; // worst case, sort ascending by path length
  });
  if (sitePath.startsWith(new URL(sorted[0].url).pathname.toUpperCase()) || // match found
    defaultToShortest) { // If no matches exist, the first element is the one w/the shortest path
    return sorted[0];
  }
  return null; // No match
};

/**
 * Check to see if there's a record for the site, and, if so, return the best match.
 */
const checkSite = (site) => {
  try {
    const url = MULTIPASS.parseDomain(site.url);
    if (url === null) {
      Console.warn('Unrecognized TLD', site);
      return null;
    }
    const siteData = MULTIPASS.siteData.sites[`${url.domain}.${url.tld}`];
    if (typeof siteData === 'undefined') {
      return null;
    }
    if (siteData.length === 1) {
      return siteData[0];
    }
    const blanks = siteData.filter(siteRecord => ['', 'www'].includes(siteRecord.subdomain.toLowerCase()));
    const subdomainMatches = siteData
      .filter(record => url.subdomain.toUpperCase().endsWith(record.subdomain.toUpperCase()));
    if (subdomainMatches.length === 0) {
      return getPathPrefixMatch(blanks, site.url, true); // If no match, get by shortest path match
    } else if (subdomainMatches.length === 1) {
      return subdomainMatches[0];
    } // Multiple subdomain matches, check out paths
    return getPathPrefixMatch(subdomainMatches, site.url);
  } catch (e) {
    Console.error('Failed to parse site', site, e);
    // TODO: Bubble this up to the user somehow and remove the null catch-all
  }
  return null;
};

const MFANames = {
  hardware: 'Hardware',
  software: 'Software',
  email: 'E-mail',
  sms: 'SMS',
  phone: 'Phone Call',
};

class MultipassSite {
  constructor(siteRecord, url, username) {
    ({
      doc: this.info,
      email: this.email,
      exceptions: this.exceptions,
      hardware: this.hardware,
      name: this.name,
      phone: this.phone,
      sms: this.sms,
      software: this.software,
      url: this.domain,
    } = siteRecord);
    this.url = url;
    this.usernames = [username];
  }

  getSupportedMethodNames() {
    return Object.keys(MFANames).reduce((supported, method) => {
      if (this[method]) supported.push(MFANames[method]);
      return supported;
    }, []);
  }

  render() {
    let moreInfo;
    if (this.info) {
      moreInfo = createElement('div', ['more-info'], { title: 'More info' }, createElement('img', [], { src: chrome.extension.getURL('res/info.svg') }));
      moreInfo.onclick = () => {
        window.open(this.info, '_blank');
        return false;
      };
    }
    let exceptions;
    if (this.exceptions) {
      exceptions = createElement('span', ['exceptions'], { title: this.exceptions.text }, '*');
    }
    const container = document.createElement('div');
    container.classList.add('multipass-site');
    /* eslint-disable function-paren-newline */
    container.appendChild(createElement(
      'a', [], { href: this.url, target: '_blank' }, createElement(
        'div', ['site-details'], {}, [createElement(
          'div', ['title-row'], {}, [createElement(
            'div', ['title'], { title: this.name }, [
              `${this.name} `,
              createElement('span', ['domain'], {}, `(${this.domain})`),
            ],
          ), moreInfo,
          ],
        ), createElement(
          'div', ['methods'], { title: 'MFA Methods' }, [
            this.getSupportedMethodNames().join(', '),
            exceptions,
          ],
        ), createElement(
          'div', ['usernames'], { title: `Usernames:\n${this.usernames.join('\n')}` }, this.usernames.join(', ')),
        ])));
    /* eslint-enable function-paren-newline */
    return container;
  }
}

class LastPass {
  constructor() {
    this.initStyles();
    this.initButton();
    this.initModal();
  }

  getSites() {
    const script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(`
      if (typeof LPProxy !== "undefined") {
        var models = LPProxy.getSiteModels().map(function(model){ return {url: model._data.url, name: model._data.name, username: model._data.unencryptedUsername}; });
        document.getElementsByTagName("body")[0].setAttribute("tmp_models", JSON.stringify(models));
      }
    `));
    (document.body || document.head || document.documentElement).appendChild(script);

    const models = JSON.parse(document.getElementsByTagName('body')[0].getAttribute('tmp_models'));
    document.getElementsByTagName('body')[0].removeAttribute('tmp_models');
    document.getElementById('tmpScript').remove();

    return models;
  }

  run() {
    try {
      this.showModal();
      const sites = this.getSites().reduce((supported, site) => {
        const match = checkSite(site);
        if (match !== null) {
          if (typeof supported[match.url] !== 'undefined') {
            supported[match.url].usernames.push(site.username);
          } else {
            supported[match.url] = new MultipassSite(match, site.url, site.username);
          }
        }
        return supported;
      }, {});
      this.setModalSites(Object.values(sites));
    } catch (e) {
      Console.error('Failed to get sites', e);
    }
  }

  showModal() {
    document.getElementById('multipassOverlay').classList.remove('closed');
    document.getElementById('multipassModal').classList.remove('closed');
  }

  hideModal() {
    document.getElementById('multipassOverlay').classList.add('closed');
    document.getElementById('multipassModal').classList.add('closed');
  }

  setModalSites(sites) {
    const container = document.getElementById('multipassModalContent');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    for (const site of sites.sort(compareByField('name'))) {
      try {
        container.appendChild(site.render());
      } catch (e) {
        Console.error('Failed to render site', site, e);
      }
    }
  }

  initButton() {
    removeIfExists('#multipassMenuItem');
    let menu = document.querySelector('#leftMenuItems .no-omaria');
    if (menu.offsetParent === null) { //  If no-omaria isn't visible, use the other
      // not sure what the 'omaria' / 'no-omaria' distinction is.
      menu = document.querySelector('#leftMenuItems .omaria');
    }
    const menuItem = document.createElement('div');
    menuItem.id = 'multipassMenuItem';
    menuItem.classList.add('leftMenuItem');
    menuItem.onclick = () => this.run();

    const menuIcon = document.createElement('div');
    menuIcon.classList.add('menuIcon');
    menuIcon.title = 'Multipass';
    menuItem.appendChild(menuIcon);

    const menuText = document.createElement('p');
    menuText.classList.add('menuText');
    menuText.innerHTML = 'Multipass';
    menuItem.appendChild(menuText);

    menu.appendChild(menuItem);
  }

  initModal() {
    removeIfExists('#multipassOverlay');
    removeIfExists('#multipassModal');
    const overlay = document.createElement('div');
    overlay.id = 'multipassOverlay';
    overlay.classList.add('closed');
    overlay.onclick = () => this.hideModal();
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.id = 'multipassModal';
    modal.classList.add('closed');

    const titleBar = document.createElement('div');
    titleBar.id = 'multipassModalTitlebar';
    titleBar.innerHTML = '<div class="title">Sites Supporting 2FA</div><div class="close-button">&times;</div>';
    titleBar.querySelector('.close-button').onclick = () => this.hideModal();
    modal.appendChild(titleBar);

    const modalContent = document.createElement('div');
    modalContent.id = 'multipassModalContent';
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
  }

  initStyles() {
    removeIfExists('#multipassStyles');
    const style = document.createElement('style');
    style.id = 'multipassStyles';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(`
      #multipassMenuItem .menuIcon {
        -webkit-mask-image: url(${chrome.extension.getURL('res/logo.svg')});
        mask-image: url(${chrome.extension.getURL('res/logo.svg')});
      }
    `));
    document.head.appendChild(style);
  }
}

try {
  Console.info('Loading LastPass bridge');
  const lp = new LastPass();
  Console.info('LastPass bridge loaded', lp);
} catch (e) {
  Console.error('Failed to load LastPass bridge', e);
}
