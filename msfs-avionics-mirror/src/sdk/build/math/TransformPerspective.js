import { Transform3D } from './Transform3D';
import { Vec2Math, Vec3Math } from './VecMath';
/**
 * A perspective transformation.
 */
export class TransformPerspective {
    constructor() {
        this.cameraPos = Vec3Math.create();
        this.surfacePos = Vec3Math.create(0, 0, 1);
        this.cameraPosTransform = new Transform3D();
        this.cameraRotationTransform = new Transform3D();
        this.cameraRotationInverseTransform = new Transform3D();
        this.allCameraTransforms = [this.cameraPosTransform, this.cameraRotationInverseTransform];
        this.fullTransform = new Transform3D();
    }
    /**
     * Gets the position of this transformation's camera, as `[x, y, z]` in world coordinates.
     * @returns The position of this transformation's camera, as `[x, y, z]` in world coordinates.
     */
    getCameraPosition() {
        return this.cameraPos;
    }
    /**
     * Gets the transformation representing the rotation of this transformation's camera.
     * @returns The transformation representing the rotation of this transformation's camera.
     */
    getCameraRotation() {
        return this.cameraRotationTransform;
    }
    /**
     * Gets the position of this transformation's projection surface relative to the camera, as `[x, y, z]` in camera
     * coordinates.
     * @returns The position of this transformation's projection surface relative to the camera, as `[x, y, z]` in camera
     * coordinates.
     */
    getSurfacePosition() {
        return this.cameraPos;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2, arg3) {
        if (arg1 instanceof Float64Array) {
            this._setCameraPosition(arg1);
            this._setCameraRotation(arg2);
            this.setSurfacePosition(arg3);
            Transform3D.concat(this.fullTransform, this.allCameraTransforms);
            return this;
        }
        else {
            return this.set(arg1.getCameraPosition(), arg1.getCameraRotation(), arg1.getSurfacePosition());
        }
    }
    /**
     * Sets the position of this projection's camera. Does not update the full camera transformation.
     * @param cameraPos The position of the camera, as `[x, y, z]` in world coordinates.
     */
    _setCameraPosition(cameraPos) {
        Vec3Math.copy(cameraPos, this.cameraPos);
        this.cameraPosTransform.toTranslation(-cameraPos[0], -cameraPos[1], -cameraPos[2]);
    }
    /**
     * Sets the rotation of this projection's camera. Does not update the full camera transformation.
     * @param cameraRotation A transformation representing the rotation of the camera.
     */
    _setCameraRotation(cameraRotation) {
        this.cameraRotationTransform.set(cameraRotation);
        this.cameraRotationInverseTransform.set(cameraRotation).invert();
    }
    /**
     * Sets the position of this projection's camera.
     * @param cameraPos The position of the camera, as `[x, y, z]` in world coordinates.
     * @returns This transformation, after it has been changed.
     */
    setCameraPosition(cameraPos) {
        this._setCameraPosition(cameraPos);
        Transform3D.concat(this.fullTransform, this.allCameraTransforms);
        return this;
    }
    /**
     * Sets the rotation of this projection's camera.
     * @param cameraRotation A transformation representing the rotation of the camera.
     * @returns This transformation, after it has been changed.
     */
    setCameraRotation(cameraRotation) {
        this._setCameraRotation(cameraRotation);
        Transform3D.concat(this.fullTransform, this.allCameraTransforms);
        return this;
    }
    /**
     * Sets the position of this transformation's projection surface relative to the camera.
     * @param surfacePos The position of the projection surface relative to the camera, as `[x, y, z]` in camera
     * coordinates.
     * @returns This transformation, after it has been changed.
     */
    setSurfacePosition(surfacePos) {
        Vec3Math.copy(surfacePos, this.surfacePos);
        return this;
    }
    /**
     * Copies this transformation.
     * @returns A copy of this transformation.
     */
    copy() {
        return new TransformPerspective().set(this);
    }
    /**
     * Applies this transformation to a 3D vector.
     * @param vec A 3D vector, in world coordinates.
     * @param out The 2D vector to which to write the result.
     * @returns The result of applying this transformation to `vec`.
     */
    apply(vec, out) {
        const transformedVec = this.fullTransform.apply(vec, TransformPerspective.vec3Cache[0]);
        if (Vec3Math.abs(transformedVec) < 1e-7) {
            return Vec2Math.set(0, 0, out);
        }
        if (transformedVec[2] < 0) {
            // vector is behind the camera.
            return Vec2Math.set(NaN, NaN, out);
        }
        const ratio = this.surfacePos[2] / transformedVec[2];
        return Vec2Math.set(transformedVec[0] * ratio + this.surfacePos[0], transformedVec[1] * ratio + this.surfacePos[1], out);
    }
}
TransformPerspective.vec3Cache = [Vec3Math.create()];
