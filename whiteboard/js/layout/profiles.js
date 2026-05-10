export const PROFILES = {
  standard: { width: 1320, height: 720, minScale: 0.62, maxScale: 1.18 },
  wide: { width: 1320, height: 720, minScale: 0.62, maxScale: 1.7 },
  compact: { width: 1180, height: 760, minScale: 0.72, maxScale: 1 }
};

export function chooseProfile(stage) {
  if (!stage) return 'standard';
  if (stage.clientWidth >= 1500) return 'wide';
  if (stage.clientWidth < 980 || stage.clientHeight < 620) return 'compact';
  return 'standard';
}
