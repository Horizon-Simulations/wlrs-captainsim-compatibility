/// <reference types="msfstypes/JS/simvar" />
import { MathUtils } from '../../math';
import { LinearServo } from '../../utils/controllers';
import { DirectorState } from './PlaneDirector';
/**
 * An autopilot roll director.
 */
export class APRollDirector {
    /**
     * Creates an instance of the LateralDirector.
     * @param bus The event bus to use with this instance.
     * @param apValues The AP Values.
     * @param options Options to set on the roll director for bank angle limitations.
     */
    constructor(bus, apValues, options) {
        this.bus = bus;
        this.apValues = apValues;
        this.options = options;
        this.currentBankRef = 0;
        this.desiredBank = 0;
        this.actualBank = 0;
        this.bankServo = new LinearServo(10);
        this.state = DirectorState.Inactive;
        const sub = this.bus.getSubscriber();
        sub.on('roll_deg').withPrecision(1).handle((roll) => {
            this.actualBank = roll;
        });
    }
    /**
     * Activates this director.
     */
    activate() {
        var _a, _b, _c, _d;
        this.state = DirectorState.Active;
        const maxBank = Math.min((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.maximumBankAngle) !== null && _b !== void 0 ? _b : 90, this.apValues.maxBankAngle.get());
        const minBank = (_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.minimumBankAngle) !== null && _d !== void 0 ? _d : 0;
        if (Math.abs(this.actualBank) < minBank) {
            this.desiredBank = 0;
        }
        else {
            this.desiredBank = MathUtils.clamp(this.actualBank, -maxBank, maxBank);
        }
        if (this.onActivate !== undefined) {
            this.onActivate();
        }
        SimVar.SetSimVarValue('AUTOPILOT BANK HOLD', 'Bool', true);
    }
    /**
     * Arms this director.
     * This director has no armed mode, so it activates immediately.
     */
    arm() {
        if (this.state == DirectorState.Inactive) {
            this.activate();
        }
    }
    /**
     * Deactivates this director.
     */
    deactivate() {
        this.state = DirectorState.Inactive;
        this.desiredBank = 0;
        SimVar.SetSimVarValue('AUTOPILOT BANK HOLD', 'Bool', false);
    }
    /**
     * Updates this director.
     */
    update() {
        if (this.state === DirectorState.Active) {
            this.setBank(this.desiredBank);
        }
    }
    /**
     * Sets the desired AP bank angle.
     * @param bankAngle The desired AP bank angle.
     */
    setBank(bankAngle) {
        if (isFinite(bankAngle)) {
            this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
            SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
        }
    }
}
