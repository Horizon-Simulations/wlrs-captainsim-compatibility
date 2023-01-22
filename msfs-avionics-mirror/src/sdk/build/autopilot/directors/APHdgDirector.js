/// <reference types="msfstypes/JS/simvar" />
import { NavMath } from '../../geo';
import { LinearServo } from '../../utils/controllers';
import { DirectorState } from './PlaneDirector';
/**
 * A heading autopilot director.
 */
export class APHdgDirector {
    /**
     * Creates an instance of the LateralDirector.
     * @param bus The event bus to use with this instance.
     * @param apValues The AP Values from the Autopilot.
     */
    constructor(bus, apValues) {
        this.bus = bus;
        this.apValues = apValues;
        this.currentBankRef = 0;
        this.currentHeading = 0;
        this.bankServo = new LinearServo(10);
        this.state = DirectorState.Inactive;
        const ahrs = this.bus.getSubscriber();
        ahrs.on('hdg_deg').withPrecision(0).handle((h) => {
            this.currentHeading = h;
        });
    }
    /**
     * Activates this director.
     */
    activate() {
        if (this.onActivate !== undefined) {
            this.onActivate();
        }
        SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', true);
        this.state = DirectorState.Active;
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
    async deactivate() {
        await SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', false);
        this.state = DirectorState.Inactive;
    }
    /**
     * Updates this director.
     */
    update() {
        if (this.state === DirectorState.Active) {
            // let bankAngle = this.desiredBank(NavMath.normalizeHeading(this.dtk + interceptAngle), this.xtk);
            this.setBank(this.desiredBank(this.apValues.selectedHeading.get()));
        }
    }
    /**
     * Gets a desired bank from a Target Selected Heading.
     * @param targetHeading The target heading.
     * @returns The desired bank angle.
     */
    desiredBank(targetHeading) {
        const turnDirection = NavMath.getTurnDirection(this.currentHeading, targetHeading);
        const headingDiff = Math.abs(NavMath.diffAngle(this.currentHeading, targetHeading));
        let baseBank = Math.min(1.25 * headingDiff, this.apValues.maxBankAngle.get());
        baseBank *= (turnDirection === 'left' ? 1 : -1);
        return baseBank;
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
