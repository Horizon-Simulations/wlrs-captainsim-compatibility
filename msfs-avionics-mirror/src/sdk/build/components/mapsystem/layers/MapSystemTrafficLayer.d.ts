import { GeoPointInterface } from '../../../geo';
import { NumberUnitInterface, ReadonlyFloat64Array, UnitFamily } from '../../../math';
import { Subscribable } from '../../../sub/Subscribable';
import { MutableSubscribableSet } from '../../../sub/SubscribableSet';
import { TcasIntruder } from '../../../traffic';
import { VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps, MapProjection } from '../../map';
import { MapOwnAirplanePropsModule } from '../../map/modules/MapOwnAirplanePropsModule';
import { MapSystemContext } from '../MapSystemContext';
import { MapSystemKeys } from '../MapSystemKeys';
import { ControllerRecord, LayerRecord } from '../MapSystemTypes';
import { MapTrafficModule } from '../modules/MapTrafficModule';
/**
 * Modules required by MapSystemTrafficLayer.
 */
export interface MapSystemTrafficLayerModules {
    /** Traffic module. */
    [MapSystemKeys.Traffic]: MapTrafficModule;
}
/**
 * A map icon for a TCAS intruder.
 */
export interface MapTrafficIntruderIcon {
    /** This icon's associated intruder. */
    readonly intruder: TcasIntruder;
    /** The projected position of this icon's intruder, in pixel coordinates, at the time it was last drawn. */
    readonly projectedPos: ReadonlyFloat64Array;
    /** Whether this icon's intruder is off-scale at the time it was last drawn. */
    readonly isOffScale: boolean;
    /**
     * Draws this icon.
     * @param projection The map projection.
     * @param context The canvas rendering context to which to draw.
     * @param offScaleRange The distance from the own airplane to this icon's intruder beyond which the intruder is
     * considered off-scale. If the value is `NaN`, the intruder is never considered off-scale.
     */
    draw(projection: MapProjection, context: CanvasRenderingContext2D, offScaleRange: NumberUnitInterface<UnitFamily.Distance>): void;
}
/**
 * A function which creates map icons for TCAS intruders.
 * @param intruder The intruder for which to create an icon.
 * @param context The context of the icon's parent map.
 */
export declare type MapTrafficIntruderIconFactory<Modules = any, Layers extends LayerRecord = any, Controllers extends ControllerRecord = any, Context = any> = (intruder: TcasIntruder, context: MapSystemContext<Modules, Layers, Controllers, Context>) => MapTrafficIntruderIcon;
/**
 * Component props for MapSystemTrafficLayer.
 */
export interface MapSystemTrafficLayerProps extends MapLayerProps<MapSystemTrafficLayerModules> {
    /** The context of the layer's parent map. */
    context: MapSystemContext<any, any, any, any>;
    /** A function which creates icons for intruders. */
    iconFactory: MapTrafficIntruderIconFactory;
    /**
     * A function which initializes global canvas styles for the layer.
     * @param context The canvas rendering context for which to initialize styles.
     */
    initCanvasStyles?: (context: CanvasRenderingContext2D) => void;
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
    oobOffset?: Subscribable<ReadonlyFloat64Array>;
}
/**
 * A map layer which displays traffic intruders.
 */
export declare class MapSystemTrafficLayer extends MapLayer<MapSystemTrafficLayerProps> {
    private static readonly DRAW_GROUPS;
    private readonly iconLayerRef;
    private readonly trafficModule;
    private readonly intruderIcons;
    private readonly needHandleOffscaleOob;
    private readonly oobOffset;
    private readonly oobBounds;
    private isInit;
    /** @inheritdoc */
    onVisibilityChanged(isVisible: boolean): void;
    /** @inheritdoc */
    onAttached(): void;
    /**
     * Initializes canvas styles.
     */
    private initCanvasStyles;
    /**
     * Initializes all currently existing TCAS intruders.
     */
    private initIntruders;
    /**
     * Initializes handlers to respond to TCAS events.
     */
    private initTCASHandlers;
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void;
    /**
     * Updates the boundaries of the intruder out-of-bounds area.
     */
    private updateOobBounds;
    /** @inheritdoc */
    onUpdated(time: number, elapsed: number): void;
    /**
     * Redraws all tracked intruders.
     */
    private redrawIntruders;
    /**
     * Updates this layer's visibility.
     */
    private updateVisibility;
    /**
     * A callback which is called when a TCAS intruder is added.
     * @param intruder The new intruder.
     */
    private onIntruderAdded;
    /**
     * A callback which is called when a TCAS intruder is removed.
     * @param intruder The removed intruder.
     */
    private onIntruderRemoved;
    /**
     * A callback which is called when the alert level of a TCAS intruder is changed.
     * @param intruder The intruder.
     */
    private onIntruderAlertLevelChanged;
    /** @inheritdoc */
    render(): VNode;
}
/**
 * An abstract implementation of {@link MapTrafficIntruderIcon} which handles the projection of the intruder's position
 * and off-scale calculations.
 */
export declare abstract class AbstractMapTrafficIntruderIcon implements MapTrafficIntruderIcon {
    readonly intruder: TcasIntruder;
    protected readonly trafficModule: MapTrafficModule;
    protected readonly ownshipModule: MapOwnAirplanePropsModule;
    private static readonly geoPointCache;
    readonly projectedPos: Float64Array;
    isOffScale: boolean;
    /**
     * Constructor.
     * @param intruder This icon's associated intruder.
     * @param trafficModule The traffic module for this icon's parent map.
     * @param ownshipModule The ownship module for this icon's parent map.
     */
    constructor(intruder: TcasIntruder, trafficModule: MapTrafficModule, ownshipModule: MapOwnAirplanePropsModule);
    /**
     * Draws this icon.
     * @param projection The map projection.
     * @param context The canvas rendering context to which to draw this icon.
     * @param offScaleRange The distance from the own airplane to this icon's intruder beyond which the intruder is
     * considered off-scale. If the value is `NaN`, the intruder is never considered off-scale.
     */
    draw(projection: MapProjection, context: CanvasRenderingContext2D, offScaleRange: NumberUnitInterface<UnitFamily.Distance>): void;
    /**
     * Updates this icon's intruder's projected position and off-scale status.
     * @param projection The map projection.
     * @param offScaleRange The distance from the own airplane to this icon's intruder beyond which the intruder is
     * considered off-scale. If the value is `NaN`, the intruder is never considered off-scale.
     */
    protected updatePosition(projection: MapProjection, offScaleRange: NumberUnitInterface<UnitFamily.Distance>): void;
    /**
     * Updates this icon's intruder's projected position and off-scale status using a specific range from the own
     * airplane to define off-scale.
     * @param projection The map projection.
     * @param ownAirplanePos The position of the own airplane.
     * @param offScaleRange The distance from the own airplane to this icon's intruder beyond which the intruder is
     * considered off-scale.
     */
    protected handleOffScaleRange(projection: MapProjection, ownAirplanePos: GeoPointInterface, offScaleRange: NumberUnitInterface<UnitFamily.Distance>): void;
    /**
     * Draws this icon.
     * @param projection The map projection.
     * @param context The canvas rendering context to which to draw this icon.
     * @param projectedPos The projected position of this icon's intruder.
     * @param isOffScale Whether this icon's intruder is off-scale.
     */
    protected abstract drawIcon(projection: MapProjection, context: CanvasRenderingContext2D, projectedPos: ReadonlyFloat64Array, isOffScale: boolean): void;
}
//# sourceMappingURL=MapSystemTrafficLayer.d.ts.map