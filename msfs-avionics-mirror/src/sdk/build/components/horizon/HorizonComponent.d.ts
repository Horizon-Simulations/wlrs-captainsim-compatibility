import { ReadonlyFloat64Array } from '../../math/VecMath';
import { Subscribable } from '../../sub/Subscribable';
import { SubscribableSet } from '../../sub/SubscribableSet';
import { ComponentProps, DisplayComponent, VNode } from '../FSComponent';
import { HorizonLayer } from './HorizonLayer';
import { HorizonProjection } from './HorizonProjection';
/**
 * Component props for HorizonComponent.
 */
export interface HorizonComponentProps extends ComponentProps {
    /** The size, as `[width, height]` in pixels, of the horizon component's projected window. */
    projectedSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
    /** The field of view, in degrees, of the horizon component's projected window. */
    fov: number | Subscribable<number>;
    /**
     * The projected endpoints at which to measure the field of view as `[x1, y1, x2, y2]` with each component expressed
     * relative to the width or height of the projected window. Defaults to `[0.5, 0, 0.5, 1]`.
     */
    fovEndpoints?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
    /** The projected offset of the center of the projection, as `[x, y]` in pixels. Defaults to `[0, 0]`. */
    projectedOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
    /** A projection to inject. A default will be used if none is provided. */
    projection?: HorizonProjection;
    /** CSS class(es) to apply to the root of the horizon component. */
    class?: string | SubscribableSet<string>;
}
/**
 * A component which displays an artificial horizon. A horizon tracks the position, altitude, heading, pitch, and roll
 * of an airplane and uses a persepctive projection to project points in space to a planar pixel grid. Each horizon
 * component maintains a {@link HorizonComponent} instance which handles the details of the projection.
 * {@link HorizonLayer} objects added to the horizon as children determine what is drawn in the horizon window.
 */
export declare class HorizonComponent<P extends HorizonComponentProps = HorizonComponentProps> extends DisplayComponent<P> {
    /**
     * This horizon component's projection.
     */
    readonly projection: HorizonProjection;
    private readonly layerEntries;
    private readonly projectedSize;
    private readonly fov;
    private readonly fovEndpoints?;
    private readonly projectedOffset?;
    private lastUpdateTime;
    private _isAwake;
    private projectedSizeSub?;
    private fovSub?;
    private fovEndpointsSub?;
    private projectedOffsetSub?;
    /** @inheritdoc */
    constructor(props: P);
    /**
     * Gets the size of this map's projected window, in pixels.
     * @returns The size of this map's projected window.
     */
    getProjectedSize(): ReadonlyFloat64Array;
    /**
     * Whether this horizon is awake.
     */
    get isAwake(): boolean;
    /**
     * Puts this horizon to sleep. While asleep, this horizon will not be updated.
     */
    sleep(): void;
    /**
     * Wakes this horizon, allowing it to be updated.
     */
    wake(): void;
    /**
     * Sets this horizon's awake state. If the new awake state is the same as the current state, nothing will happen.
     * Otherwise, this horizon's layers will be notified that the map has either been woken or put to sleep.
     * @param isAwake The new awake state.
     */
    private setAwakeState;
    /** @inheritdoc */
    onAfterRender(thisNode: VNode): void;
    /**
     * Scans this component's VNode sub-tree for HorizonLayer components and attaches them when found. Only the top-most
     * level of HorizonLayer components are attached; layers that are themselves children of other layers are not
     * attached.
     * @param thisNode This component's VNode.
     */
    protected attachLayers(thisNode: VNode): void;
    /**
     * This method is called when this horizon is awakened.
     */
    protected onWake(): void;
    /**
     * Calls the onWake() method of this horizon's layers.
     */
    protected wakeLayers(): void;
    /**
     * This method is called when this horizon is put to sleep.
     */
    protected onSleep(): void;
    /**
     * Calls the onSleep() method of this horizon's layers.
     */
    protected sleepLayers(): void;
    /**
     * This method is called when this horizon's projection changes.
     * @param projection This horizon's projection.
     * @param changeFlags The types of changes made to the projection.
     */
    protected onProjectionChanged(projection: HorizonProjection, changeFlags: number): void;
    /**
     * This method is called when the size of this horizon's projected window changes.
     */
    protected onProjectedSizeChanged(): void;
    /**
     * Attaches a layer to this horizon component. If the layer is already attached, then this method has no effect.
     * @param layer The layer to attach.
     */
    protected attachLayer(layer: HorizonLayer): void;
    /**
     * Detaches a layer from this horizon component.
     * @param layer The layer to detach.
     * @returns Whether the layer was succesfully detached.
     */
    protected detachLayer(layer: HorizonLayer): boolean;
    /**
     * Updates this horizon.
     * @param time The current real time as a UNIX timestamp in milliseconds.
     */
    update(time: number): void;
    /**
     * This method is called once every update cycle.
     * @param time The current real time as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    protected onUpdated(time: number, elapsed: number): void;
    /**
     * Updates this horizon's attached layers.
     * @param time The current real time as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    protected updateLayers(time: number, elapsed: number): void;
    /** @inheritdoc */
    render(): VNode;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=HorizonComponent.d.ts.map