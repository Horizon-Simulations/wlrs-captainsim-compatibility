class FMC_Utils_Simbrief {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        let simbriefId = WTDataStore.get("OPTIONS_SIMBRIEF_ID", "");
        let simbriefUser = WTDataStore.get("OPTIONS_SIMBRIEF_USER", "");

        fmc.setTemplate([
            ["SIMBRIEF"],
            ["SIMBRIEF ID", ""],
            [`[${simbriefId}]`, ``],
            ["SIMBRIEF USERNAME", ""],
            [`[${simbriefUser}]`, ""],
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
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("OPTIONS_SIMBRIEF_ID", value);
            FMC_Utils_Simbrief.ShowPage(fmc);
        }

        /* LSK2 */
        fmc.onLeftInput[1] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            WTDataStore.set("OPTIONS_SIMBRIEF_USER", value);
            FMC_Utils_Simbrief.ShowPage(fmc);
      }
        

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}