/* eslint-disable no-unused-vars, no-console */

const MULTIPASS = {
  logPrefix: '[multipass]',
  verbose: true,
};

const Console = {
  debug: (...args) => {
    if (MULTIPASS.verbose) {
      console.debug(`${MULTIPASS.logPrefix} `, ...args);
    }
  },
  info: (...args) => {
    if (MULTIPASS.verbose) {
      console.info(`${MULTIPASS.logPrefix} `, ...args);
    }
  },
  warn: (...args) => {
    console.warn(`${MULTIPASS.logPrefix} `, ...args);
  },
  error: (...args) => {
    console.error(`${MULTIPASS.logPrefix} `, ...args);
  },
  trace: (...args) => {
    console.trace(`${MULTIPASS.logPrefix} `, ...args);
  },
};


/**
 * Remove an element by CSS selector
 *
 * @param {string} selector - The selector
 * @return {boolean} `true` if removed, `false` if not present
 */
const removeIfExists = (selector) => {
  const existing = document.querySelector(selector);
  if (existing) {
    existing.remove();
    return true;
  }
  return false;
};

/**
 * Get a comparator for two objects based on values for a specific field
 *
 * @param {string} fieldName - The name of the filed to compare
 * @param {boolean} caseInsensitive - `true` if the comparison should be case insensitive
 * @return {function} a comparator function
 */
const compareByField = (fieldName, caseInsensitive = true) =>
  (thing1, thing2) => {
    let field1 = thing1[fieldName];
    let field2 = thing2[fieldName];
    if (caseInsensitive) {
      field1 = field1.toUpperCase();
      field2 = field2.toUpperCase();
    }
    if (field1 < field2) {
      return -1;
    } else if (field1 > field2) {
      return 1;
    }
    return 0;
  };

/**
 * Convenience method for DOM node creation
 *
 * @param {string} tagName - The element's tagname
 * @param {string[]} classes - The element's classes
 * @param {Object} attributes - The element's DOM attributes
 * @param {string | Array | Element} inner - The element's inner content
 * @return {Element} The DOM node.
 */
const createElement = (tagName, classes = [], attributes = {}, inner) => {
  try {
    const element = document.createElement(tagName);
    element.classList.add(...classes);
    Object.entries(attributes).forEach(([name, value]) => {
      element[name] = value;
    });
    const children = Array.isArray(inner) ? inner : [inner];
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (typeof child !== 'undefined') {
        element.appendChild(child);
      }
    });
    return element;
  } catch (e) {
    console.error('Couldn\'t render element', tagName, classes, attributes, inner);
    throw e;
  }
};
