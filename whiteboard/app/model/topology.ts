export type EntityKind =
  | 'soc-app'
  | 'identity'
  | 'ticketing'
  | 'gateway'
  | 'firewall'
  | 'jump'
  | 'broker'
  | 'switch'
  | 'server'
  | 'workstation'
  | 'sensor'
  | 'store'
  | 'controller'

export type ZoneKind = 'enterprise' | 'boundary' | 'operations' | 'control' | 'field' | 'monitoring'
export type LinkKind = 'enterprise' | 'service' | 'trunk' | 'protocol' | 'span' | 'metadata'
export type Direction = 'none' | 'one-way' | 'bidirectional' | 'passive'

export interface ZoneModel {
  id: ZoneKind
  title: string
  subtitle: string
  x: number
  y: number
  w: number
  h: number
}

export interface EntityModel {
  id: string
  kind: EntityKind
  label: string
  subtitle: string
  zone: ZoneKind
  x: number
  y: number
  w?: number
  h?: number
  role?: 'dark' | 'dragos' | 'boundary' | 'controller' | 'normal'
}

export interface LinkModel {
  id: string
  source: string
  target: string
  kind: LinkKind
  direction: Direction
  label?: string
  sourceAnchor?: Anchor
  targetAnchor?: Anchor
}

export interface FlowModel {
  id: string
  trigger: string
  links: string[]
  label: string
}

export type Anchor = 'left' | 'right' | 'top' | 'bottom' | 'center'

export const zones: ZoneModel[] = [
  { id: 'enterprise', title: 'Customer SOC / Enterprise', subtitle: 'IT services, tickets, identity', x: 40, y: 96, w: 450, h: 245 },
  { id: 'boundary', title: 'Authorization Boundary', subtitle: 'firewall, jump, controlled egress', x: 510, y: 96, w: 280, h: 390 },
  { id: 'operations', title: 'Plant Operations Network', subtitle: 'services used by operators and engineers', x: 820, y: 96, w: 1020, h: 255 },
  { id: 'control', title: 'Control Network', subtitle: 'SCADA, HMI, local history', x: 820, y: 385, w: 1020, h: 245 },
  { id: 'field', title: 'Controller / Process Segment', subtitle: 'vendor protocols and process equipment', x: 820, y: 665, w: 1020, h: 205 },
  { id: 'monitoring', title: 'Dragos Monitoring Architecture', subtitle: 'passive sensors, site analysis, central visibility', x: 40, y: 520, w: 700, h: 350 },
]

export const entities: EntityModel[] = [
  { id: 'soc', kind: 'soc-app', label: 'SOC / SIEM', subtitle: 'Splunk / workflow', zone: 'enterprise', x: 86, y: 152, w: 170, h: 72 },
  { id: 'ad', kind: 'identity', label: 'AD / DNS', subtitle: 'identity services', zone: 'enterprise', x: 286, y: 152, w: 170, h: 72 },
  { id: 'tickets', kind: 'ticketing', label: 'Tickets', subtitle: 'case handoff', zone: 'enterprise', x: 86, y: 260, w: 170, h: 72 },
  { id: 'gateway', kind: 'gateway', label: 'IT Gateway', subtitle: 'approved route', zone: 'enterprise', x: 286, y: 260, w: 170, h: 72 },
  { id: 'firewall', kind: 'firewall', label: 'Boundary Firewall', subtitle: 'allow-listed flows', zone: 'boundary', x: 550, y: 152, w: 172, h: 78, role: 'boundary' },
  { id: 'jump', kind: 'jump', label: 'Jump Host', subtitle: 'MFA + session logs', zone: 'boundary', x: 550, y: 260, w: 172, h: 78, role: 'boundary' },
  { id: 'broker', kind: 'broker', label: 'DMZ Broker', subtitle: 'egress proxy', zone: 'boundary', x: 550, y: 385, w: 172, h: 70, role: 'boundary' },
  { id: 'core', kind: 'switch', label: 'OT Core Switch', subtitle: 'operations trunk point', zone: 'operations', x: 875, y: 155, w: 285, h: 78, role: 'dark' },
  { id: 'historian', kind: 'server', label: 'Historian', subtitle: 'PI / OPC-UA', zone: 'operations', x: 1290, y: 155, w: 180, h: 72 },
  { id: 'patch', kind: 'server', label: 'Patch / NTP', subtitle: 'OT services', zone: 'operations', x: 1635, y: 155, w: 180, h: 72 },
  { id: 'engineering', kind: 'workstation', label: 'Engineering WS', subtitle: 'PLC tools', zone: 'operations', x: 1290, y: 260, w: 180, h: 72 },
  { id: 'dist', kind: 'switch', label: 'Control Dist Switch', subtitle: 'control trunk point', zone: 'control', x: 875, y: 450, w: 285, h: 78, role: 'dark' },
  { id: 'scada', kind: 'server', label: 'SCADA Server', subtitle: 'operator control', zone: 'control', x: 1290, y: 450, w: 180, h: 72 },
  { id: 'hmi', kind: 'workstation', label: 'HMI Pair', subtitle: 'view / alarm', zone: 'control', x: 1635, y: 450, w: 180, h: 72 },
  { id: 'mirror', kind: 'server', label: 'Local Mirror', subtitle: 'history cache', zone: 'control', x: 1435, y: 545, w: 180, h: 72 },
  { id: 'sensor-boundary', kind: 'sensor', label: 'Dragos Sensor', subtitle: 'boundary SPAN', zone: 'monitoring', x: 88, y: 610, w: 220, h: 78, role: 'dragos' },
  { id: 'sensor-control', kind: 'sensor', label: 'Dragos Sensor', subtitle: 'control trunk', zone: 'monitoring', x: 348, y: 610, w: 220, h: 78, role: 'dragos' },
  { id: 'centralstore', kind: 'store', label: 'CentralStore', subtitle: 'multi-site view', zone: 'monitoring', x: 88, y: 760, w: 220, h: 72, role: 'dark' },
  { id: 'sitestore', kind: 'store', label: 'SiteStore', subtitle: 'local analysis', zone: 'monitoring', x: 500, y: 760, w: 205, h: 72, role: 'dragos' },
  { id: 'ge', kind: 'controller', label: 'GE Mark VIe', subtitle: 'SRTP / EGD', zone: 'field', x: 875, y: 760, w: 170, h: 70, role: 'controller' },
  { id: 'controllogix', kind: 'controller', label: 'ControlLogix', subtitle: 'EtherNet/IP', zone: 'field', x: 1115, y: 760, w: 170, h: 70, role: 'controller' },
  { id: 'sel', kind: 'controller', label: 'SEL RTU', subtitle: 'DNP3', zone: 'field', x: 1395, y: 760, w: 170, h: 70, role: 'controller' },
  { id: 's7400', kind: 'controller', label: 'S7-400', subtitle: 'S7comm', zone: 'field', x: 1675, y: 760, w: 170, h: 70, role: 'controller' },
]

export const links: LinkModel[] = [
  { id: 'ad-firewall', source: 'ad', target: 'firewall', kind: 'enterprise', direction: 'one-way', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'gateway-jump', source: 'gateway', target: 'jump', kind: 'enterprise', direction: 'one-way', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'firewall-core', source: 'firewall', target: 'core', kind: 'enterprise', direction: 'bidirectional', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'jump-core', source: 'jump', target: 'core', kind: 'enterprise', direction: 'one-way', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'core-dist', source: 'core', target: 'dist', kind: 'trunk', direction: 'bidirectional', label: 'trunk', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'core-historian', source: 'core', target: 'historian', kind: 'service', direction: 'bidirectional', label: 'OPC-UA / historian reads', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'core-patch', source: 'core', target: 'patch', kind: 'service', direction: 'bidirectional', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'core-engineering', source: 'core', target: 'engineering', kind: 'service', direction: 'bidirectional', label: 'engineering access', sourceAnchor: 'bottom', targetAnchor: 'left' },
  { id: 'dist-scada', source: 'dist', target: 'scada', kind: 'service', direction: 'bidirectional', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'dist-hmi', source: 'dist', target: 'hmi', kind: 'service', direction: 'bidirectional', sourceAnchor: 'right', targetAnchor: 'left' },
  { id: 'scada-ge', source: 'scada', target: 'ge', kind: 'protocol', direction: 'bidirectional', label: 'SRTP / EGD', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'scada-controllogix', source: 'scada', target: 'controllogix', kind: 'protocol', direction: 'bidirectional', label: 'EtherNet/IP', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'hmi-sel', source: 'hmi', target: 'sel', kind: 'protocol', direction: 'bidirectional', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'hmi-s7400', source: 'hmi', target: 's7400', kind: 'protocol', direction: 'bidirectional', label: 'S7comm', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'historian-mirror', source: 'historian', target: 'mirror', kind: 'service', direction: 'one-way', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'firewall-sensor-boundary', source: 'firewall', target: 'sensor-boundary', kind: 'span', direction: 'passive', label: 'SPAN only', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'dist-sensor-control', source: 'dist', target: 'sensor-control', kind: 'span', direction: 'passive', sourceAnchor: 'left', targetAnchor: 'right' },
  { id: 'sensor-boundary-sitestore', source: 'sensor-boundary', target: 'sitestore', kind: 'span', direction: 'one-way', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'sensor-control-sitestore', source: 'sensor-control', target: 'sitestore', kind: 'span', direction: 'one-way', sourceAnchor: 'bottom', targetAnchor: 'top' },
  { id: 'sitestore-centralstore', source: 'sitestore', target: 'centralstore', kind: 'metadata', direction: 'one-way', label: 'metadata + detections', sourceAnchor: 'left', targetAnchor: 'right' },
  { id: 'tickets-centralstore', source: 'tickets', target: 'centralstore', kind: 'metadata', direction: 'one-way', sourceAnchor: 'left', targetAnchor: 'left' },
]

export const flows: FlowModel[] = [
  { id: 'boundary-path', trigger: 'firewall', links: ['ad-firewall', 'firewall-core'], label: 'allow-listed enterprise path' },
  { id: 'jump-path', trigger: 'jump', links: ['gateway-jump', 'jump-core'], label: 'approved engineering access' },
  { id: 'plant-trunk', trigger: 'core', links: ['core-dist', 'core-historian', 'core-engineering'], label: 'operations/control trunk' },
  { id: 'control-trunk', trigger: 'dist', links: ['core-dist', 'dist-scada', 'dist-hmi'], label: 'control distribution' },
  { id: 'protocols', trigger: 'scada', links: ['scada-ge', 'scada-controllogix'], label: 'controller protocol paths' },
  { id: 'span-feed', trigger: 'sensor-control', links: ['dist-sensor-control', 'sensor-control-sitestore'], label: 'passive collection feed' },
  { id: 'site-handoff', trigger: 'sitestore', links: ['sensor-boundary-sitestore', 'sensor-control-sitestore', 'sitestore-centralstore'], label: 'metadata and detections' },
  { id: 'soc-handoff', trigger: 'centralstore', links: ['sitestore-centralstore', 'tickets-centralstore'], label: 'SOC handoff' },
]
