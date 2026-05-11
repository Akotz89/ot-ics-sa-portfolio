import type { Box } from 'tldraw'
import type { DirectionCue, LinkKind, PortName, RouteClass } from '../model/topology'

export interface Point {
  x: number
  y: number
}

export interface Obstacle {
  id: string
  kind: 'device' | 'zone-header' | 'label'
  box: Box
  ownerId?: string
}

export interface RouteLabelLayout {
  id: string
  linkId: string
  text: string
  x: number
  y: number
  w: number
  h: number
}

export interface RouteLayout {
  id: string
  kind: LinkKind
  routeClass: RouteClass
  directionCue: DirectionCue
  sourceId: string
  targetId: string
  sourcePort: PortName
  targetPort: PortName
  points: Point[]
  label?: RouteLabelLayout
}

export interface RouteSceneLayout {
  routes: RouteLayout[]
  labels: RouteLabelLayout[]
  errors: string[]
}
