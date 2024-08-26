class FMC_MAINT_AirlinePol {
    static ShowPage1(fmc) {
        fmc.clearDisplay();
        const installed = "\xa0{green}INSTALLED{end}";
        const notInstalled = "\xa0{yellow}NOT INSTALLED{end}";

        const wifiSatcom = WTDataStore.get("WIFI SATCOM ATN MODE", 0);
        const telephone = WTDataStore.get("TELEPHONE MODE", false);
        const dmeAntenna = WTDataStore.get("DME ANTENNA MODE", false);

        let satcomDisplayOption;

        switch (wifiSatcom) {
            case 0:
                satcomDisplayOption = "NOT INSTALLED";
                break;
            case 1:
                satcomDisplayOption = "KU";
                break;
            case 2:
                satcomDisplayOption = "2KU";
                break;
            case 3:
                satcomDisplayOption = "KU + SATCOM";
                break;
            case 4:
                satcomDisplayOption = "2KU + SATCOM";
                break;
            case 5:
                satcomDisplayOption = "SATCOM";
                break;
            case 6:
                satcomDisplayOption = "KU MID + SATCOM";
                break;
            case 7:
                satcomDisplayOption = "KU MID";
                break;
            default:
                satcomDisplayOption = "TEST";
        }

        const updateView = () => {
            fmc.setTemplate([
                ["AIRLINES POLICY", 1, 2],
                ["\xa0SATCOM", ""],
                [`[${satcomDisplayOption}]`, ""],
                ["\xa0TELEPHONE", ""],
                [telephone ? installed : notInstalled, ""],
                ["\xa0DME", ""],
                [dmeAntenna ? installed : notInstalled, ""],
                ["", ""],
                ["", ""],
                ["", ""],
                ["", ""],
                ["", "", "__FMCSEPARATOR"],
                ["<INDEX", ""]
            ]);
        }
        updateView();
        
        /* LSK1 */
        fmc.onLeftInput[0] = () => {
			WTDataStore.set("WIFI SATCOM ATN MODE", parseInt((wifiSatcom + 1) % 8));
            FMC_MAINT_AirlinePol.ShowPage1(fmc);
        }

        /* LSK2 */
        fmc.onLeftInput[1] = () => {
			WTDataStore.set("TELEPHONE MODE", !telephone);
            FMC_MAINT_AirlinePol.ShowPage1(fmc);
        }

        /* LSK3 */
        fmc.onLeftInput[2] = () => {
			WTDataStore.set("DME ANTENNA MODE", !dmeAntenna);
            FMC_MAINT_AirlinePol.ShowPage1(fmc);
        }


        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_MAINT_Index.ShowPage(fmc);
        }

        fmc.onNextPage = () => {
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
    }
    static ShowPage2(fmc) {
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
        const aoaIndicatorDisplayOption = (aoaIndicator === true) ? offGreen : onGreen;

        
        const updateView = () => {
            fmc.setTemplate([
                ["AIRLINES POLICY", 2, 2],
                ["\xa0COST INDEX", ""],
                [`[${costIndexPolicy}]`, ""],
                ["EO ACCEL HT", "ACCEL HT"],
                [`[${eoAccelHt}] FT`, `[${accelHt}] FT`],
                ["Q-CLB AT", "CLB AT"],
                [`[${qClb}] FT`, `[${clbAt}] FT`],
                ["THR REDUCTION", "CLIMB BY"],
                [`[${thrRed}] FT`, `[${clbBy}] FT`],
                ["AOA INDICATOR", ""],
                [` [${aoaIndicatorDisplayOption}]`, ""],
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
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
        /* LSK2 */
        fmc.onLeftInput[1] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_EO_ACCEL_HT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
        /* RSK2 */
        fmc.onRightInput[1] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_ACCEL_HT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
        /* LSK3 */
        fmc.onLeftInput[2] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_Q_CLB_AT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
        /* RSK3 */
        fmc.onRightInput[2] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_CLB_AT", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
        /* LSK4 */
        fmc.onLeftInput[3] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_THR_REDUCTION", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
        /* RSK4 */
        fmc.onRightInput[3] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("TO_CLB_BY", parseInt(value));
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }

        /* LSK5 */
        fmc.onLeftInput[4] = () => {
            WTDataStore.set("aoaIndicator", (aoaIndicator === true) ? false : true);
            FMC_MAINT_AirlinePol.ShowPage2(fmc);
        }
        
        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_MAINT_Index.ShowPage(fmc);
        }
        
        fmc.onPrevPage = () => {
            FMC_MAINT_AirlinePol.ShowPage1(fmc);
        }
    }
}