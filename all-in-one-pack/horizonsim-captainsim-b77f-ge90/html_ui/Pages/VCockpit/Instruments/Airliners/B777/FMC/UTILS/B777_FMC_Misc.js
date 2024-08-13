class FMC_Utils_Misc {
    static ShowPage(fmc) {
        //Include.addScript("/JS/dataStorage.js"); //included

        fmc.clearDisplay();

        const onGreen = "{green}ON{end}/{small}OFF{end}";
        const offGreen = "{small}ON{end}/{green}OFF{end}";

        const fpSync = WTDataStore.get("WT_CJ4_FPSYNC", 0);
        const fpSyncDisplayOption = fpSync >= 1 ? onGreen : offGreen;

        const pauseAtTd = WTDataStore.get("PAUSE_AT_TD", 0);
        const pauseAtTdDisplayOption = pauseAtTd >= 1 ? onGreen : offGreen;

        const showEngineBlur =  WTDataStore.get("SHOW_ENGINE_BLUR", 0);
        const showEngineBlurDisplayOption = showEngineBlur >= 1 ? onGreen : offGreen;
        
        fmc.setTemplate([
            ["MISC"],
            ["FP SYNC (WORLD MAP FP)", "", ""],
            [`< ${fpSyncDisplayOption}`, "", ""],
            ["PAUSE AT T/D", "", ""],
            [`< ${pauseAtTdDisplayOption}`, `${pauseAtTd >= 1 ? "UNPAUSE>" : ""}`],
            ["BLUR ENGINE", ""],
            [`< ${showEngineBlurDisplayOption}`, ""],
            ["", ""],
            ["", "DEBUG PAGE>"],
            ["", ""],
            ["", ""],
            ["\xa0RETURN TO", ""],
            ["<UTILS", ""]
        ]);
        fmc.onLeftInput[0] = () => {
            WTDataStore.set("WT_CJ4_FPSYNC", fpSync >= 1 ? 0 : 1);
            fmc.showErrorMessage("RESTART FLIGHT TO APPLY");
            FMC_Utils_Misc.ShowPage(fmc);
        }

        fmc.onRightInput[1] = () => {
            SimVar.SetSimVarValue("K:PAUSE_OFF", "number", 0);
        }

        fmc.onLeftInput[1] = () => {
            WTDataStore.set("PAUSE_AT_TD", pauseAtTd >= 1 ? 0 : 1);
            FMC_Utils_Misc.ShowPage(fmc);
        };

        fmc.onLeftInput[2] = () => {
            WTDataStore.set("SHOW_ENGINE_BLUR", showEngineBlur >= 1 ? 0 : 1);
            FMC_Utils_Misc.ShowPage(fmc);
        }

        fmc.onRightInput[3] = () => {
            SimVar.SetSimVarValue("H:B777_EICAS_2_EICAS_CHANGE_PAGE_info", "bool", 1);
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}