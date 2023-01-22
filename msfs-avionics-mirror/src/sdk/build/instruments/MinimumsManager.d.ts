import { EventBus } from '../data';
import { SimVarPublisher } from './BasePublishers';
/** Minimums Modes */
export declare enum MinimumsMode {
    OFF = 0,
    BARO = 1,
    RA = 2,
    TEMP_COMP_BARO = 3
}
/** Events sourced from minimums-related simvars. */
export interface MinimumsSimVarEvents {
    /** The current decision height in feet. */
    decision_height_feet: number;
    /** The current decision altitude in feet. */
    decision_altitude_feet: number;
    /** The current selected minimums mode. */
    minimums_mode: MinimumsMode;
}
/** Events for setting Minimums values */
export interface MinimumsControlEvents {
    /** Set a new decision height in feet. */
    set_decision_height_feet: number;
    /** Set a new decision altitude in feet. */
    set_decision_altitude_feet: number;
    /** Set the decision height unit to manage increments. */
    set_dh_distance_unit: 'feet' | 'meters';
    /** Set the decision altitude unit to manage increments. */
    set_da_distance_unit: 'feet' | 'meters';
    /** Set the current selected minimums mode. */
    set_minimums_mode: MinimumsMode;
}
/** A common type for all minimums events. */
export declare type MinimumsEvents = MinimumsSimVarEvents & MinimumsControlEvents;
/** A publisher for minimums simvar events. */
export declare class MinimumsSimVarPublisher extends SimVarPublisher<MinimumsSimVarEvents> {
    private static simvars;
    /**
     * @inheritdoc
     */
    constructor(bus: EventBus);
}
/**
 * A class that manages decision height and altitude data and events.
 */
export declare class MinimumsManager {
    private bus;
    private controlSubscriber;
    private currentDH;
    private currentDA;
    private daDistanceUnit;
    private dhDistanceUnit;
    /**
     * Create a MinimumsManager
     * @param bus The event bus
     */
    constructor(bus: EventBus);
}
//# sourceMappingURL=MinimumsManager.d.ts.map