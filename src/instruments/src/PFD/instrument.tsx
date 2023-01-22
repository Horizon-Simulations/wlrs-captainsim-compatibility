import { FSComponent } from 'msfssdk';
import { PFD } from './PFD';

class PDFInstrument extends BaseInstrument {
    get templateID(): string {
        return 'pfd';
    }

    public connectedCallback(): void {
        super.connectedCallback();

        FSComponent.render(<PFD />, document.getElementById('InstrumentContent'));
    }
}

registerInstrument('pfd', PDFInstrument);