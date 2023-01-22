import { Subscribable } from '../../../sub/Subscribable';
import { MapOwnAirplanePropsModule } from '../../map/modules/MapOwnAirplanePropsModule';
import { MapSystemContext } from '../MapSystemContext';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
/**
 * Modules required for MapOwnAirplanePropsController.
 */
export interface MapOwnAirplanePropsControllerModules {
    /** Own airplane properties. */
    [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;
}
/**
 * A key for a property in {@link MapOwnAirplanePropsModule}.
 */
export declare type MapOwnAirplanePropsKey = Extract<keyof MapOwnAirplanePropsModule, string>;
/**
 * Updates the properties in a {@link MapOwnAirplanePropsModule}.
 */
export declare class MapOwnAirplanePropsController extends MapSystemController<MapOwnAirplanePropsControllerModules> {
    private readonly properties;
    private readonly updateFreq;
    private readonly module;
    private readonly subs;
    private updateFreqSub?;
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param properties The properties to update on the module.
     * @param updateFreq A subscribable which provides the update frequency, in hertz.
     */
    constructor(context: MapSystemContext<MapOwnAirplanePropsControllerModules>, properties: Iterable<MapOwnAirplanePropsKey>, updateFreq: Subscribable<number>);
    /** @inheritdoc */
    onAfterMapRender(): void;
    /**
     * Binds a module property to data received through the event bus.
     * @param sub The event bus subscriber.
     * @param property The property to bind.
     * @param updateFreq The data update frequency.
     * @returns The subscription created by the binding.
     */
    private bindProperty;
    /** @inheritdoc */
    onMapDestroyed(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MapOwnAirplanePropsController.d.ts.map