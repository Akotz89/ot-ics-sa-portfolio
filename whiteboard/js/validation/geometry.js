export function rectOf(item, pad = 0) {
  return {
    id: item.id,
    x: item.x - pad,
    y: item.y - pad,
    w: item.w + pad * 2,
    h: item.h + pad * 2,
    kind: item.kind || item.type || item.group || 'item'
  };
}

export function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function segmentHitsRect(a, b, rect) {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;

  if (a.y === b.y) {
    return a.y >= rect.y && a.y <= bottom && maxX >= rect.x && minX <= right;
  }

  if (a.x === b.x) {
    return a.x >= rect.x && a.x <= right && maxY >= rect.y && minY <= bottom;
  }

  return true;
}
