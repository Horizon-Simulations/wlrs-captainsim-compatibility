/**
 * Itl functions for array operations.
 */
export class ArrayUtils {
    /**
     * Gets the length of the longest string in the array.
     * @param array The array to search in.
     * @returns length of the longest string
     */
    static getMaxStringLength(array) {
        return array.reduce((accum, curr) => curr.length > accum ? curr.length : accum, 0);
    }
}
