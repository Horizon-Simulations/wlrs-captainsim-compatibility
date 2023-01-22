import { Subject } from '../../../sub/Subject';
/**
 * An enumeration of possible map rotation types.
 */
export var MapRotation;
(function (MapRotation) {
    /** Map rotation points towards north up. */
    MapRotation["NorthUp"] = "NorthUp";
    /** Map up position points towards the current airplane track. */
    MapRotation["TrackUp"] = "TrackUp";
    /** Map up position points towards the current airplane heading. */
    MapRotation["HeadingUp"] = "HeadingUp";
    /** Map up position points towards the current nav desired track. */
    MapRotation["DtkUp"] = "DtkUp";
})(MapRotation || (MapRotation = {}));
/**
 * A module describing the rotation behavior of the map.
 */
export class MapRotationModule {
    constructor() {
        /** The type of map rotation to use. */
        this.rotationType = Subject.create(MapRotation.HeadingUp);
    }
}
