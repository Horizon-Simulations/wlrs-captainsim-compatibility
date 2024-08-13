class FMC_Utils_Metar {
    static ShowPage(fmc) {
        fmc.clearDisplay();

        const storedMetarSrc = WTDataStore.get("OPTIONS_METAR_SRC", "MSFS");

        let msfs = "*METEOBLUE (MSFS)[color]white";
        let avwx = "*AVWX (UNREAL WEATHER)[color]white";
        let vatsim = "*VATSIM[color]white";
        let pilotedge = "*PILOTEDGE[color]white";
        let ivao = "*IVAO[color]white";

        switch (storedMetarSrc) {
            case "AVWX":
                avwx = "AVWX (UNREAL WEATHER)[color]green";
                break;
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
                msfs = "METEOBLUE (MSFS)[color]green";
        }

        const updateView = () => {
            fmc.setTemplate([
                ["METAR SOURCE"],
                [],
                [`${avwx}`, ""],
                [],
                [`${vatsim}`, ""],
                [],
                [`${pilotedge}`, ""],
                [],
                [`${ivao}`, ""],
                [],
                [`${msfs}`, ""],
                ["\xa0RETURN TO", ""],
                ["<UTILS", ""]
            ]);
        }
        updateView();

        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            if (storedMetarSrc != "AVWX") {
                WTDataStore.set("OPTIONS_METAR_SRC", "AVWX");
                FMC_Utils_Metar.ShowPage(fmc);
            }
        };

        /* LSK2 */
        fmc.onLeftInput[1] = () => {
            if (storedMetarSrc != "VATSIM") {
                WTDataStore.set("OPTIONS_METAR_SRC", "VATSIM");
                FMC_Utils_Metar.ShowPage(fmc);
            }
        };

        /* LSK3 */
        fmc.onLeftInput[2] = () => {
            if (storedMetarSrc != "PILOTEDGE") {
                WTDataStore.set("OPTIONS_METAR_SRC", "PILOTEDGE");
                FMC_Utils_Metar.ShowPage(fmc);
            }
        };

        /* LSK4 */
        fmc.onLeftInput[3] = () => {
            if (storedMetarSrc != "IVAO") {
                WTDataStore.set("OPTIONS_METAR_SRC", "IVAO");
                FMC_Utils_Metar.ShowPage(fmc);
            }
        };

        /* LSK5 */
        fmc.onLeftInput[4] = () => {
            if (storedMetarSrc != "MSFS") {
                WTDataStore.set("OPTIONS_METAR_SRC", "MSFS");
                FMC_Utils_Metar.ShowPage(fmc);
            }
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}