import { Phase, PreFlightPhase, TakeOffPhase, ClimbPhase, CruisePhase, DescentPhase, ApproachPhase, GoAroundPhase, DonePhase } from '@aims/flightphase/Phase';
import { VerticalMode } from '@shared/autopilot';
import { AimsFlightPhase, isAnEngineOn, isOnGround, isReady, isSlewActive } from '@shared/flightphase';
import { ConfirmationNode } from '@shared/logic';

function canInitiateDes(distanceToDestination: number): boolean {
    const fl = Math.round(Simplane.getAltitude() / 100);
    const fcuSelFl = Simplane.getAutoPilotDisplayedAltitudeLockValue('feet') / 100;
    const cruiseFl = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number') / 100;

    // Can initiate descent? OR Can initiate early descent?
    return ((distanceToDestination < 200 || fl < 200) && fcuSelFl < cruiseFl && fcuSelFl < fl)
        || (distanceToDestination >= 200 && fl > 200 && fcuSelFl <= 200);
}

export class FlightPhaseManager {
    private onGroundConfirmationNode = new ConfirmationNode(30 * 1000);

    private activePhase: AimsFlightPhase = this.initialPhase || AimsFlightPhase.Preflight;

    private phases: { [key in AimsFlightPhase]: Phase } = {
        [AimsFlightPhase.Preflight]: new PreFlightPhase(),
        [AimsFlightPhase.Takeoff]: new TakeOffPhase(),
        [AimsFlightPhase.Climb]: new ClimbPhase(),
        [AimsFlightPhase.Cruise]: new CruisePhase(),
        [AimsFlightPhase.Descent]: new DescentPhase(),
        [AimsFlightPhase.Approach]: new ApproachPhase(),
        [AimsFlightPhase.GoAround]: new GoAroundPhase(),
        [AimsFlightPhase.Done]: new DonePhase(),
    }

    private phaseChangeListeners: Array<(prev: AimsFlightPhase, next: AimsFlightPhase) => void> = [];

    get phase() {
        return this.activePhase;
    }

    get initialPhase() {
        return SimVar.GetSimVarValue('L:B77HS_INITIAL_FLIGHT_PHASE', 'number');
    }

    init(): void {
        console.log(`Aims Flight Phase: ${this.phase}`);
        this.phases[this.phase].init();
        this.changePhase(this.activePhase);
    }

    shouldActivateNextPhase(_deltaTime: number): void {
        // process transitions only when plane is ready
        if (isReady() && !isSlewActive()) {
            if (this.shouldActivateDonePhase(_deltaTime)) {
                this.changePhase(AimsFlightPhase.Done);
            } else if (this.phases[this.phase].shouldActivateNextPhase(_deltaTime)) {
                this.changePhase(this.phases[this.phase].nextPhase);
            }
        } else if (isReady() && isSlewActive()) {
            this.handleSlewSituation(_deltaTime);
        } else if (this.activePhase !== this.initialPhase) {
            // ensure correct init of phase
            this.activePhase = this.initialPhase;
            this.changePhase(this.initialPhase);
        }
    }

    addOnPhaseChanged(cb: (prev: AimsFlightPhase, next: AimsFlightPhase) => void): void {
        this.phaseChangeListeners.push(cb);
    }

    handleFcuAltKnobPushPull(distanceToDestination: number): void {
        switch (this.phase) {
        case AimsFlightPhase.Takeoff:
            this.changePhase(AimsFlightPhase.Climb);
            break;
        case AimsFlightPhase.Climb:
        case AimsFlightPhase.Cruise:
            if (canInitiateDes(distanceToDestination)) {
                this.changePhase(AimsFlightPhase.Descent);
            }
            break;
        default:
        }
    }

    handleFcuAltKnobTurn(distanceToDestination: number): void {
        if (this.phase === AimsFlightPhase.Cruise) {
            const activeVerticalMode = SimVar.GetSimVarValue('L:B77HS_FMA_VERTICAL_MODE', 'Enum');
            const VS = SimVar.GetSimVarValue('L:B77HS_AUTOPILOT_VS_SELECTED', 'feet per minute');
            const FPA = SimVar.GetSimVarValue('L:B77HS_AUTOPILOT_FPA_SELECTED', 'Degrees');
            if (
                (activeVerticalMode === VerticalMode.OP_DES
                     || (activeVerticalMode === VerticalMode.VS && VS < 0)
                     || (activeVerticalMode === VerticalMode.FPA && FPA < 0)
                     || activeVerticalMode === VerticalMode.DES)
                && canInitiateDes(distanceToDestination)) {
                this.changePhase(AimsFlightPhase.Descent);
            }
        }
    }

    handleFcuVSKnob(distanceToDestination: number, onStepClimbDescent: () => void): void {
        if (this.phase === AimsFlightPhase.Climb || this.phase === AimsFlightPhase.Cruise) {
            /** a timeout of 100ms is required in order to receive the updated autopilot vertical mode */
            setTimeout(() => {
                const activeVerticalMode = SimVar.GetSimVarValue('L:B77HS_FMA_VERTICAL_MODE', 'Enum');
                const VS = SimVar.GetSimVarValue('L:B77HS_AUTOPILOT_VS_SELECTED', 'feet per minute');
                const FPA = SimVar.GetSimVarValue('L:B77HS_AUTOPILOT_FPA_SELECTED', 'Degrees');
                if ((activeVerticalMode === VerticalMode.VS && VS < 0) || (activeVerticalMode === VerticalMode.FPA && FPA < 0)) {
                    if (canInitiateDes(distanceToDestination)) {
                        this.changePhase(AimsFlightPhase.Descent);
                    } else {
                        onStepClimbDescent();
                    }
                }
            }, 100);
        }
    }

    handleNewCruiseAltitudeEntered(newCruiseFlightLevel: number): void {
        const currentFlightLevel = Math.round(SimVar.GetSimVarValue('INDICATED ALTITUDE:3', 'feet') / 100);
        if (this.activePhase === AimsFlightPhase.Approach) {
            this.changePhase(AimsFlightPhase.Climb);
        } else if (currentFlightLevel < newCruiseFlightLevel
            && this.activePhase === AimsFlightPhase.Descent) {
            this.changePhase(AimsFlightPhase.Climb);
        } else if (currentFlightLevel > newCruiseFlightLevel
            && (this.activePhase === AimsFlightPhase.Climb
                || this.activePhase === AimsFlightPhase.Descent)) {
            this.changePhase(AimsFlightPhase.Cruise);
        }
    }

    handleNewDestinationAirportEntered(): void {
        if (this.activePhase === AimsFlightPhase.GoAround) {
            const accAlt = SimVar.GetSimVarValue('L:AIRLINER_ACC_ALT_GOAROUND', 'Number');
            if (Simplane.getAltitude() > accAlt) {
                this.changePhase(AimsFlightPhase.Climb);
            }
        }
    }

    changePhase(newPhase: AimsFlightPhase): void {
        const prevPhase = this.phase;
        console.log(`Aims Flight Phase: ${prevPhase} => ${newPhase}`);
        this.activePhase = newPhase;
        SimVar.SetSimVarValue('L:B77HS_Aims_FLIGHT_PHASE', 'number', newPhase);
        // Updating old SimVar to ensure backwards compatibility
        SimVar.SetSimVarValue('L:AIRLINER_FLIGHT_PHASE', 'number', (newPhase < AimsFlightPhase.Takeoff ? AimsFlightPhase.Preflight : newPhase + 1));

        this.phases[this.phase].init();

        for (const pcl of this.phaseChangeListeners) {
            pcl(prevPhase, newPhase);
        }

        this.shouldActivateNextPhase(0);
    }

    tryGoInApproachPhase(): boolean {
        if (
            this.phase === AimsFlightPhase.Preflight
            || this.phase === AimsFlightPhase.Takeoff
            || this.phase === AimsFlightPhase.Done
        ) {
            return false;
        }

        if (this.phase !== AimsFlightPhase.Approach) {
            this.changePhase(AimsFlightPhase.Approach);
        }

        return true;
    }

    shouldActivateDonePhase(_deltaTime: number): boolean {
        this.onGroundConfirmationNode.input = isOnGround();
        this.onGroundConfirmationNode.update(_deltaTime);
        return this.onGroundConfirmationNode.output && !isAnEngineOn() && this.phase !== AimsFlightPhase.Done && this.phase !== AimsFlightPhase.Preflight;
    }

    handleSlewSituation(_deltaTime: number) {
        switch (this.phase) {
        case AimsFlightPhase.Preflight:
        case AimsFlightPhase.Takeoff:
        case AimsFlightPhase.Done:
            if (Simplane.getAltitudeAboveGround() >= 1500) {
                this.changePhase(AimsFlightPhase.Climb);
            }
            break;
        default:
        }
    }
}
