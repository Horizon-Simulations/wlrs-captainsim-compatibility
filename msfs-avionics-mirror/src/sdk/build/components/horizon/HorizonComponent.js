import { BitFlags } from '../../math/BitFlags';
import { SubscribableUtils } from '../../sub/SubscribableUtils';
import { DisplayComponent, FSComponent } from '../FSComponent';
import { HorizonLayer } from './HorizonLayer';
import { HorizonProjection, HorizonProjectionChangeType } from './HorizonProjection';
/**
 * A component which displays an artificial horizon. A horizon tracks the position, altitude, heading, pitch, and roll
 * of an airplane and uses a persepctive projection to project points in space to a planar pixel grid. Each horizon
 * component maintains a {@link HorizonComponent} instance which handles the details of the projection.
 * {@link HorizonLayer} objects added to the horizon as children determine what is drawn in the horizon window.
 */
export class HorizonComponent extends DisplayComponent {
    /** @inheritdoc */
    constructor(props) {
        var _a;
        super(props);
        this.layerEntries = [];
        this.lastUpdateTime = 0;
        this._isAwake = true;
        this.projectedSize = SubscribableUtils.toSubscribable(this.props.projectedSize, true);
        this.fov = SubscribableUtils.toSubscribable(this.props.fov, true);
        if (this.props.fovEndpoints !== undefined) {
            this.fovEndpoints = SubscribableUtils.toSubscribable(this.props.fovEndpoints, true);
        }
        if (this.props.projectedOffset !== undefined) {
            this.projectedOffset = SubscribableUtils.toSubscribable(this.props.projectedOffset, true);
        }
        const initialSize = this.projectedSize.get();
        const initialFov = this.fov.get();
        if (this.props.projection !== undefined) {
            this.props.projection.set({ projectedSize: initialSize, fov: initialFov });
        }
        this.projection = (_a = this.props.projection) !== null && _a !== void 0 ? _a : new HorizonProjection(initialSize[0], initialSize[1], initialFov);
    }
    /**
     * Gets the size of this map's projected window, in pixels.
     * @returns The size of this map's projected window.
     */
    getProjectedSize() {
        return this.projection.getProjectedSize();
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * Whether this horizon is awake.
     */
    get isAwake() {
        return this._isAwake;
    }
    /**
     * Puts this horizon to sleep. While asleep, this horizon will not be updated.
     */
    sleep() {
        this.setAwakeState(false);
    }
    /**
     * Wakes this horizon, allowing it to be updated.
     */
    wake() {
        this.setAwakeState(true);
    }
    /**
     * Sets this horizon's awake state. If the new awake state is the same as the current state, nothing will happen.
     * Otherwise, this horizon's layers will be notified that the map has either been woken or put to sleep.
     * @param isAwake The new awake state.
     */
    setAwakeState(isAwake) {
        if (this._isAwake === isAwake) {
            return;
        }
        this._isAwake = isAwake;
        this._isAwake ? this.onWake() : this.onSleep();
    }
    /** @inheritdoc */
    onAfterRender(thisNode) {
        var _a, _b;
        this.projection.onChange(this.onProjectionChanged.bind(this));
        this.projectedSizeSub = this.projectedSize.sub(size => {
            this.projection.set({ projectedSize: size });
        }, true);
        this.fovSub = this.fov.sub(fov => {
            this.projection.set({ fov });
        }, true);
        this.fovEndpointsSub = (_a = this.fovEndpoints) === null || _a === void 0 ? void 0 : _a.sub(fovEndpoints => {
            this.projection.set({ fovEndpoints });
        }, true);
        this.projectedOffsetSub = (_b = this.projectedOffset) === null || _b === void 0 ? void 0 : _b.sub(projectedOffset => {
            this.projection.set({ projectedOffset });
        }, true);
        this.attachLayers(thisNode);
        if (!this._isAwake) {
            this.sleepLayers();
        }
    }
    /**
     * Scans this component's VNode sub-tree for HorizonLayer components and attaches them when found. Only the top-most
     * level of HorizonLayer components are attached; layers that are themselves children of other layers are not
     * attached.
     * @param thisNode This component's VNode.
     */
    attachLayers(thisNode) {
        FSComponent.visitNodes(thisNode, node => {
            if (node.instance instanceof HorizonLayer) {
                this.attachLayer(node.instance);
                return true;
            }
            return false;
        });
    }
    /**
     * This method is called when this horizon is awakened.
     */
    onWake() {
        this.wakeLayers();
    }
    /**
     * Calls the onWake() method of this horizon's layers.
     */
    wakeLayers() {
        const len = this.layerEntries.length;
        for (let i = 0; i < len; i++) {
            this.layerEntries[i].layer.onWake();
        }
    }
    /**
     * This method is called when this horizon is put to sleep.
     */
    onSleep() {
        this.sleepLayers();
    }
    /**
     * Calls the onSleep() method of this horizon's layers.
     */
    sleepLayers() {
        const len = this.layerEntries.length;
        for (let i = 0; i < len; i++) {
            this.layerEntries[i].layer.onSleep();
        }
    }
    /**
     * This method is called when this horizon's projection changes.
     * @param projection This horizon's projection.
     * @param changeFlags The types of changes made to the projection.
     */
    onProjectionChanged(projection, changeFlags) {
        if (BitFlags.isAll(changeFlags, HorizonProjectionChangeType.ProjectedSize)) {
            this.onProjectedSizeChanged();
        }
        const len = this.layerEntries.length;
        for (let i = 0; i < len; i++) {
            this.layerEntries[i].layer.onProjectionChanged(projection, changeFlags);
        }
    }
    /**
     * This method is called when the size of this horizon's projected window changes.
     */
    onProjectedSizeChanged() {
        // noop
    }
    /**
     * Attaches a layer to this horizon component. If the layer is already attached, then this method has no effect.
     * @param layer The layer to attach.
     */
    attachLayer(layer) {
        if (this.layerEntries.findIndex(entry => entry.layer === layer) >= 0) {
            return;
        }
        const entry = new LayerEntry(layer);
        this.layerEntries.push(entry);
        entry.attach();
    }
    /**
     * Detaches a layer from this horizon component.
     * @param layer The layer to detach.
     * @returns Whether the layer was succesfully detached.
     */
    detachLayer(layer) {
        const index = this.layerEntries.findIndex(entry => entry.layer === layer);
        if (index >= 0) {
            const entry = this.layerEntries[index];
            entry.detach();
            this.layerEntries.splice(index, 1);
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Updates this horizon.
     * @param time The current real time as a UNIX timestamp in milliseconds.
     */
    update(time) {
        if (!this._isAwake) {
            return;
        }
        this.onUpdated(time, time - this.lastUpdateTime);
        this.lastUpdateTime = time;
    }
    /**
     * This method is called once every update cycle.
     * @param time The current real time as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    onUpdated(time, elapsed) {
        this.updateLayers(time, elapsed);
    }
    /**
     * Updates this horizon's attached layers.
     * @param time The current real time as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateLayers(time, elapsed) {
        const len = this.layerEntries.length;
        for (let i = 0; i < len; i++) {
            this.layerEntries[i].update(time);
        }
    }
    /** @inheritdoc */
    render() {
        var _a;
        return (FSComponent.buildComponent("div", { class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '' }, this.props.children));
    }
    /** @inheritdoc */
    destroy() {
        var _a, _b, _c, _d;
        super.destroy();
        (_a = this.projectedSizeSub) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.fovSub) === null || _b === void 0 ? void 0 : _b.destroy();
        (_c = this.fovEndpointsSub) === null || _c === void 0 ? void 0 : _c.destroy();
        (_d = this.projectedOffsetSub) === null || _d === void 0 ? void 0 : _d.destroy();
        const len = this.layerEntries.length;
        for (let i = 0; i < len; i++) {
            this.layerEntries[i].destroy();
        }
    }
}
/**
 * An entry for a horizon layer.
 */
class LayerEntry {
    /**
     * Constructor.
     * @param layer This entry's map layer.
     */
    constructor(layer) {
        this.layer = layer;
        this.updatePeriod = 0;
        this.lastUpdated = 0;
    }
    /**
     * Attaches this layer entry.
     */
    attach() {
        var _a, _b;
        (_a = this.updateFreqSub) === null || _a === void 0 ? void 0 : _a.destroy();
        this.updateFreqSub = (_b = this.layer.props.updateFreq) === null || _b === void 0 ? void 0 : _b.sub((freq) => {
            const clamped = Math.max(0, freq);
            this.updatePeriod = clamped === 0 ? 0 : 1000 / clamped;
        }, true);
        this.layer.onAttached();
    }
    /**
     * Updates this layer entry.
     * @param currentTime The current time as a UNIX timestamp.
     */
    update(currentTime) {
        if (currentTime - this.lastUpdated >= this.updatePeriod) {
            this.layer.onUpdated(currentTime, currentTime - this.lastUpdated);
            this.lastUpdated = currentTime;
        }
    }
    /**
     * Detaches this layer entry.
     */
    detach() {
        var _a;
        (_a = this.updateFreqSub) === null || _a === void 0 ? void 0 : _a.destroy();
        this.layer.onDetached();
    }
    /**
     * Destroys this layer entry. This will detach this entry's layer and destroy it.
     */
    destroy() {
        this.detach();
        this.layer.destroy();
    }
}
