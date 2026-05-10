const STANDARD = {
  rules: {
    enclaveHeaderHeight: 56,
    enclaveInsetX: 14,
    minNodeGap: 18
  },
  enclaves: {
    enterprise: { x: 40, y: 84, w: 310, h: 270 },
    boundary: { x: 378, y: 84, w: 210, h: 350 },
    operations: { x: 620, y: 84, w: 660, h: 235 },
    control: { x: 620, y: 342, w: 660, h: 205 },
    field: { x: 620, y: 560, w: 660, h: 160 },
    monitoring: { x: 40, y: 390, w: 548, h: 294 }
  },
  slots: {
    soc: ['enterprise', 30, 62, 118, 54],
    identity: ['enterprise', 170, 62, 118, 54],
    ticketing: ['enterprise', 30, 154, 118, 54],
    itGateway: ['enterprise', 170, 154, 118, 54],
    firewall: ['boundary', 32, 62, 146, 54],
    jump: ['boundary', 32, 140, 146, 54],
    broker: ['boundary', 32, 238, 146, 54],
    core: ['operations', 30, 62, 175, 54],
    historian: ['operations', 270, 62, 138, 54],
    engineering: ['operations', 270, 140, 138, 54],
    services: ['operations', 474, 62, 138, 54],
    dist: ['control', 30, 64, 175, 54],
    scada: ['control', 270, 64, 138, 54],
    hmi: ['control', 474, 64, 138, 54],
    mirror: ['control', 372, 130, 138, 54],
    markvie: ['field', 30, 98, 128, 54],
    controllogix: ['field', 192, 98, 128, 54],
    rtu: ['field', 354, 98, 128, 54],
    s7: ['field', 516, 98, 118, 54],
    sensorBoundary: ['monitoring', 30, 76, 156, 58],
    sensorControl: ['monitoring', 210, 76, 156, 58],
    centralStore: ['monitoring', 30, 176, 156, 58],
    siteStore: ['monitoring', 370, 176, 142, 58]
  },
  annotations: {
    gap: { x: 1040, y: 228, w: 216, h: 84 },
    close: { x: 1040, y: 228, w: 216, h: 84 },
    legend: { x: 578, y: 10, w: 720, h: 58 }
  },
  labelSlots: {
    'core-historian': { x: 700, y: 232 },
    'core-engineering': { x: 700, y: 254 },
    'core-dist': { x: 736, y: 302 },
    'markvie-scada': { x: 712, y: 622 },
    'clx-hmi': { x: 864, y: 622 },
    's7-dist': { x: 1048, y: 622 },
    'span-boundary': { x: 438, y: 452 },
    'site-central': { x: 258, y: 650 }
  },
  lanes: {
    enterpriseReturnX: 55,
    enterpriseReturnY: 310,
    boundaryEastX: 570,
    boundarySpanY: 448,
    opsServiceX: 858,
    opsServiceUpperY: 80,
    opsServiceY: 260,
    controlBusY: 540,
    fieldBusY: 626,
    fieldLowBusY: 626,
    monitoringFeedY: 556,
    monitoringStoreX: 390,
    monitoringSouthY: 595,
    controlWestX: 596
  }
};

const COMPACT = {
  ...STANDARD,
  enclaves: {
    enterprise: { x: 24, y: 92, w: 286, h: 258 },
    boundary: { x: 328, y: 92, w: 198, h: 342 },
    operations: { x: 548, y: 92, w: 590, h: 228 },
    control: { x: 548, y: 344, w: 590, h: 205 },
    field: { x: 548, y: 560, w: 590, h: 160 },
    monitoring: { x: 24, y: 396, w: 502, h: 294 }
  },
  slots: {
    ...STANDARD.slots,
    soc: ['enterprise', 24, 62, 112, 54],
    identity: ['enterprise', 150, 62, 112, 54],
    ticketing: ['enterprise', 24, 154, 112, 54],
    itGateway: ['enterprise', 150, 154, 112, 54],
    firewall: ['boundary', 28, 62, 142, 54],
    jump: ['boundary', 28, 138, 142, 54],
    broker: ['boundary', 28, 234, 142, 54],
    core: ['operations', 24, 62, 168, 54],
    historian: ['operations', 238, 62, 132, 54],
    engineering: ['operations', 238, 140, 132, 54],
    services: ['operations', 420, 62, 132, 54],
    dist: ['control', 24, 64, 168, 54],
    scada: ['control', 238, 64, 132, 54],
    hmi: ['control', 420, 64, 132, 54],
    mirror: ['control', 326, 130, 132, 54],
    markvie: ['field', 24, 98, 116, 54],
    controllogix: ['field', 164, 98, 128, 54],
    rtu: ['field', 316, 98, 116, 54],
    s7: ['field', 456, 98, 102, 54],
    sensorBoundary: ['monitoring', 24, 76, 148, 58],
    sensorControl: ['monitoring', 196, 76, 148, 58],
    centralStore: ['monitoring', 24, 176, 148, 58],
    siteStore: ['monitoring', 336, 176, 138, 58]
  },
  annotations: {
    gap: { x: 990, y: 228, w: 160, h: 84 },
    close: { x: 990, y: 228, w: 160, h: 84 },
    legend: { x: 476, y: 12, w: 642, h: 58 }
  },
  labelSlots: {
    'core-historian': { x: 610, y: 232 },
    'core-engineering': { x: 610, y: 254 },
    'core-dist': { x: 644, y: 302 },
    'markvie-scada': { x: 610, y: 622 },
    'clx-hmi': { x: 760, y: 622 },
    's7-dist': { x: 938, y: 622 },
    'span-boundary': { x: 398, y: 452 },
    'site-central': { x: 210, y: 650 }
  },
  lanes: {
    enterpriseReturnX: 10,
    enterpriseReturnY: 310,
    boundaryEastX: 532,
    boundarySpanY: 448,
    opsServiceX: 760,
    opsServiceUpperY: 80,
    opsServiceY: 260,
    controlBusY: 540,
    fieldBusY: 626,
    fieldLowBusY: 626,
    monitoringFeedY: 556,
    monitoringStoreX: 344,
    monitoringSouthY: 595,
    controlWestX: 535
  }
};

export const TEMPLATES = {
  standard: STANDARD,
  wide: STANDARD,
  compact: COMPACT
};
