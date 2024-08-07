class FMC_Payload {
    static ShowPage(fmc) {
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const boardingStartedByUser = SimVar.GetSimVarValue("L:B777_BOARDING_STARTED", "Bool");
        const loadButton = boardingStartedByUser ? "STOP>" : "START>";

        const boardingRateIndex = WTDataStore.get("B777 BOARDING RATE INDEX", 0);
        let boardingRate;

        switch (boardingRateIndex) {
            case 0:
                boardingRate = "REAL";
                break;
            case 1:
                boardingRate = "FAST";
                break;
            case 2:
                boardingRate = "INSTANT";
                break;
            default:
                boardingRate = "TEST";
        }
       
        //all weight are stored in tons, convert to lbs on display only
        const maxCargo = 105223;  //kgs
        SimVar.SetSimVarValue("L:B777_MAX_CARGO", "Number", maxCargo);

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        const currentTotalCrago =  kgToUser(getTotalCargo());
        const currentZFW = kgToUser(getZfw());
        const currentCG = SimVar.GetSimVarValue("CG PERCENT", "percent");
        
        const maxPax = 6; //modify depends
        const paxTarget = this.getPaxTarget();
        const currentPax = this.getCurrentPax();

        const selectedPaxText = paxTarget === 0 ? `□□□/{small}${maxPax}` : `${paxTarget}/{small}${maxPax}`;
    
        fmc.setTemplate([
            ["PAYLOAD"],
            ["\xa0ACT CARGO", "SEL CARGO"],
            [`${(currentTotalCrago).toFixed(0)}{small}${storedUnits}`, requestCargoText],
            ["\xa0CREW BOARDED", "SEL CREW"],
            [`${currentPax}/{small}${paxTarget}`, selectedPaxText],
            ["\xa0", "DETAILS"],
            ["", "SHOW>"],
            ["\xa0ZFW", "OFP REQUEST"],
            [`${currentZFW.toFixed(0)}{small}${storedUnits}`, FMC_Payload.ofpRequestText],
            ["\xa0ACT CG", "BOARDING RATE"],
            [`${currentCG.toFixed(1)}%`, `${boardingRate}>`],
            ["\xa0RETURN TO", "BOARDING"],
            ["<UTILS", loadButton],
        ]);
        
        fmc.onRightInput[0] = () => {
            let value = fmc.inOut;
            if (value) {
                value = parseFloat(value);

                /*if (userToKg(value) < 44) {
                    value = Math.round(value * 1000);
                }*/

                if (value >= 0 && userToKg(value) <= maxCargo) {
                    HorizonSimBoarding.setTargetCargo(userToKg(value));     //stored in KGs
                    fmc.clearUserInput();
                } else fmc.showErrorMessage("NOT ALLOWED");
            }
        };
        
        fmc.onRightInput[1] = () => {
            let value = fmc.inOut;
            if (value) {
                if (value >= 0 && value <= maxPax) {
                    HorizonSimBoarding.setTargetPax(value);
                    fmc.clearUserInput();
                } else fmc.showErrorMessage("NOT ALLOWED");
            }
        };
        
        fmc.onRightInput[2] = () => {
            FMC_Payload.ShowDetailsPage1(fmc);
        };
        
        fmc.onRightInput[3] = async () => {
            FMC_Payload.ofpRequestText = "SENDING";
            
            setTimeout(async () => {
                if (!fmc.simbrief.cargo || !fmc.simbrief.paxCount) await getSimBriefPlan(fmc);

                if (fmc.simbrief.cargo || fmc.simbrief.paxCount) {
                    Coherent.call("PLAY_INSTRUMENT_SOUND", "uplink_chime");

                    if (fmc.simbrief.aircraftBaseType !== "B77F") {
                        fmc.showErrorMessage('WRONG AIRCRAFT TYPE');
                        return;
                    }

                    HorizonSimBoarding.setTargetCargo(parseInt(fmc.simbrief.cargoLoad)); 

                    if (fmc.simbrief.paxCount > maxPax) {
                        HorizonSimBoarding.setTargetPax(maxPax);
                        fmc.showErrorMessage("USE CUSTOM SB AIRFRAME");
                    } else {
                        HorizonSimBoarding.setTargetPax(fmc.simbrief.paxCount);
                    }
                } else fmc.showErrorMessage("WRONG PILOT ID");

                FMC_Payload.ofpRequestText = "SEND>";
            }, fmc.getInsertDelay());
            
        };
        
        fmc.onRightInput[4] = () => {
			WTDataStore.set("B777 BOARDING RATE INDEX", parseInt((boardingRateIndex + 1) % 3));
        };

        fmc.onRightInput[5] = () => {
            if (boardingRate !== "INSTANT" && !HorizonSimFueling.airplaneCanFuel()) {
                fmc.showErrorMessage("BOARDING NOT AVAILABLE");
            } else SimVar.SetSimVarValue("L:B777_BOARDING_STARTED", "Bool", !boardingStartedByUser);
        };
        
        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        };
    }

    static ShowDetailsPage1(fmc) {
    
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowDetailsPage1(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const paxTarget = this.getPaxTarget();
        const currentPax = this.getCurrentPax();

        fmc.setTemplate([
            ["CREW DETAILS", "1", "7"],
            [`\xa0${paxStations.reliefPilot.name}`, ""],
            [this.buildStationValue(paxStations.reliefPilot), ""],
            [`\xa0${paxStations.jumpseatPilot.name}`, ""],
            [this.buildStationValue(paxStations.jumpseatPilot), ""],
            [`\xa0${paxStations.crew.name}`, ""],
            [this.buildStationValue(paxStations.crew), ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["\xa0RETURN TO", "PAX BOARDED"],
            ["<PAYLOAD", `${currentPax}/{small}${paxTarget}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onNextPage = () => {
            FMC_Payload.ShowDetailsPage2(fmc);
        }
    }

    static ShowDetailsPage2(fmc) {
    
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowDetailsPage2(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const currentTotalCrago =  kgToUser(getTotalCargo());

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        fmc.setTemplate([
            ["MAIN CARGO", "2", "7"],
            [`\xa0${cargoStations.AL.name}`, `\xa0${cargoStations.AR.name}`],
            [`${this.buildStationValue(cargoStations.AL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.AR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.BL.name}`, `\xa0${cargoStations.BR.name}`],
            [`${this.buildStationValue(cargoStations.BL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.BR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.CL.name}`, `\xa0${cargoStations.CR.name}`],
            [`${this.buildStationValue(cargoStations.CL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.CR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.DL.name}`, `\xa0${cargoStations.DR.name}`],
            [`${this.buildStationValue(cargoStations.DL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.DR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.EL.name}`, `\xa0${cargoStations.ER.name}`],
            [`${this.buildStationValue(cargoStations.EL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.ER)}{small}${storedUnits}`],
            ["\xa0RETURN TO", "CARGO LOADED"],
            ["<PAYLOAD", `${currentTotalCrago.toFixed(0)}/{small}${requestCargoText}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onPrevPage = () => {
            FMC_Payload.ShowDetailsPage1(fmc);
        }

        fmc.onNextPage = () => {
            FMC_Payload.ShowDetailsPage3(fmc);
        }
    }

    static ShowDetailsPage3(fmc) {
    
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowDetailsPage3(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const currentTotalCrago =  kgToUser(getTotalCargo());

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        fmc.setTemplate([
            ["MAIN CARGO", "3", "7"],
            [`\xa0${cargoStations.FL.name}`, `\xa0${cargoStations.FR.name}`],
            [`${this.buildStationValue(cargoStations.FL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.FR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.GL.name}`, `\xa0${cargoStations.GR.name}`],
            [`${this.buildStationValue(cargoStations.GL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.GR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.HL.name}`, `\xa0${cargoStations.HR.name}`],
            [`${this.buildStationValue(cargoStations.HL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.HR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.IL.name}`, `\xa0${cargoStations.IR.name}`],
            [`${this.buildStationValue(cargoStations.IL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.IR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.JL.name}`, `\xa0${cargoStations.JR.name}`],
            [`${this.buildStationValue(cargoStations.JL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.JR)}{small}${storedUnits}`],
            ["\xa0RETURN TO", "CARGO LOADED"],
            ["<PAYLOAD", `${currentTotalCrago.toFixed(0)}/{small}${requestCargoText}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onPrevPage = () => {
            FMC_Payload.ShowDetailsPage2(fmc);
        }

        fmc.onNextPage = () => {
            FMC_Payload.ShowDetailsPage4(fmc);
        }
    }

    static ShowDetailsPage4(fmc) {
    
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowDetailsPage4(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const currentTotalCrago =  kgToUser(getTotalCargo());

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        fmc.setTemplate([
            ["MAIN CARGO", "4", "7"],
            [`\xa0${cargoStations.KL.name}`, `\xa0${cargoStations.KR.name}`],
            [`${this.buildStationValue(cargoStations.KL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.KR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.LL.name}`, `\xa0${cargoStations.LR.name}`],
            [`${this.buildStationValue(cargoStations.LL)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.LR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.ML.name}`, `\xa0${cargoStations.MR.name}`],
            [`${this.buildStationValue(cargoStations.ML)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.MR)}{small}${storedUnits}`],
            [`\xa0${cargoStations.N.name}`],
            [`${this.buildStationValue(cargoStations.N)}{small}${storedUnits}`],
            [""],
            [""],
            ["\xa0RETURN TO", "CARGO LOADED"],
            ["<PAYLOAD", `${currentTotalCrago.toFixed(0)}/{small}${requestCargoText}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onPrevPage = () => {
            FMC_Payload.ShowDetailsPage3(fmc);
        }

        fmc.onNextPage = () => {
            FMC_Payload.ShowDetailsPage5(fmc);
        }
    }

    static ShowDetailsPage5(fmc) {
    
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowDetailsPage5(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const currentTotalCrago =  kgToUser(getTotalCargo());

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        fmc.setTemplate([
            ["LOWER FWD CARGO", "5", "7"],
            [`\xa0${cargoStations.lower12.name}`, `\xa0${cargoStations.lower13.name}`],
            [`${this.buildStationValue(cargoStations.lower12)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.lower13)}{small}${storedUnits}`],
            [`\xa0${cargoStations.lower14.name}`, `\xa0${cargoStations.lower21.name}`],
            [`${this.buildStationValue(cargoStations.lower14)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.lower21)}{small}${storedUnits}`],
            [`\xa0${cargoStations.lower22.name}`, `\xa0${cargoStations.lower23.name}`],
            [`${this.buildStationValue(cargoStations.lower22)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.lower23)}{small}${storedUnits}`],
            [`\xa0${cargoStations.lower24.name}`, `\xa0${cargoStations.lower25.name}`],
            [`${this.buildStationValue(cargoStations.lower24)}{small}${storedUnits}`, `${this.buildStationValue(cargoStations.lower25)}{small}${storedUnits}`],
            [""],
            [""],
            ["\xa0RETURN TO", "CARGO LOADED"],
            ["<PAYLOAD", `${currentTotalCrago.toFixed(0)}/{small}${requestCargoText}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onPrevPage = () => {
            FMC_Payload.ShowDetailsPage4(fmc);
        }

        fmc.onNextPage = () => {
            FMC_Payload.ShowDetailsPage6(fmc);
        }
    }

    static ShowDetailsPage6(fmc) {
    
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowDetailsPage6(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const currentTotalCrago =  kgToUser(getTotalCargo());

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        fmc.setTemplate([
            ["LOWER AFT CARGO", "6", "7"],
            [`\xa0${cargoStations.lower33.name}`],
            [`${this.buildStationValue(cargoStations.lower33)}{small}${storedUnits}`],
            [`\xa0${cargoStations.lower41.name}`],
            [`${this.buildStationValue(cargoStations.lower41)}{small}${storedUnits}`],
            [`\xa0${cargoStations.lower42.name}`],
            [`${this.buildStationValue(cargoStations.lower42)}{small}${storedUnits}`],
            [""],
            [""],
            [""],
            [""],
            ["\xa0RETURN TO", "CARGO LOADED"],
            ["<PAYLOAD", `${currentTotalCrago.toFixed(0)}/{small}${requestCargoText}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onPrevPage = () => {
            FMC_Payload.ShowDetailsPage5(fmc);
        }

        fmc.onNextPage = () => {
            FMC_Payload.ShowDetailsPage7(fmc);
        }
    }

    static ShowDetailsPage7(fmc) {
    
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Payload.ShowDetailsPage7(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const currentTotalCrago =  kgToUser(getTotalCargo());

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        fmc.setTemplate([
            ["BULK CARGO", "7", "7"],
            [`\xa0${cargoStations.bulk.name}`],
            [`${this.buildStationValue(cargoStations.bulk)}{small}${storedUnits}`],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            ["\xa0RETURN TO", "CARGO LOADED"],
            ["<PAYLOAD", `${currentTotalCrago.toFixed(0)}/{small}${requestCargoText}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onPrevPage = () => {
            FMC_Payload.ShowDetailsPage6(fmc);
        }
    }
    
    static buildStationValue(station) {
        const targetStation = SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "KG");
        const currentStation = SimVar.GetSimVarValue(`L:${station.simVar}`, "KG");

        return `${kgToUser(currentStation).toFixed(0)}/{small}${kgToUser(targetStation).toFixed(0)}`;
    }

    static getPaxTarget() {
        return Object.values(paxStations)
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "Number"))
            .reduce((acc, cur) => acc + cur);
    }

    static getCurrentPax() {
        return Object.values(paxStations)
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}`, "Number"))
            .reduce((acc, cur) => acc + cur);
    }
}


function userToKg(userInput) {
    const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");
    if (storedUnits == "LBS") {
        return userInput/2.205;
    }
    return userInput;
}

function kgToUser(userInput) {
    const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");
    if (storedUnits == "LBS") {
        return userInput*2.205;
    }
    return userInput;
}

FMC_Payload.ofpRequestText = "SEND>";
