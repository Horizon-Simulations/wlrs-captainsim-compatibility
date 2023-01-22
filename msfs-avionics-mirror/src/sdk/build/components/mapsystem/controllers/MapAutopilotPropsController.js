import { UnitType } from '../../../math/NumberUnit';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
/**
 * Updates the properties in a {@link MapAutopilotPropsModule}.
 */
export class MapAutopilotPropsController extends MapSystemController {
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param properties The properties to update on the module.
     * @param updateFreq A subscribable which provides the update frequency, in hertz. If not defined, the properties
     * will be updated every frame.
     */
    constructor(context, properties, updateFreq) {
        super(context);
        this.properties = properties;
        this.updateFreq = updateFreq;
        this.module = this.context.model.getModule(MapSystemKeys.AutopilotProps);
        this.subs = {};
    }
    /** @inheritdoc */
    onAfterMapRender() {
        const sub = this.context.bus.getSubscriber();
        if (this.updateFreq) {
            this.updateFreqSub = this.updateFreq.sub(freq => {
                var _a;
                for (const property of this.properties) {
                    (_a = this.subs[property]) === null || _a === void 0 ? void 0 : _a.destroy();
                    this.subs[property] = this.bindProperty(sub, property, freq);
                }
            }, true);
        }
        else {
            for (const property of this.properties) {
                this.subs[property] = this.bindProperty(sub, property);
            }
        }
    }
    /**
     * Binds a module property to data received through the event bus.
     * @param sub The event bus subscriber.
     * @param property The property to bind.
     * @param updateFreq The data update frequency.
     * @returns The subscription created by the binding.
     */
    bindProperty(sub, property, updateFreq) {
        switch (property) {
            case 'selectedAltitude':
                return (updateFreq === undefined ? sub.on('ap_altitude_selected') : sub.on('ap_altitude_selected').atFrequency(updateFreq))
                    .handle(alt => { this.module.selectedAltitude.set(alt, UnitType.FOOT); });
        }
    }
    /** @inheritdoc */
    onMapDestroyed() {
        this.destroy();
    }
    /** @inheritdoc */
    destroy() {
        var _a, _b;
        super.destroy();
        (_a = this.updateFreqSub) === null || _a === void 0 ? void 0 : _a.destroy();
        for (const property of this.properties) {
            (_b = this.subs[property]) === null || _b === void 0 ? void 0 : _b.destroy();
        }
    }
}
