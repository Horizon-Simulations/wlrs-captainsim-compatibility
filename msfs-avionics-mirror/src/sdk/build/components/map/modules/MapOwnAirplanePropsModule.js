import { GeoPoint, GeoPointSubject } from '../../../geo';
import { NumberUnitSubject, UnitType } from '../../../math';
import { Subject } from '../../../sub';
/**
 * A module describing the state of the own airplane.
 */
export class MapOwnAirplanePropsModule {
    constructor() {
        /** The airplane's position. */
        this.position = GeoPointSubject.createFromGeoPoint(new GeoPoint(0, 0));
        /** The airplane's true heading, in degrees. */
        this.hdgTrue = Subject.create(0);
        /** The airplane's turn rate, in degrees per second. */
        this.turnRate = Subject.create(0);
        /** The airplane's indicated altitude. */
        this.altitude = NumberUnitSubject.createFromNumberUnit(UnitType.FOOT.createNumber(0));
        /** The airplane's vertical speed. */
        this.verticalSpeed = NumberUnitSubject.createFromNumberUnit(UnitType.FPM.createNumber(0));
        /** The airplane's true ground track, in degrees. */
        this.trackTrue = Subject.create(0);
        /** The airplane's ground speed. */
        this.groundSpeed = NumberUnitSubject.createFromNumberUnit(UnitType.KNOT.createNumber(0));
        /** Whether the airplane is on the ground. */
        this.isOnGround = Subject.create(true);
        /** The magnetic variation at the airplane's position. */
        this.magVar = Subject.create(0);
    }
}
