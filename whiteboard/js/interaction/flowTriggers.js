export function bindFlowTriggers({ links }) {
  const linksByNode = links.reduce((map, link) => {
    addLink(map, link.from, link.id);
    addLink(map, link.to, link.id);
    return map;
  }, new Map());

  document.querySelectorAll('[data-node-id]').forEach(node => {
    node.addEventListener('click', () => {
      pulseNodeFlows(node.dataset.nodeId, linksByNode);
      markTriggered(node);
    });
  });
}

function addLink(map, nodeId, linkId) {
  if (!map.has(nodeId)) map.set(nodeId, new Set());
  map.get(nodeId).add(linkId);
}

function pulseNodeFlows(nodeId, linksByNode) {
  const linkIds = linksByNode.get(nodeId) || new Set();
  linkIds.forEach(linkId => {
    const path = document.querySelector(`.flow.visible[data-link-source="${linkId}"]`);
    const packet = document.querySelector(`.packet[data-flow-link="${linkId}"]`);
    if (!path || !packet) return;
    pulsePacket(packet);
  });
}

function pulsePacket(packet) {
  const motion = packet.querySelector('animateMotion');
  const duration = parseFloat(motion?.getAttribute('dur')) || 1.8;
  packet.classList.remove('active');
  motion?.endElement?.();
  requestAnimationFrame(() => {
    packet.classList.add('active');
    motion?.beginElement?.();
    window.setTimeout(() => packet.classList.remove('active'), duration * 1000 + 120);
  });
}

function markTriggered(node) {
  node.classList.add('triggered');
  window.setTimeout(() => node.classList.remove('triggered'), 520);
}
