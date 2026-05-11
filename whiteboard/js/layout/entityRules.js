export const ENTITY_RULES = {
  nodePadding: 18,
  labelPadding: 8,
  arrowClearance: 12,
  labelDistance: 96,
  labelLeaderDistance: 190,
  header: {
    node: 56,
    label: 64,
    route: 64
  },
  anchors: {
    default: ['left', 'right', 'top', 'bottom'],
    switch: ['left', 'right', 'top', 'bottom'],
    firewall: ['left', 'right', 'bottom'],
    sensor: ['left', 'right', 'top', 'bottom'],
    controller: ['top', 'bottom']
  }
};

export function allowedAnchors(entity) {
  return ENTITY_RULES.anchors[entity.kind] || ENTITY_RULES.anchors.default;
}

export function entityRect(entity, pad = ENTITY_RULES.nodePadding) {
  return {
    id: entity.id,
    x: entity.x - pad,
    y: entity.y - pad,
    w: entity.w + pad * 2,
    h: entity.h + pad * 2
  };
}

export function headerRect(enclave, kind = 'node') {
  return {
    id: `${enclave.id}-header`,
    x: enclave.x,
    y: enclave.y,
    w: enclave.w,
    h: ENTITY_RULES.header[kind] || ENTITY_RULES.header.node
  };
}

export function headerTextRect(enclave, pad = 10) {
  const titleWidth = (enclave.title || '').length * 8.2;
  const subWidth = (enclave.sub || '').length * 6.2;
  const textWidth = Math.min(enclave.w - 28, Math.max(titleWidth, subWidth, 120));
  return {
    id: `${enclave.id}-header-text`,
    x: enclave.x + 14 - pad,
    y: enclave.y + 10 - pad,
    w: textWidth + pad * 2,
    h: 38 + pad * 2,
    group: enclave.id
  };
}
