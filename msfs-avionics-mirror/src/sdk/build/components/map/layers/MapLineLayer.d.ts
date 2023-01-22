import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { ReadonlyFloat64Array } from '../../../math/VecMath';
import { Subscribable } from '../../../sub/Subscribable';
import { MapLayerProps } from '../MapLayer';
import { MapProjection } from '../MapProjection';
import { MapSyncedCanvasLayer } from './MapSyncedCanvasLayer';
/**
 * Component props for MapLineLayer.
 */
export interface MapLineLayerProps extends MapLayerProps<any> {
    /**
     * A subscribable which provides the start point of the line, as a set of lat/lon coordinates or a 2D vector in
     * projected coordinates. If the start point is `null`, a line will not be drawn.
     */
    start: Subscribable<LatLonInterface | ReadonlyFloat64Array | null>;
    /**
     * A subscribable which provides the end point of the line, as a set of lat/lon coordinates or a 2D vector in
     * projected coordinates. If the end point is `null`, a line will not be drawn.
     */
    end: Subscribable<LatLonInterface | ReadonlyFloat64Array | null>;
    /** The width of the line stroke, in pixels. Defaults to 2 pixels. */
    strokeWidth?: number;
    /** The style of the line stroke. Defaults to `'white'`. */
    strokeStyle?: string | CanvasGradient | CanvasPattern;
    /** The dash array of the line stroke. Defaults to `[]`. */
    strokeDash?: readonly number[];
    /** The width of the line outline, in pixels. Defaults to 0 pixels. */
    outlineWidth?: number;
    /** The style of the line outline. Defaults to `'black'`. */
    outlineStyle?: string | CanvasGradient | CanvasPattern;
    /** The dash array of the line outline. Defaults to `[]`. */
    outlineDash?: readonly number[];
}
/**
 * A map layer that draws a line between two points. The line is drawn in projected coordinate space, so it will always
 * be straight on the projected map.
 */
export declare class MapLineLayer extends MapSyncedCanvasLayer<MapLineLayerProps> {
    private static readonly DEFAULT_STROKE_WIDTH;
    private static readonly DEFAULT_STROKE_STYLE;
    private static readonly DEFAULT_STROKE_DASH;
    private static readonly DEFAULT_OUTLINE_WIDTH;
    private static readonly DEFAULT_OUTLINE_STYLE;
    private static readonly DEFAULT_OUTLINE_DASH;
    private readonly strokeWidth;
    private readonly strokeStyle;
    private readonly strokeDash;
    private readonly outlineWidth;
    private readonly outlineStyle;
    private readonly outlineDash;
    private vec;
    private isUpdateScheduled;
    /** @inheritdoc */
    onAttached(): void;
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void;
    /**
     * Schedules the layer for a draw update.
     */
    private scheduleUpdate;
    /** @inheritdoc */
    onUpdated(time: number, elapsed: number): void;
    /**
     * Draws this layer's line.
     * @param x1 The x coordinate of the start of the line.
     * @param y1 The y coordinate of the start of the line.
     * @param x2 The x coordinate of the end of the line.
     * @param y2 The y coordinate of the end of the line.
     */
    private drawLine;
    /**
     * Applies a stroke to a canvas rendering context.
     * @param context A canvas rendering context.
     * @param width The width of the stroke, in pixels.
     * @param style The style of the stroke.
     * @param dash The dash array of the stroke.
     */
    private stroke;
}
//# sourceMappingURL=MapLineLayer.d.ts.map