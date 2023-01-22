import { ReadonlyFloat64Array } from '../../math/VecMath';
import { MapProjection } from '../map/MapProjection';
import { MapSystemComponent } from './MapSystemComponent';
import { MapSystemContext } from './MapSystemContext';
import { ContextRecord, ControllerRecord, LayerRecord, ModuleRecord } from './MapSystemTypes';
/**
 * A map controller.
 */
export declare abstract class MapSystemController<Modules extends ModuleRecord = any, Layers extends LayerRecord = any, Controllers extends ControllerRecord = any, Context extends ContextRecord = any> {
    private _isAlive;
    /** Whether this controller is alive. */
    get isAlive(): boolean;
    protected readonly context: MapSystemContext<Modules, Layers, Controllers, Context>;
    /**
     * Constructor.
     * @param context This controller's map context.
     */
    constructor(context: MapSystemContext<Modules, Layers, any, Context>);
    /**
     * This method is called after this controller' map is rendered.
     * @param ref A reference to the rendered map.
     */
    onAfterMapRender(ref: MapSystemComponent): void;
    /**
     * This method is called when the dead zone of this controller's map changes.
     * @param deadZone The map's new dead zone.
     */
    onDeadZoneChanged(deadZone: ReadonlyFloat64Array): void;
    /**
     * This method is called when the projection of this controller's map changes.
     * @param mapProjection The map projection.
     * @param changeFlags Bit flags describing the type of change.
     */
    onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void;
    /**
     * This method is called immediately before this controller's map updates its layers.
     * @param time The current sim time, as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    onBeforeUpdated(time: number, elapsed: number): void;
    /**
     * This method is called immediately after this controller's map updates its layers.
     * @param time The current sim time, as a UNIX timestamp in milliseconds.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    onAfterUpdated(time: number, elapsed: number): void;
    /**
     * This method is called when this controller's map is awakened.
     */
    onWake(): void;
    /**
     * This method is called when this controller's map is put to sleep.
     */
    onSleep(): void;
    /**
     * This method is called when this controller's map is destroyed.
     */
    onMapDestroyed(): void;
    /**
     * Destroys this controller.
     */
    destroy(): void;
}
//# sourceMappingURL=MapSystemController.d.ts.map