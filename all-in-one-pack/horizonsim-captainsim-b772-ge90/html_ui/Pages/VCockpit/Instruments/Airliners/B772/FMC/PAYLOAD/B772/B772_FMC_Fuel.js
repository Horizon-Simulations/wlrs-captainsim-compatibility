class FMC_Fuel {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        
        const updateView = () => {
            FMC_Fuel.ShowPage(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const refuelStartedByUser = SimVar.GetSimVarValue("L:B777_FUELING_STARTED", "Bool");
        const refuelingRateIndex = WTDataStore.get("B777 REFUEL RATE INDEX", 0);
        let refuelingRate;

        switch (refuelingRateIndex) {
            case 0:
                refuelingRate = "REAL";
                break;
            case 1:
                refuelingRate = "FAST";
                break;
            case 2:
                refuelingRate = "INSTANT";
                break;
            default:
                refuelingRate = "TEST";
        }
        //will always STORE in KG
        const grossWeightText = (SimVar.GetSimVarValue("TOTAL WEIGHT", storedUnits)).toFixed(0);

        const weightPerGallon = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", storedUnits);
        const currentFuel = (SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * weightPerGallon).toFixed(0); //kg
        const targetFuel = kgToUser(SimVar.GetSimVarValue("L:B777_FUEL_REQUEST", "KG"));         

        const targetFuelText = targetFuel <= 1 ? "□□□□□□" : `${kgToUser(targetFuel).toFixed(0)}{small}${storedUnits}`;

        const currentCG = SimVar.GetSimVarValue("CG PERCENT", "percent over 100");

            fmc.setTemplate([
                ["FUEL"],
                ["\xa0CURRENT", "REQUEST"],
                [`${currentFuel}{small}${storedUnits}`, targetFuelText],
                ["\xa0GROSS WT"],
                [`${grossWeightText}{small}${storedUnits}`],
                ["\xa0CG", "TANKS DETAIL"],
                [`${(currentCG* 100).toFixed(1).toString()}%`, "VIEW>"],
                ["", "OFP REQUEST"],
                ["", FMC_Fuel.ofpRequestText],
                ["", "REFUEL RATE"],
                ["", `${refuelingRate}>`],
                ["\xa0RETURN TO", "REFUEL"],
                ["<UTILS", refuelStartedByUser ? "STOP>" : "START>"],
            ]);
        
        fmc.onRightInput[0] = () => {
            let value = fmc.inOut;
            if (value) {
                value = parseFloat(value);

                if (value >= 0 && userToKg(value) <= 137427) {  //calibrate later
                    setDesiredFuel(fmc, updateView, userToKg(value));
                    fmc.clearUserInput();
                } else fmc.showErrorMessage("NOT ALLOWED");
            }
        };

        fmc.onRightInput[2] = () => {
			FMC_Fuel.ShowDetailPage(fmc);
        };

        fmc.onRightInput[3] = async () => {

            FMC_Fuel.ofpRequestText = "SENDING";

            setTimeout(async () => {
                if (!fmc.simbrief.blockFuel) await getSimBriefPlan(fmc);
                if (fmc.simbrief.blockFuel) {
                    const desiredFuel = parseFloat(fmc.simbrief.blockFuel);
                    Coherent.call("PLAY_INSTRUMENT_SOUND", "uplink_chime");     //INOP
                    setDesiredFuel(fmc, updateView, userToKg(desiredFuel));
                } else fmc.showErrorMessage("SOM TING WONG");

                FMC_Fuel.ofpRequestText = "SEND>";
            }, fmc.getInsertDelay())


            const desiredFuel = parseFloat(fmc.simbrief.blockFuel);
            setDesiredFuel(fmc, updateView, userToKg(desiredFuel));
        };

        fmc.onRightInput[4] = () => {
			WTDataStore.set("B777 REFUEL RATE INDEX", parseInt((refuelingRateIndex + 1) % 3));
        };

        fmc.onLeftInput[5] = () => {
            FMC_Utils.ShowPage1(fmc);
        };
        
        fmc.onRightInput[5] = () => {
            if (refuelingRate !== "INSTANT" && !HorizonSimFueling.airplaneCanFuel()) {
                fmc.showErrorMessage("FUELING NOT AVAILABLE");
            } else {
                SimVar.SetSimVarValue("L:B777_FUELING_STARTED", "Bool", !refuelStartedByUser);
            }
        };
        
    }

    static ShowDetailPage(fmc) {
        fmc.clearDisplay();

        const updateView = () => {
            FMC_Fuel.ShowDetailPage(fmc);
        };

        fmc.refreshPageCallback = () => {
            updateView();
        };

        SimVar.SetSimVarValue("L:FMC_UPDATE_CURRENT_PAGE", "number", 1);

        const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");

        const weightPerGallon = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", storedUnits);

        const fuelTankCenterCurText = (SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "gallon")*weightPerGallon).toFixed(0);
        const fuelTankLeftCurText = (SimVar.GetSimVarValue("FUEL TANK CENTER QUANTITY", "gallon")*weightPerGallon).toFixed(0);
        const fuelTankRightCurText = (SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "gallon")*weightPerGallon).toFixed(0);


        fmc.setTemplate([
            ["FUEL TANKS DETAIL"],
            ["CENTER", ""],
            [`${fuelTankCenterCurText}{small}${storedUnits}`, ""],
            ["LEFT MAIN", ""],
            [`${fuelTankLeftCurText}{small}${storedUnits}`, ""],
            ["RIGHT MAIN", ""],
            [`${fuelTankRightCurText}{small}${storedUnits}`, ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["\xa0RETURN TO", ""],
            ["<FUEL PAGE", ""],
        ]);

        fmc.onLeftInput[5] = () => {
            FMC_Fuel.ShowPage(fmc);
        };

    }
}

async function setDesiredFuel(fmc, updateView, blockFuel) {
    SimVar.SetSimVarValue("L:B777_FUEL_REQUEST", "KG", userToKg(blockFuel));

    const centerTankCapacity = 27290;       //calibrate later
    const leftMainTankCapacity = 9300;
    const rightMainTankCapacity = 9300;
    const totalMainTanksCapacity = leftMainTankCapacity+rightMainTankCapacity;

    const fuelWeightPerGallon = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "KG");
    let currentBlockFuelInGallons = blockFuel / fuelWeightPerGallon;

    const mainTankFill = Math.min(totalMainTanksCapacity, currentBlockFuelInGallons);
    await SimVar.SetSimVarValue(`L:B777_FUEL_TANK_LEFT_MAIN_QUANTITY_REQUEST`, "Gallons", mainTankFill/2);
    await SimVar.SetSimVarValue(`L:B777_FUEL_TANK_RIGHT_MAIN_QUANTITY_REQUEST`, "Gallons", mainTankFill/2);
    currentBlockFuelInGallons -= mainTankFill;

    const centerTankFill = Math.min(centerTankCapacity, currentBlockFuelInGallons);
    await SimVar.SetSimVarValue(`L:B777_FUEL_TANK_CENTER_QUANTITY_REQUEST`, "Gallons", centerTankFill);
    currentBlockFuelInGallons -= centerTankFill;

    fmc.updateFuelVars();
    updateView();
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

FMC_Fuel.ofpRequestText = "SEND>";