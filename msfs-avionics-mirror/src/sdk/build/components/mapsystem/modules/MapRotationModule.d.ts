import { Subject } from '../../../sub/Subject';
/**
 * An enumeration of possible map rotation types.
 */
export declare enum MapRotation {
    /** Map rotation points towards north up. */
    NorthUp = "NorthUp",
    /** Map up position points towards the current airplane track. */
    TrackUp = "TrackUp",
    /** Map up position points towards the current airplane heading. */
    HeadingUp = "HeadingUp",
    /** Map up position points towards the current nav desired track. */
    DtkUp = "DtkUp"
}
/**
 * A module describing the rotation behavior of the map.
 */
export declare class MapRotationModule {
    /** The type of map rotation to use. */
    readonly rotationType: Subject<MapRotation>;
}
//# sourceMappingURL=MapRotationModule.d.ts.map