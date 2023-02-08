import { FSComponent } from "msfssdk";
import { InitPage } from "./pages/InitPage";

class FMC extends BaseInstrument {
    get templateID(): string {
        return 'B777_FMC';
    }

    public connectedCallback(): void {
        super.connectedCallback();
      
        FSComponent.render(<InitPage />, document.getElementById('InstrumentContent'));
      }
}

registerInstrument('b777-fmc', FMC);