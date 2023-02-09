import { FlightPlanManager } from '@aims/wtsdk';

export interface AimsComponent {
    init(baseInstrument: BaseInstrument, flightPlanManager: FlightPlanManager): void;
    update(deltaTime: number): void;
}
