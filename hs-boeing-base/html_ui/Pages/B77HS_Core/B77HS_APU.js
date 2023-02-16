class B77HS_APU {
    constructor() {
        console.log('B77HS_APU constructed');
    }
    init() {
        console.log('B77HS_APU init');
        this.lastAPUBleedState = -1;
    }
    update(_deltaTime) {
        const apuBleedOn = SimVar.GetSimVarValue("L:B77HS_OVHD_PNEU_APU_BLEED_PB_IS_ON", "Bool");
        if (apuBleedOn !== this.lastAPUBleedState) {
            this.lastAPUBleedState = apuBleedOn;
            if (apuBleedOn === 1) {
                this.APUBleedTimer = 3;
            } else {
                this.APUBleedTimer = 0;
            }
        }

        const apuN = Arinc429Word.fromSimVarValue("L:B77HS_APU_N");
        const bleedAirValveOpen = SimVar.GetSimVarValue("L:B77HS_APU_BLEED_AIR_VALVE_OPEN", "Bool");
        let psi = 0;
        if (apuN.isNormalOperation() && apuN.value > 95 && bleedAirValveOpen) {
            if (this.APUBleedTimer > 0) {
                this.APUBleedTimer -= _deltaTime / 1000;
                psi = Math.round(35 - this.APUBleedTimer);
            } else {
                psi = 35;
            }
        }
        SimVar.SetSimVarValue("L:APU_BLEED_PRESSURE", "PSI", psi);

        // Until everything that depends on the APU is moved into WASM,
        // we still need to synchronise some of the WASM state with the sim's state.
        const simApuBleedAirOn = SimVar.GetSimVarValue("BLEED AIR APU", "Bool");
        if (psi > 0 && !simApuBleedAirOn) {
            // This event will open the sim's APU bleed air valve.
            SimVar.SetSimVarValue("K:APU_BLEED_AIR_SOURCE_TOGGLE", "Number", 0);
        } else if (psi === 0 && simApuBleedAirOn) {
            // This event will close the sim's APU bleed air valve.
            SimVar.SetSimVarValue("K:APU_BLEED_AIR_SOURCE_TOGGLE", "Number", 0);
        }
    }
}
