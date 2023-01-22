import { ReadonlyFloat64Array } from '../../math/VecMath';
import { MapProjection } from '../map/MapProjection';
import { MapSystemContext } from './MapSystemContext';
import { MapSystemController } from './MapSystemController';
import { ContextRecord, ControllerRecord, LayerRecord, ModuleRecord } from './MapSystemTypes';
/**
 * Callbacks supported by MapSystemGenericController.
 */
export declare type MapSystemGenericControllerCallbacks<Context extends MapSystemContext<any, any, any, any>> = {
    /** */
    onAfterMapRender?: (context: Context) => void;
    /** */
    onDeadZoneChanged?: (context: Context, deadZone: ReadonlyFloat64Array) => void;
    /** */
    onMapProjectionChanged?: (context: Context, mapProjection: MapProjection, changeFlags: number) => void;
    /** */
    onBeforeUpdated?: (context: Context, time: number, elapsed: number) => void;
    /** */
    onAfterUpdated?: (context: Context, time: number, elapsed: number) => void;
    /** */
    onWake?: (context: Context) => void;
    /** */
    onSleep?: (context: Context) => void;
    /** */
    onMapDestroyed?: (context: Context) => void;
    /** */
    onDestroyed?: (context: Context) => void;
};
/**
 * A map controller which delegates its behavior to injected callback functions.
 */
export declare class MapSystemGenericController<Modules extends ModuleRecord = any, Layers extends LayerRecord = any, Controllers extends ControllerRecord = any, Context extends ContextRecord = any> extends MapSystemController<Modules, Layers, Controllers, Context> {
    private readonly callbacks;
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param callbacks The callback functions to which this controller delegates its behavior.
     */
    constructor(context: MapSystemContext<Modules, Layers, any, Context>, callbacks: MapSystemGenericControllerCallbacks<MapSystemContext<Modules, Layers, Controllers, Context>>);
    /** @inheritdoc */
    onAfterMapRender(): void;
    /** @inheritdoc */
    onDeadZoneChanged(deadZone: ReadonlyFloat64Array): void;
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void;
    /** @inheritdoc */
    onBeforeUpdated(time: number, elapsed: number): void;
    /** @inheritdoc */
    onAfterUpdated(time: number, elapsed: number): void;
    /** @inheritdoc */
    onWake(): void;
    /** @inheritdoc */
    onSleep(): void;
    /** @inheritdoc */
    onMapDestroyed(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MapSystemGenericController.d.ts.map