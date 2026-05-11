import type { EntityKind } from '../model/topology'

export function DeviceIcon({ kind }: { kind: EntityKind }) {
  const className = `ot-icon ot-icon-${iconForKind(kind)}`
  return <span className={className} aria-hidden="true" />
}

function iconForKind(kind: EntityKind) {
  switch (kind) {
    case 'firewall':
      return 'firewall'
    case 'switch':
      return 'switch'
    case 'server':
    case 'store':
      return 'server'
    case 'workstation':
      return 'workstation'
    case 'controller':
      return 'controller'
    case 'sensor':
      return 'sensor'
    case 'identity':
      return 'identity'
    case 'soc-app':
      return 'database'
    case 'ticketing':
    case 'gateway':
    case 'broker':
    case 'jump':
      return 'app'
    default:
      return 'app'
  }
}
