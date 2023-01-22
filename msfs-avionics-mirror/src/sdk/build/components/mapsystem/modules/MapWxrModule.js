import { NumberUnitSubject, UnitType } from '../../../math';
import { Subject } from '../../../sub';
/**
 * A module that describes the display of weather on a Bing Map instance.
 */
export class MapWxrModule {
    /**
     * Constructor.
     */
    constructor() {
        /** Whether the weather radar is enabled. */
        this.isEnabled = Subject.create(false);
        /** The current map weather radar arc sweep angle in degrees. */
        this.weatherRadarArc = NumberUnitSubject.createFromNumberUnit(UnitType.DEGREE.createNumber(90));
        /** The current weather radar mode. */
        this.weatherRadarMode = Subject.create(EWeatherRadar.HORIZONTAL);
        this._wxrMode = Subject.create({
            mode: this.isEnabled.get() ? this.weatherRadarMode.get() : EWeatherRadar.OFF,
            arcRadians: this.weatherRadarArc.get().asUnit(UnitType.RADIAN),
        });
        this.isEnabled.sub(v => {
            this._wxrMode.get().mode = v ? this.weatherRadarMode.get() : EWeatherRadar.OFF;
            this._wxrMode.notify();
        });
        this.weatherRadarArc.sub(v => {
            this._wxrMode.get().arcRadians = v.asUnit(UnitType.RADIAN);
            this._wxrMode.notify();
        });
        this.weatherRadarMode.sub(v => {
            this._wxrMode.get().mode = this.isEnabled.get() ? v : EWeatherRadar.OFF;
            this._wxrMode.notify();
        });
    }
    /**
     * A subscribable containing the combined WxrMode from the mode and arc subjects,
     * suitable for consumption in a MapBingLayer.
     * @returns The WxrMode subscribable.
     */
    get wxrMode() {
        return this._wxrMode;
    }
}
