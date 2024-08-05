class FMC_MAINT_IrsMonitor {
    static ShowPage(fmc) {
        fmc.clearDisplay();

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        var IRSState = SimVar.GetSimVarValue("L:B777_IRS_STATE", "Enum");
        if (IRSState == 0) { IRSState = "NOT ALIGNED[color]red"; }
        if (IRSState == 1) { IRSState = "ALIGNING[color]yellow"; }
        if (IRSState == 2) { IRSState = "ALIGNED[color]green"; }
                
        const updateView = () => {
            fmc.setTemplate([
                ["IRS MONITOR"],
                [],
                ["IRS STATUS", IRSState],
                ["", ""],
                ["<UPDATE IRS STATUS", ""],
                ["", ""],
                ["<IRS INSTANT ALIGN", ""],
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
            if (IRSState == 1) {
                SimVar.SetSimVarValue("L:B777_IRS_STATE", "Enum", 2);
            }
            
            if (IRSState == 0) {
                fmc.showErrorMessage("ADIRU BUTTON OFF");
            }

            FMC_MAINT_IrsMonitor.ShowPage(fmc);
        };

        fmc.onLeftInput[1] = () => {
            FMC_MAINT_IrsMonitor.ShowPage(fmc);
        }
                  
        fmc.onLeftInput[5] = () => {
            FMC_MAINT_Index.ShowPage(fmc);
        }
    }
}