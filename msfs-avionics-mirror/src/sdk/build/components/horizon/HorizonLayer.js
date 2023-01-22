import { DisplayComponent } from '../FSComponent';
/**
 * A base component for horizon layers.
 */
export class HorizonLayer extends DisplayComponent {
    constructor() {
        super(...arguments);
        this._isAttached = false;
        this._isVisible = true;
    }
    /**
     * Checks whether this layer is attached to a horizon component.
     * @returns Whether this layer is attached to a horizon component.
     */
    isAttached() {
        return this._isAttached;
    }
    /**
     * Checks whether this layer is visible.
     * @returns whether this layer is visible.
     */
    isVisible() {
        return this._isVisible;
    }
    /**
     * Sets this layer's visibility.
     * @param val Whether this layer should be visible.
     */
    setVisible(val) {
        if (this._isVisible === val) {
            return;
        }
        this._isVisible = val;
        if (this._isAttached) {
            this.onVisibilityChanged(val);
        }
    }
    /**
     * This method is called when this layer's visibility changes.
     * @param isVisible Whether the layer is now visible.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onVisibilityChanged(isVisible) {
        // noop
    }
    /**
     * This method is called when this layer is attached to its parent horizon component.
     */
    onAttached() {
        this._isAttached = true;
        if (!this._isVisible) {
            this.onVisibilityChanged(this._isVisible);
        }
    }
    /**
     * This method is called when this layer's parent horizon component is awakened.
     */
    onWake() {
        // noop
    }
    /**
     * This method is called when this layer's parent horizon component is put to sleep.
     */
    onSleep() {
        // noop
    }
    /**
     * This method is called when this layer's horizon projection changes.
     * @param projection This layer's horizon projection.
     * @param changeFlags The types of changes made to the projection.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onProjectionChanged(projection, changeFlags) {
        // noop
    }
    /**
     * This method is called once every update cycle.
     * @param time The current time as a UNIX timestamp.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onUpdated(time, elapsed) {
        // noop
    }
    /**
     * This method is called when this layer is detached from its parent horizon component.
     */
    onDetached() {
        this._isAttached = false;
    }
}
