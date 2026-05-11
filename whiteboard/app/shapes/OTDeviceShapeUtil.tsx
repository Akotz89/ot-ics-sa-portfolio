import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  type TLResizeInfo,
  resizeBox,
} from 'tldraw'
import { DeviceIcon } from './icons'
import { OT_DEVICE_SHAPE_TYPE, type OTDeviceShape } from './types'

export class OTDeviceShapeUtil extends BaseBoxShapeUtil<OTDeviceShape> {
  static override type = OT_DEVICE_SHAPE_TYPE

  static override props = {
    w: T.number,
    h: T.number,
    entityId: T.string,
    kind: T.string,
    label: T.string,
    subtitle: T.string,
    zoneId: T.string,
    role: T.string,
  }

  override canBind() {
    return true
  }

  override canResize() {
    return true
  }

  override getDefaultProps(): OTDeviceShape['props'] {
    return {
      w: 170,
      h: 72,
      entityId: 'device',
      kind: 'server',
      label: 'Device',
      subtitle: 'asset',
      zoneId: 'operations',
      role: 'normal',
    }
  }

  override getGeometry(shape: OTDeviceShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: OTDeviceShape, info: TLResizeInfo<OTDeviceShape>) {
    return resizeBox(shape, info, { minWidth: 132, minHeight: 58, maxWidth: 360, maxHeight: 130 })
  }

  override component(shape: OTDeviceShape) {
    const role = shape.props.role || 'normal'
    return (
      <HTMLContainer
        className={`ot-device ot-device-${role} ot-kind-${shape.props.kind}`}
        data-entity-id={shape.props.entityId}
        style={{ width: shape.props.w, height: shape.props.h }}
        onClick={(event) => {
          event.stopPropagation()
          window.dispatchEvent(
            new CustomEvent('ot-node-pulse', { detail: { entityId: shape.props.entityId } })
          )
        }}
      >
        <DeviceIcon kind={shape.props.kind} />
        <span className="ot-device-text">
          <span className="ot-device-label">{shape.props.label}</span>
          <span className="ot-device-subtitle">{shape.props.subtitle}</span>
        </span>
      </HTMLContainer>
    )
  }

  override getIndicatorPath(shape: OTDeviceShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}
