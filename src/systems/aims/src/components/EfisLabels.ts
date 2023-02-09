import { FlightLevel } from '@aims/guidance/vnav/verticalFlightPlan/VerticalFlightPlan';
import { FlightPlanManager } from '@aims/wtsdk';
import { AimsComponent } from './AimsComponent';

export class EfisLabels implements aimsComponent {
    private lastTransitionAltitude: Feet;

    private lastTransitionLevel: FlightLevel;

    private flightPlanManager: FlightPlanManager;

    init(_baseInstrument: BaseInstrument, flightPlanManager: FlightPlanManager): void {
        this.flightPlanManager = flightPlanManager;
    }

    update(_deltaTime: number): void {
        const transitionAltitude = this.flightPlanManager.originTransitionAltitude;
        const transitionLevel = this.flightPlanManager.destinationTransitionLevel;

        // FIXME ARINC429 when the PR adding a TS impl. lands...
        if (transitionAltitude !== this.lastTransitionAltitude) {
            SimVar.SetSimVarValue('L:AIRLINER_TRANS_ALT', 'Number', transitionAltitude ?? 0);
            this.lastTransitionAltitude = transitionAltitude;
        }

        if (transitionLevel !== this.lastTransitionLevel) {
            SimVar.SetSimVarValue('L:AIRLINER_APPR_TRANS_ALT', 'Number', (transitionLevel ?? 0) * 100);
            this.lastTransitionLevel = transitionLevel;
        }
    }
}
