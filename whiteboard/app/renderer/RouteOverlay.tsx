import { useEffect, useRef } from 'react'
import type { StepModel } from '../model/steps'
import type { DirectionCue, LinkKind } from '../model/topology'
import type { Point, RouteSceneLayout } from '../routing/types'

interface RouteOverlayProps {
  layout: RouteSceneLayout
  step: StepModel
  pulseLinks: Set<string>
  width: number
  height: number
}

export function RouteOverlay({ layout, step, pulseLinks, width, height }: RouteOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const focused = new Set(step.active ?? step.focus ?? [])
  const hasFocus = focused.size > 0

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, width, height)

    for (const route of layout.routes) {
      const dimmed = hasFocus && !focused.has(route.id) && !focused.has(route.sourceId) && !focused.has(route.targetId)
      const pulsing = pulseLinks.has(route.id)
      drawRoute(context, route.points, route.kind, route.directionCue, { dimmed, pulsing })
    }
  }, [focused, hasFocus, height, layout.routes, pulseLinks, width])

  return (
    <div className="ot-route-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="ot-route-canvas" />
      {layout.labels.map((label) => (
        <div
          key={label.id}
          className={`ot-route-label-wrap ${hasFocus && !focused.has(label.linkId) ? 'is-dimmed' : ''}`}
          style={{ left: label.x, top: label.y, width: label.w, height: label.h }}
        >
          <div className="ot-route-label">{label.text}</div>
        </div>
      ))}
    </div>
  )
}

function drawRoute(
  context: CanvasRenderingContext2D,
  points: Point[],
  kind: LinkKind,
  cue: DirectionCue,
  state: { dimmed: boolean; pulsing: boolean }
) {
  if (points.length < 2) return
  const style = routeStyle(kind, state)
  context.save()
  context.globalAlpha = state.dimmed ? 0.18 : 1
  context.strokeStyle = state.pulsing ? '#168a43' : style.color
  context.lineWidth = state.pulsing ? style.width + 1.8 : style.width
  context.lineCap = 'butt'
  context.lineJoin = 'round'
  context.setLineDash(style.dash)
  context.beginPath()
  context.moveTo(points[0].x, points[0].y)
  for (const point of points.slice(1)) context.lineTo(point.x, point.y)
  context.stroke()
  context.setLineDash([])
  if (cue === 'forward' || cue === 'passive' || cue === 'both') drawArrowhead(context, points[points.length - 2], points[points.length - 1], style.color)
  if (cue === 'reverse' || cue === 'both') drawArrowhead(context, points[1], points[0], style.color)
  context.restore()
}

function routeStyle(kind: LinkKind, state: { pulsing: boolean }) {
  if (state.pulsing) return { color: '#168a43', width: 4.6, dash: [] as number[] }
  switch (kind) {
    case 'service':
      return { color: '#9aaabd', width: 1.55, dash: [] as number[] }
    case 'trunk':
      return { color: '#0f3554', width: 3.8, dash: [] as number[] }
    case 'protocol':
      return { color: '#2e6dab', width: 1.85, dash: [] as number[] }
    case 'span':
      return { color: '#c96a18', width: 2.15, dash: [11, 8] }
    case 'metadata':
      return { color: '#2367aa', width: 2.15, dash: [9, 7] }
    default:
      return { color: '#3a4e63', width: 2.1, dash: [] as number[] }
  }
}

function drawArrowhead(context: CanvasRenderingContext2D, from: Point, to: Point, color: string) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const length = 10
  const width = 7
  context.save()
  context.fillStyle = color
  context.beginPath()
  context.moveTo(to.x, to.y)
  context.lineTo(to.x - length * Math.cos(angle) + width * Math.sin(angle) * 0.5, to.y - length * Math.sin(angle) - width * Math.cos(angle) * 0.5)
  context.lineTo(to.x - length * Math.cos(angle) - width * Math.sin(angle) * 0.5, to.y - length * Math.sin(angle) + width * Math.cos(angle) * 0.5)
  context.closePath()
  context.fill()
  context.restore()
}
