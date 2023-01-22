/// <reference types="msfstypes/js/netbingmap" />
import { NumberUnitSubject } from '../../../math';
import { Subject, Subscribable } from '../../../sub';
import { WxrMode } from '../../bing';
/**
 * A module that describes the display of weather on a Bing Map instance.
 */
export declare class MapWxrModule {
    /** Whether the weather radar is enabled. */
    readonly isEnabled: Subject<boolean>;
    /** The current map weather radar arc sweep angle in degrees. */
    readonly weatherRadarArc: NumberUnitSubject<import("../../../math").UnitFamily.Angle, import("../../../math").SimpleUnit<import("../../../math").UnitFamily.Angle>>;
    /** The current weather radar mode. */
    readonly weatherRadarMode: Subject<EWeatherRadar.TOPVIEW | EWeatherRadar.HORIZONTAL | EWeatherRadar.VERTICAL>;
    private readonly _wxrMode;
    /**
     * A subscribable containing the combined WxrMode from the mode and arc subjects,
     * suitable for consumption in a MapBingLayer.
     * @returns The WxrMode subscribable.
     */
    get wxrMode(): Subscribable<WxrMode>;
    /**
     * Constructor.
     */
    constructor();
}
//# sourceMappingURL=MapWxrModule.d.ts.map