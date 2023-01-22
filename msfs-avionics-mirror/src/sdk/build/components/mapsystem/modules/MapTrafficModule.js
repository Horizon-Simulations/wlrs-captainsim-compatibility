import { NumberUnitSubject, UnitType } from '../../../math';
import { Subject } from '../../../sub';
import { TcasOperatingMode } from '../../../traffic';
/**
 * Traffic alert level modes.
 */
export var MapTrafficAlertLevelVisibility;
(function (MapTrafficAlertLevelVisibility) {
    MapTrafficAlertLevelVisibility[MapTrafficAlertLevelVisibility["Other"] = 1] = "Other";
    MapTrafficAlertLevelVisibility[MapTrafficAlertLevelVisibility["ProximityAdvisory"] = 2] = "ProximityAdvisory";
    MapTrafficAlertLevelVisibility[MapTrafficAlertLevelVisibility["TrafficAdvisory"] = 4] = "TrafficAdvisory";
    MapTrafficAlertLevelVisibility[MapTrafficAlertLevelVisibility["ResolutionAdvisory"] = 8] = "ResolutionAdvisory";
    MapTrafficAlertLevelVisibility[MapTrafficAlertLevelVisibility["All"] = 15] = "All";
})(MapTrafficAlertLevelVisibility || (MapTrafficAlertLevelVisibility = {}));
/**
 * A module describing the display of traffic.
 */
export class MapTrafficModule {
    /**
     * Creates an instance of a MapTrafficModule.
     * @param tcas This module's associated TCAS.
     */
    constructor(tcas) {
        this.tcas = tcas;
        /** Whether to show traffic information. */
        this.show = Subject.create(true);
        /** The TCAS operating mode. */
        this.operatingMode = Subject.create(TcasOperatingMode.Standby);
        /**
         * The distance from the own airplane beyond which intruders are considered off-scale. If the value is `NaN`,
         * intruders are never considered off-scale.
         */
        this.offScaleRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(NaN));
        /** Alert level visibility flags. */
        this.alertLevelVisibility = Subject.create(MapTrafficAlertLevelVisibility.All);
        /** The difference in altitude above the own airplane above which intruders will not be displayed. */
        this.altitudeRestrictionAbove = NumberUnitSubject.createFromNumberUnit(UnitType.FOOT.createNumber(9900));
        /** The difference in altitude below the own airplane below which intruders will not be displayed. */
        this.altitudeRestrictionBelow = NumberUnitSubject.createFromNumberUnit(UnitType.FOOT.createNumber(9900));
        /** Whether displayed intruder altitude is relative. */
        this.isAltitudeRelative = Subject.create(true);
        this.tcas.getEventSubscriber().on('tcas_operating_mode').whenChanged().handle(mode => {
            this.operatingMode.set(mode);
        });
    }
}
