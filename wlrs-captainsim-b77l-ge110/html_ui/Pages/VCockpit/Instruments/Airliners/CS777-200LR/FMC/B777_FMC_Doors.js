class FMC_Utils_Doors {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        let door1L = "CLOSE";
        let doorMainCargo = "CLOSE";

        if (SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:0", "percent") > 40) {
            door1L = "OPEN";
        }
        if (SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:1", "percent") > 40) {
            doorMainCargo = "OPEN";
        }
        
        const updateView = () => {
            fmc.setTemplate([
                ["DOORS"],
                ["DOOR 1L", "DOOR 1R[color]inop"],
                [`<${door1L}`, "INOP[color]inop"],
                [],
                [],
                ["CARGO MAIN DOOR"],
                [`<${doorMainCargo}`],
                [],
                [],
                [],
                [``, ""],
                ["\xa0RETURN TO", ""],
                ["<OPTIONS", ""]
            ]);
        }
        updateView();

        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            if (door1L == "CLOSE") {
                SimVar.SetSimVarValue("INTERACTIVE POINT OPEN:0", "percent", 100);
            }
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}