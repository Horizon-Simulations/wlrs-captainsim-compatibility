/* eslint-disable jsdoc/require-jsdoc */
import {
  FlightPlanner, FSComponent, MapDataIntegrityModule, MapIndexedRangeModule, MapOwnAirplanePropsKey, MappedSubject, MapSystemBuilder, MapSystemContext,
  MapSystemKeys, MutableSubscribable, NumberUnitInterface, ReadonlyFloat64Array, Subject, Subscribable, UnitFamily, UnitType, UserSettingManager, Vec2Math,
  Vec2Subject, VecNMath, VNode
} from 'msfssdk';

import { WaypointIconImageCache } from '../../../graphics/img/WaypointIconImageCache';
import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { TrafficUserSettingTypes } from '../../../settings/TrafficUserSettings';
import { UnitsDistanceSettingMode, UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { TrafficSystem } from '../../../traffic/TrafficSystem';
import { DefaultFlightPathPlanRenderer } from '../flightplan';
import { GarminMapBuilder, RangeCompassOptions, RangeRingOptions, TrafficIconOptions } from '../GarminMapBuilder';
import { GarminMapKeys } from '../GarminMapKeys';
import {
  MapBannerIndicator, MapDetailIndicator, MapOrientationIndicator, MapTerrainScaleIndicator, MapTrafficOffScaleIndicator, MapTrafficStatusIndicator
} from '../indicators';
import { MapPointerInfoLayerSize } from '../layers';
import { MapRangeDisplay } from '../MapRangeDisplay';
import { MapTrafficOffScaleStatus } from '../MapTrafficOffScaleStatus';
import { MapUtils } from '../MapUtils';
import { MapWaypointDisplayBuilder } from '../MapWaypointDisplayBuilder';
import { MapWaypointStyles } from '../MapWaypointStyles';
import {
  MapDeclutterMode, MapDeclutterModule, MapFlightPlanFocusModule, MapGarminTrafficModule, MapOrientation, MapOrientationModule, MapPointerModule,
  MapTerrainMode, MapTerrainModule, MapUnitsModule
} from '../modules';

/**
 * Configurations for traffic intruder icons for next-generation (NXi, G3000, etc) navigation maps.
 */
export type NextGenNavMapTrafficIconOptions
  = Pick<TrafficIconOptions, 'iconSize' | 'font' | 'fontSize'> & Partial<Pick<TrafficIconOptions, 'supportAdsbVector'>>;

/**
 * Options for creating a next-generation (NXi, G3000, etc) Garmin navigation map.
 */
export type NextGenNavMapOptions = {
  /** The ID to assign to the map's bound Bing Map instance. */
  bingId: string;

  /** The frequency, in hertz, with which player airplane and autopilot properties are updated from event bus data. */
  dataUpdateFreq: number | Subscribable<number>;

  /** The image cache from which to retrieve waypoint icon images. */
  waypointIconImageCache: WaypointIconImageCache;

  /** The scaling factor of waypoint icons and labels. Defaults to `1`. */
  waypointStyleScale?: number;

  /**
   * The nominal projected target offset of the map for each orientation mode, as `[x, y]`, where each component is
   * expressed relative to the width or height of the map's projected window, *excluding* the dead zone. Defaults to
   * the following:
   * ```
   * {
   *   [MapOrientation.NorthUp]: [0, 0],
   *   [MapOrientation.HeadingUp]: [0, 0.17],
   *   [MapOrientation.TrackUp]: [0, 0.17]
   * }
   * ```
   */
  targetOffsets?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>;

  /**
   * The range endpoints of the map for each orientation mode, as `[x1, y1, x2, y2]`, where each component is expressed
   * relative to the width or height of the map's projected window, *excluding* the dead zone. Defaults to the
   * following:
   * ```
   * {
   *   [MapOrientation.NorthUp]: [0.5, 0.5, 0.5, 0.25],
   *   [MapOrientation.HeadingUp]: [0.5, 0.67, 0.5, 0.33],
   *   [MapOrientation.TrackUp]: [0.5, 0.67, 0.5, 0.33]
   * }
   * ```
   */
  rangeEndpoints?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>;

  /** The map range array to use for nautical units mode. Defaults to a standard range array. */
  nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /** The map range array to use for metric units mode. Defaults to a standard range array. */
  metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /** Whether to support data integrity state. Defaults to `true`. */
  supportDataIntegrity?: boolean;

  /** The URI of the no-heading player airplane icon's image asset, or a subscribable which provides it. */
  noHeadingAirplaneIconSrc?: string | Subscribable<string>;

  /**
   * The point on the no-heading player airplane icon that is anchored to the airplane's position, or a subscribable
   * which provides it. The point is expressed as a 2-tuple relative to the icon's width and height, with [0, 0] at the
   * top left and [1, 1] at the bottom right.
   */
  noHeadingAirplaneIconAnchor?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** Styling options for the range ring. */
  rangeRingOptions: RangeRingOptions;

  /** Styling options for the range compass. */
  rangeCompassOptions: RangeCompassOptions;

  /** Whether to display airspaces. Defaults to `true`. */
  includeAirspaces?: boolean;

  /** The URI of the player airplane icon's image asset */
  airplaneIconSrc: string | Subscribable<string>;

  /** The size of the player airplane icon, in pixels. */
  airplaneIconSize: number;

  /**
   * The point on the player airplane icon that is anchored to the airplane's position, or a subscribable which
   * provides it. The point is expressed as a 2-tuple relative to the icon's width and height, with [0, 0] at the top
   * left and [1, 1] at the bottom right.
   */
  airplaneIconAnchor: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The flight planner containing the active flight plan. Required to display the active flight plan. */
  flightPlanner?: FlightPlanner;

  /**
   * Whether to always draw the entire active flight plan, or a subscribable which provides it. Defaults to `false`.
   * Ignored if the active flight plan is not displayed.
   */
  drawEntirePlan?: boolean | Subscribable<boolean>;

  /** Whether to support flight plan focus. Defaults to `false`. Ignored if the active flight plan is not displayed. */
  supportFlightPlanFocus?: boolean;

  /**
   * A subscribable which provides the nominal focus margins, as `[left, top, right, bottom]` in pixels. The nominal
   * margins define the offset of the boundaries of the focus region relative to the map's projected window,
   * *excluding* the dead zone. Positive values represent offsets toward the center of the window. When the flight plan
   * is focused, the focused elements of the plan are guaranteed to be contained within the focus region. Defaults to
   * `[0, 0, 0, 0]`.
   */
  nominalFocusMargins?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The default map range index to apply when the procedure focus consists of only a single point in space. Defaults
   * to `17` (25 NM/50 KM with standard range arrays).
   */
  defaultFocusRangeIndex?: number;

  /** The traffic system from which to retrieve traffic intruder data. Required to display traffic. */
  trafficSystem?: TrafficSystem;

  /** Configuration options for traffic icons. Required to display traffic. */
  trafficIconOptions?: NextGenNavMapTrafficIconOptions;

  /** Whether to include the track vector display. Defaults to `true`. */
  includeTrackVector?: boolean;

  /** Whether to include the altitude intercept arc display. Defaults to `true`. */
  includeAltitudeArc?: boolean;

  /**
   * The offset of the boundary surrounding the area in which the pointer can freely move, from the edge of the
   * projected map, excluding the dead zone, or a subscribable which provides it. Expressed as
   * `[left, top, right, bottom]`, relative to the width and height, as appropriate, of the projected map window. A
   * positive offset is directed toward the center of the map. Required to support the map pointer.
   */
  pointerBoundsOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The size of the pointer information box. Required to display the pointer information box. Ignored if the map
   * pointer is not supported.
   */
  pointerInfoSize?: MapPointerInfoLayerSize;

  /** The URI of the mini-compass's image asset. Required to display the mini-compass. */
  miniCompassImgSrc?: string;

  /** Whether to include an orientation indicator. Defaults to `true`. */
  includeOrientationIndicator?: boolean;

  /** Whether to include a map range indicator. Defaults to `false`. */
  includeRangeIndicator?: boolean;

  /** Whether to include a detail indicator. Defaults to `true`. */
  includeDetailIndicator?: boolean;

  /** Whether to show the detail indicator title. Defaults to `true`. Ignored if `includeDetailIndicator` is `false`. */
  showDetailIndicatorTitle?: boolean;

  /** Whether to include a traffic off-scale status indicator. Defaults to `true`. */
  includeTrafficOffScaleIndicator?: boolean;

  /** Whether to include a terrain scale indicator. Defaults to `true`. */
  includeTerrainScale?: boolean;

  /** Whether to include a traffic status indicator. Defaults to `true`. */
  includeTrafficStatusIndicator?: boolean;

  /**
   * Whether to show the traffic altitude restriction mode on the traffic status indicator. Defaults to `true`. Ignored
   * if `includeTrafficStatusIndicator` is `false`.
   */
  showTrafficAltRestriction?: boolean;

  /**
   * A user setting manager containing map settings. If not defined, map options will not be controlled by user
   * settings.
   */
  settingManager?: UserSettingManager<Partial<MapUserSettingTypes>>;

  /**
   * A user setting manager containing settings controlling the operation of the traffic system. If not defined,
   * certain traffic display options will not be controlled by user settings.
   */
  trafficSettingManager?: UserSettingManager<Partial<TrafficUserSettingTypes>>;

  /** A display units user setting manager. If not defined, map display units will not be controlled by user settings. */
  unitsSettingManager?: UnitsUserSettingManager;

  /** Whether the map's range should be controlled by user setting by default. Defaults to `true`. */
  useRangeUserSettingByDefault?: boolean;

  /** Whether to bind map orientation to user settings. Defaults to `true`. Ignored if `settingManager` is not defined. */
  useOrientationUserSettings?: boolean;

  /** Whether to bind terrain colors to user settings. Defaults to `true`. Ignored if `settingManager` is not defined. */
  useTerrainUserSettings?: boolean;

  /**
   * Whether to allow relative terrain mode. Defaults to `true`. Ignored if `useTerrainUserSettings` is `false` or
   * `settingManager` is not defined.
   */
  allowRelativeTerrainMode?: boolean;

  /**
   * The minimum range index, inclusive, at which NEXRAD is visible.
   */
  nexradMinRangeIndex?: number;

  /**
   * Whether to bind the display of NEXRAD to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useNexradUserSettings?: boolean;

  /**
   * Whether to bind the global declutter function to user settings. Defaults to `true`. Ignored if `settingManager` is
   * not defined.
   */
  useDeclutterUserSetting?: boolean;

  /**
   * Whether to bind waypoint visibility to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useWaypointVisUserSettings?: boolean;

  /**
   * Whether to bind airspace visibility to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useAirspaceVisUserSettings?: boolean;

  /**
   * Whether to bind track vector options to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useTrackVectorUserSettings?: boolean;

  /**
   * Whether to bind altitude intercept arc options to user settings. Defaults to `true`. Ignored if `settingManager`
   * is not defined.
   */
  useAltitudeArcUserSettings?: boolean;
}

/**
 * Builds next-generation (NXi, G3000, etc) Garmin navigation maps.
 */
export class NextGenNavMapBuilder {
  /**
   * Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin navigation map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If flight plan focus is supported, the module `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule` is added
   * to the map model and can be used to control the focus.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static build<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenNavMapOptions,
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.targetOffsets ??= {};
    options.targetOffsets[MapOrientation.NorthUp] ??= Vec2Math.create();
    options.targetOffsets[MapOrientation.HeadingUp] ??= Vec2Math.create(0, 0.17);
    options.targetOffsets[MapOrientation.TrackUp] ??= Vec2Math.create(0, 0.17);

    options.rangeEndpoints ??= {};
    options.rangeEndpoints[MapOrientation.NorthUp] ??= VecNMath.create(4, 0.5, 0.5, 0.5, 0.25);
    options.rangeEndpoints[MapOrientation.HeadingUp] ??= VecNMath.create(4, 0.5, 0.67, 0.5, 0.33);
    options.rangeEndpoints[MapOrientation.TrackUp] ??= VecNMath.create(4, 0.5, 0.67, 0.5, 0.33);

    options.supportDataIntegrity ??= true;

    options.useRangeUserSettingByDefault ??= true;

    options.useOrientationUserSettings ??= true;

    options.useDeclutterUserSetting ??= true;

    options.useTerrainUserSettings ??= true;
    options.allowRelativeTerrainMode ??= true;

    options.nexradMinRangeIndex ??= 13;
    options.useNexradUserSettings ??= true;

    options.rangeRingOptions.labelRadial ??= 225;

    options.includeAirspaces ??= true;
    options.useAirspaceVisUserSettings ??= true;

    options.useWaypointVisUserSettings ??= true;

    options.drawEntirePlan ??= false;
    options.supportFlightPlanFocus ??= false;
    options.defaultFocusRangeIndex ??= 17;

    options.includeTrackVector ??= true;
    options.useTrackVectorUserSettings ??= true;

    options.includeAltitudeArc ??= true;
    options.useAltitudeArcUserSettings ??= true;

    options.includeOrientationIndicator ??= true;
    options.includeRangeIndicator ??= false;
    options.includeDetailIndicator ??= true;
    options.showDetailIndicatorTitle ??= true;
    options.includeTrafficOffScaleIndicator ??= true;
    options.includeTerrainScale ??= true;
    options.includeTrafficStatusIndicator ??= true;
    options.showTrafficAltRestriction ??= true;

    mapBuilder
      .withModule(GarminMapKeys.Units, () => new MapUnitsModule(options.unitsSettingManager))
      .with(GarminMapBuilder.range,
        options.nauticalRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Nautical),
        options.metricRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Metric),
        options.settingManager,
        options.useRangeUserSettingByDefault
      )
      .with(GarminMapBuilder.orientation,
        options.targetOffsets,
        options.rangeEndpoints,
        options.useOrientationUserSettings ? options.settingManager : undefined
      )
      .with(GarminMapBuilder.declutter, options.useDeclutterUserSetting ? options.settingManager : undefined)
      .withBing(options.bingId)
      .with(GarminMapBuilder.terrainColors,
        {
          [MapTerrainMode.None]: MapUtils.noTerrainEarthColors(),
          [MapTerrainMode.Absolute]: MapUtils.absoluteTerrainEarthColors(),
          [MapTerrainMode.Relative]: MapUtils.relativeTerrainEarthColors()
        },
        options.useTerrainUserSettings ? options.settingManager : undefined,
        options.allowRelativeTerrainMode
      )
      .with(GarminMapBuilder.nexrad,
        options.nexradMinRangeIndex,
        options.useNexradUserSettings ? options.settingManager : undefined,
        MapDeclutterMode.Level2
      );

    if (options.includeAirspaces) {
      mapBuilder.with(GarminMapBuilder.airspaces, options.useAirspaceVisUserSettings ? options.settingManager : undefined);
    }

    mapBuilder.with(GarminMapBuilder.waypoints,
      (builder: MapWaypointDisplayBuilder): void => {
        builder.withNormalStyles(
          options.waypointIconImageCache,
          MapWaypointStyles.nextGenNormalIconStyles(1, options.waypointStyleScale),
          MapWaypointStyles.nextGenNormalLabelStyles(1, options.waypointStyleScale)
        );
      },
      options.useWaypointVisUserSettings ? options.settingManager : undefined
    );

    if (options.flightPlanner) {
      if (options.supportFlightPlanFocus) {
        mapBuilder.with(GarminMapBuilder.flightPlanFocus, options.nominalFocusMargins, options.defaultFocusRangeIndex);
      }

      mapBuilder.with(GarminMapBuilder.activeFlightPlan,
        options.flightPlanner,
        new DefaultFlightPathPlanRenderer(),
        options.drawEntirePlan,
        (builder): void => {
          builder
            .withFlightPlanInactiveStyles(
              options.waypointIconImageCache,
              MapWaypointStyles.nextGenFlightPlanIconStyles(false, 2, options.waypointStyleScale),
              MapWaypointStyles.nextGenFlightPlanLabelStyles(false, 2, options.waypointStyleScale)
            )
            .withFlightPlanActiveStyles(
              options.waypointIconImageCache,
              MapWaypointStyles.nextGenFlightPlanIconStyles(true, 3, options.waypointStyleScale),
              MapWaypointStyles.nextGenFlightPlanLabelStyles(true, 3, options.waypointStyleScale)
            )
            .withVNavStyles(
              options.waypointIconImageCache,
              MapWaypointStyles.nextGenVNavIconStyles(4, options.waypointStyleScale),
              MapWaypointStyles.nextGenVNavLabelStyles(4, options.waypointStyleScale)
            );
        },
        options.supportFlightPlanFocus
      );
    }

    mapBuilder
      .with(GarminMapBuilder.waypointHighlight,
        false,
        (builder: MapWaypointDisplayBuilder) => {
          builder.withHighlightStyles(
            options.waypointIconImageCache,
            MapWaypointStyles.nextGenHighlightIconStyles(5, options.waypointStyleScale),
            MapWaypointStyles.nextGenHighlightLabelStyles(5, options.waypointStyleScale)
          );
        }
      );

    mapBuilder
      .with(GarminMapBuilder.rangeRing, options.rangeRingOptions)
      .with(GarminMapBuilder.rangeCompass, options.rangeCompassOptions);

    if (options.includeTrackVector) {
      mapBuilder.with(GarminMapBuilder.trackVector,
        {
          arcTurnRateThreshold: 0.25,
          arcMaxLookaheadTime: UnitType.SECOND.createNumber(60)
        },
        options.useTrackVectorUserSettings ? options.settingManager : undefined
      );
    }

    if (options.includeAltitudeArc) {
      mapBuilder
        .withAutopilotProps(
          ['selectedAltitude'],
          options.dataUpdateFreq
        )
        .with(GarminMapBuilder.altitudeArc,
          {
            verticalSpeedPrecision: UnitType.FPM.createNumber(50),
            verticalSpeedThreshold: UnitType.FPM.createNumber(150),
            altitudeDeviationThreshold: UnitType.FOOT.createNumber(150)
          },
          options.useAltitudeArcUserSettings ? options.settingManager : undefined
        );
    }

    mapBuilder.with(GarminMapBuilder.crosshair);

    const supportTraffic = options.trafficSystem !== undefined
      && options.trafficIconOptions !== undefined;

    let offScale: Subject<MapTrafficOffScaleStatus> | undefined;
    if (supportTraffic && options.includeTrafficOffScaleIndicator) {
      offScale = Subject.create<MapTrafficOffScaleStatus>(MapTrafficOffScaleStatus.None);
    }

    if (supportTraffic) {
      const iconOptions = Object.assign({}, options.trafficIconOptions) as TrafficIconOptions;
      iconOptions.drawOffScale = false;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      iconOptions.supportAdsbVector ??= options.trafficSystem!.adsb !== null;

      mapBuilder.with(GarminMapBuilder.traffic,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        options.trafficSystem!,
        iconOptions,
        false,
        offScale,
        undefined, undefined,
        options.trafficSettingManager,
        options.settingManager
      );
    }

    let airplaneIconSrc = options.airplaneIconSrc;
    let airplaneIconAnchor = options.airplaneIconAnchor;
    if (options.supportDataIntegrity && options.noHeadingAirplaneIconSrc !== undefined && options.noHeadingAirplaneIconAnchor !== undefined) {
      airplaneIconSrc = Subject.create('');
      airplaneIconAnchor = Vec2Subject.createFromVector(Vec2Math.create());
    }

    const airplanePropBindings: MapOwnAirplanePropsKey[] = [
      'position', 'hdgTrue', 'magVar', 'isOnGround',
      ...(
        options.includeTrackVector || options.includeAltitudeArc
          ? ['groundSpeed', 'trackTrue']
          : []
      ) as MapOwnAirplanePropsKey[],
      ...(
        options.includeTrackVector
          ? ['turnRate']
          : []
      ) as MapOwnAirplanePropsKey[],
      ...(
        options.includeAltitudeArc
          ? ['altitude', 'verticalSpeed']
          : []
      ) as MapOwnAirplanePropsKey[]
    ];

    mapBuilder
      .withOwnAirplaneIcon(options.airplaneIconSize, airplaneIconSrc, airplaneIconAnchor)
      .withOwnAirplanePropBindings(airplanePropBindings, options.dataUpdateFreq)
      .withFollowAirplane();

    if (options.miniCompassImgSrc !== undefined) {
      mapBuilder.with(GarminMapBuilder.miniCompass, options.miniCompassImgSrc);
    }

    // Top-left indicators
    if (options.includeOrientationIndicator || options.includeRangeIndicator) {
      const orientationRef = FSComponent.createRef<MapOrientationIndicator>();
      const rangeRef = FSComponent.createRef<MapRangeDisplay>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.includeOrientationIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Orientation]: MapOrientationModule,
            [GarminMapKeys.Pointer]?: MapPointerModule,
            [GarminMapKeys.FlightPlanFocus]?: MapFlightPlanFocusModule
          }>): VNode => {
            const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
            const pointerModule = context.model.getModule(GarminMapKeys.Pointer);
            const focusModule = context.model.getModule(GarminMapKeys.FlightPlanFocus);

            const isVisible = MappedSubject.create(
              ([isPointerActive, isFocusActive]): boolean => !isPointerActive && !isFocusActive,
              pointerModule?.isActive ?? Subject.create(false),
              focusModule?.isActive ?? Subject.create(false)
            );

            return (
              <MapOrientationIndicator
                ref={orientationRef}
                orientation={orientationModule.orientation}
                text={{
                  [MapOrientation.NorthUp]: 'NORTH UP',
                  [MapOrientation.HeadingUp]: 'HDG UP',
                  [MapOrientation.TrackUp]: 'TRK UP',
                }}
                isVisible={isVisible}
              />
            );
          }
        );
      }

      if (options.includeRangeIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Range]: MapIndexedRangeModule,
            [GarminMapKeys.Units]: MapUnitsModule
          }>): VNode => {
            const rangeModule = context.model.getModule(GarminMapKeys.Range);
            const unitsModule = context.model.getModule(GarminMapKeys.Units);

            return (
              <MapRangeDisplay
                ref={rangeRef}
                range={rangeModule.nominalRange}
                displayUnit={unitsModule.distanceLarge}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopLeftIndicators,
        factories,
        {
          onDetached: () => {
            orientationRef.getOrDefault()?.destroy();
            rangeRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-top-left'
      );
    }

    // Bottom-left indicators
    if (options.includeDetailIndicator || (supportTraffic && options.includeTrafficOffScaleIndicator)) {
      const detailRef = FSComponent.createRef<MapDetailIndicator>();
      const offScaleRef = FSComponent.createRef<MapTrafficOffScaleIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.includeDetailIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Declutter]: MapDeclutterModule
          }>): VNode => {
            const declutterModule = context.model.getModule(GarminMapKeys.Declutter);

            return (
              <MapDetailIndicator
                ref={detailRef}
                declutterMode={declutterModule.mode}
                showTitle={options.showDetailIndicatorTitle as boolean}
              />
            );
          }
        );
      }

      if (supportTraffic && options.includeTrafficOffScaleIndicator) {
        factories.push(
          (): VNode => {
            return (
              <MapTrafficOffScaleIndicator
                ref={offScaleRef}
                status={offScale as Subscribable<MapTrafficOffScaleStatus>}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.BottomLeftIndicators,
        factories,
        {
          onDetached: () => {
            detailRef.getOrDefault()?.destroy();
            offScaleRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-bottom-left'
      );
    }

    // Bottom-right indicators
    if (options.includeTerrainScale || (supportTraffic && options.includeTrafficStatusIndicator)) {
      const scaleRef = FSComponent.createRef<MapDetailIndicator>();
      const trafficRef = FSComponent.createRef<MapTrafficOffScaleIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (supportTraffic && options.includeTrafficStatusIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <MapTrafficStatusIndicator
                ref={trafficRef}
                show={trafficModule.show}
                operatingMode={trafficModule.operatingMode}
                altitudeRestrictionMode={options.showTrafficAltRestriction ? trafficModule.altitudeRestrictionMode : undefined}
              />
            );
          }
        );
      }

      if (options.includeTerrainScale) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Terrain]: MapTerrainModule
          }>): VNode => {
            const terrainModule = context.model.getModule(GarminMapKeys.Terrain);

            return (
              <MapTerrainScaleIndicator
                ref={scaleRef}
                show={terrainModule.showScale}
                terrainMode={terrainModule.terrainMode}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.BottomRightIndicators,
        factories,
        {
          onDetached: () => {
            scaleRef.getOrDefault()?.destroy();
            trafficRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-bottom-right'
      );
    }

    // Center indicators
    if (options.supportDataIntegrity) {
      const noGpsRef = FSComponent.createRef<MapBannerIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.supportDataIntegrity) {
        factories.push(
          (context: MapSystemContext<{
            [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule
          }>): VNode => {
            const dataIntegrityModule = context.model.getModule(MapSystemKeys.DataIntegrity);

            return (
              <MapBannerIndicator
                ref={noGpsRef}
                show={dataIntegrityModule.gpsSignalValid.map(isValid => !isValid)}
                class='map-banner-no-gps'
              >
                NO GPS POSITION
              </MapBannerIndicator>
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.CenterIndicators,
        factories,
        {
          onDetached: () => {
            noGpsRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-center'
      );
    }

    if (options.pointerBoundsOffset !== undefined) {
      mapBuilder.with(GarminMapBuilder.pointer, options.pointerBoundsOffset);

      if (options.pointerInfoSize !== undefined) {
        mapBuilder.with(GarminMapBuilder.pointerInfo, options.pointerInfoSize);
      }
    }

    if (options.supportDataIntegrity) {
      let airplaneIconSrcToUse: MutableSubscribable<string> | undefined;
      let airplaneIconAnchorToUse: MutableSubscribable<ReadonlyFloat64Array> | undefined;

      if (options.noHeadingAirplaneIconSrc !== undefined && options.noHeadingAirplaneIconAnchor !== undefined) {
        airplaneIconSrcToUse = airplaneIconSrc as MutableSubscribable<string>;
        airplaneIconAnchorToUse = airplaneIconAnchor as MutableSubscribable<ReadonlyFloat64Array>;
      }

      mapBuilder.with(GarminMapBuilder.dataIntegrity,
        airplaneIconSrcToUse, airplaneIconAnchorToUse,
        options.airplaneIconSrc, options.airplaneIconAnchor,
        options.noHeadingAirplaneIconSrc, options.noHeadingAirplaneIconAnchor
      );
    }

    return mapBuilder;
  }
}