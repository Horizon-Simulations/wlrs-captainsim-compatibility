import { EventBus } from '../../data/EventBus';
import { ReadonlyFloat64Array } from '../../math/VecMath';
import { Subscribable } from '../../sub/Subscribable';
import { MapLayer } from '../map/MapLayer';
import { MapModel } from '../map/MapModel';
import { MapProjection } from '../map/MapProjection';
import { ContextRecord, ControllerRecord, EmptyRecord, LayerRecord, ModuleRecord } from './MapSystemTypes';
/**
 * A context which holds data related to a compiled MapSystem map.
 */
export declare type MapSystemContext<Modules extends ModuleRecord = EmptyRecord, Layers extends LayerRecord = EmptyRecord, Controllers extends ControllerRecord = EmptyRecord, Context extends ContextRecord = EmptyRecord> = {
    /** The event bus. */
    readonly bus: EventBus;
    /** This context's map model. */
    readonly model: MapModel<Modules>;
    /** This context's map projection. */
    readonly projection: MapProjection;
    /** A subscribable which provides the projected size of this context's map. */
    readonly projectedSize: Subscribable<ReadonlyFloat64Array>;
    /** A subscribable which provides the dead zone of this context's map. */
    readonly deadZone: Subscribable<ReadonlyFloat64Array>;
    /**
     * Retrieves a layer from this context.
     * @param key The key of the layer to retrieve.
     * @returns The layer in this context with the specified key.
     */
    getLayer<K extends keyof Layers & string>(key: K): Layers[K];
    /**
     * Retrieves a controller from this context.
     * @param key The key of the controller to retrieve.
     * @returns The controller in this context with the specified key.
     */
    getController<K extends keyof Controllers & string>(key: K): Controllers[K];
} & Readonly<Context>;
/**
 * A mutable version of {@link MapSystemContext} which allows adding layers and controllers.
 */
export declare type MutableMapContext<T> = T extends MapSystemContext<any, infer Layers, infer Controllers, any> ? T & {
    /**
     * Adds a layer to this context.
     * @param key The key of the layer to add.
     * @param layer The layer to add.
     */
    setLayer<K extends keyof Layers & string>(key: K, layer: Layers[K]): void;
    /**
     * Adds a controller to this context.
     * @param key The key of the controller to add.
     * @param controller The controller to add.
     */
    setController<K extends keyof Controllers & string>(key: K, controller: Controllers[K]): void;
} : never;
/**
 * An implementation of the base properties in {@link MapSystemContext}.
 */
export declare class DefaultMapSystemContext<Modules extends ModuleRecord = EmptyRecord, Layers extends LayerRecord = EmptyRecord, Controllers extends ControllerRecord = EmptyRecord> {
    readonly bus: EventBus;
    readonly projection: MapProjection;
    readonly projectedSize: Subscribable<ReadonlyFloat64Array>;
    readonly deadZone: Subscribable<ReadonlyFloat64Array>;
    /** This context's map model. */
    readonly model: MapModel<Modules>;
    private readonly layers;
    private readonly controllers;
    /**
     * Creates an instance of a MapSystemContext.
     * @param bus This context's event bus.
     * @param projection This context's map projection.
     * @param projectedSize A subscribable which provides the projected size of this context's map.
     * @param deadZone A subscribable which provides the dead zone of this context's map.
     */
    constructor(bus: EventBus, projection: MapProjection, projectedSize: Subscribable<ReadonlyFloat64Array>, deadZone: Subscribable<ReadonlyFloat64Array>);
    /**
     * Retrieves a layer from this context.
     * @param key The key of the layer to retrieve.
     * @returns The layer in this context with the specified key.
     */
    getLayer<K extends keyof Layers & string>(key: K): Layers[K] & MapLayer;
    /**
     * Retrieves a controller from this context.
     * @param key The key fo the controller to retrieve.
     * @returns The controller in this context with the specified key.
     */
    getController<K extends keyof Controllers & string>(key: K): Controllers[K];
    /**
     * Adds a layer to this context.
     * @param key The key of the layer to add.
     * @param layer The layer to add.
     */
    setLayer<K extends keyof Layers & string>(key: K, layer: Layers[K]): void;
    /**
     * Adds a controller to this context.
     * @param key The key of the controller to add.
     * @param controller The controller to add.
     */
    setController<K extends keyof Controllers & string>(key: K, controller: Controllers[K]): void;
}
//# sourceMappingURL=MapSystemContext.d.ts.map