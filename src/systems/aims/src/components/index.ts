import { FcuSync } from '@aims/components/FcuSync';
import { ReadySignal } from '@aims/components/ReadySignal';
import { FlightPlanManager } from '@aims/wtsdk';
import { EfisLabels } from './EfisLabels';
import { AimsComponent } from './AimsComponent';
import { FmsMessages } from './fms-messages';

const fmsMessages = new FmsMessages();

const components: AimsComponent[] = [
    fmsMessages,
    new EfisLabels(),
    new ReadySignal(),
    new FcuSync(),
];

export function initComponents(baseInstrument: BaseInstrument, flightPlanManager: FlightPlanManager): void {
    components.forEach((component) => component.init(baseInstrument, flightPlanManager));
}

export function updateComponents(deltaTime: number): void {
    components.forEach((component) => component.update(deltaTime));
}

export function recallMessageById(id: number) {
    fmsMessages.recallId(id);
}
