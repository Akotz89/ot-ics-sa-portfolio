import { LINKS } from './links.js?v=engine-13';

const KIND_BY_CLASS = {
  gray: 'enterprise',
  service: 'service',
  backbone: 'backbone',
  protocol: 'protocol',
  orange: 'span',
  blue: 'handoff'
};

const KIND_BY_ROUTE = {
  'boundary-span': 'span',
  'control-span': 'span',
  'sensor-store-west': 'detection',
  'sensor-store-direct': 'detection',
  'soc-handoff': 'handoff',
  'enterprise-return': 'handoff'
};

export const DATA_FLOWS = LINKS.map((link, index) => ({
  id: `flow-${link.id}`,
  link: link.id,
  kind: KIND_BY_ROUTE[link.route] || KIND_BY_CLASS[link.cls] || 'service',
  speed: speedFor(link)
}));

function speedFor(link) {
  if (link.cls === 'backbone') return 1.7;
  if (link.cls === 'protocol') return 1.9;
  if (link.cls === 'orange') return 2;
  if (link.cls === 'blue') return 2.1;
  return 1.8;
}
