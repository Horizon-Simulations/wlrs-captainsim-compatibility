import { FacilityWaypoint } from './Waypoint';
/**
 * A default implementation of {@link FacilityWaypointCache}.
 */
export class DefaultFacilityWaypointCache {
    /**
     * Constructor.
     * @param bus The event bus.
     * @param size The maximum size of this cache.
     */
    constructor(bus, size) {
        this.bus = bus;
        this.size = size;
        this.cache = new Map();
    }
    /** @inheritdoc */
    get(facility) {
        let existing = this.cache.get(facility.icao);
        if (!existing) {
            existing = new FacilityWaypoint(facility, this.bus);
            this.addToCache(facility, existing);
        }
        return existing;
    }
    /**
     * Adds a waypoint to this cache. If the size of the cache is greater than the maximum after the new waypoint is
     * added, a waypoint will be removed from the cache in FIFO order.
     * @param facility The facility associated with the waypoint to add.
     * @param waypoint The waypoint to add.
     */
    addToCache(facility, waypoint) {
        this.cache.set(facility.icao, waypoint);
        if (this.cache.size > this.size) {
            this.cache.delete(this.cache.keys().next().value);
        }
    }
    /**
     * Gets a FacilityWaypointCache instance.
     * @param bus The event bus.
     * @returns A FacilityWaypointCache instance.
     */
    static getCache(bus) {
        var _a;
        return (_a = DefaultFacilityWaypointCache.INSTANCE) !== null && _a !== void 0 ? _a : (DefaultFacilityWaypointCache.INSTANCE = new DefaultFacilityWaypointCache(bus, 1000));
    }
}
