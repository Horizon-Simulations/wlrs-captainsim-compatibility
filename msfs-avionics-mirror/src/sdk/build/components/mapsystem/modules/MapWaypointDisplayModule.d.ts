import { NumberUnitSubject } from '../../../math';
import { AirportFacility, Facility, FacilityWaypoint, IntersectionFacility, NdbFacility, VorFacility } from '../../../navigation';
import { Subject } from '../../../sub/Subject';
/**
 * A handler to determine waypoint visibility.
 */
declare type WaypointVisibilityHandler<T extends Facility> = (w: FacilityWaypoint<T>) => boolean;
/**
 * Filters for the nearest intersections.
 */
interface IntersectionFilters {
    /** A bitmask of allowable intersection types. */
    typeMask: number;
    /** Whether or not to show terminal waypoints. */
    showTerminalWaypoints: boolean;
}
/**
 * Filters for the nearest VORs.
 */
interface VorFilters {
    /** A bitmask of allowable VOR types. */
    typeMask: number;
    /** A bitmask of allowable VOR classes. */
    classMask: number;
}
/**
 * Filters for the nearest airports.
 */
interface AirportFilters {
    /** A bitmask of allowable airport classes. */
    classMask: number;
    /** Whether or not to show closed airports. */
    showClosed: boolean;
}
/**
 * Extended filters for the nearest airports.
 */
interface ExtendedAirportFilters {
    /** A bitmask of allowable runway surface types. */
    runwaySurfaceTypeMask: number;
    /** A bitmask of allowable approach types. */
    approachTypeMask: number;
    /** A bitmask of whether or not to show towered or untowered airports. */
    toweredMask: number;
    /** The minimum runway length to allow. */
    minimumRunwayLength: number;
}
/**
 * A map data module that controls waypoint display options.
 */
export declare class MapWaypointDisplayModule {
    /** A handler that dictates airport waypoint visibility. */
    showAirports: Subject<WaypointVisibilityHandler<AirportFacility>>;
    /** A handler that dictates intersection waypoint visibility. */
    showIntersections: Subject<WaypointVisibilityHandler<IntersectionFacility>>;
    /** A handler that dictates NDB waypoint visibility. */
    showNdbs: Subject<WaypointVisibilityHandler<NdbFacility>>;
    /** A handler that dictates VOR waypoint visibility. */
    showVors: Subject<WaypointVisibilityHandler<VorFacility>>;
    /** The maximum range at which airport waypoints should be searched for. */
    airportsRange: NumberUnitSubject<import("../../../math").UnitFamily.Distance, import("../../../math").SimpleUnit<import("../../../math").UnitFamily.Distance>>;
    /** The maximum range at which intersection waypoints should be searched for. */
    intersectionsRange: NumberUnitSubject<import("../../../math").UnitFamily.Distance, import("../../../math").SimpleUnit<import("../../../math").UnitFamily.Distance>>;
    /** The maximum range at which NDB waypoints should be searched for. */
    ndbsRange: NumberUnitSubject<import("../../../math").UnitFamily.Distance, import("../../../math").SimpleUnit<import("../../../math").UnitFamily.Distance>>;
    /** The maximum range at which VOR waypoints should be searched for. */
    vorsRange: NumberUnitSubject<import("../../../math").UnitFamily.Distance, import("../../../math").SimpleUnit<import("../../../math").UnitFamily.Distance>>;
    /** The maximum number of airports that should be displayed. */
    numAirports: Subject<number>;
    /** The maximum number of intersections that should be displayed. */
    numIntersections: Subject<number>;
    /** The maximum number of NDBs that should be displayed. */
    numNdbs: Subject<number>;
    /** The maximum number of VORs that should be displayed. */
    numVors: Subject<number>;
    /** The filter to apply to the intersection search. */
    intersectionsFilter: Subject<IntersectionFilters>;
    /** The filter to apply to the VOR search. */
    vorsFilter: Subject<VorFilters>;
    /** The filter to apply to the airport search. */
    airportsFilter: Subject<AirportFilters>;
    /** The extended airport filter to apply to the airport search. */
    extendedAirportsFilter: Subject<ExtendedAirportFilters>;
}
export {};
//# sourceMappingURL=MapWaypointDisplayModule.d.ts.map