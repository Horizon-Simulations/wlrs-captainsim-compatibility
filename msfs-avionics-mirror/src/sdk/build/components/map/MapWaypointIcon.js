import { Vec2Math } from '../../math';
import { SubscribableUtils } from '../../sub/SubscribableUtils';
/**
 * A blank waypoint icon.
 */
export class MapBlankWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     */
    constructor(waypoint, priority) {
        this.waypoint = waypoint;
        this.priority = SubscribableUtils.toSubscribable(priority, true);
    }
    /**
     * Does nothing.
     */
    draw() {
        // noop
    }
}
/**
 * An abstract implementation of MapWaypointIcon which supports an arbitrary anchor point and offset.
 */
export class AbstractMapWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon, or a subscribable which provides it. Icons with higher
     * priorities should be rendered above those with lower priorities.
     * @param size The size of this icon, as `[width, height]` in pixels, or a subscribable which provides it.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, size, options) {
        var _a, _b;
        this.waypoint = waypoint;
        this.priority = SubscribableUtils.toSubscribable(priority, true);
        this.size = SubscribableUtils.toSubscribable(size, true);
        this.anchor = SubscribableUtils.toSubscribable((_a = options === null || options === void 0 ? void 0 : options.anchor) !== null && _a !== void 0 ? _a : Vec2Math.create(0.5, 0.5), true);
        this.offset = SubscribableUtils.toSubscribable((_b = options === null || options === void 0 ? void 0 : options.offset) !== null && _b !== void 0 ? _b : Vec2Math.create(), true);
    }
    /** @inheritdoc */
    draw(context, mapProjection) {
        const size = this.size.get();
        const offset = this.offset.get();
        const anchor = this.anchor.get();
        const projected = mapProjection.project(this.waypoint.location.get(), MapWaypointImageIcon.tempVec2);
        const left = projected[0] + offset[0] - anchor[0] * size[0];
        const top = projected[1] + offset[1] - anchor[1] * size[1];
        this.drawIconAt(context, mapProjection, left, top);
    }
}
AbstractMapWaypointIcon.tempVec2 = new Float64Array(2);
/**
 * A waypoint icon with an image as the icon's graphic source.
 */
export class MapWaypointImageIcon extends AbstractMapWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param img This icon's image.
     * @param size The size of this icon, as `[width, height]` in pixels, or a subscribable which provides it.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, img, size, options) {
        super(waypoint, priority, size, options);
        this.img = img;
    }
    /** @inheritdoc */
    drawIconAt(context, mapProjection, left, top) {
        const size = this.size.get();
        context.drawImage(this.img, left, top, size[0], size[1]);
    }
}
/**
 * A waypoint icon with a sprite as the icon's graphic source.
 */
export class MapWaypointSpriteIcon extends AbstractMapWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param img This icon's sprite's image source.
     * @param frameWidth The frame width of the sprite, in pixels.
     * @param frameHeight The frame height of the sprite, in pixels.
     * @param size The size of this icon, as `[width, height]` in pixels, or a subscribable which provides it.
     * @param options Options with which to initialize this icon.
     * @param spriteFrameHandler An optional handler to determine the sprite frame to draw.
     */
    constructor(waypoint, priority, img, frameWidth, frameHeight, size, options, spriteFrameHandler) {
        super(waypoint, priority, size, options);
        this.img = img;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.spriteFrameHandler = spriteFrameHandler;
    }
    /** @inheritdoc */
    drawIconAt(context, mapProjection, left, top) {
        const size = this.size.get();
        const spriteIndex = this.getSpriteFrame(mapProjection);
        const rowCount = Math.floor(this.img.naturalHeight / this.frameHeight);
        const colCount = Math.floor(this.img.naturalWidth / this.frameWidth);
        const row = Math.min(rowCount - 1, Math.floor(spriteIndex / colCount));
        const col = Math.min(colCount - 1, spriteIndex % colCount);
        const spriteLeft = col * this.frameWidth;
        const spriteTop = row * this.frameHeight;
        context.drawImage(this.img, spriteLeft, spriteTop, this.frameWidth, this.frameHeight, left, top, size[0], size[1]);
    }
    /**
     * Gets the sprite frame to render.
     * @param mapProjection The map projection to use.
     * @returns The sprite frame to render.
     */
    getSpriteFrame(mapProjection) {
        if (this.spriteFrameHandler !== undefined) {
            return this.spriteFrameHandler(mapProjection);
        }
        return 0;
    }
}
