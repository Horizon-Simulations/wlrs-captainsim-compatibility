import { HorizonProjection } from '../HorizonProjection';
import { HorizonCanvasLayer, HorizonCanvasLayerProps } from './HorizonCanvasLayer';
/**
 * A canvas horizon layer whose size and position is synced with the horizon projection window.
 */
export declare class HorizonSyncedCanvasLayer extends HorizonCanvasLayer<HorizonCanvasLayerProps> {
    /** @inheritdoc */
    onAttached(): void;
    /**
     * Updates this layer according to the current size of the horizon projected window.
     * @param projectedSize The size of the horizon projected window.
     */
    private updateFromProjectedSize;
    /** @inheritdoc */
    onMapProjectionChanged(projection: HorizonProjection, changeFlags: number): void;
}
//# sourceMappingURL=HorizonSyncedCanvasLayer.d.ts.map