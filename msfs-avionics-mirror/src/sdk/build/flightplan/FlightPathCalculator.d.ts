import { EventBus } from '../data/EventBus';
import { LegType } from '../navigation/Facilities';
import { FacilityLoader } from '../navigation/FacilityLoader';
import { FlightPathLegCalculator } from './FlightPathLegCalculator';
import { LegDefinition } from './FlightPlanning';
/**
 * Options for the flight path calculator.
 */
export interface FlightPathCalculatorOptions {
    /** The default climb rate, if the plane is not yet at flying speed. */
    defaultClimbRate: number;
    /** The default speed, if the plane is not yet at flying speed. */
    defaultSpeed: number;
    /** The bank angle with which to calculate turns. */
    bankAngle: number;
}
/**
 * Calculates the flight path vectors for a given set of legs.
 */
export declare class FlightPathCalculator {
    private readonly facilityLoader;
    private readonly bus;
    private readonly facilityCache;
    private readonly legCalculatorMap;
    private readonly turnCalculator;
    private readonly state;
    private readonly options;
    private readonly calculateQueue;
    private isBusy;
    /**
     * Creates an instance of the FlightPathCalculator.
     * @param facilityLoader The facility loader to use with this instance.
     * @param options The options to use with this flight path calculator.
     * @param bus An instance of the EventBus.
     */
    constructor(facilityLoader: FacilityLoader, options: FlightPathCalculatorOptions, bus: EventBus);
    /**
     * Method to update this calculator's options.
     * @param newOptions A Partial FlightPathCalculatorOptions object.
     */
    private setOptions;
    /**
     * Creates a map from leg types to leg calculators.
     * @returns A map from leg types to leg calculators.
     */
    protected createLegCalculatorMap(): Record<LegType, FlightPathLegCalculator>;
    /**
     * Calculates a flight path for a given set of flight plan legs.
     * @param legs The legs of the flight plan to calculate.
     * @param activeLegIndex The index of the active leg.
     * @param initialIndex The index of the leg at which to start the calculation.
     * @param count The number of legs to calculate.
     * @returns A Promise which is fulfilled when the calculation is finished.
     */
    calculateFlightPath(legs: LegDefinition[], activeLegIndex: number, initialIndex?: number, count?: number): Promise<void>;
    /**
     * Executes a calculate operation. When the operation is finished, the next operation in the queue, if one exists,
     * will be started.
     * @param resolve The Promise resolve function to invoke when the calculation is finished.
     * @param reject The Promise reject function to invoke when an error occurs during calculation.
     * @param legs The legs of the flight plan to calculate.
     * @param activeLegIndex The index of the active leg.
     * @param initialIndex The index of the leg at which to start the calculation.
     * @param count The number of legs to calculate.
     * @returns A Promise which is fulfilled when the calculate operation is finished, or rejected if an error occurs
     * during calculation.
     */
    private doCalculate;
    /**
     * Loads facilities required for flight path calculations from the flight plan.
     * @param legs The legs of the flight plan to calculate.
     * @param initialIndex The index of the first leg to calculate.
     * @param count The number of legs to calculate.
     */
    private loadFacilities;
    /**
     * Stages a facility to be loaded.
     * @param icao The ICAO of the facility.
     * @param facilityPromises The array of facility load promises to push to.
     */
    private stageFacilityLoad;
    /**
     * Initializes the current lat/lon.
     * @param legs The legs of the flight plan to calculate.
     * @param initialIndex The index of the first leg to calculate.
     */
    private initCurrentLatLon;
    /**
     * Initializes the current course.
     * @param legs The legs of the flight plan to calculate.
     * @param initialIndex The index of the first leg to calculate.
     */
    private initCurrentCourse;
    /**
     * Initializes the fallback state.
     * @param legs The legs of the flight plan to calculate.
     * @param initialIndex The index of the first leg to calculate.
     */
    private initIsFallback;
    /**
     * Calculates flight paths for a sequence of flight plan legs.
     * @param legs A sequence of flight plan legs.
     * @param activeLegIndex The index of the active leg.
     * @param initialIndex The index of the first leg to calculate.
     * @param count The number of legs to calculate.
     */
    private calculateLegPaths;
    /**
     * Calculates a flight path for a leg in a sequence of legs.
     * @param legs A sequence of flight plan legs.
     * @param calculateIndex The index of the leg to calculate.
     * @param activeLegIndex The index of the active leg.
     */
    private calculateLegPath;
    /**
     * Resolves the ingress to egress vectors for a set of flight plan legs.
     * @param legs A sequence of flight plan legs.
     * @param initialIndex The index of the first leg to resolve.
     * @param count The number of legs to resolve.
     */
    private resolveLegsIngressToEgress;
    /**
     * Updates leg distances with turn anticipation.
     * @param legs A sequence of flight plan legs.
     * @param initialIndex The index of the first leg to update.
     * @param count The number of legs to update.
     */
    private updateLegDistances;
}
//# sourceMappingURL=FlightPathCalculator.d.ts.map