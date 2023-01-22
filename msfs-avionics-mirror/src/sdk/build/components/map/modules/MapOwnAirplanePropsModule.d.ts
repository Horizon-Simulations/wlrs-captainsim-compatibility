import { GeoPointSubject } from '../../../geo';
import { NumberUnitSubject } from '../../../math';
import { Subject } from '../../../sub';
/**
 * A module describing the state of the own airplane.
 */
export declare class MapOwnAirplanePropsModule {
    /** The airplane's position. */
    readonly position: GeoPointSubject;
    /** The airplane's true heading, in degrees. */
    readonly hdgTrue: Subject<number>;
    /** The airplane's turn rate, in degrees per second. */
    readonly turnRate: Subject<number>;
    /** The airplane's indicated altitude. */
    readonly altitude: NumberUnitSubject<import("../../../math").UnitFamily.Distance, import("../../../math").SimpleUnit<import("../../../math").UnitFamily.Distance>>;
    /** The airplane's vertical speed. */
    readonly verticalSpeed: NumberUnitSubject<import("../../../math").UnitFamily.Speed, import("../../../math").CompoundUnit<import("../../../math").UnitFamily.Speed>>;
    /** The airplane's true ground track, in degrees. */
    readonly trackTrue: Subject<number>;
    /** The airplane's ground speed. */
    readonly groundSpeed: NumberUnitSubject<import("../../../math").UnitFamily.Speed, import("../../../math").CompoundUnit<import("../../../math").UnitFamily.Speed>>;
    /** Whether the airplane is on the ground. */
    readonly isOnGround: Subject<boolean>;
    /** The magnetic variation at the airplane's position. */
    readonly magVar: Subject<number>;
}
//# sourceMappingURL=MapOwnAirplanePropsModule.d.ts.map