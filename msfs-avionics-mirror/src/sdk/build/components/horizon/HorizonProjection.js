import { GeoPoint } from '../../geo/GeoPoint';
import { Transform3D, UnitType } from '../../math';
import { BitFlags } from '../../math/BitFlags';
import { TransformPerspective } from '../../math/TransformPerspective';
import { Vec2Math, Vec3Math, VecNMath } from '../../math/VecMath';
import { SubEvent } from '../../sub/SubEvent';
/**
 * The different types of horizon projection changes.
 */
export var HorizonProjectionChangeType;
(function (HorizonProjectionChangeType) {
    HorizonProjectionChangeType[HorizonProjectionChangeType["Position"] = 1] = "Position";
    HorizonProjectionChangeType[HorizonProjectionChangeType["Altitude"] = 2] = "Altitude";
    HorizonProjectionChangeType[HorizonProjectionChangeType["Heading"] = 4] = "Heading";
    HorizonProjectionChangeType[HorizonProjectionChangeType["Pitch"] = 8] = "Pitch";
    HorizonProjectionChangeType[HorizonProjectionChangeType["Roll"] = 16] = "Roll";
    HorizonProjectionChangeType[HorizonProjectionChangeType["Offset"] = 32] = "Offset";
    HorizonProjectionChangeType[HorizonProjectionChangeType["ProjectedSize"] = 64] = "ProjectedSize";
    HorizonProjectionChangeType[HorizonProjectionChangeType["Fov"] = 128] = "Fov";
    HorizonProjectionChangeType[HorizonProjectionChangeType["FovEndpoints"] = 256] = "FovEndpoints";
    HorizonProjectionChangeType[HorizonProjectionChangeType["ScaleFactor"] = 512] = "ScaleFactor";
    HorizonProjectionChangeType[HorizonProjectionChangeType["ProjectedOffset"] = 1024] = "ProjectedOffset";
    HorizonProjectionChangeType[HorizonProjectionChangeType["OffsetCenterProjected"] = 2048] = "OffsetCenterProjected";
})(HorizonProjectionChangeType || (HorizonProjectionChangeType = {}));
/**
 * A perspective projection from the point of view of an airplane.
 */
export class HorizonProjection {
    /**
     * Constructor.
     * @param projectedWidth The initial projected width of the projection, in pixels.
     * @param projectedHeight The initial projected height of the projection, in pixels.
     * @param fov The initial field of view of the projection, in degrees.
     */
    constructor(projectedWidth, projectedHeight, fov) {
        this.position = new GeoPoint(0, 0);
        this.altitude = 0;
        this.heading = 0;
        this.roll = 0;
        this.pitch = 0;
        this.offset = Vec3Math.create();
        this.fovEndpoints = VecNMath.create(4, 0.5, 0, 0.5, 1);
        this.scaleFactor = 1;
        this.projectedOffset = Vec2Math.create();
        this.offsetCenterProjected = Vec2Math.create();
        this.positionAngleTransforms = [new Transform3D(), new Transform3D()];
        this.altitudeTransform = new Transform3D();
        this.positionAltitudeTransforms = [...this.positionAngleTransforms, this.altitudeTransform];
        this.positionTransform = new Transform3D();
        this.planeAngles = Vec3Math.create();
        this.planeAngleTransforms = [new Transform3D(), new Transform3D(), new Transform3D()];
        this.planeTransform = new Transform3D();
        this.cameraPos = Vec3Math.create();
        this.surfacePos = Vec3Math.create();
        this.perspectiveTransform = new TransformPerspective();
        this.oldParameters = {
            position: new GeoPoint(0, 0),
            altitude: 0,
            heading: 0,
            pitch: 0,
            roll: 0,
            offset: Vec3Math.create(),
            projectedSize: Vec2Math.create(),
            fov: 0,
            fovEndpoints: VecNMath.create(4),
            scaleFactor: 1,
            projectedOffset: Vec2Math.create(),
            offsetCenterProjected: Vec2Math.create()
        };
        this.queuedParameters = {};
        this.updateQueued = false;
        this.changeEvent = new SubEvent();
        this.projectedSize = Vec2Math.create(projectedWidth, projectedHeight);
        this.fov = fov;
        this.recompute();
    }
    /**
     * Gets the position of this projection.
     * @returns The position of this projection.
     */
    getPosition() {
        return this.position.readonly;
    }
    /**
     * Gets the altitude of this projection, in meters above mean sea level.
     * @returns The altitude of this projection, in meters above mean sea level.
     */
    getAltitude() {
        return this.altitude;
    }
    /**
     * Gets the true heading of this projection, in degrees.
     * @returns The true heading of this projection, in degrees.
     */
    getHeading() {
        return this.heading;
    }
    /**
     * Gets the pitch of this projection, in degrees.
     * @returns The pitch of this projection, in degrees.
     */
    getPitch() {
        return this.pitch;
    }
    /**
     * Gets the roll of this projection, in degrees.
     * @returns The roll of this projection, in degrees.
     */
    getRoll() {
        return this.roll;
    }
    /**
     * Gets the size of the projected window, as `[width, height]` in pixels.
     * @returns The size of the projected window, as `[width, height]` in pixels.
     */
    getProjectedSize() {
        return this.projectedSize;
    }
    /**
     * Gets the field of view of this projection, in degrees.
     * @returns The field of view of this projection, in degrees.
     */
    getFov() {
        return this.fov;
    }
    /**
     * Gets the projected endpoints at which the field of view is measured, as `[x1, y1, x2, y2]`, with each component
     * expressed relative to the width or height of the projected window.
     * @returns The projected endpoints at which the field of view is measured, as `[x1, y1, x2, y2]`, with each
     * component expressed relative to the width or height of the projected window.
     */
    getFovEndpoints() {
        return this.fovEndpoints;
    }
    /**
     * Gets the focal length of this projection, in meters. The focal length is set such that one meter at a distance
     * from the camera equal to the focal length subtends an angle equal to the field of view.
     * @returns The focal length of this projection, in meters.
     */
    getFocalLength() {
        return this.surfacePos[2];
    }
    /**
     * Gets the nominal scale factor of this projection. At a distance from the camera equal to the focal length, one
     * meter will be projected to a number of pixels equal to the nominal scale factor.
     * @returns The nominal scale factor of this projection.
     */
    getScaleFactor() {
        return this.scaleFactor;
    }
    /**
     * Gets the projected offset of this projection's center, as `[x, y]` in pixels.
     * @returns The projected offset of this projection's center, as `[x, y]` in pixels.
     */
    getProjectedOffset() {
        return this.projectedOffset;
    }
    /**
     * Gets the projected center of this projection, including offset, as `[x, y]` in pixels.
     * @returns The projected center of this projection, including offset, as `[x, y]` in pixels.
     */
    getOffsetCenterProjected() {
        return this.offsetCenterProjected;
    }
    /**
     * Recomputes this projection's computed parameters.
     */
    recompute() {
        Vec2Math.set(this.projectedSize[0] / 2 + this.projectedOffset[0], this.projectedSize[1] / 2 + this.projectedOffset[1], this.offsetCenterProjected);
        // Compute the transformation required to bring the position of the plane to [0, 0, 0]. After applying this
        // transformation, with a heading/roll/pitch of 0, the positive z axis points in the direction of the plane, the
        // positive x axis points directly upward (away from the ground), and the positive y axis points to the right.
        this.positionAngleTransforms[0].toRotationZ(-this.position.lon * Avionics.Utils.DEG2RAD);
        this.positionAngleTransforms[1].toRotationY(this.position.lat * Avionics.Utils.DEG2RAD);
        this.altitudeTransform.toTranslation(-(UnitType.GA_RADIAN.convertTo(1, UnitType.METER) + this.altitude), 0, 0);
        Transform3D.concat(this.positionTransform, this.positionAltitudeTransforms);
        this.planeAngles[0] = -this.heading * Avionics.Utils.DEG2RAD;
        this.planeAngles[1] = this.pitch * Avionics.Utils.DEG2RAD;
        this.planeAngles[2] = this.roll * Avionics.Utils.DEG2RAD;
        this.planeAngleTransforms[0].toRotationZ(this.planeAngles[2]);
        this.planeAngleTransforms[1].toRotationY(this.planeAngles[1]);
        this.planeAngleTransforms[2].toRotationX(this.planeAngles[0]);
        Transform3D.concat(this.planeTransform, this.planeAngleTransforms);
        // Convert camera offset to world coordinates
        this.planeTransform.apply(this.offset, this.cameraPos);
        this.scaleFactor = Math.hypot(this.fovEndpoints[2] * this.projectedSize[0] - this.fovEndpoints[0] * this.projectedSize[0], this.fovEndpoints[3] * this.projectedSize[1] - this.fovEndpoints[1] * this.projectedSize[1]);
        this.surfacePos[2] = 1 / (2 * Math.tan(this.fov * 0.5 * Avionics.Utils.DEG2RAD));
        this.perspectiveTransform.set(this.cameraPos, this.planeTransform, this.surfacePos);
    }
    /**
     * Sets this projection's parameters. Parameters not explicitly defined in the parameters argument will be left
     * unchanged.
     * @param parameters The new parameters.
     */
    set(parameters) {
        var _a, _b, _c, _d, _e;
        // save old values
        this.storeParameters(this.oldParameters);
        parameters.position !== undefined && this.position.set(parameters.position);
        this.altitude = (_a = parameters.altitude) !== null && _a !== void 0 ? _a : this.altitude;
        this.heading = (_b = parameters.heading) !== null && _b !== void 0 ? _b : this.heading;
        this.pitch = (_c = parameters.pitch) !== null && _c !== void 0 ? _c : this.pitch;
        this.roll = (_d = parameters.roll) !== null && _d !== void 0 ? _d : this.roll;
        parameters.offset !== undefined && this.offset.set(parameters.offset);
        parameters.projectedSize !== undefined && this.projectedSize.set(parameters.projectedSize);
        this.fov = (_e = parameters.fov) !== null && _e !== void 0 ? _e : this.fov;
        parameters.fovEndpoints !== undefined && this.fovEndpoints.set(parameters.fovEndpoints);
        parameters.projectedOffset !== undefined && this.projectedOffset.set(parameters.projectedOffset);
        let changeFlags = this.computeChangeFlags(this.oldParameters);
        if (changeFlags !== 0) {
            this.recompute();
            changeFlags |= this.computeDerivedChangeFlags(this.oldParameters);
            this.changeEvent.notify(this, changeFlags);
        }
    }
    /**
     * Sets the projection parameters to be applied when `applyQueued()` is called.
     * @param parameters The parameter changes to queue.
     */
    setQueued(parameters) {
        Object.assign(this.queuedParameters, parameters);
        this.updateQueued = true;
    }
    /**
     * Applies the set of queued projection changes, if any are queued.
     */
    applyQueued() {
        if (this.updateQueued) {
            this.updateQueued = false;
            this.set(this.queuedParameters);
            for (const key in this.queuedParameters) {
                delete this.queuedParameters[key];
            }
        }
    }
    /**
     * Stores this projection's current parameters into a record.
     * @param record The record in which to store the parameters.
     */
    storeParameters(record) {
        record.position.set(this.position);
        record.altitude = this.altitude;
        record.heading = this.heading;
        record.pitch = this.pitch;
        record.roll = this.roll;
        record.offset.set(this.offset);
        record.projectedSize.set(this.projectedSize);
        record.fov = this.fov;
        record.fovEndpoints.set(this.fovEndpoints);
        record.scaleFactor = this.scaleFactor;
        record.projectedOffset.set(this.projectedOffset);
        record.offsetCenterProjected.set(this.offsetCenterProjected);
    }
    /**
     * Computes change flags given a set of old parameters.
     * @param oldParameters The old parameters.
     * @returns Change flags based on the specified old parameters.
     */
    computeChangeFlags(oldParameters) {
        return BitFlags.union(oldParameters.position.equals(this.position) ? 0 : HorizonProjectionChangeType.Position, oldParameters.altitude === this.altitude ? 0 : HorizonProjectionChangeType.Altitude, oldParameters.heading === this.heading ? 0 : HorizonProjectionChangeType.Heading, oldParameters.pitch === this.pitch ? 0 : HorizonProjectionChangeType.Pitch, oldParameters.roll === this.roll ? 0 : HorizonProjectionChangeType.Roll, Vec3Math.equals(oldParameters.offset, this.offset) ? 0 : HorizonProjectionChangeType.Offset, Vec2Math.equals(oldParameters.projectedSize, this.projectedSize) ? 0 : HorizonProjectionChangeType.ProjectedSize, oldParameters.fov === this.fov ? 0 : HorizonProjectionChangeType.Fov, VecNMath.equals(oldParameters.fovEndpoints, this.fovEndpoints) ? 0 : HorizonProjectionChangeType.ProjectedOffset, Vec2Math.equals(oldParameters.projectedOffset, this.projectedOffset) ? 0 : HorizonProjectionChangeType.ProjectedOffset);
    }
    /**
     * Computes change flags for derived parameters given a set of old parameters.
     * @param oldParameters The old parameters.
     * @returns Change flags for derived parameters based on the specified old parameters.
     */
    computeDerivedChangeFlags(oldParameters) {
        return BitFlags.union(oldParameters.scaleFactor === this.scaleFactor ? 0 : HorizonProjectionChangeType.ScaleFactor, Vec2Math.equals(oldParameters.offsetCenterProjected, this.offsetCenterProjected) ? 0 : HorizonProjectionChangeType.OffsetCenterProjected);
    }
    /**
     * Subscribes a change listener to this projection. The listener will be called every time this projection changes.
     * A listener can be subscribed multiple times; it will be called once for every time it is registered.
     * @param listener The change listener to subscribe.
     * @returns The new subscription.
     */
    onChange(listener) {
        return this.changeEvent.on(listener);
    }
    /**
     * Projects a point represented by a set of lat/lon coordinates and altitude.
     * @param position The lat/lon coordinates of the point to project.
     * @param altitude The altitude of the point to project, in meters.
     * @param out The 2D vector to which to write the result.
     * @returns The projected point, as `[x, y]` in pixels.
     */
    project(position, altitude, out) {
        const vec = GeoPoint.sphericalToCartesian(position, HorizonProjection.vec3Cache[0]);
        Vec3Math.multScalar(vec, UnitType.GA_RADIAN.convertTo(1, UnitType.METER) + altitude, vec);
        this.positionTransform.apply(vec, vec);
        return this.projectRelativeVec(vec, out);
    }
    /**
     * Projects a point relative to the position of the airplane in spherical space.
     * @param bearing The true bearing of the point to project relative to the airplane, in degrees.
     * @param distance The geodetic horizontal distance from the point to project to the airplane, in meters.
     * @param height The geodetic height of the point to project relative to the airplane, in meters.
     * @param out The 2D vector to which to write the result.
     * @returns The projected point, as `[x, y]` in pixels.
     */
    projectRelativeSpherical(bearing, distance, height, out) {
        return this.project(this.position.offset(bearing, UnitType.METER.convertTo(distance, UnitType.GA_RADIAN), HorizonProjection.geoPointCache[0]), this.altitude + height, out);
    }
    /**
     * Projects a point relative to the position of the airplane in Euclidean space. The coordinate system is defined at
     * the position of the airplane, with the vertical axis perpendicular to the surface of the Earth and the horizontal
     * plane parallel to the Earth's surface at the point directly underneath the airplane.
     * @param bearing The true bearing of the point to project relative to the airplane, in degrees.
     * @param distance The Euclidean horizontal distance from the point to project to the airplane, in meters.
     * @param height The Euclidean height of the point to project relative to the airplane, in meters.
     * @param out The 2D vector to which to write the result.
     * @returns The projected point, as `[x, y]` in pixels.
     */
    projectRelativeEuclidean(bearing, distance, height, out) {
        const vec = Vec2Math.setFromPolar(distance, bearing * Avionics.Utils.DEG2RAD, HorizonProjection.vec3Cache[0]);
        const x = height;
        const y = vec[1];
        const z = vec[0];
        return this.projectRelativeVec(Vec3Math.set(x, y, z, vec), out);
    }
    /**
     * Projects a 3D vector defined relative to the airplane, as `[x, y, z]` in meters with the coordinate system
     * defined as follows for an airplane with heading/roll/pitch of zero degrees:
     * * The positive z axis points in the direction of the airplane.
     * * The positive x axis points directly upward.
     * * The positive y axis points to the right.
     * @param vec The vector to project.
     * @param out The 2D vector to which to write the result.
     * @returns The projected vector.
     */
    projectRelativeVec(vec, out) {
        this.perspectiveTransform.apply(vec, out);
        return Vec2Math.set(out[1] * this.scaleFactor + this.projectedSize[0] / 2 + this.projectedOffset[0], -out[0] * this.scaleFactor + this.projectedSize[1] / 2 + this.projectedOffset[1], out);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    isInProjectedBounds(point, arg2, arg3) {
        let bounds;
        if (point instanceof Float64Array) {
            bounds = arg2;
        }
        else {
            point = this.project(point, arg2, HorizonProjection.vec2Cache[0]);
            bounds = arg3;
        }
        const x = point[0];
        const y = point[1];
        if (!isFinite(x) || !isFinite(y)) {
            return false;
        }
        let left;
        let top;
        let right;
        let bottom;
        if (bounds) {
            left = bounds[0];
            top = bounds[1];
            right = bounds[2];
            bottom = bounds[3];
        }
        else {
            left = 0;
            top = 0;
            right = this.projectedSize[0];
            bottom = this.projectedSize[1];
        }
        return x >= left && x <= right && y >= top && y <= bottom;
    }
}
HorizonProjection.vec2Cache = [Vec2Math.create()];
HorizonProjection.vec3Cache = [Vec3Math.create()];
HorizonProjection.geoPointCache = [new GeoPoint(0, 0)];
