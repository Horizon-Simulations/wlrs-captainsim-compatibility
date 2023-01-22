import { EventBus } from '../data/EventBus';
import { EventSubscriber } from '../data/EventSubscriber';
import { Subject } from '../sub/Subject';
/**
 * ADS-B operating modes.
 */
export declare enum AdsbOperatingMode {
    Standby = "Standby",
    Surface = "Surface",
    Airborne = "Airborne"
}
/**
 * ADS-B events.
 */
export interface AdsbEvents {
    /** The ADS-B operating mode. */
    adsb_operating_mode: AdsbOperatingMode;
}
/**
 * An ADS-B system.
 */
export declare class Adsb {
    protected readonly bus: EventBus;
    protected readonly operatingMode: Subject<AdsbOperatingMode>;
    protected readonly eventSubscriber: EventSubscriber<AdsbEvents>;
    /**
     * Constructor.
     * @param bus The event bus.
     */
    constructor(bus: EventBus);
    /**
     * Gets this system's operating mode.
     * @returns This system's operating mode.
     */
    getOperatingMode(): AdsbOperatingMode;
    /**
     * Sets this system's operating mode.
     * @param mode The new operating mode.
     */
    setOperatingMode(mode: AdsbOperatingMode): void;
    /**
     * Gets an event bus subscriber for TCAS events.
     * @returns an event bus subscriber for TCAS events..
     */
    getEventSubscriber(): EventSubscriber<AdsbEvents>;
    /**
     * Initializes this ADS-B system.
     */
    init(): void;
}
//# sourceMappingURL=Adsb.d.ts.map