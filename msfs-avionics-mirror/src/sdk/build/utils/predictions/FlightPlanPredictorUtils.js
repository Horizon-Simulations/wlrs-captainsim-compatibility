import { UnitType } from '../../math';
/**
 * Utilities for {@link FlightPlanPredictor}
 */
export class FlightPlanPredictorUtils {
    /**
     * noop
     */
    constructor() {
        // noop
    }
    /**
     * Predicts time to fly a distance at a ground speed
     *
     * @param gs       the GPS ground speed in knots
     * @param distance the distance in nautical miles
     *
     * @returns the predicted time in seconds duration
     */
    static predictTime(gs, distance) {
        return UnitType.HOUR.convertTo(distance / gs, UnitType.SECOND);
    }
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
    static predictFuelUsage(gs, distance, fuelFlow, fuelWeight) {
        const fuelVolumeUsed = UnitType.SECOND.convertTo(FlightPlanPredictorUtils.predictTime(gs, distance), UnitType.HOUR) * fuelFlow;
        return fuelVolumeUsed * fuelWeight;
    }
}
