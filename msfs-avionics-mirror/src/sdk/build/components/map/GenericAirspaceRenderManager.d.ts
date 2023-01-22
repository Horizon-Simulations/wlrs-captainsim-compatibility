import { GeoProjection } from '../../geo/GeoProjection';
import { PathStream } from '../../graphics/path/PathStream';
import { LodBoundary } from '../../navigation/LodBoundary';
import { ThrottledTaskQueueHandler, ThrottledTaskQueueProcess } from '../../utils/task/ThrottledTaskQueueProcess';
import { MapAirspaceRenderer } from './MapAirspaceRenderer';
import { MapAirspaceRenderManager } from './MapAirspaceRenderManager';
/**
 * An generic implementation of {@link MapAirspaceRenderManager}.
 */
export declare class GenericAirspaceRenderManager implements MapAirspaceRenderManager {
    private readonly renderOrder;
    private readonly selectRenderer;
    private readonly airspaces;
    /**
     * Constructor.
     * @param renderOrder A function which determines the order in which this manager renders airspaces. The function
     * should return a negative number when airspace `a` should be rendered before (below) airspace `b`, a positive
     * number when airspace `a` should be rendered after (above) airspace `b`, and `0` when the relative render order
     * of the two airspaces does not matter.
     * @param selectRenderer A function which selects airspace renderers for individual airspaces.
     */
    constructor(renderOrder: (a: LodBoundary, b: LodBoundary) => number, selectRenderer: (airspace: LodBoundary) => MapAirspaceRenderer);
    /** @inheritdoc */
    getRegisteredAirspaces(): readonly LodBoundary[];
    /** @inheritdoc */
    registerAirspace(airspace: LodBoundary): boolean;
    /** @inheritdoc */
    deregisterAirspace(airspace: LodBoundary): boolean;
    /** @inheritdoc */
    replaceRegisteredAirspaces(airspaces: Iterable<LodBoundary>): boolean;
    /** @inheritdoc */
    clearRegisteredAirspaces(): boolean;
    /** @inheritdoc */
    prepareRenderProcess(projection: GeoProjection, context: CanvasRenderingContext2D, taskQueueHandler: ThrottledTaskQueueHandler, lod?: number, stream?: PathStream): ThrottledTaskQueueProcess;
}
//# sourceMappingURL=GenericAirspaceRenderManager.d.ts.map