import { EventBus } from '../../../data';
import { GeoPointReadOnly, LatLonInterface } from '../../../geo';
import { Facility, FacilitySearchType, NearestAirportSearchSession, NearestIntersectionSearchSession, NearestSearchResults, NearestSearchSession, NearestUserFacilitySearchSession, NearestVorSearchSession } from '../../../navigation';
import { VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapProjection } from '../MapProjection';
import { MapWaypointRenderer, MapWaypointRendererType } from '../MapWaypointRenderer';
import { MapSyncedCanvasLayer } from './MapSyncedCanvasLayer';
/**
 * Facility search types supported by MapAbstractNearestWaypointsLayer.
 */
export declare type MapNearestWaypointsLayerSearchTypes = FacilitySearchType.Airport | FacilitySearchType.Vor | FacilitySearchType.Ndb | FacilitySearchType.Intersection | FacilitySearchType.User;
/**
 * Component props for MapAbstractNearestWaypointsLayer.
 */
export interface MapAbstractNearestWaypointsLayerProps<R extends MapWaypointRenderer<any> = MapWaypointRenderer> extends MapLayerProps<any> {
    /** The event bus. */
    bus: EventBus;
    /** The waypoint renderer to use. */
    waypointRenderer: R;
    /** A function which retrieves a waypoint for a facility. */
    waypointForFacility: (facility: Facility) => MapWaypointRendererType<R>;
    /** A function which registers a waypoint with this layer's waypoint renderer. */
    registerWaypoint: (waypoint: MapWaypointRendererType<R>, renderer: R) => void;
    /** A function which deregisters a waypoint with this layer's waypoint renderer. */
    deregisterWaypoint: (waypoint: MapWaypointRendererType<R>, renderer: R) => void;
    /** A function which initializes this layer's waypoint renderer. */
    initRenderer?: (waypointRenderer: R, canvasLayer: MapSyncedCanvasLayer) => void;
    /** A function which gets the search center. If not defined, the search center defaults to the center of the map. */
    getSearchCenter?: (mapProjection: MapProjection) => LatLonInterface;
    /** A function which checks if a search should be refreshed. Defaults to `true` if not defined. */
    shouldRefreshSearch?: (searchType: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number) => boolean;
    /** A function which gets the item limit for facility searches. */
    searchItemLimit?: (searchType: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number) => number;
    /** A function which gets the radius limit for facility searches, in great-arc radians. */
    searchRadiusLimit?: (searchType: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number) => number;
    /** The debounce delay for facility searches, in milliseconds. Defaults to 500 milliseconds. */
    searchDebounceDelay?: number;
    /** A callback called when the search sessions are started. */
    onSessionsStarted?: (airportSession: NearestAirportSearchSession, vorSession: NearestVorSearchSession, ndbSession: NearestSearchSession<string, string>, intSession: NearestIntersectionSearchSession, userSession: NearestUserFacilitySearchSession) => void;
}
/**
 * An abstract implementation of a map layer which displays waypoints (airports, navaids, and intersections) within a
 * search radius.
 */
export declare class MapNearestWaypointsLayer<R extends MapWaypointRenderer<any> = MapWaypointRenderer, P extends MapAbstractNearestWaypointsLayerProps<R> = MapAbstractNearestWaypointsLayerProps<R>> extends MapLayer<P> {
    private static readonly SEARCH_RADIUS_OVERDRAW_FACTOR;
    private readonly canvasLayerRef;
    private readonly searchDebounceDelay;
    private readonly facLoader;
    private facilitySearches?;
    private searchRadius;
    private searchMargin;
    private readonly icaosToShow;
    private isInit;
    /**
     * A callback called when the facility loaded finishes initialization.
     */
    private onFacilityLoaderInitialized;
    /**
     * A callback called when the nearest facility search sessions have been started.
     * @param airportSession The airport search session.
     * @param vorSession The VOR search session.
     * @param ndbSession The NDB search session.
     * @param intSession The intersection search session.
     * @param userSession The user facility search session.
     */
    protected onSessionsStarted(airportSession: NearestAirportSearchSession, vorSession: NearestVorSearchSession, ndbSession: NearestSearchSession<string, string>, intSession: NearestIntersectionSearchSession, userSession: NearestUserFacilitySearchSession): void;
    /** @inheritdoc */
    onAttached(): void;
    /**
     * Initializes this layer.
     */
    private doInit;
    /**
     * Gets the search center for the waypoint searches on this layer.
     * @returns The waypoint search center geo point.
     */
    private getSearchCenter;
    /**
     * Initializes this layer's waypoint renderer.
     */
    private initWaypointRenderer;
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void;
    /**
     * Updates the desired nearest facility search radius based on the current map projection.
     */
    private updateSearchRadius;
    /** @inheritdoc */
    onUpdated(time: number, elapsed: number): void;
    /**
     * Updates this layer's facility searches.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    private updateSearches;
    /**
     * Attempts to refresh all of the nearest facility searches. Searches will only be refreshed if the desired search
     * radius is different from the last refreshed search radius or the desired search center is outside of the margin
     * of the last refreshed search center.
     * @param center The center of the search area. Defaults to this layer's automatically calculated search center.
     * @param radius The radius of the search area, in great-arc radians. Defaults to this layer's automatically
     * calculated search radius.
     */
    tryRefreshAllSearches(center?: LatLonInterface, radius?: number): void;
    /**
     * Attempts to refresh a nearest search. The search will only be refreshed if the desired search radius is different
     * from the last refreshed search radius or the desired search center is outside of the margin of the last refreshed
     * search center.
     * @param type The type of nearest search to refresh.
     * @param center The center of the search area. Defaults to this layer's automatically calculated search center.
     * @param radius The radius of the search area, in great-arc radians. Defaults to this layer's automatically
     * calculated search radius.
     */
    tryRefreshSearch(type: MapNearestWaypointsLayerSearchTypes, center?: LatLonInterface, radius?: number): void;
    /**
     * Attempts to refresh all of the nearest facility searches.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    private _tryRefreshAllSearches;
    /**
     * Attempts to refresh a nearest search. The search will only be refreshed if `this.shouldRefreshSearch()` returns
     * true and and the desired search radius is different from the last refreshed search radius or the desired search
     * center is outside of the margin of the last refreshed search center.
     * @param type The type of nearest search to refresh.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    private _tryRefreshSearch;
    /**
     * Checks whether one of this layer's searches should be refreshed.
     * @param type The type of nearest search to refresh.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     * @returns Whether the search should be refreshed.
     */
    private shouldRefreshSearch;
    /**
     * Schedules a refresh of this one of this layer's searches.
     * @param type The type of nearest search to refresh.
     * @param search The search to refresh.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    private scheduleSearchRefresh;
    /**
     * Processes nearest facility search results. New facilities are registered, while removed facilities are
     * deregistered.
     * @param results Nearest facility search results.
     */
    private processSearchResults;
    /**
     * Registers an ICAO string with this layer. Once an ICAO is registered, its corresponding facility is drawn to this
     * layer using a waypoint renderer.
     * @param icao The ICAO string to register.
     */
    private registerIcao;
    /**
     * Registers a facility with this layer's waypoint renderer.
     * @param renderer This layer's waypoint renderer.
     * @param facility The facility to register.
     */
    private registerWaypointWithRenderer;
    /**
     * Deregisters an ICAO string from this layer.
     * @param icao The ICAO string to deregister.
     */
    private deregisterIcao;
    /**
     * Deregisters a facility from this layer's waypoint renderer.
     * @param renderer This layer's waypoint renderer.
     * @param facility The facility to deregister.
     */
    private deregisterWaypointWithRenderer;
    /** @inheritdoc */
    render(): VNode;
}
/**
 * A nearest facility search for MapAbstractNearestWaypointsLayer.
 */
export declare class MapNearestWaypointsLayerSearch<S extends NearestSearchSession<string, string> = NearestSearchSession<string, string>> {
    private readonly session;
    private readonly refreshCallback;
    private readonly _lastCenter;
    private _lastRadius;
    private maxItemCount;
    private refreshDebounceTimer;
    private isRefreshScheduled;
    /**
     * The center of this search's last refresh.
     */
    get lastCenter(): GeoPointReadOnly;
    /**
     * The radius of this search's last refresh, in great-arc radians.
     */
    get lastRadius(): number;
    /**
     * Constructor.
     * @param session The session used by this search.
     * @param refreshCallback A callback which is called every time the search refreshes.
     */
    constructor(session: S, refreshCallback: (results: NearestSearchResults<string, string>) => void);
    /**
     * Schedules a refresh of this search.  If a refresh was previously scheduled but not yet executed, this new
     * scheduled refresh will replace the old one.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     * @param maxItemCount The maximum number of results returned by the refresh.
     * @param delay The delay, in milliseconds, before the refresh is executed.
     */
    scheduleRefresh(center: LatLonInterface, radius: number, maxItemCount: number, delay: number): void;
    /**
     * Updates this search. Executes any pending refreshes if their delay timers have expired.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    update(elapsed: number): void;
    /**
     * Refreshes this search.
     * @returns a Promise which is fulfilled when the refresh completes.
     */
    private refresh;
}
//# sourceMappingURL=MapNearestWaypointsLayer.d.ts.map