export const SVG_NS = 'http://www.w3.org/2000/svg';

export function byId(id) {
  return document.getElementById(id);
}

export function html(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  applyAttrs(element, attrs);
  children.forEach(child => element.append(child));
  return element;
}

export function svg(tag, attrs = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  applyAttrs(element, attrs);
  return element;
}

export function text(value) {
  return document.createTextNode(value);
}

function applyAttrs(element, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === 'class') element.setAttribute('class', value);
    else if (key === 'style' && typeof value === 'object') Object.assign(element.style, value);
    else if (key.startsWith('data')) element.dataset[key.slice(4).replace(/^[A-Z]/, c => c.toLowerCase())] = value;
    else element.setAttribute(key, value);
  });
}
