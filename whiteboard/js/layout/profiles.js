import { TEMPLATES } from './templates.js?v=engine-22';

export const PROFILES = {
  compact: { width: 1180, height: 760, minScale: 0.56, maxScale: 1.6, template: TEMPLATES.compact },
  standard: { width: 1320, height: 720, minScale: 0.52, maxScale: 2, template: TEMPLATES.standard },
  wide: { width: 1900, height: 760, minScale: 0.52, maxScale: 2, template: TEMPLATES.wide },
  ultra: { width: 2600, height: 760, minScale: 0.48, maxScale: 2, template: TEMPLATES.ultra }
};
