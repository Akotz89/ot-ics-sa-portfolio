import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  type TLResizeInfo,
  resizeBox,
} from 'tldraw'
import { OT_ZONE_SHAPE_TYPE, type OTZoneShape } from './types'

export class OTZoneShapeUtil extends BaseBoxShapeUtil<OTZoneShape> {
  static override type = OT_ZONE_SHAPE_TYPE

  static override props = {
    w: T.number,
    h: T.number,
    zoneId: T.string,
    title: T.string,
    subtitle: T.string,
  }

  override canBind() {
    return false
  }

  override canResize() {
    return true
  }

  override getDefaultProps(): OTZoneShape['props'] {
    return {
      w: 400,
      h: 260,
      zoneId: 'operations',
      title: 'Zone',
      subtitle: 'scope',
    }
  }

  override getGeometry(shape: OTZoneShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: OTZoneShape, info: TLResizeInfo<OTZoneShape>) {
    return resizeBox(shape, info, { minWidth: 240, minHeight: 160 })
  }

  override component(shape: OTZoneShape) {
    return (
      <HTMLContainer
        className={`ot-zone ot-zone-${shape.props.zoneId}`}
        style={{ width: shape.props.w, height: shape.props.h }}
      >
        <div className="ot-zone-title">{shape.props.title}</div>
        <div className="ot-zone-subtitle">{shape.props.subtitle}</div>
      </HTMLContainer>
    )
  }

  override getIndicatorPath(shape: OTZoneShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}
