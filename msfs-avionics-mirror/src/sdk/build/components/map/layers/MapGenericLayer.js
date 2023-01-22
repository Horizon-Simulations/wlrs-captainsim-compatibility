import { FSComponent } from '../../FSComponent';
import { MapLayer } from '../MapLayer';
/**
 * A generic map layer which renders its children.
 */
export class MapGenericLayer extends MapLayer {
    /** @inheritdoc */
    onVisibilityChanged(isVisible) {
        this.props.onVisibilityChanged && this.props.onVisibilityChanged(this, isVisible);
    }
    /** @inheritdoc */
    onAttached() {
        this.props.onAttached && this.props.onAttached(this);
    }
    /** @inheritdoc */
    onWake() {
        this.props.onWake && this.props.onWake(this);
    }
    /** @inheritdoc */
    onSleep() {
        this.props.onSleep && this.props.onSleep(this);
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.props.onMapProjectionChanged && this.props.onMapProjectionChanged(this, mapProjection, changeFlags);
    }
    /** @inheritdoc */
    onUpdated(time, elapsed) {
        this.props.onUpdated && this.props.onUpdated(this, time, elapsed);
    }
    /** @inheritdoc */
    onDetached() {
        this.props.onDetached && this.props.onDetached(this);
    }
    /** @inheritdoc */
    render() {
        var _a;
        return (FSComponent.buildComponent("div", { class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '' }, this.props.children));
    }
}
