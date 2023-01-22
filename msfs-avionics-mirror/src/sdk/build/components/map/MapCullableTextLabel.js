import { SubEvent } from '../../sub/SubEvent';
import { SubscribableUtils } from '../../sub/SubscribableUtils';
import { MapLocationTextLabel } from './MapTextLabel';
/**
 * A cullable text label associated with a specific geographic location.
 */
export class MapCullableLocationTextLabel extends MapLocationTextLabel {
    /**
     * Constructor.
     * @param text The text of this label, or a subscribable which provides it.
     * @param priority The priority of this label, or a subscribable which provides it.
     * @param location The geographic location of this label, or a subscribable which provides it.
     * @param alwaysShow Whether this label is immune to culling, or a subscribable which provides it.
     * @param options Options with which to initialize this label.
     */
    constructor(text, priority, location, alwaysShow, options) {
        super(text, priority, location, options);
        /** @inheritdoc */
        this.bounds = new Float64Array(4);
        /** @inheritdoc */
        this.invalidation = new SubEvent();
        this.subs = [];
        this.alwaysShow = SubscribableUtils.toSubscribable(alwaysShow, true);
        this.subs.push(this.priority.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.alwaysShow.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.location.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.text.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.fontSize.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.anchor.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.offset.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.bgPadding.sub(() => { this.invalidation.notify(this); }));
        this.subs.push(this.bgOutlineWidth.sub(() => { this.invalidation.notify(this); }));
    }
    /** @inheritdoc */
    updateBounds(mapProjection) {
        const fontSize = this.fontSize.get();
        const anchor = this.anchor.get();
        const width = 0.6 * fontSize * this.text.get().length;
        const height = fontSize;
        const pos = this.getPosition(mapProjection, MapCullableLocationTextLabel.tempVec2);
        let left = pos[0] - anchor[0] * width;
        let right = left + width;
        let top = pos[1] - anchor[1] * height;
        let bottom = top + height;
        if (this.showBg.get()) {
            const bgPadding = this.bgPadding.get();
            const bgOutlineWidth = this.bgOutlineWidth.get();
            left -= (bgPadding[3] + bgOutlineWidth);
            right += (bgPadding[1] + bgOutlineWidth);
            top -= (bgPadding[0] + bgOutlineWidth);
            bottom += (bgPadding[2] + bgOutlineWidth);
        }
        this.bounds[0] = left;
        this.bounds[1] = top;
        this.bounds[2] = right;
        this.bounds[3] = bottom;
    }
    /**
     * Destroys this label.
     */
    destroy() {
        for (const sub of this.subs) {
            sub.destroy();
        }
    }
}
/**
 * Manages a set of MapCullableTextLabels. Colliding labels will be culled based on their render priority. Labels with
 * lower priorities will be culled before labels with higher priorities.
 */
export class MapCullableTextLabelManager {
    /**
     * Creates an instance of the MapCullableTextLabelManager.
     * @param cullingEnabled Whether or not culling of labels is enabled.
     */
    constructor(cullingEnabled = true) {
        this.cullingEnabled = cullingEnabled;
        this.registered = new Map();
        this._visibleLabels = [];
        this.needUpdate = false;
        this.lastScaleFactor = 1;
        this.lastRotation = 0;
        this.invalidationHandler = () => { this.needUpdate = true; };
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** An array of labels registered with this manager that are visible. */
    get visibleLabels() {
        return this._visibleLabels;
    }
    /**
     * Registers a label with this manager. Newly registered labels will be processed with the next manager update.
     * @param label The label to register.
     */
    register(label) {
        if (this.registered.has(label)) {
            return;
        }
        this.registered.set(label, label.invalidation.on(this.invalidationHandler));
        this.needUpdate = true;
    }
    /**
     * Deregisters a label with this manager. Newly deregistered labels will be processed with the next manager update.
     * @param label The label to deregister.
     */
    deregister(label) {
        const sub = this.registered.get(label);
        if (sub === undefined) {
            return;
        }
        sub.destroy();
        this.registered.delete(label);
        this.needUpdate = true;
    }
    /**
     * Sets whether or not text label culling is enabled.
     * @param enabled Whether or not culling is enabled.
     */
    setCullingEnabled(enabled) {
        this.cullingEnabled = enabled;
        this.needUpdate = true;
    }
    /**
     * Updates this manager.
     * @param mapProjection The projection of the map to which this manager's labels are to be drawn.
     */
    update(mapProjection) {
        if (!this.needUpdate) {
            const scaleFactorRatio = mapProjection.getScaleFactor() / this.lastScaleFactor;
            if (scaleFactorRatio < MapCullableTextLabelManager.SCALE_UPDATE_THRESHOLD && scaleFactorRatio > 1 / MapCullableTextLabelManager.SCALE_UPDATE_THRESHOLD) {
                const rotationDelta = Math.abs(mapProjection.getRotation() - this.lastRotation);
                if (Math.min(rotationDelta, 2 * Math.PI - rotationDelta) < MapCullableTextLabelManager.ROTATION_UPDATE_THRESHOLD) {
                    return;
                }
            }
        }
        this._visibleLabels = [];
        if (this.cullingEnabled) {
            const labelArray = Array.from(this.registered.keys());
            const len = labelArray.length;
            for (let i = 0; i < len; i++) {
                labelArray[i].updateBounds(mapProjection);
            }
            labelArray.sort(MapCullableTextLabelManager.SORT_FUNC);
            const collisionArray = [];
            for (let i = 0; i < len; i++) {
                const label = labelArray[i];
                let show = true;
                if (!label.alwaysShow.get()) {
                    const len2 = collisionArray.length;
                    for (let j = 0; j < len2; j++) {
                        const other = collisionArray[j];
                        if (MapCullableTextLabelManager.doesCollide(label.bounds, other)) {
                            show = false;
                            break;
                        }
                    }
                }
                if (show) {
                    collisionArray.push(label.bounds);
                    this._visibleLabels.push(label);
                }
            }
        }
        else {
            this._visibleLabels.push(...this.registered.keys());
        }
        this.lastScaleFactor = mapProjection.getScaleFactor();
        this.lastRotation = mapProjection.getRotation();
        this.needUpdate = false;
    }
    /**
     * Checks if two bounding boxes collide.
     * @param a The first bounding box, as a 4-tuple [left, top, right, bottom].
     * @param b The second bounding box, as a 4-tuple [left, top, right, bottom].
     * @returns whether the bounding boxes collide.
     */
    static doesCollide(a, b) {
        return a[0] < b[2]
            && a[2] > b[0]
            && a[1] < b[3]
            && a[3] > b[1];
    }
}
MapCullableTextLabelManager.SCALE_UPDATE_THRESHOLD = 1.2;
MapCullableTextLabelManager.ROTATION_UPDATE_THRESHOLD = Math.PI / 6;
MapCullableTextLabelManager.SORT_FUNC = (a, b) => {
    const alwaysShowA = a.alwaysShow.get();
    const alwaysShowB = b.alwaysShow.get();
    if (alwaysShowA && !alwaysShowB) {
        return -1;
    }
    else if (alwaysShowB && !alwaysShowA) {
        return 1;
    }
    else {
        return b.priority.get() - a.priority.get();
    }
};
