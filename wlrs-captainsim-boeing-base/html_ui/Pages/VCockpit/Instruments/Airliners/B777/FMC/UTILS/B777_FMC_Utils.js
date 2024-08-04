class FMC_Utils {
    static ShowPage1(fmc) {
        fmc.clearDisplay();

        fmc.setTemplate([
            ["UTILS"],
            ["", ""],
            ["<DOORS", "UNITS>"],
            ["", ""],
            ["<METAR SRC", "ATIS SRC>"],
            ["", ""],
            ["<TAF SRC", "FUEL>"],
            ["", ""],
            [`<SIMBRIEF`, "PAYLOAD>"],
            ["", ""],
            ["<CPDLC[color]inop", "MISC>"],
            ["\xa0RETURN TO", ""],
            ["<INDEX", ""]
        ]);

        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            FMC_Utils_Doors.ShowPage(fmc);
        }
        /* RSK1 */
        fmc.onRightInput[0] = () => {
            FMC_Utils_Units.ShowPage(fmc);
        }
        /* LSK2 */
        fmc.onLeftInput[1] = () => {
            FMC_Utils_Metar.ShowPage(fmc);
        };

        /* RSK2 */
        fmc.onRightInput[1] = () => {
            FMC_Utils_Atis.ShowPage(fmc);
        };

        /* LSK3 */
        fmc.onLeftInput[2] = () => {
            FMC_Options_Taf.ShowPage(fmc);
        };

        /* RSK3 */
        fmc.onRightInput[2] = () => {
            FMC_Fuel.ShowPage(fmc);
        };
        
        /* LSK4 */
        fmc.onLeftInput[3] = () => {
            FMC_Utils_Simbrief.ShowPage(fmc);
        }

        /* RSK4 */
        fmc.onRightInput[3] = () => {
            FMC_Payload.ShowPage(fmc);
       }
        
        /* RSK5 */
        fmc.onRightInput[4] = () => {
            FMC_Utils_Misc.ShowPage(fmc);
        }

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Menu.ShowPage(fmc);
        }
    }
}