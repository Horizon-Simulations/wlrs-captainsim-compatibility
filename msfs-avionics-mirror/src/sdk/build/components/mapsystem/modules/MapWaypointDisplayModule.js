import { NumberUnitSubject, UnitType } from '../../../math';
import { NearestAirportSearchSession, NearestIntersectionSearchSession, NearestVorSearchSession } from '../../../navigation';
import { Subject } from '../../../sub/Subject';
/**
 * A map data module that controls waypoint display options.
 */
export class MapWaypointDisplayModule {
    constructor() {
        /** A handler that dictates airport waypoint visibility. */
        this.showAirports = Subject.create(() => true);
        /** A handler that dictates intersection waypoint visibility. */
        this.showIntersections = Subject.create(() => false);
        /** A handler that dictates NDB waypoint visibility. */
        this.showNdbs = Subject.create(() => true);
        /** A handler that dictates VOR waypoint visibility. */
        this.showVors = Subject.create(() => true);
        /** The maximum range at which airport waypoints should be searched for. */
        this.airportsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(50));
        /** The maximum range at which intersection waypoints should be searched for. */
        this.intersectionsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(50));
        /** The maximum range at which NDB waypoints should be searched for. */
        this.ndbsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(500));
        /** The maximum range at which VOR waypoints should be searched for. */
        this.vorsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(500));
        /** The maximum number of airports that should be displayed. */
        this.numAirports = Subject.create(40);
        /** The maximum number of intersections that should be displayed. */
        this.numIntersections = Subject.create(40);
        /** The maximum number of NDBs that should be displayed. */
        this.numNdbs = Subject.create(40);
        /** The maximum number of VORs that should be displayed. */
        this.numVors = Subject.create(40);
        /** The filter to apply to the intersection search. */
        this.intersectionsFilter = Subject.create({
            typeMask: NearestIntersectionSearchSession.Defaults.TypeMask,
            showTerminalWaypoints: true
        });
        /** The filter to apply to the VOR search. */
        this.vorsFilter = Subject.create({
            typeMask: NearestVorSearchSession.Defaults.TypeMask,
            classMask: NearestVorSearchSession.Defaults.ClassMask
        });
        /** The filter to apply to the airport search. */
        this.airportsFilter = Subject.create({
            classMask: NearestAirportSearchSession.Defaults.ClassMask,
            showClosed: NearestAirportSearchSession.Defaults.ShowClosed
        });
        /** The extended airport filter to apply to the airport search. */
        this.extendedAirportsFilter = Subject.create({
            runwaySurfaceTypeMask: NearestAirportSearchSession.Defaults.SurfaceTypeMask,
            approachTypeMask: NearestAirportSearchSession.Defaults.ApproachTypeMask,
            minimumRunwayLength: NearestAirportSearchSession.Defaults.MinimumRunwayLength,
            toweredMask: NearestAirportSearchSession.Defaults.ToweredMask
        });
    }
}
