import { GeoPointInterface } from '../../geo/GeoPoint';
import { ReadonlySubEvent, SubEvent } from '../../sub/SubEvent';
import { Subscribable } from '../../sub/Subscribable';
import { MapProjection } from './MapProjection';
import { MapLocationTextLabel, MapLocationTextLabelOptions, MapTextLabel } from './MapTextLabel';
/**
 * A map text label which can be culled to prevent collision with other labels.
 */
export interface MapCullableTextLabel extends MapTextLabel {
    /** Whether this label is immune to culling. */
    readonly alwaysShow: Subscribable<boolean>;
    /** The bounding box of this label. */
    readonly bounds: Float64Array;
    /** An invalidation event. */
    readonly invalidation: ReadonlySubEvent<this, void>;
    /**
     * Updates this label's bounding box.
     * @param mapProjection The map projection to use.
     */
    updateBounds(mapProjection: MapProjection): void;
}
/**
 * A cullable text label associated with a specific geographic location.
 */
export declare class MapCullableLocationTextLabel extends MapLocationTextLabel implements MapCullableTextLabel {
    /** @inheritdoc */
    readonly alwaysShow: Subscribable<boolean>;
    /** @inheritdoc */
    readonly bounds: Float64Array;
    /** @inheritdoc */
    readonly invalidation: SubEvent<this, void>;
    private readonly subs;
    /**
     * Constructor.
     * @param text The text of this label, or a subscribable which provides it.
     * @param priority The priority of this label, or a subscribable which provides it.
     * @param location The geographic location of this label, or a subscribable which provides it.
     * @param alwaysShow Whether this label is immune to culling, or a subscribable which provides it.
     * @param options Options with which to initialize this label.
     */
    constructor(text: string | Subscribable<string>, priority: number | Subscribable<number>, location: GeoPointInterface | Subscribable<GeoPointInterface>, alwaysShow: boolean | Subscribable<boolean>, options?: MapLocationTextLabelOptions);
    /** @inheritdoc */
    updateBounds(mapProjection: MapProjection): void;
    /**
     * Destroys this label.
     */
    destroy(): void;
}
/**
 * Manages a set of MapCullableTextLabels. Colliding labels will be culled based on their render priority. Labels with
 * lower priorities will be culled before labels with higher priorities.
 */
export declare class MapCullableTextLabelManager {
    private cullingEnabled;
    private static readonly SCALE_UPDATE_THRESHOLD;
    private static readonly ROTATION_UPDATE_THRESHOLD;
    private static readonly SORT_FUNC;
    private readonly registered;
    private _visibleLabels;
    /** An array of labels registered with this manager that are visible. */
    get visibleLabels(): readonly MapCullableTextLabel[];
    private needUpdate;
    private lastScaleFactor;
    private lastRotation;
    private readonly invalidationHandler;
    /**
     * Creates an instance of the MapCullableTextLabelManager.
     * @param cullingEnabled Whether or not culling of labels is enabled.
     */
    constructor(cullingEnabled?: boolean);
    /**
     * Registers a label with this manager. Newly registered labels will be processed with the next manager update.
     * @param label The label to register.
     */
    register(label: MapCullableTextLabel): void;
    /**
     * Deregisters a label with this manager. Newly deregistered labels will be processed with the next manager update.
     * @param label The label to deregister.
     */
    deregister(label: MapCullableTextLabel): void;
    /**
     * Sets whether or not text label culling is enabled.
     * @param enabled Whether or not culling is enabled.
     */
    setCullingEnabled(enabled: boolean): void;
    /**
     * Updates this manager.
     * @param mapProjection The projection of the map to which this manager's labels are to be drawn.
     */
    update(mapProjection: MapProjection): void;
    /**
     * Checks if two bounding boxes collide.
     * @param a The first bounding box, as a 4-tuple [left, top, right, bottom].
     * @param b The second bounding box, as a 4-tuple [left, top, right, bottom].
     * @returns whether the bounding boxes collide.
     */
    private static doesCollide;
}
//# sourceMappingURL=MapCullableTextLabel.d.ts.map