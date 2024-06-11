class FMCSaltyOptions_Misc {
    static ShowPage(fmc) {
        fmc.clearDisplay();

        const onGreen = "{green}ON{end}/{small}OFF{end}";
        const offGreen = "{small}ON{end}/{green}OFF{end}";

        const fpSync = WTDataStore.get("WT_CJ4_FPSYNC", 0);
        const fpSyncDisplayOption = fpSync >= 1 ? onGreen : offGreen;

        const pauseAtTd = WTDataStore.get("PAUSE_AT_TD", 0);
        const pauseAtTdDisplayOption = pauseAtTd >= 1 ? onGreen : offGreen;

        const showEngineBlur =  SaltyDataStore.get("SHOW_ENGINE_BLUR", 0);
        const showEngineBlurDisplayOption = showEngineBlur >= 1 ? onGreen : offGreen;
        SimVar.SetSimVarValue("L:teevee_SHOW_ENGINE_BLUR", "bool", showEngineBlur);
        //test
        fmc.setTemplate([
            ["MISC OPTIONS"],
            ["", "", "FP SYNC (WORLD MAP FP)"],
            [`< ${fpSyncDisplayOption}`, "", ""],
            ["", "", "PAUSE AT T/D"],
            [`< ${pauseAtTdDisplayOption}`, `${pauseAtTd >= 1 ? "UNPAUSE>" : ""}`],
            ["<BLUR ENGINE", ""],
            [`< ${showEngineBlurDisplayOption}`, ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["\xa0RETURN TO", ""],
            ["<OPTIONS", ""]
        ]);
        fmc.onLeftInput[0] = () => {
            WTDataStore.set("WT_CJ4_FPSYNC", fpSync >= 1 ? 0 : 1);
            fmc.showErrorMessage("RESTART FLIGHT TO APPLY");
            FMCSaltyOptions_Misc.ShowPage(fmc);
        }

        fmc.onRightInput[1] = () => {
            SimVar.SetSimVarValue("K:PAUSE_OFF", "number", 0);
        }

        fmc.onLeftInput[1] = () => {
            WTDataStore.set("PAUSE_AT_TD", pauseAtTd >= 1 ? 0 : 1);
            FMCSaltyOptions_Misc.ShowPage(fmc);
        };

        fmc.onLeftInput[2] = () => {
            SaltyDataStore.set("SHOW_ENGINE_BLUR", fpSync >= 1 ? 0 : 1);
            SimVar.SetSimVarValue("L:teevee_SHOW_ENGINE_BLUR", "bool", showEngineBlur);
            FMCSaltyOptions_Misc.ShowPage(fmc);
        }

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMCSaltyOptions.ShowPage1(fmc);
        }
    }
}
//# sourceMappingURL=B747_8_FMC_SaltyOptions.js.map
