/**
 * Utilities for {@link FlightPlanPredictor}
 */
export declare class FlightPlanPredictorUtils {
    /**
     * noop
     */
    private constructor();
    /**
     * Predicts time to fly a distance at a ground speed
     *
     * @param gs       the GPS ground speed in knots
     * @param distance the distance in nautical miles
     *
     * @returns the predicted time in seconds duration
     */
    static predictTime(gs: number, distance: number): number;
    /**
     * Predicts fuel usage to fly a distance at a ground speed with a fuel flow and weight
     *
     * @param gs         the GPS ground speed in knots
     * @param distance   the distance in nautical miles
     * @param fuelFlow   the total fuel flow in gallons per hour
     * @param fuelWeight the fuel weight in pounds per gallon
     *
     * @returns the predicted fuel usage in pounds
     */
    static predictFuelUsage(gs: number, distance: number, fuelFlow: number, fuelWeight: number): number;
}
//# sourceMappingURL=FlightPlanPredictorUtils.d.ts.map