/// <reference types="msfstypes/js/types" />
import { ConsumerSubject, EventBus } from '../../data';
import { FlightPlanner } from '../../flightplan';
import { Subscribable } from '../../sub';
/**
 * Contains data necessary for predicting flight plan legs
 */
export declare class FlightPlanPredictorStore {
    private readonly bus;
    private readonly flightPlanner;
    private readonly planIndexSub;
    private readonly activeLegSubject;
    readonly ppos: ConsumerSubject<LatLongAlt>;
    readonly groundSpeed: ConsumerSubject<number>;
    /**
     * Total fuel quantity in gallons
     */
    readonly fuelTotalQuantity: ConsumerSubject<number>;
    /**
     * Total fuel quantity in gallons per hour
     */
    readonly fuelFlow: ConsumerSubject<number>;
    /**
     * Fuel weight in pounds per gallons
     */
    readonly fuelWeight: ConsumerSubject<number>;
    readonly lnavDtg: ConsumerSubject<number>;
    readonly unixSimTime: ConsumerSubject<number>;
    /**
     * Ctor
     *
     * @param bus           the event bus
     * @param flightPlanner a flight planner
     * @param planIndexSub  a subscribable regarding the index of the flight plan we want to predict for
     */
    constructor(bus: EventBus, flightPlanner: FlightPlanner, planIndexSub: Subscribable<number>);
    /**
     * Handles the active leg changing
     */
    private handleNewActiveLeg;
}
//# sourceMappingURL=FlightPlanPredictorStore.d.ts.map