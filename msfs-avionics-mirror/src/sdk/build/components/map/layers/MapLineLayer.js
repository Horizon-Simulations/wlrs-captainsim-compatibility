import { MapSyncedCanvasLayer } from './MapSyncedCanvasLayer';
/**
 * A map layer that draws a line between two points. The line is drawn in projected coordinate space, so it will always
 * be straight on the projected map.
 */
export class MapLineLayer extends MapSyncedCanvasLayer {
    constructor() {
        var _a, _b, _c, _d, _e, _f;
        super(...arguments);
        this.strokeWidth = (_a = this.props.strokeWidth) !== null && _a !== void 0 ? _a : MapLineLayer.DEFAULT_STROKE_WIDTH;
        this.strokeStyle = (_b = this.props.strokeStyle) !== null && _b !== void 0 ? _b : MapLineLayer.DEFAULT_STROKE_STYLE;
        this.strokeDash = (_c = this.props.strokeDash) !== null && _c !== void 0 ? _c : MapLineLayer.DEFAULT_STROKE_DASH;
        this.outlineWidth = (_d = this.props.outlineWidth) !== null && _d !== void 0 ? _d : MapLineLayer.DEFAULT_OUTLINE_WIDTH;
        this.outlineStyle = (_e = this.props.outlineStyle) !== null && _e !== void 0 ? _e : MapLineLayer.DEFAULT_OUTLINE_STYLE;
        this.outlineDash = (_f = this.props.outlineDash) !== null && _f !== void 0 ? _f : MapLineLayer.DEFAULT_OUTLINE_DASH;
        this.vec = new Float64Array([0, 0]);
        this.isUpdateScheduled = false;
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.props.start.sub(() => { this.scheduleUpdate(); });
        this.props.end.sub(() => { this.scheduleUpdate(); });
        this.scheduleUpdate();
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        super.onMapProjectionChanged(mapProjection, changeFlags);
        this.scheduleUpdate();
    }
    /**
     * Schedules the layer for a draw update.
     */
    scheduleUpdate() {
        this.isUpdateScheduled = true;
    }
    /** @inheritdoc */
    onUpdated(time, elapsed) {
        super.onUpdated(time, elapsed);
        if (this.isUpdateScheduled) {
            this.display.clear();
            const start = this.props.start.get();
            const end = this.props.end.get();
            if (start !== null && end !== null) {
                const [x1, y1] = start instanceof Float64Array ? start : this.props.mapProjection.project(start, this.vec);
                const [x2, y2] = end instanceof Float64Array ? end : this.props.mapProjection.project(end, this.vec);
                this.drawLine(x1, y1, x2, y2);
            }
            this.isUpdateScheduled = false;
        }
    }
    /**
     * Draws this layer's line.
     * @param x1 The x coordinate of the start of the line.
     * @param y1 The y coordinate of the start of the line.
     * @param x2 The x coordinate of the end of the line.
     * @param y2 The y coordinate of the end of the line.
     */
    drawLine(x1, y1, x2, y2) {
        const context = this.display.context;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        if (this.outlineWidth > 0) {
            this.stroke(context, this.strokeWidth + this.outlineWidth * 2, this.outlineStyle, this.outlineDash);
        }
        if (this.strokeWidth > 0) {
            this.stroke(context, this.strokeWidth, this.strokeStyle, this.strokeDash);
        }
    }
    /**
     * Applies a stroke to a canvas rendering context.
     * @param context A canvas rendering context.
     * @param width The width of the stroke, in pixels.
     * @param style The style of the stroke.
     * @param dash The dash array of the stroke.
     */
    stroke(context, width, style, dash) {
        context.lineWidth = width;
        context.strokeStyle = style;
        context.setLineDash(dash);
        context.stroke();
    }
}
MapLineLayer.DEFAULT_STROKE_WIDTH = 2; // px
MapLineLayer.DEFAULT_STROKE_STYLE = 'white';
MapLineLayer.DEFAULT_STROKE_DASH = [];
MapLineLayer.DEFAULT_OUTLINE_WIDTH = 0; // px
MapLineLayer.DEFAULT_OUTLINE_STYLE = 'black';
MapLineLayer.DEFAULT_OUTLINE_DASH = [];
