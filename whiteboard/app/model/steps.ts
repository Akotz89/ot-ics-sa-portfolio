export interface StepModel {
  id: string
  label: string
  tag: 'TALK' | 'DRAW' | 'POINT' | 'ASK'
  narration: string
  visibleZones: string[]
  visibleEntities: string[]
  visibleLinks: string[]
  focus?: string[]
}

const start = ['enterprise', 'boundary', 'operations']
const enterprise = ['soc', 'ad', 'tickets', 'gateway']
const boundary = ['firewall', 'jump', 'broker']
const operations = ['core', 'historian', 'engineering', 'patch']
const control = ['dist', 'scada', 'hmi', 'mirror']
const field = ['ge', 'controllogix', 'sel', 's7400']
const monitoring = ['sensor-boundary', 'sensor-control', 'centralstore', 'sitestore']

export const steps: StepModel[] = [
  {
    id: 'orient',
    label: 'Orient',
    tag: 'TALK',
    narration:
      'Start with the customer network: enterprise services, the authorization boundary, and the OT operations enclave. This is not a Purdue poster; it is where traffic has to cross.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: [],
    focus: ['enterprise', 'boundary', 'operations'],
  },
  {
    id: 'enterprise-handoff',
    label: 'Enterprise Handoff',
    tag: 'DRAW',
    narration:
      'Show the approved enterprise paths first. AD/DNS and ticketing are useful context, but the firewall and jump host are the real control points.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: ['ad-firewall', 'gateway-jump'],
    focus: ['ad', 'gateway', 'firewall', 'jump', 'ad-firewall', 'gateway-jump'],
  },
  {
    id: 'authorized-plant-entry',
    label: 'Authorized Entry',
    tag: 'DRAW',
    narration:
      'Now cross the boundary into OT. Directionality matters here: allow-listed firewall flows and approved jump access are different conversations.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: ['ad-firewall', 'gateway-jump', 'firewall-core', 'jump-core'],
    focus: ['firewall', 'jump', 'core', 'firewall-core', 'jump-core'],
  },
  {
    id: 'operations-services',
    label: 'Operations Services',
    tag: 'POINT',
    narration:
      'Inside operations, the core switch anchors services operators care about: historian reads, engineering workstation access, and patch/NTP dependencies.',
    visibleZones: start,
    visibleEntities: [...enterprise, ...boundary, ...operations],
    visibleLinks: ['ad-firewall', 'gateway-jump', 'firewall-core', 'jump-core', 'core-historian', 'core-engineering', 'core-patch'],
    focus: ['core', 'historian', 'engineering', 'patch', 'core-historian', 'core-engineering', 'core-patch'],
  },
  {
    id: 'control-network',
    label: 'Control Network',
    tag: 'DRAW',
    narration:
      'Bring in the control network only after the operations path is understood. The control distribution switch becomes the anchor for SCADA and HMI traffic.',
    visibleZones: [...start, 'control'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control],
    visibleLinks: ['firewall-core', 'jump-core', 'core-historian', 'core-engineering', 'core-dist', 'dist-scada', 'dist-hmi', 'historian-mirror'],
    focus: ['core', 'dist', 'scada', 'hmi', 'mirror', 'core-dist', 'dist-scada', 'dist-hmi'],
  },
  {
    id: 'field-segment',
    label: 'Field Segment',
    tag: 'DRAW',
    narration:
      'Add process equipment last, then name protocols as conversations to validate with the customer, not as decoration.',
    visibleZones: [...start, 'control', 'field'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field],
    visibleLinks: ['firewall-core', 'jump-core', 'core-dist', 'dist-scada', 'dist-hmi', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400', 'historian-mirror'],
    focus: ['field', 'ge', 'controllogix', 'sel', 's7400', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400'],
  },
  {
    id: 'visibility-gap',
    label: 'Visibility Gap',
    tag: 'ASK',
    narration:
      'Pause here. Logs show access and change activity, but they do not prove what controller traffic actually crossed the wire.',
    visibleZones: [...start, 'control', 'field'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field],
    visibleLinks: ['ad-firewall', 'gateway-jump', 'firewall-core', 'jump-core', 'core-dist', 'dist-scada', 'dist-hmi', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400'],
    focus: ['firewall', 'jump', 'dist', 'field'],
  },
  {
    id: 'monitoring-architecture',
    label: 'Monitoring Architecture',
    tag: 'DRAW',
    narration:
      'Introduce Dragos as a monitoring architecture, not an inline control device. Sensors observe SPAN or trunk feeds; SiteStore analyzes locally; CentralStore supports multi-site visibility.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['firewall-core', 'jump-core', 'core-dist', 'dist-scada', 'dist-hmi'],
    focus: ['monitoring', 'sensor-boundary', 'sensor-control', 'sitestore', 'centralstore'],
  },
  {
    id: 'boundary-span',
    label: 'Boundary SPAN',
    tag: 'POINT',
    narration:
      'The first passive collection point is boundary SPAN: useful for north/south visibility without changing the firewall path.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['firewall-core', 'jump-core', 'core-dist', 'firewall-sensor-boundary'],
    focus: ['firewall', 'sensor-boundary', 'firewall-sensor-boundary'],
  },
  {
    id: 'control-trunk',
    label: 'Control Trunk',
    tag: 'POINT',
    narration:
      'The second collection point is the control trunk. This is where passive visibility can see SCADA-to-controller conversations.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['firewall-core', 'jump-core', 'core-dist', 'dist-scada', 'dist-hmi', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400', 'dist-sensor-control'],
    focus: ['dist', 'sensor-control', 'dist-sensor-control', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400'],
  },
  {
    id: 'site-analysis',
    label: 'Site Analysis',
    tag: 'DRAW',
    narration:
      'SPAN feeds land in SiteStore for local analysis. This is the proof-of-value bridge from passive traffic to detections and inventory.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['core-dist', 'dist-scada', 'dist-hmi', 'dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore'],
    focus: ['sensor-boundary', 'sensor-control', 'sitestore', 'sensor-boundary-sitestore', 'sensor-control-sitestore'],
  },
  {
    id: 'metadata-handoff',
    label: 'Metadata Handoff',
    tag: 'DRAW',
    narration:
      'SiteStore and CentralStore carry metadata and detections northbound. Raw packet capture stays governed by the plant plan.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore', 'sitestore-centralstore'],
    focus: ['sitestore', 'centralstore', 'sitestore-centralstore'],
  },
  {
    id: 'soc-process',
    label: 'SOC Process',
    tag: 'DRAW',
    narration:
      'Now connect detections to the customer SOC process: alerts, tickets, and the decision path for escalation.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['ad-firewall', 'gateway-jump', 'firewall-core', 'jump-core', 'core-dist', 'dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore', 'sitestore-centralstore', 'tickets-centralstore'],
    focus: ['soc', 'tickets', 'centralstore', 'sitestore-centralstore', 'tickets-centralstore'],
  },
  {
    id: 'handoff',
    label: 'Handoff',
    tag: 'POINT',
    narration:
      'The handoff is practical: confirm ports, SPAN source, baseline window, SOC workflow, and proof-of-value criteria.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['ad-firewall', 'gateway-jump', 'firewall-core', 'jump-core', 'core-historian', 'core-engineering', 'core-patch', 'core-dist', 'dist-scada', 'dist-hmi', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400', 'historian-mirror', 'firewall-sensor-boundary', 'dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore', 'sitestore-centralstore', 'tickets-centralstore'],
    focus: ['firewall', 'sensor-boundary', 'sensor-control', 'sitestore', 'centralstore', 'tickets'],
  },
  {
    id: 'close',
    label: 'Close',
    tag: 'ASK',
    narration:
      'Close the technical plan: ports, SPAN, baseline, SOC handoff, and what success looks like for the Dragos demo.',
    visibleZones: [...start, 'control', 'field', 'monitoring'],
    visibleEntities: [...enterprise, ...boundary, ...operations, ...control, ...field, ...monitoring],
    visibleLinks: ['ad-firewall', 'gateway-jump', 'firewall-core', 'jump-core', 'core-historian', 'core-engineering', 'core-patch', 'core-dist', 'dist-scada', 'dist-hmi', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400', 'historian-mirror', 'firewall-sensor-boundary', 'dist-sensor-control', 'sensor-boundary-sitestore', 'sensor-control-sitestore', 'sitestore-centralstore', 'tickets-centralstore'],
    focus: undefined,
  },
]
