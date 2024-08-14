class FMC_Utils_Units {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        let system = "IMPERIAL";
        if (storedUnits == "KG") {
            system = "METRIC";
        }
        
        const updateView = () => {
            fmc.setTemplate([
                ["UNITS"],
                ["WEIGHT UNITS", "SYSTEM"],
                [`*${storedUnits}`, `*${system}`],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [``, ""],
                ["\xa0RETURN TO", ""],
                ["<UTILS", ""]
            ]);
        }
        updateView();

        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            if (storedUnits == "KG") {
                WTDataStore.set("OPTIONS_UNITS", "LBS");
                FMC_Utils_Units.ShowPage(fmc);
            } else if (storedUnits == "LBS") {                
                WTDataStore.set("OPTIONS_UNITS", "KG");
                FMC_Utils_Units.ShowPage(fmc);
            }
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}