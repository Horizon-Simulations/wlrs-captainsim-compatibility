import { GeoPointInterface } from '../../geo/GeoPoint';
import { ReadonlyFloat64Array } from '../../math/VecMath';
import { Subscribable } from '../../sub/Subscribable';
import { MapProjection } from './MapProjection';
/**
 * A text label to be displayed on a map.
 */
export interface MapTextLabel {
    /** The text of this label. */
    readonly text: Subscribable<string>;
    /** The render priority of this label. */
    readonly priority: Subscribable<number>;
    /**
     * Draws this label to a canvas.
     * @param context The canvas rendering context to use to draw.
     * @param mapProjection The projection to use to project the location of the label.
     */
    draw(context: CanvasRenderingContext2D, mapProjection: MapProjection): void;
}
/**
 * Options for a AbstractMapTextLabel.
 */
export interface AbstractMapTextLabelOptions {
    /**
     * The anchor point of the label, expressed relative to the width/height of the label. `[0, 0]` is the top-left
     * corner, and `[1, 1]` is the bottom-right corner. Defaults to `[0, 0]`.
     */
    anchor?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
    /** The font type of the label. Defaults to `''` (the default canvas font). */
    font?: string | Subscribable<string>;
    /** The font size of the label, in pixels. Defaults to 10 pixels. */
    fontSize?: number | Subscribable<number>;
    /** The font color of the label. Defaults to `'white'`. */
    fontColor?: string | Subscribable<string>;
    /** The font outline width of the label, in pixels. Defaults to 0. */
    fontOutlineWidth?: number | Subscribable<number>;
    /** The font outline color of the label. Defaults to `'black'`. */
    fontOutlineColor?: string | Subscribable<string>;
    /** Whether to show the background for the label. Defaults to `false`. */
    showBg?: boolean | Subscribable<boolean>;
    /** The label's background color. Defaults to `'black'`. */
    bgColor?: string | Subscribable<string>;
    /** The padding of the label's background, in pixels. Expressed as `[top, right, bottom, left]`. Defaults to `[0, 0, 0, 0]`. */
    bgPadding?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
    /** The border radius of the label's background, in pixels. Defaults to 0. */
    bgBorderRadius?: number | Subscribable<number>;
    /** The outline width of the label's background, in pixels. Defaults to 0. */
    bgOutlineWidth?: number | Subscribable<number>;
    /** The outline color of the label's background. Defaults to `'white'`. */
    bgOutlineColor?: string | Subscribable<string>;
}
/**
 * An abstract implementation of a map text label.
 */
export declare abstract class AbstractMapTextLabel implements MapTextLabel {
    protected static readonly tempVec2: Float64Array;
    /** @inheritdoc */
    readonly text: Subscribable<string>;
    /** @inheritdoc */
    readonly priority: Subscribable<number>;
    /**
     * The anchor point of this label, expressed relative to this label's width/height. [0, 0] is the top-left corner,
     * and [1, 1] is the bottom-right corner.
     */
    readonly anchor: Subscribable<ReadonlyFloat64Array>;
    /** The font type of this label. */
    readonly font: Subscribable<string>;
    /** The font size of this label, in pixels. */
    readonly fontSize: Subscribable<number>;
    /** The font color of this label. */
    readonly fontColor: Subscribable<string>;
    /** The font outline width of this label, in pixels. */
    readonly fontOutlineWidth: Subscribable<number>;
    /** The font outline color of this label. */
    readonly fontOutlineColor: Subscribable<string>;
    /** Whether to show the background for this label. */
    readonly showBg: Subscribable<boolean>;
    /** This label's background color. */
    readonly bgColor: Subscribable<string>;
    /** The padding of this label's background, in pixels. Expressed as [top, right, bottom, left]. */
    readonly bgPadding: Subscribable<ReadonlyFloat64Array>;
    /** The border radius of this label's background. */
    readonly bgBorderRadius: Subscribable<number>;
    /** The outline width of this label's background. */
    readonly bgOutlineWidth: Subscribable<number>;
    /** The outline color of this label's background. */
    readonly bgOutlineColor: Subscribable<string>;
    /**
     * Constructor.
     * @param text The text of this label, or a subscribable which provides it.
     * @param priority The render priority of this label, or a subscribable which provides it.
     * @param options Options with which to initialize this label.
     */
    constructor(text: string | Subscribable<string>, priority: number | Subscribable<number>, options?: AbstractMapTextLabelOptions);
    draw(context: CanvasRenderingContext2D, mapProjection: MapProjection): void;
    /**
     * Gets the projected position of the label, in pixels.
     * @param mapProjection The map projection to use.
     * @param out The vector to which to write the result.
     * @returns The projected position of the label.
     */
    protected abstract getPosition(mapProjection: MapProjection, out: Float64Array): Float64Array;
    /**
     * Loads this label's text style to a canvas rendering context.
     * @param context The canvas rendering context to use.
     */
    protected setTextStyle(context: CanvasRenderingContext2D): void;
    /**
     * Draws this label's text to a canvas.
     * @param context The canvas rendering context.
     * @param centerX The x-coordinate of the center of the label, in pixels.
     * @param centerY the y-coordinate of the center of the label, in pixels.
     */
    protected drawText(context: CanvasRenderingContext2D, centerX: number, centerY: number): void;
    /**
     * Draws this label's background to a canvas.
     * @param context The canvas rendering context.
     * @param centerX The x-coordinate of the center of the label, in pixels.
     * @param centerY the y-coordinate of the center of the label, in pixels.
     * @param width The width of the background, in pixels.
     * @param height The height of the background, in pixels.
     */
    protected drawBackground(context: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number): void;
    /**
     * Loads the path of this label's background to a canvas rendering context.
     * @param context The canvas rendering context to use.
     * @param left The x-coordinate of the left edge of the background, in pixels.
     * @param top The y-coordinate of the top edge of the background, in pixels.
     * @param width The width of the background, in pixels.
     * @param height The height of the background, in pixels.
     * @param radius The border radius of the background, in pixels.
     */
    protected loadBackgroundPath(context: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, radius: number): void;
}
/**
 * Options for a MapLocationTextLabel.
 */
export interface MapLocationTextLabelOptions extends AbstractMapTextLabelOptions {
    /** The offset of the label from its projected position, as `[x, y]` in pixels. Defaults to `[0, 0]`. */
    offset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
}
/**
 * A text label associated with a specific geographic location.
 */
export declare class MapLocationTextLabel extends AbstractMapTextLabel {
    readonly location: Subscribable<GeoPointInterface>;
    readonly offset: Subscribable<ReadonlyFloat64Array>;
    /**
     * Constructor.
     * @param text The text of this label, or a subscribable which provides it.
     * @param priority The render priority of this label, or a subscribable which provides it.
     * @param location The geographic location of this label, or a subscribable which provides it.
     * @param options Options with which to initialize this label.
     */
    constructor(text: string | Subscribable<string>, priority: number | Subscribable<number>, location: GeoPointInterface | Subscribable<GeoPointInterface>, options?: MapLocationTextLabelOptions);
    /** @inheritdoc */
    protected getPosition(mapProjection: MapProjection, out: Float64Array): Float64Array;
}
//# sourceMappingURL=MapTextLabel.d.ts.map