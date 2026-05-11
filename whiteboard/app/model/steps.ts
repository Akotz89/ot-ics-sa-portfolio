import type { EvidenceRefId } from './evidence'

export interface StepModel {
  id: string
  label: string
  tag: 'TALK' | 'DRAW' | 'POINT' | 'ASK'
  narration: string
  visibleZones: string[]
  visibleEntities: string[]
  visibleLinks: string[]
  introduced?: string[]
  active?: string[]
  dimmed?: string[]
  hidden?: string[]
  focus?: string[]
  evidenceRefs?: EvidenceRefId[]
}

const start = ['enterprise', 'boundary', 'operations']
const allZones = [...start, 'control', 'field', 'monitoring']

const enterprise = ['soc', 'ad', 'tickets', 'gateway']
const boundary = ['firewall', 'jump', 'broker']
const boundaryControls = ['firewall', 'jump']
const operations = ['core', 'historian', 'engineering', 'patch']
const operationsCore = ['core']
const operationsServices = ['historian', 'engineering', 'patch']
const control = ['dist', 'scada', 'hmi', 'mirror']
const controlCore = ['dist']
const controlApps = ['scada', 'hmi', 'mirror']
const field = ['ge', 'controllogix', 'sel', 's7400']
const monitoring = ['sensor-boundary', 'sensor-control', 'centralstore', 'sitestore']
const sensors = ['sensor-boundary', 'sensor-control']
const stores = ['centralstore', 'sitestore']

const enterpriseLinks = ['ad-firewall', 'gateway-jump']
const entryLinks = ['firewall-core', 'jump-core']
const operationsLinks = ['core-historian', 'core-engineering', 'core-patch']
const controlLinks = ['core-dist', 'dist-scada']
const protocolLinks = ['scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400']
const monitoringLinks = ['firewall-sensor-boundary', 'dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore']
const socLinks = ['sitestore-centralstore', 'tickets-centralstore']

const SCENARIO_STEP_REFS: EvidenceRefId[] = ['scenario-overview', 'discovery-as-found', 'nist-800-82']
const DRAGOS_STEP_REFS: EvidenceRefId[] = ['architecture-design', 'dragos-appliances', 'dragos-centralstore', 'passive-span-tap']
const PROTOCOL_STEP_REFS: EvidenceRefId[] = ['hydropower-protocols', 'demo-thesis', 'nist-800-82']
const POC_STEP_REFS: EvidenceRefId[] = ['demo-thesis', 'pov-success', 'research-index']

const stepDefinitions: StepModel[] = [
  {
    id: 'orient',
    label: 'Orient',
    tag: 'TALK',
    narration:
      'Start by framing the customer objective: where enterprise services, the authorization boundary, and plant operations actually exchange traffic.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [],
    active: ['enterprise', 'boundary', 'operations'],
    introduced: ['enterprise', 'boundary', 'operations'],
    focus: ['enterprise', 'boundary', 'operations'],
  },
  {
    id: 'customer-confirmation',
    label: 'Customer Check',
    tag: 'ASK',
    narration:
      'Confirm what matters before drawing more: which SOC tools, identity services, remote access paths, and OT services belong in scope.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [],
    active: [...enterprise, ...boundaryControls, ...operationsCore],
    focus: [...enterprise, ...boundaryControls, ...operationsCore],
  },
  {
    id: 'enterprise-services',
    label: 'Enterprise Services',
    tag: 'DRAW',
    narration:
      'Place the enterprise services as context: SOC/SIEM, identity, tickets, and the approved IT gateway. These are not control assets; they are handoff systems.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [],
    introduced: enterprise,
    active: enterprise,
    focus: enterprise,
  },
  {
    id: 'boundary-controls',
    label: 'Boundary Controls',
    tag: 'DRAW',
    narration:
      'Now name the boundary controls: firewall, jump host, and DMZ broker context. Only draw routes for systems that actually participate in the customer conversation.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [],
    introduced: boundary,
    active: boundary,
    focus: boundary,
  },
  {
    id: 'firewall-path',
    label: 'Firewall Path',
    tag: 'DRAW',
    narration:
      'Draw the allow-listed firewall path into OT. This is a controlled boundary flow, not a general enterprise-to-plant shortcut.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: ['ad-firewall', 'firewall-core'],
    active: ['ad', 'firewall', 'core', 'ad-firewall', 'firewall-core'],
    focus: ['ad', 'firewall', 'core', 'ad-firewall', 'firewall-core'],
  },
  {
    id: 'jump-path',
    label: 'Jump Path',
    tag: 'DRAW',
    narration:
      'Add approved jump-host access separately so the customer can validate who uses it, when it is allowed, and what logs exist.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: ['ad-firewall', 'firewall-core', 'gateway-jump', 'jump-core'],
    active: ['gateway', 'jump', 'core', 'gateway-jump', 'jump-core'],
    focus: ['gateway', 'jump', 'core', 'gateway-jump', 'jump-core'],
  },
  {
    id: 'operations-anchor',
    label: 'OT Core',
    tag: 'POINT',
    narration:
      'Use the OT core switch as the operations anchor. The next routes are service dependencies hanging off this plant-side switching point.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [...entryLinks],
    active: ['core', ...entryLinks],
    focus: ['core', ...entryLinks],
  },
  {
    id: 'historian-service',
    label: 'Historian Reads',
    tag: 'DRAW',
    narration:
      'Add the historian read path. Ask whether it is PI, OPC-UA, vendor historian, or another service the plant depends on.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [...entryLinks, 'core-historian'],
    active: ['core', 'historian', 'core-historian'],
    focus: ['core', 'historian', 'core-historian'],
  },
  {
    id: 'engineering-access',
    label: 'Engineering Access',
    tag: 'DRAW',
    narration:
      'Add engineering workstation access as a separate conversation from historian reads. This is usually where change activity and access review matter.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [...entryLinks, 'core-historian', 'core-engineering'],
    active: ['core', 'engineering', 'core-engineering'],
    focus: ['core', 'engineering', 'core-engineering'],
  },
  {
    id: 'patch-ntp',
    label: 'Patch / NTP',
    tag: 'POINT',
    narration:
      'Add OT service dependencies such as patching and NTP. Keep them thin on the diagram because they support operations rather than drive the demo story.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [...entryLinks, ...operationsLinks],
    active: ['core', 'patch', 'core-patch'],
    focus: ['core', 'patch', 'core-patch'],
  },
  {
    id: 'control-distribution',
    label: 'Control Distribution',
    tag: 'DRAW',
    narration:
      'Bring in the control network only after operations are understood. The distribution switch becomes the anchor for SCADA, HMI, and local history traffic.',
    visibleZones: [...start, 'control'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...controlCore],
    visibleLinks: [...entryLinks, 'core-dist'],
    introduced: ['control', 'dist', 'core-dist'],
    active: ['core', 'dist', 'core-dist'],
    focus: ['core', 'dist', 'core-dist'],
  },
  {
    id: 'scada-hmi',
    label: 'SCADA / HMI',
    tag: 'DRAW',
    narration:
      'Add SCADA and HMI as operator-facing control services. Keep the service lines quiet so the network conversation stays readable.',
    visibleZones: [...start, 'control'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...controlCore, 'scada', 'hmi'],
    visibleLinks: [...entryLinks, 'core-dist', 'dist-scada'],
    introduced: ['scada', 'hmi', 'dist-scada'],
    active: ['dist', 'scada', 'hmi', 'dist-scada'],
    focus: ['dist', 'scada', 'hmi', 'dist-scada'],
  },
  {
    id: 'local-history',
    label: 'Local History',
    tag: 'POINT',
    narration:
      'Add the local mirror or cache as a history dependency. It is useful context, but should not clutter the main control path.',
    visibleZones: [...start, 'control'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control],
    visibleLinks: [...entryLinks],
    introduced: ['mirror'],
    active: ['historian', 'mirror'],
    focus: ['historian', 'mirror'],
  },
  {
    id: 'field-process',
    label: 'Field Segment',
    tag: 'DRAW',
    narration:
      'Place controllers and RTUs as process equipment, then ask which conversations are real. This is where the customer validates the plant view.',
    visibleZones: [...start, 'control', 'field'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field],
    visibleLinks: [...entryLinks, 'core-dist', 'dist-scada'],
    introduced: ['field', ...field],
    active: field,
    focus: ['field', ...field],
  },
  {
    id: 'controller-protocols',
    label: 'Controller Protocols',
    tag: 'DRAW',
    narration:
      'Draw controller protocol conversations as a clean bus and drops. The labels are validation prompts, not decorative stickers.',
    visibleZones: [...start, 'control', 'field'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field],
    visibleLinks: [...protocolLinks],
    introduced: protocolLinks,
    active: [...field, ...protocolLinks],
    focus: ['scada', 'hmi', ...field, ...protocolLinks],
  },
  {
    id: 'visibility-gap',
    label: 'Visibility Gap',
    tag: 'ASK',
    narration:
      'Pause here. Access logs and change records help, but they do not prove what controller traffic crossed the wire during the baseline window.',
    visibleZones: [...start, 'control', 'field'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field],
    visibleLinks: [...enterpriseLinks, ...entryLinks, ...protocolLinks],
    active: ['firewall', 'jump', 'dist', ...field],
    focus: ['firewall', 'jump', 'dist', 'field', ...protocolLinks],
  },
  {
    id: 'dragos-architecture',
    label: 'Dragos Architecture',
    tag: 'DRAW',
    narration:
      'Introduce Dragos as passive monitoring architecture. Sensors observe, SiteStore analyzes locally, and CentralStore supports broader visibility.',
    visibleZones: allZones,
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: [...entryLinks, 'core-dist', 'dist-scada'],
    introduced: ['monitoring', ...monitoring],
    active: ['monitoring', ...monitoring],
    focus: ['monitoring', ...monitoring],
  },
  {
    id: 'boundary-span',
    label: 'Boundary SPAN',
    tag: 'POINT',
    narration:
      'Draw the passive boundary SPAN/TAP copy. This gives north/south visibility without placing Dragos inline on the firewall path.',
    visibleZones: allZones,
    visibleEntities: [...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['firewall-sensor-boundary'],
    introduced: ['firewall-sensor-boundary'],
    active: ['firewall', 'sensor-boundary', 'firewall-sensor-boundary'],
    focus: ['firewall', 'sensor-boundary', 'firewall-sensor-boundary'],
  },
  {
    id: 'control-trunk-span',
    label: 'Control Trunk SPAN',
    tag: 'POINT',
    narration:
      'Draw the passive control SPAN/TAP copy. Confirm the mirrored source sees the control VLANs and does not miss same-switch east/west traffic.',
    visibleZones: allZones,
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['core-dist', 'dist-sensor-control'],
    introduced: ['dist-sensor-control'],
    active: ['core', 'dist', 'sensor-control', 'core-dist', 'dist-sensor-control'],
    focus: ['core', 'dist', 'sensor-control', 'core-dist', 'dist-sensor-control'],
  },
  {
    id: 'sitestore-analysis',
    label: 'SiteStore Analysis',
    tag: 'DRAW',
    narration:
      'Connect passive feeds into SiteStore. This turns observed traffic into local inventory, detections, and proof-of-value evidence.',
    visibleZones: allZones,
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['sensor-boundary-sitestore', 'sensor-control-sitestore'],
    introduced: ['sensor-boundary-sitestore', 'sensor-control-sitestore'],
    active: [...sensors, 'sitestore', 'sensor-boundary-sitestore', 'sensor-control-sitestore'],
    focus: [...sensors, 'sitestore', 'sensor-boundary-sitestore', 'sensor-control-sitestore'],
  },
  {
    id: 'centralstore-aggregation',
    label: 'CentralStore',
    tag: 'DRAW',
    narration:
      'Connect SiteStore to CentralStore for metadata and detections. Raw packet retention remains a plant governance decision.',
    visibleZones: allZones,
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['sitestore-centralstore'],
    introduced: ['sitestore-centralstore'],
    active: [...stores, 'sitestore-centralstore'],
    focus: [...stores, 'sitestore-centralstore'],
  },
  {
    id: 'soc-ticket-handoff',
    label: 'SOC Handoff',
    tag: 'DRAW',
    narration:
      'Close the loop into the customer process: approved outbound detections become SOC review and ticket handoff, not enterprise tools reaching into OT.',
    visibleZones: allZones,
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['sitestore-centralstore', 'tickets-centralstore'],
    introduced: ['tickets-centralstore'],
    active: ['centralstore', 'tickets', 'soc', 'tickets-centralstore'],
    focus: ['centralstore', 'tickets', 'soc', 'tickets-centralstore'],
  },
  {
    id: 'pov-checklist',
    label: 'POV Checklist',
    tag: 'ASK',
    narration:
      'Ask for the practical proof-of-value inputs: ports, SPAN source, baseline window, systems in scope, SOC workflow, and escalation criteria.',
    visibleZones: allZones,
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['ad-firewall', 'gateway-jump', ...entryLinks, 'core-dist', 'dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore', 'sitestore-centralstore', 'tickets-centralstore'],
    active: ['firewall', ...sensors, 'sitestore', 'centralstore', 'tickets'],
    focus: ['firewall', ...sensors, 'sitestore', 'centralstore', 'tickets'],
  },
  {
    id: 'close',
    label: 'Close',
    tag: 'ASK',
    narration:
      'Close the technical plan: confirm the approved paths, passive collection points, SOC handoff, baseline window, and what success looks like for the Dragos demo.',
    visibleZones: allZones,
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['ad-firewall', 'gateway-jump', ...entryLinks, 'core-dist', 'dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore', 'sitestore-centralstore', 'tickets-centralstore'],
    active: ['firewall', 'jump', 'core', 'dist', ...sensors, 'sitestore', 'centralstore', 'tickets'],
    focus: ['firewall', 'jump', 'core', 'dist', ...sensors, 'sitestore', 'centralstore', 'tickets'],
  },
]

export const steps: StepModel[] = stepDefinitions.map(withStepEvidence)

function withStepEvidence(step: StepModel): StepModel {
  if (step.evidenceRefs?.length) return step
  if (step.id.includes('span') || step.id.includes('dragos') || step.id.includes('sitestore') || step.id.includes('centralstore') || step.id.includes('handoff')) {
    return { ...step, evidenceRefs: DRAGOS_STEP_REFS }
  }
  if (step.id.includes('protocol') || step.id.includes('field')) return { ...step, evidenceRefs: PROTOCOL_STEP_REFS }
  if (step.id.includes('pov') || step.id === 'close') return { ...step, evidenceRefs: POC_STEP_REFS }
  return { ...step, evidenceRefs: SCENARIO_STEP_REFS }
}
