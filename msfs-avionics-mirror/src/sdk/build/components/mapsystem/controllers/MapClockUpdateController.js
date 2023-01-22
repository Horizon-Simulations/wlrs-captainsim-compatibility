import { MapSystemController } from '../MapSystemController';
/**
 * Updates a map at regular intervals based on event bus clock events.
 */
export class MapClockUpdateController extends MapSystemController {
    /** @inheritdoc */
    onAfterMapRender(ref) {
        this.freqSub = this.context.updateFreq.sub(freq => {
            var _a;
            (_a = this.clockSub) === null || _a === void 0 ? void 0 : _a.destroy();
            this.clockSub = this.context.bus.getSubscriber().on('realTime').atFrequency(freq).handle(realTime => {
                ref.update(realTime);
            });
        }, true);
    }
    /** @inheritdoc */
    onMapDestroyed() {
        this.destroy();
    }
    /** @inheritdoc */
    destroy() {
        var _a, _b;
        super.destroy();
        (_a = this.clockSub) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.freqSub) === null || _b === void 0 ? void 0 : _b.destroy();
    }
}
