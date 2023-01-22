/// <reference types="msfstypes/js/netbingmap" />
import { EventBus } from '../../data/EventBus';
import { FlightPlanner } from '../../flightplan/FlightPlanner';
import { NumberUnitInterface, UnitFamily } from '../../math';
import { ReadonlyFloat64Array } from '../../math/VecMath';
import { LodBoundary, LodBoundaryCache } from '../../navigation';
import { Subscribable } from '../../sub/Subscribable';
import { MutableSubscribableSet, SubscribableSet } from '../../sub/SubscribableSet';
import { Tcas, TcasIntruder } from '../../traffic/Tcas';
import { VNode } from '../FSComponent';
import { MapAirspaceLayerProps } from '../map/layers/MapAirspaceLayer';
import { MapAirspaceRenderer } from '../map/MapAirspaceRenderer';
import { MapCullableTextLabelManager } from '../map/MapCullableTextLabel';
import { MapLayer } from '../map/MapLayer';
import { MapAirspaceShowTypes } from '../map/modules/MapAirspaceModule';
import { MapAutopilotPropsKey } from './controllers/MapAutopilotPropsController';
import { MapBinding, MapTransformedBinding } from './controllers/MapBindingsController';
import { MapOwnAirplanePropsControllerModules, MapOwnAirplanePropsKey } from './controllers/MapOwnAirplanePropsController';
import { FlightPlanDisplayBuilder } from './FlightPlanDisplayBuilder';
import { MapTrafficIntruderIconFactory } from './layers/MapSystemTrafficLayer';
import { MapSystemContext, MutableMapContext } from './MapSystemContext';
import { MapSystemController } from './MapSystemController';
import { MapSystemKeys } from './MapSystemKeys';
import { CompiledMapSystem, ContextRecord, ControllerRecord, EmptyRecord, LayerRecord, ModuleRecord, RequiredControllerContext, RequiredControllerLayers, RequiredControllerModules, RequiredLayerModules } from './MapSystemTypes';
import { WaypointDisplayBuilder } from './WaypointDisplayBuilder';
/**
 * A function which defines a custom build step.
 */
export declare type MapSystemCustomBuilder<Args extends any[] = any[], RequiredModules extends ModuleRecord = any, RequiredLayers extends LayerRecord = any, RequiredContext extends ContextRecord = any> = (mapBuilder: MapSystemBuilder<RequiredModules, RequiredLayers, any, RequiredContext>, ...args: Args) => MapSystemBuilder<any, any, any, any>;
/**
 * Retrieves the extra arguments, after the map builder, of a custom builder.
 */
declare type CustomBuilderArgs<Builder> = Builder extends MapSystemCustomBuilder<infer Args> ? Args : never;
/**
 * Retrieves a custom map builder's required modules.
 */
export declare type RequiredCustomBuilderModules<Builder> = Builder extends MapSystemCustomBuilder<any, infer M> ? M : never;
/**
 * Retrieves a custom map builder's required layers.
 */
export declare type RequiredCustomBuilderLayers<Builder> = Builder extends MapSystemCustomBuilder<any, any, infer L> ? L : never;
/**
 * Retrieves a custom map builder's required context.
 */
export declare type RequiredCustomBuilderContext<Builder> = Builder extends MapSystemCustomBuilder<any, any, any, infer Context> ? Context : never;
/**
 * A map model module factory.
 */
declare type ModuleFactory = {
    /** The key of the module to create. */
    key: string;
    /** The constructor of the module to create. */
    factory: () => any;
};
/**
 * A map layer factory.
 */
declare type LayerFactory = {
    /** The key of the layer to create. */
    key: string;
    /** A function which renders the layer to create. */
    factory: (context: MapSystemContext<any, any, any, any>) => VNode;
    /** The order value of the layer to create. */
    order: number;
};
/**
 * A map controller factory.
 */
declare type ControllerFactory = {
    /** A function which creates the controller. */
    factory: (context: MapSystemContext<any, any, any, any>) => MapSystemController<any, any, any>;
};
/**
 * A map context property factory.
 */
declare type ContextFactory = {
    /** The key of the property to create. */
    key: string;
    /** A function which creates the context property. */
    factory: (context: MapSystemContext<any, any, any, any>) => any;
    /** The value determining in which order to create the property.  */
    order: number;
};
/**
 * Checks if a set of module, layer, and context records meet certain requirements. If the requirements are met, the
 * specified type is returned. If the requirements are not met, `never` is returned.
 */
declare type ConditionalReturn<Modules, RequiredModules, Layers, RequiredLayers, Context, RequiredContext, ReturnType> = Modules extends RequiredModules ? Layers extends RequiredLayers ? Context extends RequiredContext ? ReturnType : never : never : never;
/** Checks if a type is exactly the `any` type. */
declare type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false;
/** Returns a type if it is not `any`, otherwise returns a default type. */
declare type DefaultIfAny<T, Default> = IsAny<T> extends true ? Default : T;
/**
 * Options for handling off-scale and out-of-bounds traffic intruders on a traffic layer.
 */
export declare type TrafficOffScaleOobOptions = {
    /** A subscribable set to update with off-scale intruders. */
    offScaleIntruders?: MutableSubscribableSet<TcasIntruder>;
    /**
     * A subscribable set to update with intruders that are not off-scale but whose projected positions are considered
     * out-of-bounds.
     */
    oobIntruders?: MutableSubscribableSet<TcasIntruder>;
    /**
     * A subscribable which provides the offset of the intruder out-of-bounds boundaries relative to the boundaries of
     * the map's projected window, as `[left, top, right, bottom]` in pixels. Positive offsets are directed toward the
     * center of the map. Defaults to `[0, 0, 0, 0]`.
     */
    oobOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
};
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
export declare class MapSystemBuilder<Modules extends ModuleRecord = any, Layers extends LayerRecord = any, Controllers extends ControllerRecord = any, Context extends ContextRecord = any> {
    readonly bus: EventBus;
    protected static readonly RESTRICTED_CONTEXT_KEYS: Set<string>;
    protected readonly moduleFactories: Map<string, ModuleFactory>;
    protected readonly layerFactories: Map<string, LayerFactory>;
    protected readonly controllerFactories: Map<string, ControllerFactory>;
    protected readonly contextFactories: Map<string, ContextFactory>;
    protected readonly initCallbacks: Map<string, (context: MapSystemContext<any, any, any, any>) => void>;
    protected projectedSize: Subscribable<ReadonlyFloat64Array>;
    protected deadZone?: Subscribable<ReadonlyFloat64Array>;
    protected targetOffset?: ReadonlyFloat64Array;
    protected nominalRangeEndpoints?: ReadonlyFloat64Array;
    protected range?: number;
    /** The number of map model modules added to this builder. */
    get moduleCount(): number;
    /** The number of map layers added to this builder. */
    get layerCount(): number;
    /** The number of map controllers added to this builder. */
    get controllerCount(): number;
    /**
     * Creates an instance of a map system builder.
     * @param bus This builder's event bus.
     */
    protected constructor(bus: EventBus);
    /**
     * Creates a new Garmin map builder. The builder is initialized with a default projected size of `[100, 100]` pixels.
     * @param bus The event bus.
     * @returns A new Garmin map builder.
     */
    static create(bus: EventBus): MapSystemBuilder;
    /**
     * Configures this builder to generate a map with a given projected window size.
     * @param size The size of the projected window, as `[width, height]` in pixels, or a subscribable which provides it.
     * @returns This builder, after it has been configured.
     */
    withProjectedSize(size: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>): this;
    /**
     * Configures this builder to generate a map with a given dead zone.
     * @param deadZone The dead zone, as `[left, top, right, bottom]` in pixels, or a subscribable which provides it.
     * @returns This builder, after it has been configured.
     */
    withDeadZone(deadZone: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>): this;
    /**
     * Configures this builder to generate a map with an initial projected target offset.
     * @param offset The initial projected target offset, as `[x, y]` in pixels.
     * @returns This builder, after it has been configured.
     */
    withTargetOffset(offset: ReadonlyFloat64Array): this;
    /**
     * Configures this builder to generate a map with specific initial range endpoints. The endpoints are defined
     * relative to the width and height of the map's projected window, *excluding* the dead zone.
     * @param endpoints The initial range endpoints, as `[x1, y1, x2, y2]`.
     * @returns This builder, after it has been configured.
     */
    withRangeEndpoints(endpoints: ReadonlyFloat64Array): this;
    /**
     * Configures this build to generate a map with a specific initial range.
     * @param range The initial range.
     * @returns This builder, after it has been configured.
     */
    withRange(range: NumberUnitInterface<UnitFamily.Distance>): this;
    /**
     * Adds a map module to this builder. When this builder compiles its map, all added modules will be created and added
     * to the map's model. If an existing module has been added to this builder with the same key, it will be replaced.
     * @param key The key (name) of the module.
     * @param factory A function which creates the module.
     * @returns This builder, after the map module has been added.
     */
    withModule(key: string, factory: () => any): this;
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
    withLayer<L extends MapLayer = any, UseModules = any, UseContext = any>(key: string, factory: (context: MapSystemContext<DefaultIfAny<UseModules, Modules>, EmptyRecord, EmptyRecord, DefaultIfAny<UseContext, Context>>) => VNode, order?: number): ConditionalReturn<DefaultIfAny<UseModules, Modules>, RequiredLayerModules<L>, any, any, any, any, this>;
    /**
     * Adds a controller to this builder. When this builder compiles its map, all added controllers will be created and
     * hooked up to the map's lifecycle callbacks. If an existing controller has been added to this builder with the same
     * key, it will be replaced.
     * @param key The key of the controller.
     * @param factory A function which creates the controller.
     * @returns This builder, after the map layer has been added, or `never` if this builder does not have all the
     * modules required by the controller.
     */
    withController<Controller extends MapSystemController<any, any, any, any>, UseModules = any, UseLayers extends LayerRecord = any, UseControllers extends ControllerRecord = any, UseContext = any>(key: string, factory: (context: MapSystemContext<DefaultIfAny<UseModules, Modules>, DefaultIfAny<UseLayers, Layers>, DefaultIfAny<UseControllers, Controllers>, DefaultIfAny<UseContext, Context>>) => Controller): ConditionalReturn<DefaultIfAny<UseModules, Modules>, RequiredControllerModules<Controller>, DefaultIfAny<UseLayers, Layers>, RequiredControllerLayers<Controller>, DefaultIfAny<UseContext, Context>, RequiredControllerContext<Controller>, this>;
    /**
     * Adds a context property to this builder. When the builder compiles its map, all added properties will be available
     * on the context. Properties are created on the context in the order they were added to the builder, and property
     * factories have access to previously created properties on the context. If an existing property has been added to
     * this builder with the same key, it will be replaced.
     * @param key The key of the property to add.
     * @param factory A function which creates the value of the property.
     * @returns This builder, after the context property has been added.
     */
    withContext<UseContext = any>(key: Exclude<string, keyof MapSystemContext>, factory: (context: MapSystemContext<Record<never, never>, Record<never, never>, Record<never, never>, DefaultIfAny<UseContext, Context>>) => any): this;
    /**
     * Configures this builder to execute a callback function immediately after it is finished compiling a map. If an
     * existing callback has been added to this builder with the same key, it will be replaced.
     * @param key The key of the callback.
     * @param callback The callback function to add.
     * @returns This builder, after the callback has been added.
     */
    withInit<UseModules = any, UseLayers extends LayerRecord = any, UseControllers extends ControllerRecord = any, UseContext = any>(key: string, callback: (context: MapSystemContext<DefaultIfAny<UseModules, Modules>, DefaultIfAny<UseLayers, Layers>, DefaultIfAny<UseControllers, Controllers>, DefaultIfAny<UseContext, Context>>) => void): this;
    /**
     * Assigns an order value to a layer. Layers with a lower assigned order will be attached before and appear below
     * layers with greater assigned order values.
     * @param key The key of the layer to which to assign the order value.
     * @param order The order value to assign.
     * @returns This builder, after the order value has been assigned.
     */
    withLayerOrder(key: keyof Layers & string, order: number): this;
    /**
     * Configures this builder to add a controller which maintains a list of bindings from source to target
     * subscribables.
     * @param key The key of the controller.
     * @param bindings The bindings to maintain.
     * @returns This builder, after it has been configured.
     */
    withBindings<UseModules = any, UseLayers extends LayerRecord = any, UseContext = any>(key: string, bindings: (context: MapSystemContext<DefaultIfAny<UseModules, Modules>, DefaultIfAny<UseLayers, Layers>, EmptyRecord, DefaultIfAny<UseContext, Context>>) => Iterable<MapBinding<any> | MapTransformedBinding<any, any>>): this;
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
    withClockUpdate(updateFreq: number | Subscribable<number>): this;
    /**
     * Configures this builder to add a resource moderator for control of the map's projection target.
     *
     * Adds the context property `[MapSystemKeys.TargetControl]: ResourceModerator<void>`.
     * @returns This builder, after the resource moderator has been added.
     */
    withTargetControlModerator(): this;
    /**
     * Configures this builder to add a resource moderator for control of the map's rotation.
     *
     * Adds the context property `[MapSystemKeys.RotationControl]: ResourceModerator<void>`.
     * @returns This builder, after the resource moderator has been added.
     */
    withRotationControlModerator(): this;
    /**
     * Configures this builder to add a resource moderator for control of the map's range.
     *
     * Adds the context property `[MapSystemKeys.RangeControl]: ResourceModerator<void>`.
     * @returns This builder, after the resource moderator has been added.
     */
    withRangeControlModerator(): this;
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
    withFollowAirplane(): this;
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
    withRotation(): this;
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
    withOwnAirplaneIcon(iconSize: number, iconFilePath: string | Subscribable<string>, iconAnchor: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>, cssClass?: string | SubscribableSet<string>, order?: number): this;
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
    withOwnAirplanePropBindings<UseModules = any>(properties: Iterable<MapOwnAirplanePropsKey>, updateFreq: number | Subscribable<number>): ConditionalReturn<DefaultIfAny<UseModules, Modules>, MapOwnAirplanePropsControllerModules, any, any, any, any, this>;
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
    withAutopilotProps(propertiesToBind?: Iterable<MapAutopilotPropsKey>, updateFreq?: number | Subscribable<number>): this;
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
    withTextLayer(enableCulling: boolean, order?: number): this;
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
    withBing(bingId: string, delay?: number, mode?: EBingMode, order?: number): this;
    /**
     * Configures this builder to generate a map which uses a {@link MapSystemWaypointsRenderer} to render waypoints.
     *
     * Requires the `[MapSystemKeys.TextManager]: MapCullableTextLabelManager` context property.
     *
     * Adds the `[MapSystemKeys.WaypointRenderer]: MapSystemWaypointsRenderer` context property.
     * @returns This builder, after it has been configured.
     */
    withWaypoints<UseContext = any>(): ConditionalReturn<any, any, any, any, DefaultIfAny<UseContext, Context>, {
        [MapSystemKeys.TextManager]: MapCullableTextLabelManager;
    }, this>;
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
    withNearestWaypoints(configure: (builder: WaypointDisplayBuilder) => void, enableTextCulling?: boolean, order?: number): this;
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
    withFlightPlan(configure: (builder: FlightPlanDisplayBuilder) => void, flightPlanner: FlightPlanner, planIndex: number, enableTextCulling?: boolean, order?: number): this;
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
    withAirspaces(cache: LodBoundaryCache, showTypes: MapAirspaceShowTypes, selectRenderer: (airspace: LodBoundary) => MapAirspaceRenderer, renderOrder?: (a: LodBoundary, b: LodBoundary) => number, options?: Partial<Pick<MapAirspaceLayerProps, 'maxSearchRadius' | 'maxSearchItemCount' | 'searchDebounceDelay' | 'renderTimeBudget'>>, order?: number): this;
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
    withTraffic<UseModules = any, UseLayers extends LayerRecord = any, UserControllers extends ControllerRecord = any, UseContext = any>(tcas: Tcas, iconFactory: MapTrafficIntruderIconFactory<DefaultIfAny<UseModules, Modules>, DefaultIfAny<UseLayers, Layers>, DefaultIfAny<UserControllers, Controllers>, DefaultIfAny<UseContext, Context>>, initCanvasStyles?: (context: CanvasRenderingContext2D) => void, offScaleOobOptions?: (context: MapSystemContext<DefaultIfAny<UseModules, Modules>, DefaultIfAny<UseLayers, Layers>, DefaultIfAny<UserControllers, Controllers>, DefaultIfAny<UseContext, Context>>) => TrafficOffScaleOobOptions, order?: number): this;
    /**
     * Configures this builder using a custom build step.
     * @param builder A function which defines a custom build step.
     * @param args Arguments to pass to the custom build function.
     * @returns This builder, after it has been configured.
     */
    with<Builder extends MapSystemCustomBuilder<any[], any, any>, UseModules = any, UseLayers extends LayerRecord = any, UseContext = any>(builder: Builder, ...args: CustomBuilderArgs<Builder>): ConditionalReturn<DefaultIfAny<UseModules, Modules>, RequiredCustomBuilderModules<Builder>, DefaultIfAny<UseLayers, Layers>, RequiredCustomBuilderLayers<Builder>, DefaultIfAny<UseContext, Context>, RequiredCustomBuilderContext<Builder>, this>;
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
    build<UseModules = any, UseLayers extends LayerRecord = any, UseControllers extends ControllerRecord = any, UseContext = any>(cssClass?: string | SubscribableSet<string>): CompiledMapSystem<DefaultIfAny<UseModules, Modules>, DefaultIfAny<UseLayers, Layers>, DefaultIfAny<UseControllers, Controllers>, DefaultIfAny<UseContext, Context>>;
    /**
     * Builds a new map context. The map context will be initialized with all context properties and modules added to
     * this builder.
     * @returns The new map context.
     */
    protected buildContext(): MutableMapContext<MapSystemContext<any, any, any, any>>;
}
export {};
//# sourceMappingURL=MapSystemBuilder.d.ts.map