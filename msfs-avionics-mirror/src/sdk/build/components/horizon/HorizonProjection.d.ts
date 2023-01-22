import { LatLonInterface } from '../../geo';
import { GeoPointReadOnly } from '../../geo/GeoPoint';
import { ReadonlyFloat64Array } from '../../math/VecMath';
import { Subscription } from '../../sub/Subscription';
/**
 * A parameter object for HorizonProjection.
 */
export declare type HorizonProjectionParameters = {
    /** The position of the airplane. */
    readonly position?: LatLonInterface;
    /** The altitude of the airplane, in meters above mean sea level. */
    readonly altitude?: number;
    /** The true heading of the airplane, in degrees. */
    readonly heading?: number;
    /** The pitch of the airplane, in degrees. */
    readonly pitch?: number;
    /** The roll of the airplane, in degrees. */
    readonly roll?: number;
    /**
     * The offset of the projection camera relative to the airplane, as `[x, y, z]` in meters using the airplane's
     * coordinate system. The positive z axis points in the forward direction of the airplane, the positive x axis points
     * in the upward direction, and the positive y axis points to the right.
     */
    readonly offset?: ReadonlyFloat64Array;
    /** The size of the projected window, as `[x, y]` in pixels. */
    readonly projectedSize?: ReadonlyFloat64Array;
    /** The field of view, in degrees. */
    readonly fov?: number;
    /**
     * The projected endpoints at which to measure the field of view, as `[x1, y1, x2, y2]`, with each component
     * expressed relative to the width or height of the projected window.
     */
    readonly fovEndpoints?: ReadonlyFloat64Array;
    /** The offset of the center of the projection, as `[x, y]` in pixels. */
    readonly projectedOffset?: ReadonlyFloat64Array;
};
/**
 * The different types of horizon projection changes.
 */
export declare enum HorizonProjectionChangeType {
    Position = 1,
    Altitude = 2,
    Heading = 4,
    Pitch = 8,
    Roll = 16,
    Offset = 32,
    ProjectedSize = 64,
    Fov = 128,
    FovEndpoints = 256,
    ScaleFactor = 512,
    ProjectedOffset = 1024,
    OffsetCenterProjected = 2048
}
/**
 * A change listener callback for a HorizonProjection.
 */
export interface HorizonProjectionChangeListener {
    (source: HorizonProjection, changeFlags: number): void;
}
/**
 * A perspective projection from the point of view of an airplane.
 */
export declare class HorizonProjection {
    private static readonly vec2Cache;
    private static readonly vec3Cache;
    private static readonly geoPointCache;
    private readonly position;
    private altitude;
    private heading;
    private roll;
    private pitch;
    private readonly offset;
    private readonly projectedSize;
    private fov;
    private readonly fovEndpoints;
    private scaleFactor;
    private readonly projectedOffset;
    private readonly offsetCenterProjected;
    private readonly positionAngleTransforms;
    private readonly altitudeTransform;
    private readonly positionAltitudeTransforms;
    private readonly positionTransform;
    private readonly planeAngles;
    private readonly planeAngleTransforms;
    private readonly planeTransform;
    private readonly cameraPos;
    private readonly surfacePos;
    private readonly perspectiveTransform;
    private readonly oldParameters;
    private readonly queuedParameters;
    private updateQueued;
    private readonly changeEvent;
    /**
     * Constructor.
     * @param projectedWidth The initial projected width of the projection, in pixels.
     * @param projectedHeight The initial projected height of the projection, in pixels.
     * @param fov The initial field of view of the projection, in degrees.
     */
    constructor(projectedWidth: number, projectedHeight: number, fov: number);
    /**
     * Gets the position of this projection.
     * @returns The position of this projection.
     */
    getPosition(): GeoPointReadOnly;
    /**
     * Gets the altitude of this projection, in meters above mean sea level.
     * @returns The altitude of this projection, in meters above mean sea level.
     */
    getAltitude(): number;
    /**
     * Gets the true heading of this projection, in degrees.
     * @returns The true heading of this projection, in degrees.
     */
    getHeading(): number;
    /**
     * Gets the pitch of this projection, in degrees.
     * @returns The pitch of this projection, in degrees.
     */
    getPitch(): number;
    /**
     * Gets the roll of this projection, in degrees.
     * @returns The roll of this projection, in degrees.
     */
    getRoll(): number;
    /**
     * Gets the size of the projected window, as `[width, height]` in pixels.
     * @returns The size of the projected window, as `[width, height]` in pixels.
     */
    getProjectedSize(): ReadonlyFloat64Array;
    /**
     * Gets the field of view of this projection, in degrees.
     * @returns The field of view of this projection, in degrees.
     */
    getFov(): number;
    /**
     * Gets the projected endpoints at which the field of view is measured, as `[x1, y1, x2, y2]`, with each component
     * expressed relative to the width or height of the projected window.
     * @returns The projected endpoints at which the field of view is measured, as `[x1, y1, x2, y2]`, with each
     * component expressed relative to the width or height of the projected window.
     */
    getFovEndpoints(): ReadonlyFloat64Array;
    /**
     * Gets the focal length of this projection, in meters. The focal length is set such that one meter at a distance
     * from the camera equal to the focal length subtends an angle equal to the field of view.
     * @returns The focal length of this projection, in meters.
     */
    getFocalLength(): number;
    /**
     * Gets the nominal scale factor of this projection. At a distance from the camera equal to the focal length, one
     * meter will be projected to a number of pixels equal to the nominal scale factor.
     * @returns The nominal scale factor of this projection.
     */
    getScaleFactor(): number;
    /**
     * Gets the projected offset of this projection's center, as `[x, y]` in pixels.
     * @returns The projected offset of this projection's center, as `[x, y]` in pixels.
     */
    getProjectedOffset(): ReadonlyFloat64Array;
    /**
     * Gets the projected center of this projection, including offset, as `[x, y]` in pixels.
     * @returns The projected center of this projection, including offset, as `[x, y]` in pixels.
     */
    getOffsetCenterProjected(): ReadonlyFloat64Array;
    /**
     * Recomputes this projection's computed parameters.
     */
    private recompute;
    /**
     * Sets this projection's parameters. Parameters not explicitly defined in the parameters argument will be left
     * unchanged.
     * @param parameters The new parameters.
     */
    set(parameters: HorizonProjectionParameters): void;
    /**
     * Sets the projection parameters to be applied when `applyQueued()` is called.
     * @param parameters The parameter changes to queue.
     */
    setQueued(parameters: HorizonProjectionParameters): void;
    /**
     * Applies the set of queued projection changes, if any are queued.
     */
    applyQueued(): void;
    /**
     * Stores this projection's current parameters into a record.
     * @param record The record in which to store the parameters.
     */
    private storeParameters;
    /**
     * Computes change flags given a set of old parameters.
     * @param oldParameters The old parameters.
     * @returns Change flags based on the specified old parameters.
     */
    private computeChangeFlags;
    /**
     * Computes change flags for derived parameters given a set of old parameters.
     * @param oldParameters The old parameters.
     * @returns Change flags for derived parameters based on the specified old parameters.
     */
    private computeDerivedChangeFlags;
    /**
     * Subscribes a change listener to this projection. The listener will be called every time this projection changes.
     * A listener can be subscribed multiple times; it will be called once for every time it is registered.
     * @param listener The change listener to subscribe.
     * @returns The new subscription.
     */
    onChange(listener: HorizonProjectionChangeListener): Subscription;
    /**
     * Projects a point represented by a set of lat/lon coordinates and altitude.
     * @param position The lat/lon coordinates of the point to project.
     * @param altitude The altitude of the point to project, in meters.
     * @param out The 2D vector to which to write the result.
     * @returns The projected point, as `[x, y]` in pixels.
     */
    project(position: LatLonInterface, altitude: number, out: Float64Array): Float64Array;
    /**
     * Projects a point relative to the position of the airplane in spherical space.
     * @param bearing The true bearing of the point to project relative to the airplane, in degrees.
     * @param distance The geodetic horizontal distance from the point to project to the airplane, in meters.
     * @param height The geodetic height of the point to project relative to the airplane, in meters.
     * @param out The 2D vector to which to write the result.
     * @returns The projected point, as `[x, y]` in pixels.
     */
    projectRelativeSpherical(bearing: number, distance: number, height: number, out: Float64Array): Float64Array;
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
    projectRelativeEuclidean(bearing: number, distance: number, height: number, out: Float64Array): Float64Array;
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
    private projectRelativeVec;
    /**
     * Checks whether a point falls within certain projected bounds.
     * @param point The lat/lon coordinates of the point to check.
     * @param altitude The altitude of the point to check, in meters.
     * @param bounds The bounds to check against, expressed as `[left, top, right, bottom]` in pixels. Defaults to the
     * bounds of the projected window.
     * @returns Whether the point falls within the projected bounds.
     */
    isInProjectedBounds(point: LatLonInterface, altitude: number, bounds?: ReadonlyFloat64Array): boolean;
    /**
     * Checks whether a projected point falls within certain projected bounds.
     * @param point The projected point to check, as `[x, y]` in pixels.
     * @param bounds The bounds to check against, expressed as `[left, top, right, bottom]` in pixels. Defaults to the
     * bounds of the projected window.
     * @returns Whether the point falls within the projected bounds.
     */
    isInProjectedBounds(point: ReadonlyFloat64Array, bounds?: ReadonlyFloat64Array): boolean;
}
//# sourceMappingURL=HorizonProjection.d.ts.map