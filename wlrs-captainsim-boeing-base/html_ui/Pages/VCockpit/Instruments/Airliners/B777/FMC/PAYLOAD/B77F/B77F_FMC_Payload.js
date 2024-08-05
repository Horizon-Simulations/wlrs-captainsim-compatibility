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
        const maxCargo = 105223  //kgs
        SimVar.SetSimVarValue("L:B777_MAX_CARGO", "Number", maxCargo);

        const requestCargo = SimVar.GetSimVarValue("L:B777_CARGO_REQUEST", "KG");
        const requestCargoText = requestCargo === 0 ? "□□□□□□" : `${(kgToUser(requestCargo)).toFixed(0)}{small}${storedUnits}`;
        
        const currentTotalCrago =  kgToUser(getTotalCargo());
        const currentTotalPayload = kgToUser(getTotalPayload());
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

                if (userToKg(value) < 44) {
                    value = Math.round(value * 1000);
                }
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

                    if (fmc.simbrief.paxCount > maxPax) {          //work on this later
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
            ["PAX DETAILS", "1", "2"],
            [`\xa0${paxStations.businessClass.name}`, ""],
            [this.buildStationValue(paxStations.businessClass), ""],
            [`\xa0${paxStations.premiumEconomy.name}`, ""],
            [this.buildStationValue(paxStations.premiumEconomy), ""],
            [`\xa0${paxStations.forwardEconomy.name}`, ""],
            [this.buildStationValue(paxStations.forwardEconomy), ""],
            [`\xa0${paxStations.rearEconomy.name}`, ""],
            [this.buildStationValue(paxStations.rearEconomy), ""],
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
        
        fmc.setTemplate([           //CALIBRATE LATER
            ["CARGO DETAILS", "2", "2"],
            [`\xa0${cargoStations.fwdBag.name}`, ""],
            [`${this.buildStationValue(cargoStations.fwdBag)}{small}${storedUnits}`, ""],
            [`\xa0${cargoStations.aftBag.name}`, ""],
            [`${this.buildStationValue(cargoStations.aftBag)}{small}${storedUnits}`, ""],
            [`\xa0${cargoStations.bulkBag.name}`, ""],
            [`${this.buildStationValue(cargoStations.bulkBag)}{small}${storedUnits}`, ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["\xa0RETURN TO", "CARGO LOADED"],
            ["<PAYLOAD", `${currentTotalCrago.toFixed(0)}/{small}${requestCargoText}`],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Payload.ShowPage(fmc);
        };

        fmc.onPrevPage = () => {
            FMC_Payload.ShowDetailsPage1(fmc);
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
