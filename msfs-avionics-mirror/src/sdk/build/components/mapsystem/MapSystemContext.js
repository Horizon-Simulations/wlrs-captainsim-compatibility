import { MapModel } from '../map/MapModel';
/**
 * An implementation of the base properties in {@link MapSystemContext}.
 */
export class DefaultMapSystemContext {
    /**
     * Creates an instance of a MapSystemContext.
     * @param bus This context's event bus.
     * @param projection This context's map projection.
     * @param projectedSize A subscribable which provides the projected size of this context's map.
     * @param deadZone A subscribable which provides the dead zone of this context's map.
     */
    constructor(bus, projection, projectedSize, deadZone) {
        this.bus = bus;
        this.projection = projection;
        this.projectedSize = projectedSize;
        this.deadZone = deadZone;
        /** This context's map model. */
        this.model = new MapModel();
        this.layers = new Map();
        this.controllers = new Map();
    }
    /**
     * Retrieves a layer from this context.
     * @param key The key of the layer to retrieve.
     * @returns The layer in this context with the specified key.
     */
    getLayer(key) {
        return this.layers.get(key);
    }
    /**
     * Retrieves a controller from this context.
     * @param key The key fo the controller to retrieve.
     * @returns The controller in this context with the specified key.
     */
    getController(key) {
        return this.controllers.get(key);
    }
    /**
     * Adds a layer to this context.
     * @param key The key of the layer to add.
     * @param layer The layer to add.
     */
    setLayer(key, layer) {
        this.layers.set(key, layer);
    }
    /**
     * Adds a controller to this context.
     * @param key The key of the controller to add.
     * @param controller The controller to add.
     */
    setController(key, controller) {
        this.controllers.set(key, controller);
    }
}
