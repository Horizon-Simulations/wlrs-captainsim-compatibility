import { VerticalMode } from '@shared/autopilot';
import { AimsFlightPhase, getAutopilotVerticalMode, isAllEngineOn, isAnEngineOn, isOnGround, conditionTakeOff } from '@shared/flightphase';
import { ConfirmationNode } from '@shared/logic';

export abstract class Phase {
    // eslint-disable-next-line no-empty-function
    init(): void { /* prototype function */ }

    abstract shouldActivateNextPhase(time: any): boolean;

    nextPhase: AimsFlightPhase;
}

export class PreFlightPhase extends Phase {
    takeoffConfirmation = new ConfirmationNode(0.2 * 1000);

    init() {
        this.nextPhase = AimsFlightPhase.Takeoff;
    }

    shouldActivateNextPhase(_deltaTime) {
        this.takeoffConfirmation.input = conditionTakeOff();
        this.takeoffConfirmation.update(_deltaTime);
        return this.takeoffConfirmation.output;
    }
}

export class TakeOffPhase extends Phase {
    accelerationAltitudeMsl: number;

    accelerationAltitudeMslEo: number;

    init() {
        this.nextPhase = AimsFlightPhase.Climb;
        SimVar.SetSimVarValue('L:B77HS_COLD_AND_DARK_SPAWN', 'Bool', false);
        const accAlt = SimVar.GetSimVarValue('L:AIRLINER_ACC_ALT', 'Number');
        const thrRedAlt = SimVar.GetSimVarValue('L:AIRLINER_THR_RED_ALT', 'Number');
        this.accelerationAltitudeMsl = accAlt || thrRedAlt;
        this.accelerationAltitudeMslEo = SimVar.GetSimVarValue('L:B77HS_ENG_OUT_ACC_ALT', 'feet');
    }

    shouldActivateNextPhase(_deltaTime) {
        return Simplane.getAltitude() > (isAllEngineOn() ? this.accelerationAltitudeMsl : this.accelerationAltitudeMslEo);
    }
}

export class ClimbPhase extends Phase {
    init() {
        this.nextPhase = AimsFlightPhase.Cruise;
    }

    shouldActivateNextPhase(_deltaTime) {
        const cruiseFl = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number') / 100;
        const fl = Math.round(SimVar.GetSimVarValue('INDICATED ALTITUDE:3', 'feet') / 100);
        return fl >= cruiseFl;
    }
}

export class CruisePhase extends Phase {
    init() {
        // switch out of cruise phase is handled in FlightPhaseManager
        this.nextPhase = AimsFlightPhase.Cruise;
    }

    shouldActivateNextPhase(_deltaTime) {
        return false;
    }
}

export class DescentPhase extends Phase {
    init() {
        this.nextPhase = AimsFlightPhase.Approach;
    }

    shouldActivateNextPhase(_deltaTime) {
        const fl = Math.round(SimVar.GetSimVarValue('INDICATED ALTITUDE:3', 'feet') / 100);
        const fcuSelFl = Simplane.getAutoPilotDisplayedAltitudeLockValue('feet') / 100;
        const cruiseFl = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number') / 100;

        if (fl === cruiseFl && fcuSelFl === fl) {
            this.nextPhase = AimsFlightPhase.Cruise;
            return true;
        }

        // APPROACH phase from DECEL pseudo waypoint case. This is decided by the new TS FMS.
        return !!SimVar.GetSimVarValue('L:B77HS_FM_ENABLE_APPROACH_PHASE', 'Bool');
    }
}

export class ApproachPhase extends Phase {
    landingConfirmation = new ConfirmationNode(30 * 1000);

    init() {
        SimVar.SetSimVarValue('L:AIRLINER_TO_FLEX_TEMP', 'Number', 0);
        this.nextPhase = AimsFlightPhase.Done;
    }

    shouldActivateNextPhase(_deltaTime) {
        if (getAutopilotVerticalMode() === VerticalMode.SRS_GA) {
            this.nextPhase = AimsFlightPhase.GoAround;
            return true;
        }

        this.landingConfirmation.input = isOnGround();
        this.landingConfirmation.update(_deltaTime);
        return this.landingConfirmation.output || !isAnEngineOn();
    }
}

export class GoAroundPhase extends Phase {
    init() {
        SimVar.SetSimVarValue('L:AIRLINER_TO_FLEX_TEMP', 'Number', 0);
        this.nextPhase = AimsFlightPhase.GoAround;
    }

    shouldActivateNextPhase(_deltaTime) {
        // there is no automatic switch from this phase
        return false;
    }
}

export class DonePhase extends Phase {
    init() {
        SimVar.SetSimVarValue('L:AIRLINER_TO_FLEX_TEMP', 'Number', 0);
        this.nextPhase = AimsFlightPhase.Done;
    }

    shouldActivateNextPhase(_deltaTime) {
        // there is no automatic switch from this phase
        return false;
    }
}
