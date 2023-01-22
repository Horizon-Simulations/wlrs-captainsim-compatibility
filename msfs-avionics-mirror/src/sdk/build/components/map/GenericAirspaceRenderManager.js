import { ArrayTaskQueue } from '../../utils/task/TaskQueue';
import { ThrottledTaskQueueProcess } from '../../utils/task/ThrottledTaskQueueProcess';
/**
 * An generic implementation of {@link MapAirspaceRenderManager}.
 */
export class GenericAirspaceRenderManager {
    /**
     * Constructor.
     * @param renderOrder A function which determines the order in which this manager renders airspaces. The function
     * should return a negative number when airspace `a` should be rendered before (below) airspace `b`, a positive
     * number when airspace `a` should be rendered after (above) airspace `b`, and `0` when the relative render order
     * of the two airspaces does not matter.
     * @param selectRenderer A function which selects airspace renderers for individual airspaces.
     */
    constructor(renderOrder, selectRenderer) {
        this.renderOrder = renderOrder;
        this.selectRenderer = selectRenderer;
        this.airspaces = new Map();
    }
    /** @inheritdoc */
    getRegisteredAirspaces() {
        return Array.from(this.airspaces.values());
    }
    /** @inheritdoc */
    registerAirspace(airspace) {
        if (this.airspaces.has(airspace.facility.id)) {
            return false;
        }
        this.airspaces.set(airspace.facility.id, airspace);
        return true;
    }
    /** @inheritdoc */
    deregisterAirspace(airspace) {
        return this.airspaces.delete(airspace.facility.id);
    }
    /** @inheritdoc */
    replaceRegisteredAirspaces(airspaces) {
        let changed = false;
        let numMatched = 0;
        for (const airspace of airspaces) {
            changed || (changed = !this.airspaces.has(airspace.facility.id));
            if (changed) {
                break;
            }
            else {
                numMatched++;
            }
        }
        changed || (changed = numMatched !== this.airspaces.size);
        if (!changed) {
            return false;
        }
        this.airspaces.clear();
        for (const airspace of airspaces) {
            this.registerAirspace(airspace);
        }
        return true;
    }
    /** @inheritdoc */
    clearRegisteredAirspaces() {
        if (this.airspaces.size === 0) {
            return false;
        }
        this.airspaces.clear();
        return true;
    }
    /** @inheritdoc */
    prepareRenderProcess(projection, context, taskQueueHandler, lod = 0, stream) {
        const sorted = Array.from(this.airspaces.values()).sort(this.renderOrder);
        const tasks = sorted.map(airspace => {
            const renderer = this.selectRenderer(airspace);
            // The explicit cast is to avoid a bogus typescript error
            return renderer.render.bind(renderer, airspace, projection, context, lod, stream);
        });
        return new ThrottledTaskQueueProcess(new ArrayTaskQueue(tasks), taskQueueHandler);
    }
}
