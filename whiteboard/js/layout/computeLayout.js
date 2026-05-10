import { PROFILES, chooseProfile } from './profiles.js?v=wide-fill-1';
import { TEMPLATES } from './templates.js?v=wide-fill-1';

export function computeLayout({ board, enclaves, nodes, annotations, stage }) {
  const profileName = chooseProfile(stage);
  const profile = PROFILES[profileName];
  const template = TEMPLATES[profileName];
  const placedEnclaves = placeEnclaves(enclaves, template);
  const enclaveMap = new Map(placedEnclaves.map(enclave => [enclave.id, enclave]));
  const placedNodes = placeNodes(nodes, template, enclaveMap);
  const placedAnnotations = placeAnnotations(annotations, template);
  const legend = { id: 'legend', group: 'monitoring', ...template.annotations.legend };

  return {
    profile: profileName,
    board: { ...board, width: profile.width, height: profile.height, minScale: profile.minScale, maxScale: profile.maxScale },
    enclaves: placedEnclaves,
    nodes: placedNodes,
    annotations: placedAnnotations,
    legend,
    labelSlots: template.labelSlots,
    lanes: template.lanes,
    rules: template.rules
  };
}

function placeEnclaves(enclaves, template) {
  return enclaves.map(enclave => ({ ...enclave, ...template.enclaves[enclave.id] }));
}

function placeNodes(nodes, template, enclaveMap) {
  return nodes.map(node => {
    const [enclaveId, offsetX, offsetY, w, h] = template.slots[node.id];
    const enclave = enclaveMap.get(enclaveId);
    return {
      ...node,
      group: enclaveId,
      x: enclave.x + offsetX,
      y: enclave.y + offsetY,
      w,
      h
    };
  });
}

function placeAnnotations(annotations, template) {
  return annotations.map(annotation => ({ ...annotation, ...template.annotations[annotation.id] }));
}
