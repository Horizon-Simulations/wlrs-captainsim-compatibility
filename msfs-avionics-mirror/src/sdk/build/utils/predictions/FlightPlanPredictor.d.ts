import { EventBus } from '../../data';
import { FlightPlanner, LegDefinition } from '../../flightplan';
import { AirportFacility } from '../../navigation';
import { Subscribable } from '../../sub';
import { FlightPlanPredictorConfiguration } from './FlightPlanPredictorConfiguration';
import { ActiveOrUpcomingLegPredictions, LegPredictions } from './LegPredictions';
/**
 * Creates leg-by-leg predictions for a flight plan, both in the future by estimating performance and in the past by
 * recording predicted data and actual achieved performance.
 */
export declare class FlightPlanPredictor {
    private readonly bus;
    private readonly flightPlanner;
    private readonly planIndexSub;
    private readonly activeLegIndexSub;
    private readonly config;
    private readonly predictions;
    private readonly store;
    /**
     * Ctor
     *
     * @param bus               the event bus
     * @param flightPlanner     a flight planner
     * @param planIndexSub      a subscribable regarding the index of the flight plan we want to predict for
     * @param activeLegIndexSub a subscribable regarding the index of the displayed active leg, specific to the avionics suite
     * @param config            configuration object
     */
    constructor(bus: EventBus, flightPlanner: FlightPlanner, planIndexSub: Subscribable<number>, activeLegIndexSub: Subscribable<number>, config: FlightPlanPredictorConfiguration);
    /**
     * Whether the flight plan exists and has an active lateral leg index >= 1
     *
     * @returns boolean
     */
    get planAndPredictionsValid(): boolean;
    /**
     * Obtains the flight plan to predict
     *
     * @returns a flight plan
     */
    private get plan();
    /**
     * Returns the active leg index to be used
     *
     * @returns the index
     */
    private get activeLegIndex();
    /**
     * Checks if all legs in the plan are calculated
     * @returns true if all legs are calculated, false otherwise
     */
    private isAllLegsCalculated;
    /**
     * Updates the predictor
     */
    update(): void;
    /**
     * Clears out values from predictions
     *
     * @private
     */
    private clearOutValues;
    /**
     * Clears out entries that have become discontinuities
     */
    private clearOutDirtyValues;
    /**
     * Finds the index of the destination leg, in other words, the last non-missed-approach leg.
     *
     * @returns the index
     */
    private findDestinationLegIndex;
    /**
     * Returns predictions for the destination airport.
     *
     * If the dest leg (defined as the last leg that is not part of the missed approach) is not a runway,
     * then the direct distance between the termination of that leg and the provided airport facility.
     *
     * @param destinationFacility the airport facility to use in case a direct distance needs to be calculated
     *
     * @returns predictions for the destination airport
     */
    getDestinationPrediction(destinationFacility: AirportFacility): ActiveOrUpcomingLegPredictions;
    /**
     * Returns active or upcoming predictions for a given leg index
     *
     * @param index the leg index
     *
     * @returns the predictions object
     *
     * @throws if no predictions are available
     */
    predictionsForLegIndex(index: number): LegPredictions;
    /**
     * Returns active or upcoming predictions for a given leg definition
     *
     * @param leg the leg
     *
     * @returns the predictions object
     *
     * @throws if the leg is not in the flight plan used by the predictor or if no predictions are available
     */
    predictionsForLeg(leg: LegDefinition): LegPredictions;
    /**
     * Whether the leg is predicted
     *
     * @param leg the target leg
     *
     * @returns boolean
     */
    isLegPredicted(leg: LegDefinition): boolean;
    /**
     * Applies a reducer function to the predictions of active and upcoming legs
     *
     * @param initialValue initial accumulator value
     * @param reducer      reducer function
     * @param upTo         index to reduce to
     *
     * @returns reduced value
     */
    reducePredictions(initialValue: number, reducer: (accumulator: number, predictions: ActiveOrUpcomingLegPredictions) => number, upTo?: number): number;
    /**
     * Generator of all predictable legs in the plan
     *
     * The yielded tuple contains the following:
     * - 0: leg index in flight plan
     * - 1: leg definition object
     * - 2: previous leg definition object, including a previous discontinuity
     *
     * @param onlyAfterActive whether to start at the active leg
     *
     * @returns generator that skips appropriate legs
     *
     * @yields legs including and after the active leg that are not discontinuities (and not in missed approach, if config asks so)
     */
    private predictableLegs;
    /**
     * Stamps the actual values from the last estimated values
     *
     * @param targetObject the object to stamp the actual values on
     *
     * @private
     */
    private stampPassedLegValues;
    /**
     * Creates predictions for a passed leg
     *
     * @param targetObject the object to apply the predictions to
     * @param leg          the leg
     *
     * @throws if calculated is undefined
     */
    private updatePassedLeg;
    /**
     * Computes predictions for the active leg
     *
     * @param targetObject the object to apply the predictions to
     *
     * @throws if no active leg in flight plan
     */
    private updateActiveLeg;
    /**
     * Creates predictions for an upcoming leg
     *
     * @param targetObject        the object to apply the predictions to
     * @param leg                 the leg
     * @param accumulatedDistance accumulated distance in previous predictions before this leg
     *
     * @throws if calculated is undefined
     */
    private updateUpcomingLeg;
    /**
     * Predicts performance over a distance
     *
     * @param targetObject        the object to apply the predictions to
     * @param distance            the distance flown
     */
    private predictForDistance;
    /**
     * Obtains current GS with a minimum of 150
     *
     * @returns knots
     */
    private currentGs;
    /**
     * Obtains current fuel weight
     *
     * @returns pounds
     */
    private currentFuelWeight;
}
//# sourceMappingURL=FlightPlanPredictor.d.ts.map