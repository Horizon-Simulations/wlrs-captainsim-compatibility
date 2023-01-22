import { Vec2Math, VecNMath } from '../../math/VecMath';
import { SubscribableUtils } from '../../sub/SubscribableUtils';
/**
 * An abstract implementation of a map text label.
 */
export class AbstractMapTextLabel {
    /**
     * Constructor.
     * @param text The text of this label, or a subscribable which provides it.
     * @param priority The render priority of this label, or a subscribable which provides it.
     * @param options Options with which to initialize this label.
     */
    constructor(text, priority, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        this.text = SubscribableUtils.toSubscribable(text, true);
        this.priority = SubscribableUtils.toSubscribable(priority, true);
        this.anchor = SubscribableUtils.toSubscribable((_a = options === null || options === void 0 ? void 0 : options.anchor) !== null && _a !== void 0 ? _a : Vec2Math.create(), true);
        this.font = SubscribableUtils.toSubscribable((_b = options === null || options === void 0 ? void 0 : options.font) !== null && _b !== void 0 ? _b : '', true);
        this.fontSize = SubscribableUtils.toSubscribable((_c = options === null || options === void 0 ? void 0 : options.fontSize) !== null && _c !== void 0 ? _c : 10, true);
        this.fontColor = SubscribableUtils.toSubscribable((_d = options === null || options === void 0 ? void 0 : options.fontColor) !== null && _d !== void 0 ? _d : 'white', true);
        this.fontOutlineWidth = SubscribableUtils.toSubscribable((_e = options === null || options === void 0 ? void 0 : options.fontOutlineWidth) !== null && _e !== void 0 ? _e : 0, true);
        this.fontOutlineColor = SubscribableUtils.toSubscribable((_f = options === null || options === void 0 ? void 0 : options.fontOutlineColor) !== null && _f !== void 0 ? _f : 'black', true);
        this.showBg = SubscribableUtils.toSubscribable((_g = options === null || options === void 0 ? void 0 : options.showBg) !== null && _g !== void 0 ? _g : false, true);
        this.bgColor = SubscribableUtils.toSubscribable((_h = options === null || options === void 0 ? void 0 : options.bgColor) !== null && _h !== void 0 ? _h : 'black', true);
        this.bgPadding = SubscribableUtils.toSubscribable((_j = options === null || options === void 0 ? void 0 : options.bgPadding) !== null && _j !== void 0 ? _j : VecNMath.create(4), true);
        this.bgBorderRadius = SubscribableUtils.toSubscribable((_k = options === null || options === void 0 ? void 0 : options.bgBorderRadius) !== null && _k !== void 0 ? _k : 0, true);
        this.bgOutlineWidth = SubscribableUtils.toSubscribable((_l = options === null || options === void 0 ? void 0 : options.bgOutlineWidth) !== null && _l !== void 0 ? _l : 0, true);
        this.bgOutlineColor = SubscribableUtils.toSubscribable((_m = options === null || options === void 0 ? void 0 : options.bgOutlineColor) !== null && _m !== void 0 ? _m : 'white', true);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    draw(context, mapProjection) {
        this.setTextStyle(context);
        const width = context.measureText(this.text.get()).width;
        const height = this.fontSize.get();
        const showBg = this.showBg.get();
        const bgPadding = this.bgPadding.get();
        const bgOutlineWidth = this.bgOutlineWidth.get();
        const bgExtraWidth = showBg ? bgPadding[1] + bgPadding[3] + bgOutlineWidth * 2 : 0;
        const bgExtraHeight = showBg ? bgPadding[0] + bgPadding[2] + bgOutlineWidth * 2 : 0;
        const anchor = this.anchor.get();
        const pos = this.getPosition(mapProjection, AbstractMapTextLabel.tempVec2);
        const centerX = pos[0] - (anchor[0] - 0.5) * (width + bgExtraWidth);
        const centerY = pos[1] - (anchor[1] - 0.5) * (height + bgExtraHeight);
        if (showBg) {
            this.drawBackground(context, centerX, centerY, width, height);
        }
        this.drawText(context, centerX, centerY);
    }
    /**
     * Loads this label's text style to a canvas rendering context.
     * @param context The canvas rendering context to use.
     */
    setTextStyle(context) {
        context.font = `${this.fontSize.get()}px ${this.font.get()}`;
        context.textBaseline = 'middle';
        context.textAlign = 'center';
    }
    /**
     * Draws this label's text to a canvas.
     * @param context The canvas rendering context.
     * @param centerX The x-coordinate of the center of the label, in pixels.
     * @param centerY the y-coordinate of the center of the label, in pixels.
     */
    drawText(context, centerX, centerY) {
        const text = this.text.get();
        const fontOutlineWidth = this.fontOutlineWidth.get();
        if (fontOutlineWidth > 0) {
            context.lineWidth = fontOutlineWidth * 2;
            context.strokeStyle = this.fontOutlineColor.get();
            context.strokeText(text, centerX, centerY);
        }
        context.fillStyle = this.fontColor.get();
        context.fillText(text, centerX, centerY);
    }
    /**
     * Draws this label's background to a canvas.
     * @param context The canvas rendering context.
     * @param centerX The x-coordinate of the center of the label, in pixels.
     * @param centerY the y-coordinate of the center of the label, in pixels.
     * @param width The width of the background, in pixels.
     * @param height The height of the background, in pixels.
     */
    drawBackground(context, centerX, centerY, width, height) {
        const bgPadding = this.bgPadding.get();
        const bgOutlineWidth = this.bgOutlineWidth.get();
        const bgBorderRadius = this.bgBorderRadius.get();
        const backgroundLeft = centerX - width / 2 - (bgPadding[3] + bgOutlineWidth);
        const backgroundTop = centerY - height / 2 - (bgPadding[0] + bgOutlineWidth);
        const backgroundWidth = width + (bgPadding[1] + bgPadding[3] + 2 * bgOutlineWidth);
        const backgroundHeight = height + (bgPadding[0] + bgPadding[2] + 2 * bgOutlineWidth);
        let isRounded = false;
        if (bgBorderRadius > 0) {
            isRounded = true;
            this.loadBackgroundPath(context, backgroundLeft, backgroundTop, backgroundWidth, backgroundHeight, bgBorderRadius);
        }
        if (bgOutlineWidth > 0) {
            context.lineWidth = bgOutlineWidth * 2;
            context.strokeStyle = this.bgOutlineColor.get();
            if (isRounded) {
                context.stroke();
            }
            else {
                context.strokeRect(backgroundLeft, backgroundTop, backgroundWidth, backgroundHeight);
            }
        }
        context.fillStyle = this.bgColor.get();
        if (isRounded) {
            context.fill();
        }
        else {
            context.fillRect(backgroundLeft, backgroundTop, backgroundWidth, backgroundHeight);
        }
    }
    /**
     * Loads the path of this label's background to a canvas rendering context.
     * @param context The canvas rendering context to use.
     * @param left The x-coordinate of the left edge of the background, in pixels.
     * @param top The y-coordinate of the top edge of the background, in pixels.
     * @param width The width of the background, in pixels.
     * @param height The height of the background, in pixels.
     * @param radius The border radius of the background, in pixels.
     */
    loadBackgroundPath(context, left, top, width, height, radius) {
        const right = left + width;
        const bottom = top + height;
        context.beginPath();
        context.moveTo(left + radius, top);
        context.lineTo(right - radius, top);
        context.arcTo(right, top, right, top + radius, radius);
        context.lineTo(right, bottom - radius);
        context.arcTo(right, bottom, right - radius, bottom, radius);
        context.lineTo(left + radius, bottom);
        context.arcTo(left, bottom, left, bottom - radius, radius);
        context.lineTo(left, top + radius);
        context.arcTo(left, top, left + radius, top, radius);
    }
}
AbstractMapTextLabel.tempVec2 = new Float64Array(2);
/**
 * A text label associated with a specific geographic location.
 */
export class MapLocationTextLabel extends AbstractMapTextLabel {
    /**
     * Constructor.
     * @param text The text of this label, or a subscribable which provides it.
     * @param priority The render priority of this label, or a subscribable which provides it.
     * @param location The geographic location of this label, or a subscribable which provides it.
     * @param options Options with which to initialize this label.
     */
    constructor(text, priority, location, options) {
        var _a;
        super(text, priority, options);
        this.location = SubscribableUtils.toSubscribable(location, true);
        this.offset = SubscribableUtils.toSubscribable((_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : Vec2Math.create(), true);
    }
    /** @inheritdoc */
    getPosition(mapProjection, out) {
        mapProjection.project(this.location.get(), out);
        Vec2Math.add(out, this.offset.get(), out);
        return out;
    }
}
