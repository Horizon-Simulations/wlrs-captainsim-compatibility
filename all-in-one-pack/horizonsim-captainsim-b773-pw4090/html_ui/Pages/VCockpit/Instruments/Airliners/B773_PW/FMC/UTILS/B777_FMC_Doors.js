class FMC_Utils_Doors {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        let door1L = "OPEN";
        let door5R = "OPEN";
        let doorFwdCargo = "OPEN";

        if (SimVar.GetSimVarValue("INTERACTIVE POINT GOAL:0", "percent") > 40) {
            door1L = "CLOSE";
        }
        if (SimVar.GetSimVarValue("INTERACTIVE POINT GOAL:9", "percent") > 40) {
            door5R = "CLOSE";
        }
        if (SimVar.GetSimVarValue("INTERACTIVE POINT GOAL:12", "percent") > 40) {
            doorFwdCargo = "CLOSE";
        }
        
        const updateView = () => {
            fmc.setTemplate([
                ["DOORS"],
                ["DOOR 1L", "DOOR 1R[color]inop"],
                [`<${door1L}`, "INOP[color]inop"],
                ["","CARGO FOWARD DOOR"],
                ["",`${doorFwdCargo}>`],
                [],
                [],
                [],
                [],
                ["", "DOOR 5R"],
                ["", `${door5R}>`],
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
            if (doorFwdCargo == "OPEN") {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:12", "percent", 100);
            }
            else {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:12", "percent", 0);
            }
            FMC_Utils_Doors.ShowPage(fmc);
        };

        /* RSK3 */
        fmc.onRightInput[4] = () => {
            if (door5R == "OPEN") {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:9", "percent", 100);
            }
            else {
                SimVar.SetSimVarValue("INTERACTIVE POINT GOAL:9", "percent", 0);
            }
            FMC_Utils_Doors.ShowPage(fmc);
        };

        /* LSK6 */
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        }
    }
}