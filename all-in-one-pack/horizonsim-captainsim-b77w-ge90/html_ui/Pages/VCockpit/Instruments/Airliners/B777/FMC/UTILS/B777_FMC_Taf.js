class FMC_Options_Taf {
    static ShowPage(fmc) {
        fmc.clearDisplay();

        const storedTafSrc = WTDataStore.get("OPTIONS_TAF_SRC", "NOAA");

        let noaa = "*NOAA[color]white";
        let ivao = "*IVAO[color]white";

        switch (storedTafSrc) {
            case "IVAO":
                ivao = "IVAO[color]green";
                break;
            default:
                noaa = "NOAA[color]green";
        }

        fmc.setTemplate([
            ["TAF SOURCE"],
            ["", ""],
            [ivao, ""],
            ["", ""],
            [noaa, ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["\xa0RETURN TO", ""],
            ["<UTILS", ""]
        ]);

        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            WTDataStore.set("OPTIONS_TAF_SRC", "IVAO");
            FMC_Utils_Taf.ShowPage(fmc);
        }

        /* LSK2 */
        fmc.onLeftInput[1] = () => {
            WTDataStore.set("OPTIONS_TAF_SRC", "NOAA");
             FMC_Utils_Taf.ShowPage(fmc);
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}