import { SubEvent } from '../../../sub/SubEvent';
import { Subject } from '../../../sub/Subject';
/**
 * A map data module that handles the display of flight plan data.
 */
export class MapFlightPlanModule {
    constructor() {
        this.plans = [];
    }
    /**
     * Gets the flight plan subjects for a specified flight plan.
     * @param index The index of the flight plan.
     * @returns The subject for the specified plan index.
     */
    getPlanSubjects(index) {
        let planSubject = this.plans[index];
        if (planSubject === undefined) {
            planSubject = new PlanSubjects();
            this.plans[index] = planSubject;
        }
        return planSubject;
    }
}
/**
 * A collection of subjects for consuming flight plan data in the flight plan module.
 */
export class PlanSubjects {
    constructor() {
        /** The current flight plan to display, if any. */
        this.flightPlan = Subject.create(undefined);
        /** An event that fires when the plan is changed. */
        this.planChanged = new SubEvent();
        /** An event that fired when the flight path of the plan is recalculated. */
        this.planCalculated = new SubEvent();
        /** The active leg index currently being navigated to. */
        this.activeLeg = Subject.create(0);
    }
}
