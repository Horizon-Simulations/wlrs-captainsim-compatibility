/**
 * A map controller.
 */
export class MapSystemController {
    /**
     * Constructor.
     * @param context This controller's map context.
     */
    constructor(context) {
        this._isAlive = true;
        this.context = context;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** Whether this controller is alive. */
    get isAlive() {
        return this._isAlive;
    }
    /**
     * This method is called after this controller' map is rendered.
     * @param ref A reference to the rendered map.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterMapRender(ref) {
        // noop
    }
    /**
     * This method is called when the dead zone of this controller's map changes.
     * @param deadZone The map's new dead zone.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDeadZoneChanged(deadZone) {
        // noop
    }
    /**
     * This method is called when the projection of this controller's map changes.
     * @param mapProjection The map projection.
     * @param changeFlags Bit flags describing the type of change.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMapProjectionChanged(mapProjection, changeFlags) {
        // noop
    }
    /**
     * This method is called immediately before this controller's map updates its layers.
     * @param time The current sim time, as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeUpdated(time, elapsed) {
        // noop
    }
    /**
     * This method is called immediately after this controller's map updates its layers.
     * @param time The current sim time, as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterUpdated(time, elapsed) {
        // noop
    }
    /**
     * This method is called when this controller's map is awakened.
     */
    onWake() {
        // noop
    }
    /**
     * This method is called when this controller's map is put to sleep.
     */
    onSleep() {
        // noop
    }
    /**
     * This method is called when this controller's map is destroyed.
     */
    onMapDestroyed() {
        // noop
    }
    /**
     * Destroys this controller.
     */
    destroy() {
        this._isAlive = false;
    }
}
