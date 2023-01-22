import { NumberUnitSubject, UnitType } from '../../../math';
/**
 * A module describing the state of the autopilot.
 */
export class MapAutopilotPropsModule {
    constructor() {
        /** The altitude preselector setting. */
        this.selectedAltitude = NumberUnitSubject.createFromNumberUnit(UnitType.FOOT.createNumber(0));
        this.apSelectedAltitudeHandler = (alt) => {
            this.selectedAltitude.set(alt);
        };
    }
}
