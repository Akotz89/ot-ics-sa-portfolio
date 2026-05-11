export type EvidenceRefId =
  | 'scenario-overview'
  | 'discovery-as-found'
  | 'demo-thesis'
  | 'architecture-design'
  | 'research-index'
  | 'nist-800-82'
  | 'dragos-centralstore'
  | 'dragos-appliances'
  | 'passive-span-tap'
  | 'hydropower-protocols'
  | 'pov-success'

export interface EvidenceRef {
  id: EvidenceRefId
  claim: string
  source: string
  url: string
  kind: 'portfolio' | 'public'
}

export const evidenceCatalog: Record<EvidenceRefId, EvidenceRef> = {
  'scenario-overview': {
    id: 'scenario-overview',
    claim: 'USACE Northwestern Division hydropower scenario, stakeholders, sites, and customer constraints.',
    source: 'Scenario brief',
    url: 'scenario.html',
    kind: 'portfolio',
  },
  'discovery-as-found': {
    id: 'discovery-as-found',
    claim: 'As-found OT topology, visibility gaps, SPAN/TAP availability, stakeholders, and deployment constraints.',
    source: 'Technical discovery document',
    url: 'discovery/index.html',
    kind: 'portfolio',
  },
  'demo-thesis': {
    id: 'demo-thesis',
    claim: 'Tailored Dragos demo thesis focused on asset discovery, protocol parsing, detection, and SOC integration.',
    source: 'Demo agenda',
    url: 'demo.html',
    kind: 'portfolio',
  },
  'architecture-design': {
    id: 'architecture-design',
    claim: 'Dragos deployment design, sensor placement, SiteStore, CentralStore, and federal architecture artifacts.',
    source: 'Solution architecture',
    url: 'architecture.html',
    kind: 'portfolio',
  },
  'research-index': {
    id: 'research-index',
    claim: 'Portfolio research evidence index for federal, Dragos, procurement, and OT/ICS claims.',
    source: 'Research evidence index',
    url: 'research/research_evidence.md',
    kind: 'portfolio',
  },
  'nist-800-82': {
    id: 'nist-800-82',
    claim: 'OT diagrams should emphasize system architecture, data flows, monitoring, and OT security constraints.',
    source: 'NIST SP 800-82 Rev. 3',
    url: 'https://csrc.nist.gov/pubs/sp/800/82/r3/final',
    kind: 'public',
  },
  'dragos-centralstore': {
    id: 'dragos-centralstore',
    claim: 'CentralStore supports large-scale and multi-site Dragos sensor deployment management and aggregation.',
    source: 'Dragos CentralStore datasheet',
    url: 'https://www.dragos.com/resources/datasheet/dragos-centralstore-simplify-large-scale-sensor-deployments/',
    kind: 'public',
  },
  'dragos-appliances': {
    id: 'dragos-appliances',
    claim: 'Dragos Platform appliance options include Sensors, SiteStore, and CentralStore deployment models.',
    source: 'Dragos appliance models datasheet',
    url: 'https://www.dragos.com/resources/datasheet/dragos-appliance-datasheet/',
    kind: 'public',
  },
  'passive-span-tap': {
    id: 'passive-span-tap',
    claim: 'Customer constraints require passive-only monitoring via SPAN/TAP with no active scanning or PLC agents.',
    source: 'Discovery and demo work products',
    url: 'discovery/index.html',
    kind: 'portfolio',
  },
  'hydropower-protocols': {
    id: 'hydropower-protocols',
    claim: 'Scenario includes GE Mark VIe, ControlLogix, Siemens S7-400, SRTP/EGD, EtherNet/IP, and S7comm context.',
    source: 'Scenario and demo work products',
    url: 'scenario.html',
    kind: 'portfolio',
  },
  'pov-success': {
    id: 'pov-success',
    claim: 'Proof-of-value criteria include SPAN source, baseline window, asset inventory, detections, and SOC workflow.',
    source: 'Demo agenda and discovery follow-up plan',
    url: 'demo.html',
    kind: 'portfolio',
  },
}
