import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarPublisher } from './BasePublishers';
/**
 * Base events related to air data computer information.
 */
export interface BaseAdcEvents {
    /** The airplane's indicated airspeed, in knots. */
    ias: number;
    /** The airplane's true airspeed, in knots. */
    tas: number;
    /** The airplane's indicated altitude, in feet. */
    indicated_alt: number;
    /** The airplane's pressure altitude, in feet. */
    pressure_alt: number;
    /** The airplane's vertical speed, in feet per minute. */
    vertical_speed: number;
    /** The airplane's radio altitude, in feet. */
    radio_alt: number;
    /** The current altimeter baro setting, in inches of mercury. */
    altimeter_baro_setting_inhg: number;
    /** The current altimeter baro setting, in millibars. */
    altimeter_baro_setting_mb: number;
    /** The current preselected altimeter baro setting, in inches of mercury. */
    altimeter_baro_preselect_inhg: number;
    /** Whether the altimeter baro setting is set to STD (true=STD, false=set pressure). */
    altimeter_baro_is_std: boolean;
    /** The ambient temperature, in degrees Celsius. */
    ambient_temp_c: number;
    /** The ambient pressure, in inches of mercury. */
    ambient_pressure_inhg: number;
    /** The current ISA temperature, in degrees Celsius. */
    isa_temp_c: number;
    /** The current ram air temperatuer, in degrees Celsius. */
    ram_air_temp_c: number;
    /** The ambient wind velocity, in knots. */
    ambient_wind_velocity: number;
    /** The ambient wind direction, in degrees true. */
    ambient_wind_direction: number;
    /** Whether the plane is on the ground. */
    on_ground: boolean;
    /** The angle of attack. */
    aoa: number;
    /** The stall aoa of the current aircraft configuration. */
    stall_aoa: number;
    /** The speed of the aircraft in mach. */
    mach_number: number;
    /**
     * The conversion factor from mach to knots indicated airspeed in the airplane's current environment. In other
     * words, the speed of sound in knots indicated airspeed.
     */
    mach_to_kias_factor: number;
}
/**
 * Topics indexed by airspeed indicator.
 */
declare type AdcAirspeedIndexedTopics = 'ias' | 'tas' | 'mach_to_kias_factor';
/** Topics indexed by altimeter. */
declare type AdcAltimeterIndexedTopics = 'indicated_alt' | 'altimeter_baro_setting_inhg' | 'altimeter_baro_setting_mb' | 'altimeter_baro_preselect_inhg' | 'altimeter_baro_is_std';
/**
 * Topics related to air data computer information that are indexed.
 */
declare type AdcIndexedTopics = AdcAirspeedIndexedTopics | AdcAltimeterIndexedTopics;
/**
 * Indexed events related to air data computer information.
 */
declare type AdcIndexedEvents = {
    [P in keyof Pick<BaseAdcEvents, AdcIndexedTopics> as IndexedEventType<P>]: BaseAdcEvents[P];
};
/**
 * Events related to air data computer information.
 */
export interface AdcEvents extends BaseAdcEvents, AdcIndexedEvents {
}
/**
 * A publisher for air data computer information.
 */
export declare class AdcPublisher extends SimVarPublisher<AdcEvents> {
    private mach;
    private needUpdateMach;
    /**
     * Creates an AdcPublisher.
     * @param bus The event bus to which to publish.
     * @param airspeedIndicatorCount The number of airspeed indicators.
     * @param altimeterCount The number of altimeters.
     * @param pacer An optional pacer to use to control the rate of publishing.
     */
    constructor(bus: EventBus, airspeedIndicatorCount: number, altimeterCount: number, pacer?: PublishPacer<AdcEvents>);
    /** @inheritdoc */
    protected onTopicSubscribed(topic: keyof AdcEvents): void;
    /** @inheritdoc */
    onUpdate(): void;
}
export {};
//# sourceMappingURL=Adc.d.ts.map