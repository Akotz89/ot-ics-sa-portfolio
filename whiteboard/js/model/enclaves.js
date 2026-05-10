export const ENCLAVES = [
  { id: 'enterprise', group: 'enterprise', x: 40, y: 84, w: 310, h: 270, title: 'Customer SOC / Enterprise', sub: 'IT services, tickets, identity' },
  { id: 'boundary', group: 'boundary', x: 378, y: 84, w: 210, h: 350, title: 'Authorization Boundary', sub: 'firewall, jump, controlled egress', variant: 'danger' },
  { id: 'operations', group: 'operations', x: 620, y: 84, w: 660, h: 235, title: 'Plant Operations Network', sub: 'services used by operators and engineers', variant: 'ot' },
  { id: 'control', group: 'control', x: 620, y: 342, w: 660, h: 205, title: 'Control Network', sub: 'SCADA, HMI, local history', variant: 'control' },
  { id: 'field', group: 'field', x: 620, y: 574, w: 660, h: 110, title: 'Controller / Process Segment', sub: 'vendor protocols and process equipment', variant: 'field' },
  { id: 'monitoring', group: 'monitoring', x: 40, y: 390, w: 548, h: 294, title: 'Dragos Monitoring Architecture', sub: 'passive sensors, site analysis, central visibility', variant: 'monitoring' }
];
