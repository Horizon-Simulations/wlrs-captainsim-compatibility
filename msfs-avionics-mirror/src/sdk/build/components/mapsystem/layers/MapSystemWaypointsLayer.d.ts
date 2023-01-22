import { EventBus } from '../../../data/EventBus';
import { VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps, MapProjection } from '../../map';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapSystemIconFactory, MapSystemLabelFactory, MapSystemWaypointsRenderer } from '../MapSystemWaypointsRenderer';
import { MapWaypointDisplayModule } from '../modules/MapWaypointDisplayModule';
/**
 * Modules required by MapSystemWaypointsLayer.
 */
export interface MapSystemWaypointsLayerModules {
    /** Waypoints display module. */
    [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule;
}
/**
 * Props on the MapSystemWaypointsLayer component.
 */
export interface MapSystemWaypointsLayerProps extends MapLayerProps<MapSystemWaypointsLayerModules> {
    /** The event bus. */
    bus: EventBus;
    /** The waypoint renderer to use. */
    waypointRenderer: MapSystemWaypointsRenderer;
    /** The icon factory to use with this component. */
    iconFactory: MapSystemIconFactory;
    /** The label factory to use with this component. */
    labelFactory: MapSystemLabelFactory;
    /**
     * Whether to use the map's projection target as the center for facility searches instead of the map's center.
     * Defaults to `false`.
     */
    useMapTargetAsSearchCenter?: boolean;
}
/**
 * A class that renders waypoints into a layer.
 */
export declare class MapSystemWaypointsLayer extends MapLayer<MapSystemWaypointsLayerProps> {
    private readonly waypointsLayer;
    private readonly displayModule;
    private readonly waypointCache;
    private readonly searchItemLimits;
    private readonly searchRadiusLimits;
    private renderRole;
    /** @inheritdoc */
    onAttached(): void;
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void;
    /** @inheritdoc */
    onUpdated(time: number, elapsed: number): void;
    /** @inheritdoc */
    private initEventHandlers;
    /**
     * A callback called when the nearest facility search sessions have been started.
     * @param airportSession The airport search session.
     * @param vorSession The VOR search session.
     * @param ndbSession The NDB search session.
     * @param intSession The intersection search session.
     */
    private onSessionsStarted;
    /**
     * Initializes this layer's waypoint renderer.
     * @param renderer This layer's waypoint renderer.
     * @param canvasLayer The canvas layer to which to draw the waypoints.
     */
    private initWaypointRenderer;
    /**
     * Defines the render role for this layer's waypoints.
     * @param renderer This layer's waypoint renderer.
     * @param canvasLayer The canvas layer to which to draw the waypoints.
     */
    private defineRenderRole;
    /** @inheritdoc */
    setVisible(val: boolean): void;
    /**
     * Checks to see if a waypoint should be visible.
     * @param waypoint The waypoint to check.
     * @returns True if visible, false otherwise.
     */
    private isWaypointVisible;
    /** @inheritdoc */
    render(): VNode;
}
//# sourceMappingURL=MapSystemWaypointsLayer.d.ts.map