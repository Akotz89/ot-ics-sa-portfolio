import type { CSSProperties } from 'react'
import type { Editor } from 'tldraw'
import type { StepModel } from '../model/steps'
import type { DirectionCue, LinkKind } from '../model/topology'
import type { Point, RouteLabelLayout, RouteLayout, RouteSceneLayout } from '../routing/types'

interface RouteOverlayProps {
  editor: Editor | null
  layout: RouteSceneLayout
  step: StepModel
  pulseLinks: Set<string>
}

export function RouteOverlay({ editor, layout, step, pulseLinks }: RouteOverlayProps) {
  if (!editor) return null

  const camera = editor.getCamera()
  const focused = new Set(step.focus ?? [])
  const hasFocus = focused.size > 0

  return (
    <svg className="ot-route-overlay" aria-hidden="true">
      <defs>
        <marker id="ot-route-arrow-dark" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M 1 1 L 11 6 L 1 11 z" />
        </marker>
        <marker id="ot-route-arrow-blue" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M 1 1 L 11 6 L 1 11 z" />
        </marker>
        <marker id="ot-route-arrow-orange" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M 1 1 L 11 6 L 1 11 z" />
        </marker>
      </defs>
      {layout.routes.map((route) => {
        const pulse = pulseLinks.has(route.id)
        const dimmed = hasFocus && !focused.has(route.id)
        return (
          <path
            key={route.id}
            className={`ot-route ot-route-${route.kind} ${pulse ? 'is-pulsing' : ''} ${dimmed ? 'is-dimmed' : ''}`}
            d={pathData(route.points.map((point) => editor.pageToViewport(point)))}
            style={markerStyle(route.kind, route.directionCue)}
          />
        )
      })}
      {layout.labels.map((label) => (
        <RouteLabel key={label.id} editor={editor} label={label} zoom={camera.z} dimmed={hasFocus && !focused.has(label.linkId)} />
      ))}
    </svg>
  )
}

function RouteLabel({ editor, label, zoom, dimmed }: { editor: Editor; label: RouteLabelLayout; zoom: number; dimmed: boolean }) {
  const point = editor.pageToViewport({ x: label.x, y: label.y })
  return (
    <foreignObject
      className={`ot-route-label-wrap ${dimmed ? 'is-dimmed' : ''}`}
      x={point.x}
      y={point.y}
      width={label.w * zoom}
      height={label.h * zoom}
    >
      <div className="ot-route-label" style={{ '--route-label-scale': String(zoom) } as CSSProperties}>
        {label.text}
      </div>
    </foreignObject>
  )
}

function pathData(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${round(point.x)} ${round(point.y)}`).join(' ')
}

function markerStyle(kind: LinkKind, cue: DirectionCue): CSSProperties {
  const marker = kind === 'span' ? 'orange' : kind === 'metadata' || kind === 'protocol' ? 'blue' : 'dark'
  if (cue === 'both') {
    return {
      markerStart: `url(#ot-route-arrow-${marker})`,
      markerEnd: `url(#ot-route-arrow-${marker})`,
    } as CSSProperties
  }
  if (cue === 'forward' || cue === 'passive') {
    return { markerEnd: `url(#ot-route-arrow-${marker})` } as CSSProperties
  }
  if (cue === 'reverse') {
    return { markerStart: `url(#ot-route-arrow-${marker})` } as CSSProperties
  }
  return {}
}

function round(value: number) {
  return Math.round(value * 10) / 10
}
