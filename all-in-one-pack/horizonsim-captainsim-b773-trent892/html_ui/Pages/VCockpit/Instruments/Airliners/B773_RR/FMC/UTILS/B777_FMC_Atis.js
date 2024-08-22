class FMC_Utils_Atis {
    static ShowPage(fmc) {
        fmc.clearDisplay();

        const storedAtisSrc = WTDataStore.get("OPTIONS_ATIS_SRC", "FAA");

        let faa = "*FAA (US ONLY)[color]white";
        let vatsim = "*VATSIM[color]white";
        let pilotedge = "*PILOTEDGE[color]white";
        let ivao = "*IVAO[color]white";

        switch (storedAtisSrc) {
            case "VATSIM":
                vatsim = "VATSIM[color]green";
                break;
            case "PILOTEDGE":
                pilotedge = "PILOTEDGE[color]green";
                break;
            case "IVAO":
                ivao = "IVAO[color]green";
                break;
            default:
                faa = "FAA (US ONLY)[color]green";
        }

        const updateView = () => {
            fmc.setTemplate([
                ["ATIS SOURCE"],
                [],
                [`${vatsim}`, ""],
                [],
                [`${pilotedge}`, ""],
                [],
                [`${ivao}`, ""],
                [],
                [`${faa}`, ""],
                [],
                [``, ""],
                ["\xa0RETURN TO", ""],
                ["<UTILS", ""]
            ]);
        }
        updateView();

        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            if (storedAtisSrc != "VATSIM") {
                WTDataStore.set("OPTIONS_ATIS_SRC", "VATSIM");
                FMC_Utils_Atis.ShowPage(fmc);
            }
        };

        /* LSK2 */
        fmc.onLeftInput[1] = () => {
            if (storedAtisSrc != "PILOTEDGE") {
                WTDataStore.set("OPTIONS_ATIS_SRC", "PILOTEDGE");
                FMC_Utils_Atis.ShowPage(fmc);
            }
        };

        /* LSK3 */
        fmc.onLeftInput[2] = () => {
            if (storedAtisSrc != "IVAO") {
                WTDataStore.set("OPTIONS_ATIS_SRC", "IVAO");
                FMC_Utils_Atis.ShowPage(fmc);
            }
        };

        /* LSK4 */
        fmc.onLeftInput[3] = () => {
            if (storedAtisSrc != "FAA") {
                WTDataStore.set("OPTIONS_ATIS_SRC", "FAA");
                FMC_Utils_Atis.ShowPage(fmc);
            }
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}