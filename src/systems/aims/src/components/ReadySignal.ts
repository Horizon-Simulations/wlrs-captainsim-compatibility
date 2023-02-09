import { FlightPlanManager } from '@aims/wtsdk';
import { AimsComponent } from './AimsComponent';

export class ReadySignal implements AimsComponent {
    private baseInstrument: BaseInstrument = null;

    private updateThrottler = new B77HS_Util.UpdateThrottler(1000);

    init(baseInstrument: BaseInstrument, _flightPlanManager: FlightPlanManager): void {
        this.baseInstrument = baseInstrument;
    }

    update(deltaTime: number): void {
        if (this.updateThrottler.canUpdate(deltaTime) !== -1
            && this.baseInstrument.getGameState() === GameState.ingame
            && SimVar.GetSimVarValue('L:B77HS_IS_READY', 'number') !== 1) {
            // set ready signal that JS code is initialized and flight is actually started
            // -> user pressed 'READY TO FLY' button
            SimVar.SetSimVarValue('L:B77HS_IS_READY', 'number', 1);
        }
    }
}
