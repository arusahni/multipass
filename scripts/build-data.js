#!/usr/bin/env node
// Convert twofactorauth YAML data into JSON for the extension to read
/* eslint-env node */

const { execSync } = require('child_process');
const fs = require('fs');

const parseDomain = require('parse-domain');
const yaml = require('js-yaml');

const OUT_DIR = './dist/';
const DATA_DIR = './vendor/twofactorauth/_data/';

/**
 * Add a site's record(s) to the site collection. This modifies the collection in place.
 */
function addSites(collection, site, recordCollection) {
  if (!(site in collection)) {
    collection[site] = recordCollection;
  } else {
    collection[site] = [...collection[site], ...recordCollection];
  }
  return collection;
}

/**
 * Get the JSON representation of a website file
 */
function fileToJSON(file) {
  console.info('Processing file', file);
  const data = {};
  var doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
  if (doc.websites === undefined) {
    console.warn(`Non-website file encountered: ${file}`);
    return {};
  }
  for (const site of doc.websites.filter(site => site.tfa.toLowerCase() === 'yes')) {
    const url = parseDomain(site.url);
    delete site.img;
    site.subdomain = url.subdomain;
    addSites(data, `${url.domain}.${url.tld}`, [site]);
  }
  return data;
}

/**
 * Recursively load the website data within a given path
 */
function getData(dirPath) {
  const sites = {};
  fs.readdirSync(dirPath).forEach((file) => {
    const data = fileToJSON(`${dirPath}${file}`);
    for (const site in data) {
      if (data.hasOwnProperty(site)) {
        addSites(sites, site, data[site]);
      }
    }
  });
  return sites;
}

/**
 * Write the sites to disk
 */
function writeData(sites) {
  const data = {
    sha: execSync('git submodule status vendor/twofactorauth | awk \'{print $1}\'').toString().replace(/\n$/, ''),
    timestamp: (new Date()).toUTCString(),
    sites,
  };
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
  }
  fs.writeFileSync(`${OUT_DIR}sites.js`, `MULTIPASS.siteData=${JSON.stringify(data)}`, 'utf8');
}

const sites = getData(DATA_DIR);
writeData(sites);
