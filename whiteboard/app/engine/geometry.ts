import type { Point, Rect } from '../routing/types'

export const GRID_SIZE = 20

export function rectMaxX(rect: Rect) {
  return rect.x + rect.w
}

export function rectMaxY(rect: Rect) {
  return rect.y + rect.h
}

export function rectMidX(rect: Rect) {
  return rect.x + rect.w / 2
}

export function rectMidY(rect: Rect) {
  return rect.y + rect.h / 2
}

export function inflate(rect: Rect, amount: number): Rect {
  return { x: rect.x - amount, y: rect.y - amount, w: rect.w + amount * 2, h: rect.h + amount * 2 }
}

export function intersects(a: Rect, b: Rect) {
  return a.x < rectMaxX(b) && rectMaxX(a) > b.x && a.y < rectMaxY(b) && rectMaxY(a) > b.y
}

export function contains(outer: Rect, inner: Rect) {
  return inner.x >= outer.x && inner.y >= outer.y && rectMaxX(inner) <= rectMaxX(outer) && rectMaxY(inner) <= rectMaxY(outer)
}

export function clampRectToRect(rect: Rect, bounds: Rect): Rect {
  return {
    ...rect,
    x: clamp(rect.x, bounds.x, rectMaxX(bounds) - rect.w),
    y: clamp(rect.y, bounds.y, rectMaxY(bounds) - rect.h),
  }
}

export function snap(value: number, grid = GRID_SIZE) {
  return Math.round(value / grid) * grid
}

export function snapPoint(point: Point, grid = GRID_SIZE): Point {
  return { x: snap(point.x, grid), y: snap(point.y, grid) }
}

export function distance(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function segmentIntersectsRect(a: Point, b: Point, rect: Rect) {
  if (Math.abs(a.x - b.x) < 0.5) {
    const y1 = Math.min(a.y, b.y)
    const y2 = Math.max(a.y, b.y)
    return a.x >= rect.x && a.x <= rectMaxX(rect) && y2 >= rect.y && y1 <= rectMaxY(rect)
  }
  if (Math.abs(a.y - b.y) < 0.5) {
    const x1 = Math.min(a.x, b.x)
    const x2 = Math.max(a.x, b.x)
    return a.y >= rect.y && a.y <= rectMaxY(rect) && x2 >= rect.x && x1 <= rectMaxX(rect)
  }
  return false
}

export function segmentsFor(points: Point[]) {
  const segments: Array<{ a: Point; b: Point }> = []
  for (let index = 1; index < points.length; index += 1) segments.push({ a: points[index - 1], b: points[index] })
  return segments
}

export function segmentsCross(a1: Point, a2: Point, b1: Point, b2: Point) {
  const aHorizontal = Math.abs(a1.y - a2.y) < 0.5
  const bHorizontal = Math.abs(b1.y - b2.y) < 0.5
  if (aHorizontal === bHorizontal) return false
  const h1 = aHorizontal ? a1 : b1
  const h2 = aHorizontal ? a2 : b2
  const v1 = aHorizontal ? b1 : a1
  const v2 = aHorizontal ? b2 : a2
  const hMin = Math.min(h1.x, h2.x)
  const hMax = Math.max(h1.x, h2.x)
  const vMin = Math.min(v1.y, v2.y)
  const vMax = Math.max(v1.y, v2.y)
  return v1.x > hMin + 8 && v1.x < hMax - 8 && h1.y > vMin + 8 && h1.y < vMax - 8
}

export function segmentsOverlap(a1: Point, a2: Point, b1: Point, b2: Point, clearance = 6) {
  const aHorizontal = Math.abs(a1.y - a2.y) < 0.5
  const bHorizontal = Math.abs(b1.y - b2.y) < 0.5
  if (aHorizontal !== bHorizontal) return false
  if (aHorizontal) {
    if (Math.abs(a1.y - b1.y) > clearance) return false
    return rangeOverlap(Math.min(a1.x, a2.x), Math.max(a1.x, a2.x), Math.min(b1.x, b2.x), Math.max(b1.x, b2.x)) > 8
  }
  if (Math.abs(a1.x - b1.x) > clearance) return false
  return rangeOverlap(Math.min(a1.y, a2.y), Math.max(a1.y, a2.y), Math.min(b1.y, b2.y), Math.max(b1.y, b2.y)) > 8
}

export function cleanPath(points: Point[]) {
  const rounded = points.map((point) => ({ x: Math.round(point.x), y: Math.round(point.y) }))
  const deduped = rounded.filter((point, index) => {
    const previous = rounded[index - 1]
    return !previous || Math.abs(previous.x - point.x) > 0.5 || Math.abs(previous.y - point.y) > 0.5
  })
  return deduped.filter((point, index) => {
    const previous = deduped[index - 1]
    const next = deduped[index + 1]
    if (!previous || !next) return true
    return !((previous.x === point.x && point.x === next.x) || (previous.y === point.y && point.y === next.y))
  })
}

export function pathBounds(points: Point[]): Rect {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function rangeOverlap(aMin: number, aMax: number, bMin: number, bMax: number) {
  return Math.min(aMax, bMax) - Math.max(aMin, bMin)
}
