import { UnitType } from '../../../math/NumberUnit';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
/**
 * Updates the properties in a {@link MapOwnAirplanePropsModule}.
 */
export class MapOwnAirplanePropsController extends MapSystemController {
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param properties The properties to update on the module.
     * @param updateFreq A subscribable which provides the update frequency, in hertz.
     */
    constructor(context, properties, updateFreq) {
        super(context);
        this.properties = properties;
        this.updateFreq = updateFreq;
        this.module = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps);
        this.subs = {};
    }
    /** @inheritdoc */
    onAfterMapRender() {
        const sub = this.context.bus.getSubscriber();
        this.updateFreqSub = this.updateFreq.sub(freq => {
            var _a;
            for (const property of this.properties) {
                (_a = this.subs[property]) === null || _a === void 0 ? void 0 : _a.destroy();
                this.subs[property] = this.bindProperty(sub, property, freq);
            }
        }, true);
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
            case 'position':
                return sub.on('gps-position').atFrequency(updateFreq).handle(lla => { this.module.position.set(lla.lat, lla.long); });
            case 'altitude':
                return sub.on('indicated_alt').atFrequency(updateFreq).handle(alt => { this.module.altitude.set(alt, UnitType.FOOT); });
            case 'groundSpeed':
                return sub.on('ground_speed').atFrequency(updateFreq).handle(gs => { this.module.groundSpeed.set(gs, UnitType.KNOT); });
            case 'hdgTrue':
                return sub.on('hdg_deg_true').atFrequency(updateFreq).handle(hdg => { this.module.hdgTrue.set(hdg); });
            case 'trackTrue':
                return sub.on('track_deg_true').atFrequency(updateFreq).handle(track => { this.module.trackTrue.set(track); });
            case 'verticalSpeed':
                return sub.on('vertical_speed').atFrequency(updateFreq).handle(vs => { this.module.verticalSpeed.set(vs, UnitType.FPM); });
            case 'turnRate':
                return sub.on('delta_heading_rate').atFrequency(updateFreq).handle(turnRate => { this.module.turnRate.set(turnRate); });
            case 'isOnGround':
                return sub.on('on_ground').atFrequency(updateFreq).handle(isOnGround => { this.module.isOnGround.set(isOnGround); });
            case 'magVar':
                return sub.on('magvar').atFrequency(updateFreq).handle(magVar => { this.module.magVar.set(magVar); });
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
