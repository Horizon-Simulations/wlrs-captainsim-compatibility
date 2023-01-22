import { Subscribable } from '../../../sub/Subscribable';
import { MapSystemComponent } from '../MapSystemComponent';
import { MapSystemController } from '../MapSystemController';
/**
 * Context values required for MapClockUpdateController.
 */
export interface MapClockUpdateControllerContext {
    /** The map update frequency. */
    updateFreq: Subscribable<number>;
}
/**
 * Updates a map at regular intervals based on event bus clock events.
 */
export declare class MapClockUpdateController extends MapSystemController<any, any, any, MapClockUpdateControllerContext> {
    private freqSub?;
    private clockSub?;
    /** @inheritdoc */
    onAfterMapRender(ref: MapSystemComponent): void;
    /** @inheritdoc */
    onMapDestroyed(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MapClockUpdateController.d.ts.map