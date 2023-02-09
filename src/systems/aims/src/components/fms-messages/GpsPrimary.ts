import { FMMessage, FMMessageTypes } from '@shared/FmMessages';
import { FMMessageSelector, FMMessageUpdate } from './FmsMessages';

export class GpsPrimary implements FMMessageSelector {
    message: FMMessage = FMMessageTypes.GpsPrimary;

    private lastState = false;

    process(_: number): FMMessageUpdate {
        const newState = SimVar.GetSimVarValue('L:B77HS_ADIRS_USES_GPS_AS_PRIMARY', 'Bool') === 1;

        if (newState !== this.lastState) {
            this.lastState = newState;

            return newState ? FMMessageUpdate.SEND : FMMessageUpdate.RECALL;
        }

        return FMMessageUpdate.NO_ACTION;
    }
}
