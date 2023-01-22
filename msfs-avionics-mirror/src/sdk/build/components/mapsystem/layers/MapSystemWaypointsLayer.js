import { UnitType } from '../../../math';
import { DefaultFacilityWaypointCache, FacilitySearchType, FacilityWaypoint, WaypointTypes } from '../../../navigation';
import { FSComponent } from '../../FSComponent';
import { MapLayer, MapNearestWaypointsLayer } from '../../map';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapSystemWaypointRoles } from '../MapSystemWaypointRoles';
/**
 * A class that renders waypoints into a layer.
 */
export class MapSystemWaypointsLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.waypointsLayer = FSComponent.createRef();
        this.displayModule = this.props.model.getModule(MapSystemKeys.NearestWaypoints);
        this.waypointCache = DefaultFacilityWaypointCache.getCache(this.props.bus);
        this.searchItemLimits = {
            [FacilitySearchType.Airport]: 500,
            [FacilitySearchType.Vor]: 250,
            [FacilitySearchType.Ndb]: 250,
            [FacilitySearchType.Intersection]: 500,
            [FacilitySearchType.User]: 100
        };
        this.searchRadiusLimits = {
            [FacilitySearchType.Airport]: Number.POSITIVE_INFINITY,
            [FacilitySearchType.Vor]: Number.POSITIVE_INFINITY,
            [FacilitySearchType.Ndb]: Number.POSITIVE_INFINITY,
            [FacilitySearchType.Intersection]: Number.POSITIVE_INFINITY,
            [FacilitySearchType.User]: Number.POSITIVE_INFINITY
        };
        this.renderRole = 1;
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.waypointsLayer.instance.onAttached();
        this.initEventHandlers();
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        super.onMapProjectionChanged(mapProjection, changeFlags);
        this.waypointsLayer.instance.onMapProjectionChanged(mapProjection, changeFlags);
    }
    /** @inheritdoc */
    onUpdated(time, elapsed) {
        if (this.isVisible()) {
            this.waypointsLayer.instance.onUpdated(time, elapsed);
        }
    }
    /** @inheritdoc */
    initEventHandlers() {
        this.displayModule.numAirports.sub(num => this.searchItemLimits[FacilitySearchType.Airport] = num, true);
        this.displayModule.numIntersections.sub(num => this.searchItemLimits[FacilitySearchType.Intersection] = num, true);
        this.displayModule.numVors.sub(num => this.searchItemLimits[FacilitySearchType.Vor] = num, true);
        this.displayModule.numNdbs.sub(num => this.searchItemLimits[FacilitySearchType.Ndb] = num, true);
        this.displayModule.airportsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Airport] = num.asUnit(UnitType.GA_RADIAN), true);
        this.displayModule.intersectionsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Intersection] = num.asUnit(UnitType.GA_RADIAN), true);
        this.displayModule.vorsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Vor] = num.asUnit(UnitType.GA_RADIAN), true);
        this.displayModule.ndbsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Ndb] = num.asUnit(UnitType.GA_RADIAN), true);
    }
    /**
     * A callback called when the nearest facility search sessions have been started.
     * @param airportSession The airport search session.
     * @param vorSession The VOR search session.
     * @param ndbSession The NDB search session.
     * @param intSession The intersection search session.
     */
    onSessionsStarted(airportSession, vorSession, ndbSession, intSession) {
        this.displayModule.intersectionsFilter.sub(filters => intSession.setIntersectionFilter(filters.typeMask));
        this.displayModule.vorsFilter.sub(filters => vorSession.setVorFilter(filters.classMask, filters.typeMask));
        this.displayModule.airportsFilter.sub(filters => {
            airportSession.setAirportFilter(filters.showClosed, filters.classMask);
        });
        this.displayModule.extendedAirportsFilter.sub(filters => {
            airportSession.setExtendedAirportFilters(filters.runwaySurfaceTypeMask, filters.approachTypeMask, filters.toweredMask, filters.minimumRunwayLength);
        });
    }
    /**
     * Initializes this layer's waypoint renderer.
     * @param renderer This layer's waypoint renderer.
     * @param canvasLayer The canvas layer to which to draw the waypoints.
     */
    initWaypointRenderer(renderer, canvasLayer) {
        this.defineRenderRole(renderer, canvasLayer);
        renderer.onRolesAdded.on(this.defineRenderRole.bind(this, renderer, canvasLayer));
    }
    /**
     * Defines the render role for this layer's waypoints.
     * @param renderer This layer's waypoint renderer.
     * @param canvasLayer The canvas layer to which to draw the waypoints.
     */
    defineRenderRole(renderer, canvasLayer) {
        let hasDefaultId = false;
        const groupRoles = renderer.getRoleNamesByGroup(MapSystemWaypointRoles.Normal);
        groupRoles.forEach(id => {
            const roleId = renderer.getRoleFromName(id);
            if (roleId !== undefined) {
                renderer.setCanvasContext(roleId, canvasLayer.display.context);
                renderer.setIconFactory(roleId, this.props.iconFactory);
                renderer.setLabelFactory(roleId, this.props.labelFactory);
                renderer.setVisibilityHandler(roleId, this.isWaypointVisible.bind(this));
                if (!hasDefaultId) {
                    this.renderRole = roleId;
                    hasDefaultId = true;
                }
            }
        });
    }
    /** @inheritdoc */
    setVisible(val) {
        super.setVisible(val);
        this.waypointsLayer.instance.setVisible(val);
    }
    /**
     * Checks to see if a waypoint should be visible.
     * @param waypoint The waypoint to check.
     * @returns True if visible, false otherwise.
     */
    isWaypointVisible(waypoint) {
        if (waypoint instanceof FacilityWaypoint) {
            switch (waypoint.type) {
                case WaypointTypes.Airport:
                    return this.displayModule.showAirports.get()(waypoint);
                case WaypointTypes.Intersection:
                    return this.displayModule.showIntersections.get()(waypoint);
                case WaypointTypes.VOR:
                    return this.displayModule.showVors.get()(waypoint);
                case WaypointTypes.NDB:
                    return this.displayModule.showNdbs.get()(waypoint);
            }
        }
        return false;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent(MapNearestWaypointsLayer, { ref: this.waypointsLayer, model: this.props.model, mapProjection: this.props.mapProjection, bus: this.props.bus, waypointRenderer: this.props.waypointRenderer, waypointForFacility: (facility) => this.waypointCache.get(facility), initRenderer: this.initWaypointRenderer.bind(this), registerWaypoint: (waypoint, renderer) => { renderer.register(waypoint, this.renderRole, 'waypoints-layer'); }, deregisterWaypoint: (waypoint, renderer) => { renderer.deregister(waypoint, this.renderRole, 'waypoints-layer'); }, searchItemLimit: (type) => this.searchItemLimits[type], searchRadiusLimit: (type) => this.searchRadiusLimits[type], getSearchCenter: this.props.useMapTargetAsSearchCenter === true ? (mapProjection) => mapProjection.getTarget() : undefined, onSessionsStarted: this.onSessionsStarted.bind(this) }));
    }
}
