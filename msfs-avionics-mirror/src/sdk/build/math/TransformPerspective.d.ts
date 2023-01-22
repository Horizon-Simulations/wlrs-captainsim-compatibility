import { ReadonlyTransform3D } from './Transform3D';
import { ReadonlyFloat64Array } from './VecMath';
/**
 * A readonly perspective transformation.
 */
export declare type ReadonlyTransformPerspective = Pick<TransformPerspective, 'getCameraPosition' | 'getCameraRotation' | 'getSurfacePosition' | 'apply' | 'copy'>;
/**
 * A perspective transformation.
 */
export declare class TransformPerspective {
    private static readonly vec3Cache;
    private readonly cameraPos;
    private readonly surfacePos;
    private readonly cameraPosTransform;
    private readonly cameraRotationTransform;
    private readonly cameraRotationInverseTransform;
    private readonly allCameraTransforms;
    private readonly fullTransform;
    /**
     * Gets the position of this transformation's camera, as `[x, y, z]` in world coordinates.
     * @returns The position of this transformation's camera, as `[x, y, z]` in world coordinates.
     */
    getCameraPosition(): ReadonlyFloat64Array;
    /**
     * Gets the transformation representing the rotation of this transformation's camera.
     * @returns The transformation representing the rotation of this transformation's camera.
     */
    getCameraRotation(): ReadonlyTransform3D;
    /**
     * Gets the position of this transformation's projection surface relative to the camera, as `[x, y, z]` in camera
     * coordinates.
     * @returns The position of this transformation's projection surface relative to the camera, as `[x, y, z]` in camera
     * coordinates.
     */
    getSurfacePosition(): ReadonlyFloat64Array;
    /**
     * Sets the parameters of this transformation.
     * @param cameraPos The position of the camera, as `[x, y, z]` in world coordinates.
     * @param cameraRotation A transformation representing the rotation of the camera.
     * @param surfacePos The position of the projection surface relative to the camera, as `[x, y, z]` in camera
     * coordinates.
     * @returns This transformation, after it has been changed.
     */
    set(cameraPos: ReadonlyFloat64Array, cameraRotation: ReadonlyTransform3D, surfacePos: ReadonlyFloat64Array): this;
    /**
     * Sets the parameters of this transformation from another transformation.
     * @param transform The transformation from which to take parameters.
     */
    set(transform: ReadonlyTransformPerspective): this;
    /**
     * Sets the position of this projection's camera. Does not update the full camera transformation.
     * @param cameraPos The position of the camera, as `[x, y, z]` in world coordinates.
     */
    private _setCameraPosition;
    /**
     * Sets the rotation of this projection's camera. Does not update the full camera transformation.
     * @param cameraRotation A transformation representing the rotation of the camera.
     */
    _setCameraRotation(cameraRotation: ReadonlyTransform3D): void;
    /**
     * Sets the position of this projection's camera.
     * @param cameraPos The position of the camera, as `[x, y, z]` in world coordinates.
     * @returns This transformation, after it has been changed.
     */
    setCameraPosition(cameraPos: ReadonlyFloat64Array): this;
    /**
     * Sets the rotation of this projection's camera.
     * @param cameraRotation A transformation representing the rotation of the camera.
     * @returns This transformation, after it has been changed.
     */
    setCameraRotation(cameraRotation: ReadonlyTransform3D): this;
    /**
     * Sets the position of this transformation's projection surface relative to the camera.
     * @param surfacePos The position of the projection surface relative to the camera, as `[x, y, z]` in camera
     * coordinates.
     * @returns This transformation, after it has been changed.
     */
    setSurfacePosition(surfacePos: ReadonlyFloat64Array): this;
    /**
     * Copies this transformation.
     * @returns A copy of this transformation.
     */
    copy(): TransformPerspective;
    /**
     * Applies this transformation to a 3D vector.
     * @param vec A 3D vector, in world coordinates.
     * @param out The 2D vector to which to write the result.
     * @returns The result of applying this transformation to `vec`.
     */
    apply(vec: ReadonlyFloat64Array, out: Float64Array): Float64Array;
}
//# sourceMappingURL=TransformPerspective.d.ts.map