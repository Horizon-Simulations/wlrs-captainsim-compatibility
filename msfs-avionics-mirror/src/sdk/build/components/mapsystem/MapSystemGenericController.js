import { MapSystemController } from './MapSystemController';
/**
 * A map controller which delegates its behavior to injected callback functions.
 */
export class MapSystemGenericController extends MapSystemController {
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param callbacks The callback functions to which this controller delegates its behavior.
     */
    constructor(context, callbacks) {
        super(context);
        this.callbacks = callbacks;
    }
    /** @inheritdoc */
    onAfterMapRender() {
        this.callbacks.onAfterMapRender && this.callbacks.onAfterMapRender(this.context);
    }
    /** @inheritdoc */
    onDeadZoneChanged(deadZone) {
        this.callbacks.onDeadZoneChanged && this.callbacks.onDeadZoneChanged(this.context, deadZone);
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.callbacks.onMapProjectionChanged && this.callbacks.onMapProjectionChanged(this.context, mapProjection, changeFlags);
    }
    /** @inheritdoc */
    onBeforeUpdated(time, elapsed) {
        this.callbacks.onBeforeUpdated && this.callbacks.onBeforeUpdated(this.context, time, elapsed);
    }
    /** @inheritdoc */
    onAfterUpdated(time, elapsed) {
        this.callbacks.onAfterUpdated && this.callbacks.onAfterUpdated(this.context, time, elapsed);
    }
    /** @inheritdoc */
    onWake() {
        this.callbacks.onWake && this.callbacks.onWake(this.context);
    }
    /** @inheritdoc */
    onSleep() {
        this.callbacks.onSleep && this.callbacks.onSleep(this.context);
    }
    /** @inheritdoc */
    onMapDestroyed() {
        this.callbacks.onMapDestroyed && this.callbacks.onMapDestroyed(this.context);
    }
    /** @inheritdoc */
    destroy() {
        super.destroy();
        this.callbacks.onDestroyed && this.callbacks.onDestroyed(this.context);
    }
}
