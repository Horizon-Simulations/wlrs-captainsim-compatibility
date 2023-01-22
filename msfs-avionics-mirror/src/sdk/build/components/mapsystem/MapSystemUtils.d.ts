import { ReadonlyFloat64Array } from '../../math';
/**
 * Utility methods related to MapSystem.
 */
export declare class MapSystemUtils {
    /**
     * Converts a nominal relative projected x coordinate to a true relative projected x coordinate. Nominal relative
     * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
     * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
     * @param nominalRelX A nominal relative projected x coordinate.
     * @param width The width of the map's projected window, in pixels.
     * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
     * @returns The true relative projected x coordinate that is equivalent to the specified nominal coordinate.
     */
    static nominalToTrueRelativeX(nominalRelX: number, width: number, deadZone: ReadonlyFloat64Array): number;
    /**
     * Converts a nominal relative projected y coordinate to a true relative projected y coordinate. Nominal relative
     * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
     * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
     * @param nominalRelY A nominal relative projected y coordinate.
     * @param height The height of the map's projected window, in pixels.
     * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
     * @returns The true relative projected y coordinate that is equivalent to the specified nominal coordinate.
     */
    static nominalToTrueRelativeY(nominalRelY: number, height: number, deadZone: ReadonlyFloat64Array): number;
    /**
     * Converts nominal relative projected coordinates to a true relative projected coordinates. Nominal relative
     * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
     * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
     * @param nominal Nominal relative projected coordinates.
     * @param size The size of the map's projected window, in pixels.
     * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
     * @param out The vector to which to write the result.
     * @returns The true relative projected coordinates that are equivalent to the specified nominal coordinates.
     */
    static nominalToTrueRelativeXY(nominal: ReadonlyFloat64Array, size: ReadonlyFloat64Array, deadZone: ReadonlyFloat64Array, out: Float64Array): Float64Array;
}
//# sourceMappingURL=MapSystemUtils.d.ts.map