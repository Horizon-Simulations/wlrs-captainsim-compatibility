import { UnitType } from '../../math';
import { Vec2Math } from '../../math/VecMath';
import { VecNSubject } from '../../math/VectorSubject';
import { Subject } from '../../sub/Subject';
import { ResourceModerator } from '../../utils/resource';
import { FSComponent } from '../FSComponent';
import { GenericAirspaceRenderManager } from '../map/GenericAirspaceRenderManager';
import { MapAirspaceLayer } from '../map/layers/MapAirspaceLayer';
import { MapBingLayer } from '../map/layers/MapBingLayer';
import { MapCullableTextLayer } from '../map/layers/MapCullableTextLayer';
import { MapOwnAirplaneLayer } from '../map/layers/MapOwnAirplaneLayer';
import { MapCullableTextLabelManager } from '../map/MapCullableTextLabel';
import { MapProjection } from '../map/MapProjection';
import { MapAirspaceModule } from '../map/modules/MapAirspaceModule';
import { MapAutopilotPropsModule } from '../map/modules/MapAutopilotPropsModule';
import { MapOwnAirplaneIconModule } from '../map/modules/MapOwnAirplaneIconModule';
import { MapOwnAirplanePropsModule } from '../map/modules/MapOwnAirplanePropsModule';
import { MapAutopilotPropsController } from './controllers/MapAutopilotPropsController';
import { MapBindingsController } from './controllers/MapBindingsController';
import { MapClockUpdateController } from './controllers/MapClockUpdateController';
import { MapFlightPlanController } from './controllers/MapFlightPlanController';
import { MapFollowAirplaneController } from './controllers/MapFollowAirplaneController';
import { MapOwnAirplanePropsController } from './controllers/MapOwnAirplanePropsController';
import { MapRotationController } from './controllers/MapRotationController';
import { FlightPlanDisplayBuilder } from './FlightPlanDisplayBuilder';
import { MapSystemFlightPlanLayer } from './layers/MapSystemFlightPlanLayer';
import { MapSystemTrafficLayer } from './layers/MapSystemTrafficLayer';
import { MapSystemWaypointsLayer } from './layers/MapSystemWaypointsLayer';
import { MapSystemComponent } from './MapSystemComponent';
import { DefaultMapSystemContext } from './MapSystemContext';
import { MapSystemGenericController } from './MapSystemGenericController';
import { MapSystemKeys } from './MapSystemKeys';
import { MapSystemPlanRenderer } from './MapSystemPlanRenderer';
import { MapSystemUtils } from './MapSystemUtils';
import { MapSystemWaypointRoles } from './MapSystemWaypointRoles';
import { MapSystemIconFactory, MapSystemLabelFactory, MapSystemWaypointsRenderer } from './MapSystemWaypointsRenderer';
import { MapFlightPlanModule } from './modules/MapFlightPlanModule';
import { MapFollowAirplaneModule } from './modules/MapFollowAirplaneModule';
import { MapRotationModule } from './modules/MapRotationModule';
import { MapTerrainColorsModule } from './modules/MapTerrainColorsModule';
import { MapTrafficModule } from './modules/MapTrafficModule';
import { MapWaypointDisplayModule } from './modules/MapWaypointDisplayModule';
import { MapWxrModule } from './modules/MapWxrModule';
import { WaypointDisplayBuilder } from './WaypointDisplayBuilder';
/**
 * Builds maps. Each builder is configured with a series of build steps which collectively define how the builder
 * compiles finished maps. In addition to defining basic map properties such as size and range, build steps can also
 * customize map behavior and appearance through adding map model modules, layers, and controllers.
 *
 * Each map compiled by the builder is associated with a {@link MapSystemContext}, which holds references to the map
 * projection, map model, all layers and controllers, and other data associated with the map. Layers and controllers
 * have access to the context when they are created during compilation, and a reference to the context is stored with
 * the compiled map.
 *
 * A single builder can compile multiple maps. Each compiled map is a separate entity, with its own model, layers,
 * controllers, and context.
 */
export class MapSystemBuilder {
    /**
     * Creates an instance of a map system builder.
     * @param bus This builder's event bus.
     */
    constructor(bus) {
        this.bus = bus;
        this.moduleFactories = new Map();
        this.layerFactories = new Map();
        this.controllerFactories = new Map();
        this.contextFactories = new Map();
        this.initCallbacks = new Map();
        this.projectedSize = Subject.create(Vec2Math.create(100, 100));
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The number of map model modules added to this builder. */
    get moduleCount() {
        return this.moduleFactories.size;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The number of map layers added to this builder. */
    get layerCount() {
        return this.layerFactories.size;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The number of map controllers added to this builder. */
    get controllerCount() {
        return this.controllerFactories.size;
    }
    /**
     * Creates a new Garmin map builder. The builder is initialized with a default projected size of `[100, 100]` pixels.
     * @param bus The event bus.
     * @returns A new Garmin map builder.
     */
    static create(bus) {
        return new MapSystemBuilder(bus);
    }
    /**
     * Configures this builder to generate a map with a given projected window size.
     * @param size The size of the projected window, as `[width, height]` in pixels, or a subscribable which provides it.
     * @returns This builder, after it has been configured.
     */
    withProjectedSize(size) {
        this.projectedSize = 'isSubscribable' in size ? size : Subject.create(size);
        return this;
    }
    /**
     * Configures this builder to generate a map with a given dead zone.
     * @param deadZone The dead zone, as `[left, top, right, bottom]` in pixels, or a subscribable which provides it.
     * @returns This builder, after it has been configured.
     */
    withDeadZone(deadZone) {
        this.deadZone = 'isSubscribable' in deadZone ? deadZone : VecNSubject.createFromVector(new Float64Array(deadZone));
        return this;
    }
    /**
     * Configures this builder to generate a map with an initial projected target offset.
     * @param offset The initial projected target offset, as `[x, y]` in pixels.
     * @returns This builder, after it has been configured.
     */
    withTargetOffset(offset) {
        this.targetOffset = offset;
        return this;
    }
    /**
     * Configures this builder to generate a map with specific initial range endpoints. The endpoints are defined
     * relative to the width and height of the map's projected window, *excluding* the dead zone.
     * @param endpoints The initial range endpoints, as `[x1, y1, x2, y2]`.
     * @returns This builder, after it has been configured.
     */
    withRangeEndpoints(endpoints) {
        this.nominalRangeEndpoints = endpoints;
        return this;
    }
    /**
     * Configures this build to generate a map with a specific initial range.
     * @param range The initial range.
     * @returns This builder, after it has been configured.
     */
    withRange(range) {
        this.range = range.asUnit(UnitType.GA_RADIAN);
        return this;
    }
    /**
     * Adds a map module to this builder. When this builder compiles its map, all added modules will be created and added
     * to the map's model. If an existing module has been added to this builder with the same key, it will be replaced.
     * @param key The key (name) of the module.
     * @param factory A function which creates the module.
     * @returns This builder, after the map module has been added.
     */
    withModule(key, factory) {
        this.moduleFactories.set(key, { key, factory });
        return this;
    }
    /**
     * Adds a map layer to this builder. When this builder compiles its map, all added layers will be created and
     * attached to the map. Layers with a lower assigned order will be attached before and appear below layers with
     * greater assigned order values. If an existing layer has been added to this builder with the same key, it will be
     * replaced.
     * @param key The key of the layer.
     * @param factory A function which renders the layer as a VNode.
     * @param order The order assigned to the layer. Layers with lower assigned order will be attached to the map before
     * and appear below layers with greater assigned order values. Defaults to the number of layers already added to this
     * builder.
     * @returns This builder, after the map layer has been added, or `never` if this builder does not have all the
     * modules required by the layer.
     */
    withLayer(key, factory, order) {
        // Delete the key to ensure a consistent layer order.
        const wasDeleted = this.layerFactories.delete(key);
        this.layerFactories.set(key, { key, factory, order: order !== null && order !== void 0 ? order : (this.layerFactories.size + (wasDeleted ? 1 : 0)) });
        return this;
    }
    /**
     * Adds a controller to this builder. When this builder compiles its map, all added controllers will be created and
     * hooked up to the map's lifecycle callbacks. If an existing controller has been added to this builder with the same
     * key, it will be replaced.
     * @param key The key of the controller.
     * @param factory A function which creates the controller.
     * @returns This builder, after the map layer has been added, or `never` if this builder does not have all the
     * modules required by the controller.
     */
    withController(key, factory) {
        this.controllerFactories.set(key, { factory });
        return this;
    }
    /**
     * Adds a context property to this builder. When the builder compiles its map, all added properties will be available
     * on the context. Properties are created on the context in the order they were added to the builder, and property
     * factories have access to previously created properties on the context. If an existing property has been added to
     * this builder with the same key, it will be replaced.
     * @param key The key of the property to add.
     * @param factory A function which creates the value of the property.
     * @returns This builder, after the context property has been added.
     */
    withContext(key, factory) {
        var _a;
        if (!MapSystemBuilder.RESTRICTED_CONTEXT_KEYS.has(key)) {
            const existing = this.contextFactories.get(key);
            const order = (_a = existing === null || existing === void 0 ? void 0 : existing.order) !== null && _a !== void 0 ? _a : this.contextFactories.size;
            this.contextFactories.set(key, { key, factory, order });
        }
        return this;
    }
    /**
     * Configures this builder to execute a callback function immediately after it is finished compiling a map. If an
     * existing callback has been added to this builder with the same key, it will be replaced.
     * @param key The key of the callback.
     * @param callback The callback function to add.
     * @returns This builder, after the callback has been added.
     */
    withInit(key, callback) {
        this.initCallbacks.set(key, callback);
        return this;
    }
    /**
     * Assigns an order value to a layer. Layers with a lower assigned order will be attached before and appear below
     * layers with greater assigned order values.
     * @param key The key of the layer to which to assign the order value.
     * @param order The order value to assign.
     * @returns This builder, after the order value has been assigned.
     */
    withLayerOrder(key, order) {
        const factory = this.layerFactories.get(key);
        if (factory) {
            // Delete the key to ensure a consistent layer order.
            this.layerFactories.delete(key);
            factory.order = order;
            this.layerFactories.set(key, factory);
        }
        return this;
    }
    /**
     * Configures this builder to add a controller which maintains a list of bindings from source to target
     * subscribables.
     * @param key The key of the controller.
     * @param bindings The bindings to maintain.
     * @returns This builder, after it has been configured.
     */
    withBindings(key, bindings) {
        return this.withController(key, context => new MapBindingsController(context, bindings(context)));
    }
    /**
     * Configures this builder to generate a map which is updated at a regular frequency based on event bus clock events.
     *
     * Adds the following...
     *
     * Context properties:
     * * `'updateFreq': Subscribable<number>`
     *
     * Controllers:
     * * `[MapSystemKeys.ClockUpdate]: MapClockUpdateController`.
     * @param updateFreq The map's update frequency, in hertz, or a subscribable which provides it.
     * @returns This builder, after it has been configured.
     */
    withClockUpdate(updateFreq) {
        return this
            .withContext('updateFreq', () => typeof updateFreq === 'number' ? Subject.create(updateFreq) : updateFreq)
            .withController(MapSystemKeys.ClockUpdate, context => new MapClockUpdateController(context));
    }
    /**
     * Configures this builder to add a resource moderator for control of the map's projection target.
     *
     * Adds the context property `[MapSystemKeys.TargetControl]: ResourceModerator<void>`.
     * @returns This builder, after the resource moderator has been added.
     */
    withTargetControlModerator() {
        return this.withContext(MapSystemKeys.TargetControl, () => new ResourceModerator(undefined));
    }
    /**
     * Configures this builder to add a resource moderator for control of the map's rotation.
     *
     * Adds the context property `[MapSystemKeys.RotationControl]: ResourceModerator<void>`.
     * @returns This builder, after the resource moderator has been added.
     */
    withRotationControlModerator() {
        return this.withContext(MapSystemKeys.RotationControl, () => new ResourceModerator(undefined));
    }
    /**
     * Configures this builder to add a resource moderator for control of the map's range.
     *
     * Adds the context property `[MapSystemKeys.RangeControl]: ResourceModerator<void>`.
     * @returns This builder, after the resource moderator has been added.
     */
    withRangeControlModerator() {
        return this.withContext(MapSystemKeys.RangeControl, () => new ResourceModerator(undefined));
    }
    /**
     * Configures this builder to generate a map whose projection target follows the player airplane. The follow airplane
     * behavior will be active if and only if the controller owns the projection target control resource. The
     * controller's priority for the resource is `0`.
     *
     * Adds the following...
     *
     * Context properties:
     * * `[MapSystemKeys.TargetControl]: ResourceModerator<void>`
     *
     * Modules:
     * * `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule`
     * * `[MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule`
     *
     * Controllers:
     * * `[MapSystemKeys.FollowAirplane]: MapFollowAirplaneController`
     * @returns This builder, after it has been configured.
     */
    withFollowAirplane() {
        return this
            .withModule(MapSystemKeys.OwnAirplaneProps, () => new MapOwnAirplanePropsModule)
            .withModule(MapSystemKeys.FollowAirplane, () => new MapFollowAirplaneModule())
            .withTargetControlModerator()
            .withController(MapSystemKeys.FollowAirplane, context => new MapFollowAirplaneController(context));
    }
    /**
     * Configures this builder to generate a map which supports common rotation behavior. The rotation behavior will be
     * active if and only if the controller owns the rotation control resource. The controller's priority for the
     * resource is `0`.
     *
     * Requires the module `'ownAirplaneProps': MapOwnAirplanePropsModule` to support player airplane-derived rotation
     * behavior, such as Heading Up and Track Up.
     *
     * Adds the following...
     *
     * Context properties:
     * * `'[MapSystemKeys.RotationControl]': ResourceModerator<void>`
     *
     * Modules:
     * * `[MapSystemKeys.Rotation]: MapRotationModule`
     *
     * Controllers:
     * * `[MapSystemKeys.Rotation]: MapRotationController`
     * @returns This builder, after it has been configured.
     */
    withRotation() {
        return this
            .withModule(MapSystemKeys.Rotation, () => new MapRotationModule())
            .withRotationControlModerator()
            .withController(MapSystemKeys.Rotation, context => new MapRotationController(context));
    }
    /**
     * Configures this builder to generate a map which displays an icon depicting the position of the player airplane.
     *
     * Adds the following...
     *
     * Modules:
     * * `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule`
     * * `[MapSystemKeys.OwnAirplaneIcon]: MapOwnAirplaneIconModule`
     *
     * Layers:
     * * `[MapSystemKeys.OwnAirplaneIcon]: MapOwnAirplaneLayer`
     * @param iconSize The size of the icon, in pixels.
     * @param iconFilePath The path to the icon's image asset, or a subscribable which provides it.
     * @param iconAnchor The point on the icon that is anchored to the airplane's position, or a subscribable which
     * provides it. The point is expressed as a 2-tuple relative to the icon's width and height, with `[0, 0]` at the
     * top left and `[1, 1]` at the bottom right.
     * @param cssClass The CSS class(es) to apply to the root of the airplane icon layer.
     * @param order The order assigned to the icon layer. Layers with lower assigned order will be attached to the map
     * before and appear below layers with greater assigned order values. Defaults to the number of layers already added
     * to this builder.
     * @returns This builder, after it has been configured.
     */
    withOwnAirplaneIcon(iconSize, iconFilePath, iconAnchor, cssClass, order) {
        return this
            .withModule(MapSystemKeys.OwnAirplaneProps, () => new MapOwnAirplanePropsModule())
            .withModule(MapSystemKeys.OwnAirplaneIcon, () => new MapOwnAirplaneIconModule())
            .withLayer(MapSystemKeys.OwnAirplaneIcon, (context) => {
            return (FSComponent.buildComponent(MapOwnAirplaneLayer, { model: context.model, mapProjection: context.projection, imageFilePath: typeof iconFilePath === 'string' ? Subject.create(iconFilePath) : iconFilePath, iconSize: iconSize, iconAnchor: 'isSubscribable' in iconAnchor ? iconAnchor : Subject.create(iconAnchor), class: cssClass }));
        }, order);
    }
    /**
     * Configures this builder to bind properties in an added {@link MapOwnAirplanePropsModule} to data derived from
     * event bus events.
     *
     * Requires the module `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule`.
     *
     * Adds the controller `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsController`.
     * @param properties The properties to bind.
     * @param updateFreq The update frequency, in hertz, or a subscribable which provides it.
     * @returns This builder, after it has been configured.
     */
    withOwnAirplanePropBindings(properties, updateFreq) {
        return this.withController(MapSystemKeys.OwnAirplaneProps, context => new MapOwnAirplanePropsController(context, properties, typeof updateFreq === 'number' ? Subject.create(updateFreq) : updateFreq));
    }
    /**
     * Configures this builder to add a module describing the player airplane's autopilot properties, and optionally
     * binds the module's properties to data received over the event bus.
     *
     * Adds the following...
     *
     * Modules:
     * * `[MapSystemKeys.AutopilotProps]: MapAutopilotPropsModule`
     *
     * Controllers:
     * * `[MapSystemKeys.AutopilotProps]: MapAutopilotPropsController` (optional)
     * @param propertiesToBind Properties on the autopilot module to bind to data received over the event bus.
     * @param updateFreq The update frequency, in hertz, of the data bindings, or a subscribable which provides it. If
     * not defined, the data bindings will update every frame. Ignored if `propertiesToBind` is undefined.
     * @returns This builder, after it has been configured.
     */
    withAutopilotProps(propertiesToBind, updateFreq) {
        this.withModule(MapSystemKeys.AutopilotProps, () => new MapAutopilotPropsModule());
        if (propertiesToBind !== undefined) {
            this.withController(MapSystemKeys.AutopilotProps, context => new MapAutopilotPropsController(context, propertiesToBind, typeof updateFreq === 'number' ? Subject.create(updateFreq) : updateFreq));
        }
        return this;
    }
    /**
     * Configures this builder to generate a map which includes a layer displaying text.
     *
     * Adds the following...
     *
     * Context properties:
     * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
     *
     * Layers:
     * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
     * @param enableCulling Whether to enable text culling. Defaults to `false`.
     * @param order The order value to assign to the text layer. Layers with lower assigned order will be attached to
     * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
     * already added to this builder.
     * @returns This builder, after it has been configured.
     */
    withTextLayer(enableCulling, order) {
        return this.withContext(MapSystemKeys.TextManager, () => new MapCullableTextLabelManager(enableCulling))
            .withLayer(MapSystemKeys.TextLayer, (context) => {
            return (FSComponent.buildComponent(MapCullableTextLayer, { model: context.model, mapProjection: context.projection, manager: context.textManager }));
        }, order);
    }
    /**
     * Configures this builder to generate a map which displays Bing Map terrain and weather.
     *
     * Adds the following...
     *
     * Modules:
     * * `[MapSystemKeys.TerrainColors]: MapTerrainColorsModule`
     * * `[MapSystemKeys.Weather]: MapWxrModule`
     *
     * Layers:
     * * `[MapSystemKeys.Bing]: MapBingLayer`
     * @param bingId The ID to assign to the Bing Map instance bound to the layer.
     * @param delay The delay, in milliseconds, to wait after the Bing layer has been rendered before attempting to bind
     * a Bing Map instance.
     * @param mode The mode of the map, optional. If omitted, will be EBingMode.PLANE.
     * @param order The order value to assign to the Bing layer. Layers with lower assigned order will be attached to the
     * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
     * added to the map builder.
     * @returns This builder, after it has been configured.
     */
    withBing(bingId, delay = 0, mode, order) {
        return this
            .withModule(MapSystemKeys.TerrainColors, () => new MapTerrainColorsModule())
            .withModule(MapSystemKeys.Weather, () => new MapWxrModule())
            .withLayer(MapSystemKeys.Bing, context => {
            const terrainColors = context.model.getModule('terrainColors');
            const weather = context.model.getModule('weather');
            return (FSComponent.buildComponent(MapBingLayer, { model: context.model, mapProjection: context.projection, bingId: bingId, reference: terrainColors.reference, earthColors: terrainColors.colors, isoLines: terrainColors.showIsoLines, wxrMode: weather.wxrMode, mode: mode, delay: delay }));
        }, order);
    }
    /**
     * Configures this builder to generate a map which uses a {@link MapSystemWaypointsRenderer} to render waypoints.
     *
     * Requires the `[MapSystemKeys.TextManager]: MapCullableTextLabelManager` context property.
     *
     * Adds the `[MapSystemKeys.WaypointRenderer]: MapSystemWaypointsRenderer` context property.
     * @returns This builder, after it has been configured.
     */
    withWaypoints() {
        return this
            .withContext(MapSystemKeys.WaypointRenderer, context => new MapSystemWaypointsRenderer(context[MapSystemKeys.TextManager]))
            .withController('waypointRendererUpdate', context => new MapSystemGenericController(context, {
            onAfterUpdated: (contextArg) => { contextArg[MapSystemKeys.WaypointRenderer].update(context.projection); }
        }));
    }
    /**
     * Configures this builder to generate a map which displays waypoints near the map center or target. Waypoints
     * displayed in this manner are rendered by a {@link MapSystemWaypointsRenderer}.
     *
     * If a text layer has already been added to the builder, its order will be changed so that it is rendered above the
     * waypoint layer. Otherwise, a text layer will be added to the builder after the waypoint layer.
     *
     * Adds the following...
     *
     * Context properties:
     * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
     * * `[MapSystemKeys.IconFactory]: MapSystemIconFactory`
     * * `[MapSystemKeys.LabelFactory]: MapSystemLabelFactory`
     *
     * Modules:
     * * `[MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule`
     *
     * Layers:
     * * `[MapSystemKeys.NearestWaypoints]: MapSystemWaypointsLayer`
     * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
     * @param configure A function to configure the waypoint display.
     * @param enableTextCulling Whether to enable text culling on the text manager.
     * @param order The order to assign to the waypoint layer. Layers with lower assigned order will be attached to the
     * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
     * added to this builder.
     * @returns This builder, after it has been configured.
     */
    withNearestWaypoints(configure, enableTextCulling = false, order) {
        this
            .withTextLayer(enableTextCulling)
            .withModule(MapSystemKeys.NearestWaypoints, () => new MapWaypointDisplayModule())
            .withWaypoints()
            .withContext(MapSystemKeys.IconFactory, () => new MapSystemIconFactory())
            .withContext(MapSystemKeys.LabelFactory, () => new MapSystemLabelFactory())
            .withContext('useTargetAsWaypointSearchCenter', context => {
            context[MapSystemKeys.WaypointRenderer].addRenderRole(MapSystemWaypointRoles.Normal, undefined, MapSystemWaypointRoles.Normal);
            const builder = new WaypointDisplayBuilder(context[MapSystemKeys.IconFactory], context[MapSystemKeys.LabelFactory], context[MapSystemKeys.WaypointRenderer]);
            configure(builder);
            return builder.getIsCenterTarget();
        });
        const layerCount = this.layerCount;
        return this
            .withLayer(MapSystemKeys.NearestWaypoints, context => {
            return (FSComponent.buildComponent(MapSystemWaypointsLayer, { bus: context.bus, waypointRenderer: context[MapSystemKeys.WaypointRenderer], model: context.model, mapProjection: context.projection, iconFactory: context[MapSystemKeys.IconFactory], labelFactory: context[MapSystemKeys.LabelFactory], useMapTargetAsSearchCenter: context.useTargetAsWaypointSearchCenter }));
        }, order)
            .withLayerOrder(MapSystemKeys.TextLayer, order !== null && order !== void 0 ? order : layerCount);
    }
    /**
     * Configures this builder to generate a map which displays a flight plan. Waypoints displayed as part of the flight
     * plan are rendered by a {@link MapSystemWaypointsRenderer}.
     *
     * If a text layer has already been added to the builder, its order will be changed so that it is rendered above the
     * waypoint layer. Otherwise, a text layer will be added to the builder after the waypoint layer.
     *
     * Adds the following...
     *
     * Context properties:
     * * `[MapSystemKeys.FlightPlanner]: FlightPlanner`
     * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
     * * `[MapSystemKeys.IconFactory]: MapSystemIconFactory`
     * * `[MapSystemKeys.LabelFactory]: MapSystemLabelFactory`
     * * `[MapSystemKeys.FlightPathRenderer]: MapSystemPlanRenderer`
     *
     * Modules:
     * * `[MapSystemKeys.FlightPlan]: MapFlightPlanModule`
     *
     * Layers:
     * * `` `${[MapSystemKeys.FlightPlan]}${planIndex}`: MapSystemFlightPlanLayer ``
     * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
     *
     * Controllers:
     * * `[MapSystemKeys.FlightPlan]: MapFlightPlanController`
     * @param configure A function to configure the waypoint display.
     * @param flightPlanner The flight planner.
     * @param planIndex The index of the flight plan to display.
     * @param enableTextCulling Whether to enable text culling on the text manager.
     * @param order The order to assign to the plan layer. Layers with lower assigned order will be attached to the
     * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
     * added to this builder.
     * @returns This builder, after it has been configured.
     */
    withFlightPlan(configure, flightPlanner, planIndex, enableTextCulling = false, order) {
        this
            .withTextLayer(enableTextCulling)
            .withModule(MapSystemKeys.FlightPlan, () => new MapFlightPlanModule())
            .withWaypoints()
            .withContext(MapSystemKeys.FlightPlanner, () => flightPlanner)
            .withContext(MapSystemKeys.IconFactory, () => new MapSystemIconFactory())
            .withContext(MapSystemKeys.LabelFactory, () => new MapSystemLabelFactory())
            .withContext(MapSystemKeys.FlightPathRenderer, () => new MapSystemPlanRenderer(1))
            .withController(MapSystemKeys.FlightPlan, context => new MapFlightPlanController(context))
            .withInit(`${MapSystemKeys.FlightPlan}${planIndex}`, context => {
            const builder = new FlightPlanDisplayBuilder(context[MapSystemKeys.IconFactory], context[MapSystemKeys.LabelFactory], context[MapSystemKeys.WaypointRenderer], context[MapSystemKeys.FlightPathRenderer], planIndex);
            context[MapSystemKeys.WaypointRenderer].insertRenderRole(MapSystemWaypointRoles.FlightPlan, MapSystemWaypointRoles.Normal, undefined, `${MapSystemWaypointRoles.FlightPlan}_${planIndex}`);
            configure(builder);
        });
        const layerCount = this.layerCount;
        return this
            .withLayer(`${MapSystemKeys.FlightPlan}${planIndex}`, (context) => {
            return (FSComponent.buildComponent(MapSystemFlightPlanLayer, { bus: context.bus, waypointRenderer: context[MapSystemKeys.WaypointRenderer], model: context.model, mapProjection: context.projection, iconFactory: context[MapSystemKeys.IconFactory], labelFactory: context[MapSystemKeys.LabelFactory], flightPathRenderer: context[MapSystemKeys.FlightPathRenderer], planIndex: planIndex }));
        }, order)
            .withLayerOrder(MapSystemKeys.TextLayer, order !== null && order !== void 0 ? order : layerCount);
    }
    /**
     * Configures this builder to generate a map which displays airspaces.
     *
     * Adds the following...
     *
     * Context properties:
     * * `[MapSystemKeys.AirspaceManager]: GenericAirspaceRenderManager`
     *
     * Modules:
     * * `[MapSystemKeys.Airspace]: MapAirspaceModule`
     *
     * Layers:
     * * `[MapSystemKeys.Airspace]: MapAirspaceLayer`
     * @param cache The airspace cache to use to store airspaces retrieved for rendering.
     * @param showTypes The airspace show types to define in the airspace module. Each show type will be assigned a
     * {@link Subject} in the `show` property of the module. The Subject controls the visibility of airspace types
     * included in its show type. Airspace types that are not included in any defined show type will never be displayed.
     * @param selectRenderer A function which selects a {@link MapAirspaceRenderer}
     * @param renderOrder A function which determines the rendering order of airspaces. The function should return a
     * negative number when airspace `a` should be rendered before (below) airspace `b`, a positive number when airspace
     * `a` should be rendered after (above) airspace `b`, and `0` when the relative render order of the two airspaces
     * does not matter. If not defined, there will be no guarantee on the order in which airspaces are rendered.
     * @param options Options for the airspace layer. Option defaults are as follows:
     * * `maxSearchRadius`: 10 nautical miles
     * * `maxSearchItemCount`: 100
     * * `searchDebounceDelay`: 500 (milliseconds)
     * * `renderTimeBudget`: 0.2 (milliseconds)
     * @param order The order to assign to the airspace layer. Layers with lower assigned order will be attached to the
     * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
     * added to this builder.
     * @returns This builder, after it has been configured.
     */
    withAirspaces(cache, showTypes, selectRenderer, renderOrder = () => 0, options, order) {
        return this
            .withModule(MapSystemKeys.Airspace, () => new MapAirspaceModule(showTypes))
            .withContext(MapSystemKeys.AirspaceManager, () => new GenericAirspaceRenderManager(renderOrder, selectRenderer))
            .withLayer(MapSystemKeys.Airspace, context => {
            var _a, _b;
            const optionsToUse = Object.assign({}, options);
            (_a = optionsToUse.maxSearchRadius) !== null && _a !== void 0 ? _a : (optionsToUse.maxSearchRadius = Subject.create(UnitType.NMILE.createNumber(10)));
            (_b = optionsToUse.maxSearchItemCount) !== null && _b !== void 0 ? _b : (optionsToUse.maxSearchItemCount = Subject.create(100));
            return (FSComponent.buildComponent(MapAirspaceLayer, Object.assign({ model: context.model, mapProjection: context.projection, bus: context.bus, lodBoundaryCache: cache, airspaceRenderManager: context[MapSystemKeys.AirspaceManager] }, optionsToUse)));
        }, order);
    }
    /**
     * Configures this builder to generate a map which displays TCAS intruders.
     *
     * Adds the following...
     *
     * Modules:
     * * `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule`
     * * `[MapSystemKeys.Traffic]: MapTrafficModule`
     *
     * Layers:
     * * `[MapSystemKeys.Traffic]: MapSystemTrafficLayer`
     * @param tcas The TCAS used by the traffic display.
     * @param iconFactory A function which creates intruder icons for the traffic display.
     * @param initCanvasStyles A function which initializes global canvas styles for the traffic display.
     * @param offScaleOobOptions A function which generates options for handling off-scale and out-of-bounds intruders.
     * @param order The order to assign to the traffic layer. Layers with lower assigned order will be attached to the
     * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
     * added to this builder.
     * @returns This builder, after it has been configured.
     */
    withTraffic(tcas, iconFactory, initCanvasStyles, offScaleOobOptions, order) {
        return this
            .withModule(MapSystemKeys.OwnAirplaneProps, () => new MapOwnAirplanePropsModule())
            .withModule(MapSystemKeys.Traffic, () => new MapTrafficModule(tcas))
            .withLayer('traffic', context => {
            const options = offScaleOobOptions !== undefined ? Object.assign({}, offScaleOobOptions(context)) : {};
            if (options.oobOffset !== undefined && !('isSubscribable' in options.oobOffset)) {
                options.oobOffset = Subject.create(options.oobOffset);
            }
            return (FSComponent.buildComponent(MapSystemTrafficLayer, Object.assign({ context: context, model: context.model, mapProjection: context.projection, iconFactory: iconFactory, initCanvasStyles: initCanvasStyles }, options)));
        }, order);
    }
    /**
     * Configures this builder using a custom build step.
     * @param builder A function which defines a custom build step.
     * @param args Arguments to pass to the custom build function.
     * @returns This builder, after it has been configured.
     */
    with(builder, ...args) {
        return builder(this, ...args);
    }
    /**
     * Compiles a map. The compiled map consists of a map context, a rendered map (as a VNode), and a node reference to
     * the rendered map component.
     *
     * The compiled map will be bound to a model (accessible through the map context) which contains all the modules
     * added to this builder.
     *
     * The map will also contain all layers added to this builder, with layers assigned lower order values appearing
     * below layers assigned greater order values. The layers can be retrieved by their keys from the map context.
     *
     * All controllers added to this builder will be created with the map and hooked up to the map's lifecycle callbacks.
     * The controllers can be retrieved by their keys from the map context.
     * @param cssClass The CSS class(es) to apply to the root of the rendered map component.
     * @returns A compiled map.
     */
    build(cssClass) {
        const context = this.buildContext();
        const controllers = [];
        const ref = FSComponent.createRef();
        const onAfterRender = () => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onAfterMapRender(ref.instance);
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onAfterMapRender() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
        };
        const onDeadZoneChanged = (deadZone) => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onDeadZoneChanged(deadZone);
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onDeadZoneChanged() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
        };
        const onMapProjectionChanged = (mapProjection, changeFlags) => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onMapProjectionChanged(mapProjection, changeFlags);
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onMapProjectionChanged() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
        };
        const onBeforeUpdated = (time, elapsed) => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onBeforeUpdated(time, elapsed);
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onBeforeUpdated() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
            context.projection.applyQueued();
        };
        const onAfterUpdated = (time, elapsed) => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onAfterUpdated(time, elapsed);
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onAfterUpdated() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
        };
        const onWake = () => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onWake();
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onWake() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
        };
        const onSleep = () => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onSleep();
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onSleep() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
        };
        const onDestroy = () => {
            for (let i = 0; i < controllers.length; i++) {
                if (!controllers[i].isAlive) {
                    controllers.splice(i, 1);
                    i--;
                }
                try {
                    controllers[i].onMapDestroyed();
                }
                catch (e) {
                    console.error(`MapSystem: error in controller .onMapDestroyed() callback: ${e}`);
                    if (e instanceof Error) {
                        console.error(e.stack);
                    }
                }
            }
        };
        const map = (FSComponent.buildComponent(MapSystemComponent, { ref: ref, model: context.model, projection: context.projection, bus: context.bus, projectedSize: this.projectedSize, onAfterRender: onAfterRender, onDeadZoneChanged: onDeadZoneChanged, onMapProjectionChanged: onMapProjectionChanged, onBeforeUpdated: onBeforeUpdated, onAfterUpdated: onAfterUpdated, onWake: onWake, onSleep: onSleep, onDestroy: onDestroy, class: cssClass }, Array.from(this.layerFactories.values()).sort((a, b) => a.order - b.order).map(factory => {
            const node = factory.factory(context);
            context.setLayer(factory.key, node.instance);
            return node;
        })));
        const controllerEntries = Array.from(this.controllerFactories)
            .map(([key, factory]) => [key, factory.factory(context)]);
        for (const [key, controller] of controllerEntries) {
            context.setController(key, controller);
        }
        controllers.push(...controllerEntries.map(([, controller]) => controller));
        for (const callback of this.initCallbacks.values()) {
            callback(context);
        }
        return { context, map, ref };
    }
    /**
     * Builds a new map context. The map context will be initialized with all context properties and modules added to
     * this builder.
     * @returns The new map context.
     */
    buildContext() {
        var _a;
        const context = new DefaultMapSystemContext(this.bus, new MapProjection(this.projectedSize.get()[0], this.projectedSize.get()[1]), this.projectedSize, (_a = this.deadZone) !== null && _a !== void 0 ? _a : VecNSubject.createFromVector(new Float64Array(4)));
        context.projection.set({
            targetProjectedOffset: this.targetOffset,
            rangeEndpoints: this.nominalRangeEndpoints !== undefined
                ? MapSystemUtils.nominalToTrueRelativeXY(this.nominalRangeEndpoints, context.projectedSize.get(), context.deadZone.get(), Vec2Math.create())
                : undefined,
            range: this.range
        });
        for (const factory of Array.from(this.contextFactories.values()).sort((a, b) => a.order - b.order)) {
            context[factory.key] = factory.factory(context);
        }
        for (const factory of this.moduleFactories.values()) {
            context.model.addModule(factory.key, factory.factory());
        }
        return context;
    }
}
MapSystemBuilder.RESTRICTED_CONTEXT_KEYS = new Set([
    'bus',
    'model',
    'projection',
    'projectedSize',
    'deadZone',
    'getLayer',
    'setLayer',
    'getController',
    'setController'
]);
