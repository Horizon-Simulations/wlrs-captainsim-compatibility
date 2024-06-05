class FMCSaltyOptions_Misc {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        let displayCurrentPilotsOption;


        const onGreen = "{green}ON{end}/{small}OFF{end}";
        const offGreen = "{small}ON{end}/{green}OFF{end}";

        const fpSync = WTDataStore.get("WT_CJ4_FPSYNC", 0);
        const fpSyncDisplayOption = fpSync >= 1 ? onGreen : offGreen;

        const pauseAtTd = WTDataStore.get("PAUSE_AT_TD", 0);
        const pauseAtTdDisplayOption = pauseAtTd >= 1 ? onGreen : offGreen;

        fmc.setTemplate([
            ["MISC OPTIONS"],
            ["", "", "FP SYNC (WORLD MAP FP)"],
            [`< ${fpSyncDisplayOption}`, "", ""],
            ["", "", "PAUSE AT T/D"],
            [`< ${pauseAtTdDisplayOption}`, `${pauseAtTd >= 1 ? "UNPAUSE>" : ""}`],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["\xa0RETURN TO", ""],
            ["<OPTIONS", ""]
        ]);

        /* LSK1 */
        fmc.onLeftInput[0] = () => {
        }

        /* RSK1 */
        fmc.onRightInput[0] = () => {

        }

        fmc.onRightInput[2] = () => {
            SimVar.SetSimVarValue("K:PAUSE_OFF", "number", 0);
        }

        fmc.onLeftInput[1] = () => {
            WTDataStore.set("WT_CJ4_FPSYNC", fpSync >= 1 ? 0 : 1);
            fmc.showErrorMessage("RESTART FLIGHT TO APPLY");
            FMCSaltyOptions_Misc.ShowPage(fmc);
        }

        fmc.onLeftInput[2] = () => {
            WTDataStore.set("PAUSE_AT_TD", pauseAtTd >= 1 ? 0 : 1);
            FMCSaltyOptions_Misc.ShowPage(fmc);
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMCSaltyOptions.ShowPage1(fmc);
        }
    }
}
//# sourceMappingURL=B747_8_FMC_SaltyOptions.js.map
