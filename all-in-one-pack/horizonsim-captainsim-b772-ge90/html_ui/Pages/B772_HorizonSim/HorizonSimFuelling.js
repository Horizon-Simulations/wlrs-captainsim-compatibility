const CENTER_MODIFIER = 3;

class HorizonSimFueling {
    init() {
        SimVar.SetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons", 2500);
        SimVar.SetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons", 2500);
        SimVar.SetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons", 0);
        SimVar.SetSimVarValue("L:FUEL_TEMP", "Celsius", 20);
        this.timeRefueling = -200;
    }

    constructor() {}

    defuelTank() {
        return 29;
    }

    refuelTank() {
        return 29;
    }

    update(_deltaTime) {
        /* Fuel current sim vars */
        const main1CurrentSimVar = SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons");
        const main2CurrentSimVar = SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons");
        const centerCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons");

        const refuelStartedByUser = SimVar.GetSimVarValue("L:B777_FUELING_STARTED", "Bool");
        const isOnGround = SimVar.GetSimVarValue("SIM ON GROUND", "Bool");

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
                refuelingRate = "INSTANT";
        }

        if (!refuelStartedByUser) {
            return;
        }
        if (
            (!HorizonSimFueling.airplaneCanFuel() && refuelingRate == "REAL") ||
            (!HorizonSimFueling.airplaneCanFuel() && refuelingRate == "FAST") ||
            (refuelingRate == "INSTANT" && !isOnGround)
        ) {
            return;
        }

        /* Fuel target sim vars */
        const main1TargetSimVar = SimVar.GetSimVarValue("L:B777_FUEL_TANK_LEFT_MAIN_QUANTITY_REQUEST", "Gallons");
        const main2TargetSimVar = SimVar.GetSimVarValue("L:B777_FUEL_TANK_RIGHT_MAIN_QUANTITY_REQUEST", "Gallons");
        const centerTargetSimVar = SimVar.GetSimVarValue("L:B777_FUEL_TANK_CENTER_QUANTITY_REQUEST", "Gallons");

        let main1Current = main1CurrentSimVar;
        let main2Current = main2CurrentSimVar;
        let centerCurrent = centerCurrentSimVar;

        let main1Target = main1TargetSimVar;
        let main2Target = main2TargetSimVar;
        let centerTarget = centerTargetSimVar;

        if (refuelingRate == "INSTANT") {
            SimVar.SetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons", main1Target);
            SimVar.SetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons", main2Target);
            SimVar.SetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons", centerTarget);
            SimVar.SetSimVarValue("L:B777_FUELING_STARTED", "Bool", false);
            return;
        }
        
        this.timeRefueling += _deltaTime;

        let msDelayRefueling = 2000;    //update (refuel) every second
        if (refuelingRate == "FAST") {
            msDelayRefueling = 200;
        }
        
        //DEFUELING (order is MAIN WING TANKS, CENTER)
        /* Center */
        if (this.timeRefueling > msDelayRefueling) {
            this.timeRefueling = 0;

            if (centerCurrent > centerTarget) {
                centerCurrent += this.defuelTank();
                if (centerCurrent < centerTarget) {
                    centerCurrent = centerTarget;
                }
                SimVar.SetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons", centerCurrent);
                if (centerCurrent != centerTarget) {
                    return;
                }
            }
            /* Main 1 and 2*/
            if (main1Current > main1Target || main2Current > main2Target) {
                main1Current += this.defuelTank();
                main2Current += this.defuelTank();
                if (main1Current < main1Target) {
                    main1Current = main1Target;
                }
                if (main2Current < main2Target) {
                    main2Current = main2Target;
                }
                SimVar.SetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons", main1Current);
                SimVar.SetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons", main2Current);
                if (main1Current != main1Target || main2Current != main2Target) {
                    return;
                }
            }

            // REFUELING (order is MAIN WING TANKS, CENTER)
            /* Main 1 and 2 */
            if (main1Current < main1Target || main2Current < main2Target) {
                main1Current += this.refuelTank();
                main2Current += this.refuelTank();
                if (main1Current > main1Target) {
                    main1Current = main1Target;
                }
                if (main2Current > main2Target) {
                    main2Current = main2Target;
                }
                SimVar.SetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons", main1Current);
                SimVar.SetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons", main2Current);
                if (main1Current != main1Target || main2Current != main2Target) {
                    return;
                }
            }
            /* Center */
            if (centerCurrent < centerTarget) {
                centerCurrent += this.refuelTank();
                if (centerCurrent > centerTarget) {
                    centerCurrent = centerTarget;
                }
                SimVar.SetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons", centerCurrent);
                if (centerCurrent != centerTarget) {
                    return;
                }
            }
            // Done fueling
            SimVar.SetSimVarValue("L:B777_FUELING_STARTED", "Bool", false);
        }
        

    }

    static airplaneCanFuel() {
        const gs = SimVar.GetSimVarValue("GPS GROUND SPEED", "knots");
        const isOnGround = SimVar.GetSimVarValue("SIM ON GROUND", "Bool");
        const eng1Running = SimVar.GetSimVarValue("ENG COMBUSTION:1", "Bool");
        const eng2Running = SimVar.GetSimVarValue("ENG COMBUSTION:2", "Bool");

        return !(gs > 0.1 || eng1Running || eng2Running || !isOnGround);
    }
}