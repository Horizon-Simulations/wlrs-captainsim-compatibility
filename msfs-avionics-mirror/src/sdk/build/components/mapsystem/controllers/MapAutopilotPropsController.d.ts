import { Subscribable } from '../../../sub/Subscribable';
import { MapAutopilotPropsModule } from '../../map/modules/MapAutopilotPropsModule';
import { MapSystemContext } from '../MapSystemContext';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
/**
 * Modules required for MapAutopilotPropsController.
 */
export interface MapAutopilotPropsControllerModules {
    /** Autopilot properties. */
    [MapSystemKeys.AutopilotProps]: MapAutopilotPropsModule;
}
/**
 * A key for a property in {@link MapAutopilotPropsModule}.
 */
export declare type MapAutopilotPropsKey = Extract<keyof MapAutopilotPropsModule, string>;
/**
 * Updates the properties in a {@link MapAutopilotPropsModule}.
 */
export declare class MapAutopilotPropsController extends MapSystemController<MapAutopilotPropsControllerModules> {
    private readonly properties;
    private readonly updateFreq?;
    private readonly module;
    private readonly subs;
    private updateFreqSub?;
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param properties The properties to update on the module.
     * @param updateFreq A subscribable which provides the update frequency, in hertz. If not defined, the properties
     * will be updated every frame.
     */
    constructor(context: MapSystemContext<MapAutopilotPropsControllerModules>, properties: Iterable<MapAutopilotPropsKey>, updateFreq?: Subscribable<number> | undefined);
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
//# sourceMappingURL=MapAutopilotPropsController.d.ts.map