class FMC_MAINT_ADIRU_Monitor {
    static ShowPage(fmc) {
        fmc.clearDisplay();

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        var adiruState = SimVar.GetSimVarValue("L:B777_ADIRU_STATE", "Enum");
        if (adiruState == 0) { adiruState = "NOT ALIGNED[color]red"; }
        if (adiruState == 1) { adiruState = "ALIGNING[color]yellow"; }
        if (adiruState == 2) { adiruState = "ALIGNED[color]green"; }
                
        const updateView = () => {
            fmc.setTemplate([
                ["ADIRU MONITOR"],
                [],
                ["ADIRU STATUS", adiruState],
                ["", ""],
                ["<UPDATE ADIRU STATUS", ""],
                ["", ""],
                ["<ADIRU INSTANT ALIGN", ""],
                ["", ""],
                ["", ""],
                ["", ""],
                ["", ""],
                ["", "", "__FMCSEPARATOR"],
                ["<INDEX", ""]
            ]);
        }
        updateView();

        fmc.onLeftInput[2] = () => {
            if (adiruState == 1) {
                SimVar.SetSimVarValue("L:B777_ADIRU_STATE", "Enum", 2);
            }
            
            if (adiruState == 0) {
                fmc.showErrorMessage("ADIRU BUTTON OFF");
            }

            FMC_MAINT_ADIRU_Monitor.ShowPage(fmc);
        };

        fmc.onLeftInput[1] = () => {
            FMC_MAINT_ADIRU_Monitor.ShowPage(fmc);
        }
                  
        fmc.onLeftInput[5] = () => {
            FMC_MAINT_Index.ShowPage(fmc);
        }
    }
}