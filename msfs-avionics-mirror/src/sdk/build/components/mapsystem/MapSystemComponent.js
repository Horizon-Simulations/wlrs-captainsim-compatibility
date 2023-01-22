import { VecNSubject } from '../../math/VectorSubject';
import { ObjectSubject } from '../../sub/ObjectSubject';
import { FSComponent } from '../FSComponent';
import { MapComponent } from '../map/MapComponent';
/**
 * A component that encompasses the compiled map system.
 */
export class MapSystemComponent extends MapComponent {
    /** @inheritdoc */
    constructor(props) {
        var _a;
        super(props);
        this.rootStyles = ObjectSubject.create({
            width: '0px',
            height: '0px'
        });
        this.deadZone = (_a = this.props.deadZone) !== null && _a !== void 0 ? _a : VecNSubject.create(new Float64Array(4));
        this.deadZone.sub(this.onDeadZoneChanged.bind(this));
    }
    /** @inheritdoc */
    onAfterRender(thisNode) {
        super.onAfterRender(thisNode);
        this.onProjectedSizeChanged();
        this.props.onAfterRender();
    }
    /**
     * This method is called when the size of this map's dead zone changes.
     * @param deadZone The dead zone.
     */
    onDeadZoneChanged(deadZone) {
        this.props.onDeadZoneChanged(deadZone);
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        super.onMapProjectionChanged(mapProjection, changeFlags);
        this.props.onMapProjectionChanged(mapProjection, changeFlags);
    }
    /**
     * Sets the size of this map's root HTML element.
     * @param size The new size, in pixels.
     */
    setRootSize(size) {
        this.rootStyles.set('width', `${size[0]}px`);
        this.rootStyles.set('height', `${size[1]}px`);
    }
    /** @inheritdoc */
    onProjectedSizeChanged() {
        this.setRootSize(this.mapProjection.getProjectedSize());
    }
    /** @inheritdoc */
    onUpdated(time, elapsed) {
        this.props.onBeforeUpdated(time, elapsed);
        super.onUpdated(time, elapsed);
        this.props.onAfterUpdated(time, elapsed);
    }
    /** @inheritdoc */
    onWake() {
        super.onWake();
        this.props.onWake();
    }
    /** @inheritdoc */
    onSleep() {
        super.onSleep();
        this.props.onSleep();
    }
    /** @inheritdoc */
    render() {
        var _a;
        return (FSComponent.buildComponent("div", { style: this.rootStyles, class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '' }, this.props.children));
    }
    /** @inheritdoc */
    destroy() {
        super.destroy();
        this.props.onDestroy();
    }
}
