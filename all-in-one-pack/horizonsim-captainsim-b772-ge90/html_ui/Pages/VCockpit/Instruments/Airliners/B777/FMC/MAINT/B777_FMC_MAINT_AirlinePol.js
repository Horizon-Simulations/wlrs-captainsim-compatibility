class FMC_MAINT_AirlinePol {
    static ShowPage(fmc) {
        //note: since WT datastore uses type comparison, I'll have to parseInt to use WTDataStore. Suggest writing a class without type check, but it won't error redundancy
        fmc.clearDisplay();
        const onGreen = "{green}ON{end}/{small}OFF{end}";
        const offGreen = "{small}ON{end}/{green}OFF{end}";

        const costIndexPolicy = WTDataStore.get("COST_INDEX_POL", 50);
        const eoAccelHt = WTDataStore.get("TO_EO_ACCEL_HT", 1000);
        const accelHt = WTDataStore.get("TO_ACCEL_HT", 1000);
        const clbAt = WTDataStore.get("TO_CLB_AT", 3000);
        const qClb = WTDataStore.get("TO_Q_CLB_AT", 1000);
        const thrRed = WTDataStore.get("TO_THR_REDUCTION", 3000);
        const clbBy = WTDataStore.get("TO_CLB_BY", 3000);
        
        const aoaIndicator = WTDataStore.get("aoaIndicator", true);
        const pauseAtTdDisplayOption = (aoaIndicator === true) ? offGreen : onGreen;

        
        const updateView = () => {
            fmc.setTemplate([
                ["AIRLINES POLICY"],
                ["\xa0COST INDEX", ""],
                [`[${costIndexPolicy}]`, ""],
                ["EO ACCEL HT", "ACCEL HT"],
                [`[${eoAccelHt}] FT`, `[${accelHt}] FT`],
                ["Q-CLB AT", "CLB AT"],
                [`[${qClb}] FT`, `[${clbAt}] FT`],
                ["THR REDUCTION", "CLIMB BY"],
                [`[${thrRed}] FT`, `[${clbBy}] FT`],
                ["AOA INDICATOR", ""],
                [` [${pauseAtTdDisplayOption}]`, ""],
                ["", "", "__FMCSEPARATOR"],
                ["<INDEX", ""]
            ]);
        }
        updateView();
        
        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("COST_INDEX_POL", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }
        
        /* LSK2 */
        fmc.onLeftInput[1] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_EO_ACCEL_HT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }
        
        /* RSK2 */
        fmc.onRightInput[1] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_ACCEL_HT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }
        
        /* LSK3 */
        fmc.onLeftInput[2] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_Q_CLB_AT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }
        
        /* RSK3 */
        fmc.onRightInput[2] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_CLB_AT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }
        
        /* LSK4 */
        fmc.onLeftInput[3] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_THR_REDUCTION", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }
        
        /* RSK4 */
        fmc.onRightInput[3] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_CLB_BY", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }

        /* LSK5 */
        fmc.onLeftInput[4] = () => {
            WTDataStore.set("aoaIndicator", (aoaIndicator === true) ? false : true);
            FMC_MAINT_AirlinePol.ShowPage(fmc);
        }
        
        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_MAINT_Index.ShowPage(fmc);
        }
    }
}