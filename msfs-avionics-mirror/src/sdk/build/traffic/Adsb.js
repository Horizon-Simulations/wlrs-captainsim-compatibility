import { Subject } from '../sub/Subject';
/**
 * ADS-B operating modes.
 */
export var AdsbOperatingMode;
(function (AdsbOperatingMode) {
    AdsbOperatingMode["Standby"] = "Standby";
    AdsbOperatingMode["Surface"] = "Surface";
    AdsbOperatingMode["Airborne"] = "Airborne";
})(AdsbOperatingMode || (AdsbOperatingMode = {}));
/**
 * An ADS-B system.
 */
export class Adsb {
    /**
     * Constructor.
     * @param bus The event bus.
     */
    constructor(bus) {
        this.bus = bus;
        this.operatingMode = Subject.create(AdsbOperatingMode.Standby);
        this.eventSubscriber = this.bus.getSubscriber();
    }
    /**
     * Gets this system's operating mode.
     * @returns This system's operating mode.
     */
    getOperatingMode() {
        return this.operatingMode.get();
    }
    /**
     * Sets this system's operating mode.
     * @param mode The new operating mode.
     */
    setOperatingMode(mode) {
        this.operatingMode.set(mode);
    }
    /**
     * Gets an event bus subscriber for TCAS events.
     * @returns an event bus subscriber for TCAS events..
     */
    getEventSubscriber() {
        return this.eventSubscriber;
    }
    /**
     * Initializes this ADS-B system.
     */
    init() {
        this.operatingMode.sub(mode => {
            this.bus.pub('adsb_operating_mode', mode, false, true);
        }, true);
    }
}
