import { KeyInterceptManager } from '../data';
import { SimVarValueType } from '../data/SimVars';
import { UnitType } from '../math';
import { SimVarPublisher } from './BasePublishers';
/** Minimums Modes */
export var MinimumsMode;
(function (MinimumsMode) {
    MinimumsMode[MinimumsMode["OFF"] = 0] = "OFF";
    MinimumsMode[MinimumsMode["BARO"] = 1] = "BARO";
    MinimumsMode[MinimumsMode["RA"] = 2] = "RA";
    MinimumsMode[MinimumsMode["TEMP_COMP_BARO"] = 3] = "TEMP_COMP_BARO";
})(MinimumsMode || (MinimumsMode = {}));
/** A publisher for minimums simvar events. */
export class MinimumsSimVarPublisher extends SimVarPublisher {
    /**
     * @inheritdoc
     */
    constructor(bus) {
        super(MinimumsSimVarPublisher.simvars, bus);
    }
}
MinimumsSimVarPublisher.simvars = new Map([
    ['decision_height_feet', { name: 'DECISION HEIGHT', type: SimVarValueType.Feet }],
    ['decision_altitude_feet', { name: 'DECISION ALTITUDE MSL', type: SimVarValueType.Feet }],
    ['minimums_mode', { name: 'L:WT_MINIMUMS_MODE', type: SimVarValueType.Number }]
]);
/**
 * A class that manages decision height and altitude data and events.
 */
export class MinimumsManager {
    /**
     * Create a MinimumsManager
     * @param bus The event bus
     */
    constructor(bus) {
        this.currentDH = 0;
        this.currentDA = 0;
        this.daDistanceUnit = UnitType.FOOT;
        this.dhDistanceUnit = UnitType.FOOT;
        this.bus = bus;
        this.controlSubscriber = bus.getSubscriber();
        // Initialize both simvars to 0.
        SimVar.SetSimVarValue('K:SET_DECISION_HEIGHT', 'number', 0);
        SimVar.SetSimVarValue('K:SET_DECISION_ALTITUDE_MSL', 'number', 0);
        KeyInterceptManager.getManager(bus).then(manager => {
            manager.interceptKey('INCREASE_DECISION_HEIGHT', false);
            manager.interceptKey('DECREASE_DECISION_HEIGHT', false);
            manager.interceptKey('INCREASE_DECISION_ALTITUDE_MSL', false);
            manager.interceptKey('DECREASE_DECISION_ALTITUDE_MSL', false);
        });
        this.controlSubscriber.on('set_decision_height_feet').handle((dh) => {
            SimVar.SetSimVarValue('K:SET_DECISION_HEIGHT', SimVarValueType.Number, dh);
        });
        this.controlSubscriber.on('set_decision_altitude_feet').handle((da) => {
            SimVar.SetSimVarValue('K:SET_DECISION_ALTITUDE_MSL', SimVarValueType.Number, da);
        });
        this.controlSubscriber.on('set_minimums_mode').handle((mode) => {
            SimVar.SetSimVarValue('L:WT_MINIMUMS_MODE', SimVarValueType.Number, mode);
        });
        this.controlSubscriber.on('set_dh_distance_unit').handle((unit) => {
            this.dhDistanceUnit = unit == 'meters' ? UnitType.METER : UnitType.FOOT;
        });
        this.controlSubscriber.on('set_da_distance_unit').handle((unit) => {
            this.daDistanceUnit = unit == 'meters' ? UnitType.METER : UnitType.FOOT;
        });
        const sub = this.bus.getSubscriber();
        sub.on('key_intercept').handle((evt) => {
            let simvar;
            let curVal;
            let direction = 'up';
            let unit;
            if (evt.value !== undefined) {
                switch (evt.key) {
                    case 'DECREASE_DECISION_HEIGHT':
                        direction = 'down';
                    // eslint-disable-next-line no-fallthrough
                    case 'INCREASE_DECISION_HEIGHT':
                        simvar = 'K:SET_DECISION_HEIGHT';
                        unit = this.dhDistanceUnit;
                        curVal = this.currentDH;
                        break;
                    case 'DECREASE_DECISION_ALTITUDE_MSL':
                        direction = 'down';
                    // eslint-disable-next-line no-fallthrough
                    case 'INCREASE_DECISION_ALTITUDE_MSL':
                        simvar = 'K:SET_DECISION_ALTITUDE_MSL';
                        unit = this.daDistanceUnit;
                        curVal = this.currentDA;
                        break;
                }
                if (simvar !== undefined && curVal !== undefined && unit !== undefined) {
                    // There is one flaw in this logic, but I'm not sure what can be done about
                    // it.  You can set the inc/dec amount via the K event in feet or meters.
                    // If your user preference unit is one, but the simvar call uses the other,
                    // we have now way of knowing  about it so will force a conversion that's not
                    // needed.This is a fairly minor flaw, but worth acknowledging until a
                    // workaround can be found.
                    const increment = unit.convertTo(evt.value, UnitType.FOOT) * (direction == 'down' ? -1 : 1);
                    SimVar.SetSimVarValue(simvar, 'number', curVal + increment);
                }
            }
        });
    }
}
