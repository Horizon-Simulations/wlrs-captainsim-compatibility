import { EventBus } from '../data/EventBus';
import { Facility } from './Facilities';
import { FacilityWaypointCache } from './FacilityWaypointCache';
import { FacilityWaypoint } from './Waypoint';
/**
 * A default implementation of {@link FacilityWaypointCache}.
 */
export declare class DefaultFacilityWaypointCache implements FacilityWaypointCache {
    private readonly bus;
    readonly size: number;
    private static INSTANCE;
    private readonly cache;
    /**
     * Constructor.
     * @param bus The event bus.
     * @param size The maximum size of this cache.
     */
    private constructor();
    /** @inheritdoc */
    get<T extends Facility>(facility: Facility): FacilityWaypoint<T>;
    /**
     * Adds a waypoint to this cache. If the size of the cache is greater than the maximum after the new waypoint is
     * added, a waypoint will be removed from the cache in FIFO order.
     * @param facility The facility associated with the waypoint to add.
     * @param waypoint The waypoint to add.
     */
    private addToCache;
    /**
     * Gets a FacilityWaypointCache instance.
     * @param bus The event bus.
     * @returns A FacilityWaypointCache instance.
     */
    static getCache(bus: EventBus): FacilityWaypointCache;
}
//# sourceMappingURL=DefaultFacilityWaypointCache.d.ts.map