class FMC_Utils_Doors {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        let door1L = "OPEN";
        let door4R = "OPEN";
        let doorFowCargo = "OPEN";

        if (SimVar.GetSimVarValue("INTERACTIVE POINT GOAL:0", "percent") > 40) {
            door1L = "CLOSE";
        }
        if (SimVar.GetSimVarValue("INTERACTIVE POINT GOAL:1", "percent") > 40) {
            door4R = "CLOSE";
        }
        if (SimVar.GetSimVarValue("INTERACTIVE POINT GOAL:2", "percent") > 40) {
            doorFowCargo = "CLOSE";
        }
        
        const updateView = () => {
            fmc.setTemplate([
                ["DOORS"],
                ["DOOR 1L", "DOOR 1R[color]inop"],
                [`<${door1L}`, "INOP[color]inop"],
                ["","CARGO FOWARD DOOR"],
                ["",`${doorFowCargo}>`],
                [],
                [],
                ["", "DOOR 4R"],
                ["", `${door4R}>`],
                [],
                [],
                ["\xa0RETURN TO", ""],
                ["<UTILS", ""]
            ]);
        }
        updateView();

        //THIS IS ACTION BASED, OR WHAT SHOW ON FMC WILL BE THE NEXT ACTION EXECUTED
        /* LSK1 */
        fmc.onLeftInput[0] = () => {
            if (door1L == "OPEN") {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:0", "percent", 100);
            }
            else {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:0", "percent", 0);
            }
            FMC_Utils_Doors.ShowPage(fmc);
        };

        /* RSK1 */
        fmc.onRightInput[1] = () => {
            if (doorFowCargo == "OPEN") {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:2", "percent", 100);
            }
            else {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:2", "percent", 0);
            }
            FMC_Utils_Doors.ShowPage(fmc);
        };

        /* RSK3 */
        fmc.onRightInput[3] = () => {
            if (door4R == "OPEN") {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:1", "percent", 100);
            }
            else {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:1", "percent", 0);
            }
            FMC_Utils_Doors.ShowPage(fmc);
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}