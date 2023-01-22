import { GeoPoint } from '../../../geo';
import { BitFlags, UnitType, Vec2Math } from '../../../math';
import { FacilityLoader, FacilityRepository, FacilitySearchType, ICAO } from '../../../navigation';
import { FSComponent } from '../../FSComponent';
import { MapLayer } from '../MapLayer';
import { MapProjectionChangeType } from '../MapProjection';
import { MapSyncedCanvasLayer } from './MapSyncedCanvasLayer';
/**
 * An abstract implementation of a map layer which displays waypoints (airports, navaids, and intersections) within a
 * search radius.
 */
export class MapNearestWaypointsLayer extends MapLayer {
    constructor() {
        var _a;
        super(...arguments);
        this.canvasLayerRef = FSComponent.createRef();
        this.searchDebounceDelay = (_a = this.props.searchDebounceDelay) !== null && _a !== void 0 ? _a : 500;
        this.facLoader = new FacilityLoader(FacilityRepository.getRepository(this.props.bus), this.onFacilityLoaderInitialized.bind(this));
        this.searchRadius = 0;
        this.searchMargin = 0;
        this.icaosToShow = new Set();
        this.isInit = false;
    }
    /**
     * A callback called when the facility loaded finishes initialization.
     */
    onFacilityLoaderInitialized() {
        Promise.all([
            this.facLoader.startNearestSearchSession(FacilitySearchType.Airport),
            this.facLoader.startNearestSearchSession(FacilitySearchType.Vor),
            this.facLoader.startNearestSearchSession(FacilitySearchType.Ndb),
            this.facLoader.startNearestSearchSession(FacilitySearchType.Intersection),
            this.facLoader.startNearestSearchSession(FacilitySearchType.User)
        ]).then((value) => {
            const [airportSession, vorSession, ndbSession, intSession, userSession] = value;
            this.onSessionsStarted(airportSession, vorSession, ndbSession, intSession, userSession);
        });
    }
    /**
     * A callback called when the nearest facility search sessions have been started.
     * @param airportSession The airport search session.
     * @param vorSession The VOR search session.
     * @param ndbSession The NDB search session.
     * @param intSession The intersection search session.
     * @param userSession The user facility search session.
     */
    onSessionsStarted(airportSession, vorSession, ndbSession, intSession, userSession) {
        const callback = this.processSearchResults.bind(this);
        this.facilitySearches = {
            [FacilitySearchType.Airport]: new MapNearestWaypointsLayerSearch(airportSession, callback),
            [FacilitySearchType.Vor]: new MapNearestWaypointsLayerSearch(vorSession, callback),
            [FacilitySearchType.Ndb]: new MapNearestWaypointsLayerSearch(ndbSession, callback),
            [FacilitySearchType.Intersection]: new MapNearestWaypointsLayerSearch(intSession, callback),
            [FacilitySearchType.User]: new MapNearestWaypointsLayerSearch(userSession, callback)
        };
        this.props.onSessionsStarted && this.props.onSessionsStarted(airportSession, vorSession, ndbSession, intSession, userSession);
        if (this.isInit) {
            this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
        }
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.canvasLayerRef.instance.onAttached();
        this.doInit();
        this.isInit = true;
        this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
    }
    /**
     * Initializes this layer.
     */
    doInit() {
        this.initWaypointRenderer();
        this.updateSearchRadius();
    }
    /**
     * Gets the search center for the waypoint searches on this layer.
     * @returns The waypoint search center geo point.
     */
    getSearchCenter() {
        return this.props.getSearchCenter ? this.props.getSearchCenter(this.props.mapProjection) : this.props.mapProjection.getCenter();
    }
    /**
     * Initializes this layer's waypoint renderer.
     */
    initWaypointRenderer() {
        this.props.initRenderer && this.props.initRenderer(this.props.waypointRenderer, this.canvasLayerRef.instance);
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        super.onMapProjectionChanged(mapProjection, changeFlags);
        this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        if (BitFlags.isAny(changeFlags, MapProjectionChangeType.Range | MapProjectionChangeType.RangeEndpoints | MapProjectionChangeType.ProjectedSize)) {
            this.updateSearchRadius();
            this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
        }
        else if (BitFlags.isAll(changeFlags, MapProjectionChangeType.Center)) {
            this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
        }
    }
    /**
     * Updates the desired nearest facility search radius based on the current map projection.
     */
    updateSearchRadius() {
        const mapHalfDiagRange = Vec2Math.abs(this.props.mapProjection.getProjectedSize()) * this.props.mapProjection.getProjectedResolution() / 2;
        this.searchRadius = mapHalfDiagRange * MapNearestWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR;
        this.searchMargin = mapHalfDiagRange * (MapNearestWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR - 1);
    }
    /** @inheritdoc */
    onUpdated(time, elapsed) {
        this.updateSearches(elapsed);
    }
    /**
     * Updates this layer's facility searches.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    updateSearches(elapsed) {
        if (!this.facilitySearches) {
            return;
        }
        this.facilitySearches[FacilitySearchType.Airport].update(elapsed);
        this.facilitySearches[FacilitySearchType.Vor].update(elapsed);
        this.facilitySearches[FacilitySearchType.Ndb].update(elapsed);
        this.facilitySearches[FacilitySearchType.Intersection].update(elapsed);
        this.facilitySearches[FacilitySearchType.User].update(elapsed);
    }
    /**
     * Attempts to refresh all of the nearest facility searches. Searches will only be refreshed if the desired search
     * radius is different from the last refreshed search radius or the desired search center is outside of the margin
     * of the last refreshed search center.
     * @param center The center of the search area. Defaults to this layer's automatically calculated search center.
     * @param radius The radius of the search area, in great-arc radians. Defaults to this layer's automatically
     * calculated search radius.
     */
    tryRefreshAllSearches(center, radius) {
        center !== null && center !== void 0 ? center : (center = this.getSearchCenter());
        radius !== null && radius !== void 0 ? radius : (radius = this.searchRadius);
        this._tryRefreshAllSearches(center, radius);
    }
    /**
     * Attempts to refresh a nearest search. The search will only be refreshed if the desired search radius is different
     * from the last refreshed search radius or the desired search center is outside of the margin of the last refreshed
     * search center.
     * @param type The type of nearest search to refresh.
     * @param center The center of the search area. Defaults to this layer's automatically calculated search center.
     * @param radius The radius of the search area, in great-arc radians. Defaults to this layer's automatically
     * calculated search radius.
     */
    tryRefreshSearch(type, center, radius) {
        center !== null && center !== void 0 ? center : (center = this.getSearchCenter());
        radius !== null && radius !== void 0 ? radius : (radius = this.searchRadius);
        this._tryRefreshSearch(type, center, radius);
    }
    /**
     * Attempts to refresh all of the nearest facility searches.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    _tryRefreshAllSearches(center, radius) {
        this._tryRefreshSearch(FacilitySearchType.Airport, center, radius);
        this._tryRefreshSearch(FacilitySearchType.Vor, center, radius);
        this._tryRefreshSearch(FacilitySearchType.Ndb, center, radius);
        this._tryRefreshSearch(FacilitySearchType.Intersection, center, radius);
        this._tryRefreshSearch(FacilitySearchType.User, center, radius);
    }
    /**
     * Attempts to refresh a nearest search. The search will only be refreshed if `this.shouldRefreshSearch()` returns
     * true and and the desired search radius is different from the last refreshed search radius or the desired search
     * center is outside of the margin of the last refreshed search center.
     * @param type The type of nearest search to refresh.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    _tryRefreshSearch(type, center, radius) {
        const search = this.facilitySearches && this.facilitySearches[type];
        if (!search || !this.shouldRefreshSearch(type, center, radius)) {
            return;
        }
        if (search.lastRadius !== radius || search.lastCenter.distance(center) >= this.searchMargin) {
            this.scheduleSearchRefresh(type, search, center, radius);
        }
    }
    /**
     * Checks whether one of this layer's searches should be refreshed.
     * @param type The type of nearest search to refresh.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     * @returns Whether the search should be refreshed.
     */
    shouldRefreshSearch(type, center, radius) {
        return this.props.shouldRefreshSearch ? this.props.shouldRefreshSearch(type, center, radius) : true;
    }
    /**
     * Schedules a refresh of this one of this layer's searches.
     * @param type The type of nearest search to refresh.
     * @param search The search to refresh.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    scheduleSearchRefresh(type, search, center, radius) {
        const itemLimit = this.props.searchItemLimit ? this.props.searchItemLimit(type, center, radius) : 100;
        const radiusLimit = this.props.searchRadiusLimit ? this.props.searchRadiusLimit(type, center, radius) : undefined;
        if (radiusLimit !== undefined && isFinite(radiusLimit)) {
            radius = Math.min(radius, Math.max(0, radiusLimit));
        }
        search.scheduleRefresh(center, radius, itemLimit, this.searchDebounceDelay);
    }
    /**
     * Processes nearest facility search results. New facilities are registered, while removed facilities are
     * deregistered.
     * @param results Nearest facility search results.
     */
    processSearchResults(results) {
        if (!results) {
            return;
        }
        const numAdded = results.added.length;
        for (let i = 0; i < numAdded; i++) {
            const icao = results.added[i];
            if (icao === undefined || icao === ICAO.emptyIcao) {
                continue;
            }
            this.registerIcao(icao);
        }
        const numRemoved = results.removed.length;
        for (let i = 0; i < numRemoved; i++) {
            const icao = results.removed[i];
            if (icao === undefined || icao === ICAO.emptyIcao) {
                continue;
            }
            this.deregisterIcao(icao);
        }
    }
    /**
     * Registers an ICAO string with this layer. Once an ICAO is registered, its corresponding facility is drawn to this
     * layer using a waypoint renderer.
     * @param icao The ICAO string to register.
     */
    registerIcao(icao) {
        this.icaosToShow.add(icao);
        this.facLoader.getFacility(ICAO.getFacilityType(icao), icao).then(facility => {
            if (!this.icaosToShow.has(icao)) {
                return;
            }
            this.registerWaypointWithRenderer(this.props.waypointRenderer, facility);
        });
    }
    /**
     * Registers a facility with this layer's waypoint renderer.
     * @param renderer This layer's waypoint renderer.
     * @param facility The facility to register.
     */
    registerWaypointWithRenderer(renderer, facility) {
        const waypoint = this.props.waypointForFacility(facility);
        this.props.registerWaypoint(waypoint, renderer);
    }
    /**
     * Deregisters an ICAO string from this layer.
     * @param icao The ICAO string to deregister.
     */
    deregisterIcao(icao) {
        this.icaosToShow.delete(icao);
        this.facLoader.getFacility(ICAO.getFacilityType(icao), icao).then(facility => {
            if (this.icaosToShow.has(icao)) {
                return;
            }
            this.deregisterWaypointWithRenderer(this.props.waypointRenderer, facility);
        });
    }
    /**
     * Deregisters a facility from this layer's waypoint renderer.
     * @param renderer This layer's waypoint renderer.
     * @param facility The facility to deregister.
     */
    deregisterWaypointWithRenderer(renderer, facility) {
        const waypoint = this.props.waypointForFacility(facility);
        this.props.deregisterWaypoint(waypoint, renderer);
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent(MapSyncedCanvasLayer, { ref: this.canvasLayerRef, model: this.props.model, mapProjection: this.props.mapProjection }));
    }
}
MapNearestWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR = Math.SQRT2;
/**
 * A nearest facility search for MapAbstractNearestWaypointsLayer.
 */
export class MapNearestWaypointsLayerSearch {
    /**
     * Constructor.
     * @param session The session used by this search.
     * @param refreshCallback A callback which is called every time the search refreshes.
     */
    constructor(session, refreshCallback) {
        this.session = session;
        this.refreshCallback = refreshCallback;
        this._lastCenter = new GeoPoint(0, 0);
        this._lastRadius = 0;
        this.maxItemCount = 0;
        this.refreshDebounceTimer = 0;
        this.isRefreshScheduled = false;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The center of this search's last refresh.
     */
    get lastCenter() {
        return this._lastCenter.readonly;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The radius of this search's last refresh, in great-arc radians.
     */
    get lastRadius() {
        return this._lastRadius;
    }
    /**
     * Schedules a refresh of this search.  If a refresh was previously scheduled but not yet executed, this new
     * scheduled refresh will replace the old one.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     * @param maxItemCount The maximum number of results returned by the refresh.
     * @param delay The delay, in milliseconds, before the refresh is executed.
     */
    scheduleRefresh(center, radius, maxItemCount, delay) {
        this._lastCenter.set(center);
        this._lastRadius = radius;
        this.maxItemCount = maxItemCount;
        this.refreshDebounceTimer = delay;
        this.isRefreshScheduled = true;
    }
    /**
     * Updates this search. Executes any pending refreshes if their delay timers have expired.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    update(elapsed) {
        if (!this.isRefreshScheduled) {
            return;
        }
        this.refreshDebounceTimer = Math.max(0, this.refreshDebounceTimer - elapsed);
        if (this.refreshDebounceTimer === 0) {
            this.refresh();
            this.isRefreshScheduled = false;
        }
    }
    /**
     * Refreshes this search.
     * @returns a Promise which is fulfilled when the refresh completes.
     */
    async refresh() {
        const results = await this.session.searchNearest(this._lastCenter.lat, this._lastCenter.lon, UnitType.GA_RADIAN.convertTo(this._lastRadius, UnitType.METER), this.maxItemCount);
        this.refreshCallback(results);
    }
}
