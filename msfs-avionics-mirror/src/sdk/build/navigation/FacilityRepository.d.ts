import { EventBus } from '../data/EventBus';
import { GeoKdTreeSearchFilter, GeoKdTreeSearchVisitor } from '../utils/datastructures';
import { Facility, FacilityType } from './Facilities';
/**
 * Topics published by {@link FacilityRepository} on the event bus.
 */
export interface FacilityRepositoryEvents {
    /** A facility was changed. The suffix of the topic specifies the ICAO of the changed facility. */
    [facility_changed: `facility_changed_${string}`]: Facility;
}
/** Facility types for which {@link FacilityRepository} supports spatial searches. */
export declare type SearchableFacilityTypes = FacilityType.USR;
/**
 * A repository of facilities.
 */
export declare class FacilityRepository {
    private readonly bus;
    private static readonly SYNC_TOPIC;
    private static readonly treeKeyFunc;
    private static INSTANCE;
    private readonly repos;
    private readonly trees;
    private ignoreSync;
    /**
     * Constructor.
     * @param bus The event bus.
     */
    private constructor();
    /**
     * Retrieves a facility from this repository.
     * @param icao The ICAO of the facility to retrieve.
     * @returns The requested user facility, or undefined if it was not found in this repository.
     */
    get(icao: string): Facility | undefined;
    /**
     * Searches for facilities around a point. Only supported for USR facilities.
     * @param type The type of facility for which to search.
     * @param lat The latitude of the query point, in degrees.
     * @param lon The longitude of the query point, in degrees.
     * @param radius The radius of the search, in great-arc radians.
     * @param visitor A visitor function. This function will be called once per element found within the search radius.
     * If the visitor returns `true`, then the search will continue; if the visitor returns `false`, the search will
     * immediately halt.
     * @throws Error if spatial searches are not supported for the specified facility type.
     */
    search(type: SearchableFacilityTypes, lat: number, lon: number, radius: number, visitor: GeoKdTreeSearchVisitor<Facility>): void;
    /**
     * Searches for facilities around a point. Only supported for USR facilities.
     * @param type The type of facility for which to search.
     * @param lat The latitude of the query point, in degrees.
     * @param lon The longitude of the query point, in degrees.
     * @param radius The radius of the search, in great-arc radians.
     * @param maxResultCount The maximum number of search results to return.
     * @param out An array in which to store the search results.
     * @param filter A function to filter the search results.
     * @throws Error if spatial searches are not supported for the specified facility type.
     */
    search(type: SearchableFacilityTypes, lat: number, lon: number, radius: number, maxResultCount: number, out: Facility[], filter?: GeoKdTreeSearchFilter<Facility>): Facility[];
    /**
     * Adds a facility to this repository and all other repositories synced with this one. If this repository already
     * contains a facility with the same ICAO as the facility to add, the existing facility will be replaced with the
     * new one.
     * @param fac The facility to add.
     * @throws Error if the facility has an invalid ICAO.
     */
    add(fac: Facility): void;
    /**
     * Removes a facility from this repository and all other repositories synced with this one.
     * @param fac The facility to remove.
     * @throws Error if the facility has an invalid ICAO.
     */
    remove(fac: Facility): void;
    /**
     * Iterates over every facility in this respository with a visitor function.
     * @param fn A visitor function.
     * @param types The types of facilities over which to iterate. Defaults to all facility types.
     */
    forEach(fn: (fac: Facility) => void, types?: FacilityType[]): void;
    /**
     * Adds a facility to this repository.
     * @param fac The facility to add.
     */
    private addToRepo;
    /**
     * Removes a facility from this repository.
     * @param fac The facility to remove.
     */
    private removeFromRepo;
    /**
     * Publishes a sync event over the event bus.
     * @param type The type of sync event.
     * @param facs The event's user facilities.
     */
    private pubSyncEvent;
    /**
     * A callback which is called when a sync event occurs.
     * @param data The event data.
     */
    private onSyncEvent;
    /**
     * Gets an instance of FacilityRepository.
     * @param bus The event bus.
     * @returns an instance of FacilityRepository.
     */
    static getRepository(bus: EventBus): FacilityRepository;
}
//# sourceMappingURL=FacilityRepository.d.ts.map