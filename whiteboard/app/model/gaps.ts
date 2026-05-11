import type { EvidenceRefId } from './evidence'

export type ConcernStatus = 'validate' | 'unknown' | 'gap-if-absent' | 'confirmed-gap' | 'pov-dependency' | 'authorization-dependency'

export type ConcernOwnerPersona = 'SCADA PM' | 'OT Network Admin' | 'Cybersecurity Chief' | 'ISSO/AO' | 'SOC Lead' | 'Contracting Officer'

export interface ConcernModel {
  id: string
  title: string
  status: ConcernStatus
  stepIds: string[]
  tiedTo: string[]
  customerPrompt: string
  whyItMatters: string
  scenarioFinding: string
  dragosRelevance: string
  ownerPersona?: ConcernOwnerPersona
  evidenceRefs: EvidenceRefId[]
}

export const concernStatusLabels: Record<ConcernStatus, string> = {
  validate: 'Confirm',
  unknown: 'Unknown',
  'gap-if-absent': 'Gap if absent',
  'confirmed-gap': 'Known gap',
  'pov-dependency': 'PoV dependency',
  'authorization-dependency': 'Authorization',
}

export const concerns: ConcernModel[] = [
  {
    id: 'l4-l3-firewall-gap',
    title: 'L4/L3 boundary control',
    status: 'confirmed-gap',
    stepIds: ['boundary-controls', 'firewall-path', 'visibility-gap'],
    tiedTo: ['boundary', 'firewall', 'firewall-core'],
    customerPrompt: 'Can we validate whether this site has a true L4-to-L3 firewall, or is the firewall on the board a target-state control we need to document as absent?',
    whyItMatters: 'A missing boundary control changes the demo story from tuning rules to proving immediate passive visibility at the enterprise-to-OT handoff.',
    scenarioFinding: 'Discovery documents a critical gap: no firewall between the L4 DMZ and L3 control network.',
    dragosRelevance: 'Use the gap to justify boundary SPAN/TAP placement and to keep segmentation recommendations separate from the passive monitoring PoV.',
    ownerPersona: 'Cybersecurity Chief',
    evidenceRefs: ['discovery-as-found', 'nist-800-82', 'passive-span-tap'],
  },
  {
    id: 'remote-access-no-jump-mfa',
    title: 'Remote access workflow',
    status: 'confirmed-gap',
    stepIds: ['jump-path', 'engineering-access', 'visibility-gap'],
    tiedTo: ['gateway', 'jump', 'engineering', 'gateway-jump', 'jump-core'],
    customerPrompt: 'Is engineering access really brokered through a jump host with MFA and session logging, or is the current path VPN-to-RDP into OT workstations?',
    whyItMatters: 'Remote access is usually where operations, identity, logging, and change control all collide during the workshop.',
    scenarioFinding: 'Discovery identifies VPN-to-RDP remote access, no jump host, no session recording, and no MFA.',
    dragosRelevance: 'Dragos does not fix access control by itself, but it can show what remote access activity actually touched the OT network during the baseline.',
    ownerPersona: 'OT Network Admin',
    evidenceRefs: ['discovery-as-found', 'demo-thesis', 'nist-800-82'],
  },
  {
    id: 'flat-l3-l2-network',
    title: 'Flat control/process network',
    status: 'confirmed-gap',
    stepIds: ['field-process', 'controller-protocols', 'visibility-gap'],
    tiedTo: ['control', 'field', 'dist', 'scada', 'hmi'],
    customerPrompt: 'Where does L3 end and L2 begin in the actual plant, and which controller conversations can move laterally today?',
    whyItMatters: 'A flat network makes controller traffic discovery more urgent and makes passive monitoring the safer first move before segmentation changes.',
    scenarioFinding: 'Discovery says L3 and L2 are flat, with no segmentation between HMI/SCADA and process equipment.',
    dragosRelevance: 'The PoV can baseline real protocol paths before the customer attempts segmentation or firewall policy changes.',
    ownerPersona: 'SCADA PM',
    evidenceRefs: ['discovery-as-found', 'hydropower-protocols', 'nist-800-82'],
  },
  {
    id: 'controller-protocol-unknowns',
    title: 'Actual controller conversations',
    status: 'unknown',
    stepIds: ['controller-protocols', 'visibility-gap'],
    tiedTo: ['ge', 'controllogix', 'sel', 's7400', 'scada-ge', 'scada-controllogix', 'hmi-sel', 'hmi-s7400'],
    customerPrompt: 'Which protocol paths are confirmed from diagrams, and which ones must be discovered from passive baseline traffic?',
    whyItMatters: 'The customer may know vendor platforms but not the live protocol relationships, polling patterns, or unexpected peer-to-peer traffic.',
    scenarioFinding: 'The scenario includes GE Mark VIe, ControlLogix, SEL, Siemens, SRTP/EGD, EtherNet/IP, DNP3, and S7comm as validation targets.',
    dragosRelevance: 'Protocol parsing and communication mapping are central proof points for the tailored Dragos demo.',
    ownerPersona: 'SCADA PM',
    evidenceRefs: ['hydropower-protocols', 'demo-thesis', 'discovery-as-found'],
  },
  {
    id: 'no-ot-monitoring',
    title: 'OT visibility gap',
    status: 'confirmed-gap',
    stepIds: ['visibility-gap', 'dragos-architecture'],
    tiedTo: ['monitoring', 'sensor-boundary', 'sensor-control', 'sitestore'],
    customerPrompt: 'What evidence do we have today for controller traffic besides access logs, change records, and operator recollection?',
    whyItMatters: 'This separates governance evidence from wire-level visibility without making the customer feel accused.',
    scenarioFinding: 'Discovery identifies zero dedicated OT network monitoring and no OT vulnerability visibility.',
    dragosRelevance: 'This is the core value bridge from whiteboard discovery to passive Dragos placement.',
    ownerPersona: 'Cybersecurity Chief',
    evidenceRefs: ['discovery-as-found', 'demo-thesis', 'architecture-design'],
  },
  {
    id: 'passive-only-tenable',
    title: 'Passive-only requirement',
    status: 'validate',
    stepIds: ['dragos-architecture', 'boundary-span', 'control-trunk-span'],
    tiedTo: ['sensor-boundary', 'sensor-control', 'firewall-sensor-boundary', 'dist-sensor-control'],
    customerPrompt: 'Can we agree that the PoV uses SPAN/TAP copies only, with no active scanning, no PLC agents, and no inline dependency?',
    whyItMatters: 'The customer was burned by active scanning, so the SA must state the safety boundary before asking for deployment approval.',
    scenarioFinding: 'The scenario and discovery notes cite a Tenable incident that crashed two HMIs and made passive-only monitoring non-negotiable.',
    dragosRelevance: 'Dragos sensors are positioned as receive-only observation points, not control-path devices.',
    ownerPersona: 'SCADA PM',
    evidenceRefs: ['scenario-overview', 'discovery-as-found', 'passive-span-tap', 'dragos-appliances'],
  },
  {
    id: 'span-not-configured',
    title: 'SPAN source readiness',
    status: 'pov-dependency',
    stepIds: ['boundary-span', 'control-trunk-span', 'pov-checklist'],
    tiedTo: ['firewall-sensor-boundary', 'dist-sensor-control', 'sensor-boundary', 'sensor-control'],
    customerPrompt: 'Which exact switch ports can mirror the boundary and control VLAN traffic, who owns the change request, and when does the window clear?',
    whyItMatters: 'A beautiful PoV plan fails if the monitoring source is not available, or if a trunk SPAN misses same-switch east/west controller traffic.',
    scenarioFinding: 'Discovery says no SPAN ports are currently configured and change control has a four-week lead time.',
    dragosRelevance: 'SPAN readiness becomes a concrete PoV dependency, not an afterthought.',
    ownerPersona: 'OT Network Admin',
    evidenceRefs: ['discovery-as-found', 'passive-span-tap', 'pov-success'],
  },
  {
    id: 'tap-procurement-lead-time',
    title: 'TAP procurement and install',
    status: 'pov-dependency',
    stepIds: ['control-trunk-span', 'pov-checklist', 'close'],
    tiedTo: ['sensor-control', 'dist-sensor-control'],
    customerPrompt: 'For sites without usable SPAN, do we need TAP hardware, outage coordination, procurement lead time, or a narrower PoV scope?',
    whyItMatters: 'TAP needs can move the schedule and bill of materials, especially at John Day and McNary.',
    scenarioFinding: 'Discovery notes limited SPAN at John Day and no SPAN at McNary, with TAP recommended or required.',
    dragosRelevance: 'The SA turns a physical network constraint into a scoped deployment path and timeline risk.',
    ownerPersona: 'Contracting Officer',
    evidenceRefs: ['discovery-as-found', 'architecture-design', 'pov-success'],
  },
  {
    id: 'soc-alert-workflow',
    title: 'SOC and ticket workflow',
    status: 'gap-if-absent',
    stepIds: ['soc-ticket-handoff', 'pov-checklist', 'close'],
    tiedTo: ['soc', 'tickets', 'centralstore', 'tickets-centralstore'],
    customerPrompt: 'When Dragos sends approved outbound detections or case context, who receives it, where is the ticket created, and what does escalation look like after hours?',
    whyItMatters: 'Alerts without workflow are not operational value, and the customer already has enterprise SOC tooling that should be reused.',
    scenarioFinding: 'Discovery shows Splunk exists on the IT side but does not yet have dedicated OT alert data feeds.',
    dragosRelevance: 'CentralStore-to-SOC handoff turns local OT visibility into a customer-owned response process.',
    ownerPersona: 'SOC Lead',
    evidenceRefs: ['discovery-as-found', 'architecture-design', 'pov-success'],
  },
  {
    id: 'raw-data-governance',
    title: 'Raw data and metadata boundary',
    status: 'validate',
    stepIds: ['centralstore-aggregation', 'soc-ticket-handoff'],
    tiedTo: ['sitestore', 'centralstore', 'sitestore-centralstore'],
    customerPrompt: 'What data can leave the site, what stays local in SiteStore, and what metadata is acceptable for SOC review?',
    whyItMatters: 'Federal OT customers need clarity on PCAP, asset data, alert metadata, and cloud/enterprise handoff before authorization.',
    scenarioFinding: 'Architecture keeps packet analysis local and forwards alert metadata through controlled integrations.',
    dragosRelevance: 'This supports a defensible data-flow conversation for ISSO/AO and SOC stakeholders.',
    ownerPersona: 'ISSO/AO',
    evidenceRefs: ['architecture-design', 'dragos-centralstore', 'pov-success'],
  },
  {
    id: 'rmf-iatt-artifacts',
    title: 'Authorization evidence package',
    status: 'authorization-dependency',
    stepIds: ['pov-checklist', 'close'],
    tiedTo: ['boundary', 'monitoring', 'centralstore'],
    customerPrompt: 'Does the PoV need IATT or test authorization, and who needs STIG, PPSM, data-flow, hardware, and ports/protocols evidence?',
    whyItMatters: 'The technical win can still stall if the authorization path is not started early.',
    scenarioFinding: 'Scenario and architecture pages state that RMF/IATT, STIG evidence, network diagrams, data flows, and ports/protocols matrices may be required.',
    dragosRelevance: 'The SA de-risks deployment by packaging evidence before the sensor install date.',
    ownerPersona: 'ISSO/AO',
    evidenceRefs: ['scenario-overview', 'architecture-design', 'research-index'],
  },
  {
    id: 'pov-success-criteria',
    title: 'Proof-of-value success criteria',
    status: 'validate',
    stepIds: ['pov-checklist', 'close'],
    tiedTo: ['sitestore', 'centralstore', 'tickets'],
    customerPrompt: 'What result makes this a win: asset accuracy, protocol parsing, zero disruption, alert workflow, findings report, or all of the above?',
    whyItMatters: 'The SA should leave the workshop with measurable success criteria, not vague agreement that visibility sounds useful.',
    scenarioFinding: 'The portfolio defines PoV success around asset discovery, protocol validation, zero disruption, Splunk alerting, and a findings report.',
    dragosRelevance: 'This turns whiteboard gaps into a scoped Dragos evaluation plan.',
    ownerPersona: 'Cybersecurity Chief',
    evidenceRefs: ['demo-thesis', 'pov-success', 'architecture-design'],
  },
]

export const requiredScenarioConcernIds = [
  'l4-l3-firewall-gap',
  'remote-access-no-jump-mfa',
  'flat-l3-l2-network',
  'no-ot-monitoring',
  'span-not-configured',
  'tap-procurement-lead-time',
  'soc-alert-workflow',
  'passive-only-tenable',
  'rmf-iatt-artifacts',
]

export function concernsForStep(stepId: string) {
  return concerns.filter((concern) => concern.stepIds.includes(stepId))
}
