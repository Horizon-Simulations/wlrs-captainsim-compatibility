import { FlightPlan } from '../../../flightplan';
import { SubEvent } from '../../../sub/SubEvent';
import { Subject } from '../../../sub/Subject';
/**
 * A map data module that handles the display of flight plan data.
 */
export declare class MapFlightPlanModule {
    private readonly plans;
    /**
     * Gets the flight plan subjects for a specified flight plan.
     * @param index The index of the flight plan.
     * @returns The subject for the specified plan index.
     */
    getPlanSubjects(index: number): PlanSubjects;
}
/**
 * A collection of subjects for consuming flight plan data in the flight plan module.
 */
export declare class PlanSubjects {
    /** The current flight plan to display, if any. */
    flightPlan: Subject<FlightPlan | undefined>;
    /** An event that fires when the plan is changed. */
    planChanged: SubEvent<any, void>;
    /** An event that fired when the flight path of the plan is recalculated. */
    planCalculated: SubEvent<any, void>;
    /** The active leg index currently being navigated to. */
    activeLeg: Subject<number>;
}
//# sourceMappingURL=MapFlightPlanModule.d.ts.map