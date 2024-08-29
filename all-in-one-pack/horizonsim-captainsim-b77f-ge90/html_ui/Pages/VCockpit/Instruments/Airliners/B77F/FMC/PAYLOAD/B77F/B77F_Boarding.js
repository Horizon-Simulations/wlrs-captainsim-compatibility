class HorizonSimBoarding {
    constructor() {
        this.boardingState = "finished";
        this.timeBoarding = -200;
        this.timeCargoLoading = -200;
        const payloadConstruct = new PayloadConstructor();
        this.paxStations = payloadConstruct.paxStations;
        this.cargoStations = payloadConstruct.cargoStations;
    }

    async init() {
        await HorizonSimBoarding.setTargetPax(0);
        await this.loadPaxPayload();
        await this.loadCargoZero();
        await this.loadCargoPayload();
    }
    
    async fillPaxStation(station, paxToFill) {
        const pax = Math.min(paxToFill, station.seats);
        station.pax = pax;

        await SimVar.SetSimVarValue(`L:${station.simVar}`, "KG", parseInt(pax));
    }
    
    async fillCargoStation(station, loadToFill) {
        station.load = loadToFill;
        await SimVar.SetSimVarValue(`L:${station.simVar}`, "KG", parseInt(loadToFill));
    }
    
    static async setTargetPax(numberOfPax) {
        let paxRemaining = parseInt(numberOfPax);

        async function fillStation(station, percent, paxToFill) {
            const pax = Math.min(Math.trunc(percent * paxToFill), station.seats);
            station.pax = pax;

            await SimVar.SetSimVarValue(`L:${station.simVar}_REQUEST`, "KG", parseInt(pax));

            paxRemaining -= pax;
        }
        
        await fillStation(paxStations["reliefPilot"], 0.17, numberOfPax);
        await fillStation(paxStations["jumpseatPilot"], 0.17, numberOfPax);
        await fillStation(paxStations["crew"], 1, paxRemaining);
    }
    
    static async setTargetCargo(cargo) {
        SimVar.SetSimVarValue("L:B777_CARGO_REQUEST", "KG", cargo);

        const maxLoadInCargoHold = 105223;   //kg //from flight_model.cfg     //calibrate later
        const loadableCargoWeight = cargo > maxLoadInCargoHold ? maxLoadInCargoHold : cargo;

        let remainingWeight = loadableCargoWeight;

        async function fillCargo(station, percent, loadableCargoWeight) {
            const weight = Math.round(percent * loadableCargoWeight);
            station.load = weight;
            remainingWeight -= weight;
            await SimVar.SetSimVarValue(`L:${station.simVar}_REQUEST`, "KG", parseInt(weight));
        }
        
        await fillCargo(cargoStations["AR"], 0.065, loadableCargoWeight);
        await fillCargo(cargoStations["AL"], 0.065, loadableCargoWeight);
        await fillCargo(cargoStations["BR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["BL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["CR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["CL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["DR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["DL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["ER"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["EL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["FR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["FL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["GR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["GL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["HR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["HL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["IR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["IL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["JR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["JL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["KR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["KL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["LR"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["LL"], 0.015, loadableCargoWeight);
        await fillCargo(cargoStations["MR"], 0.065, loadableCargoWeight);
        await fillCargo(cargoStations["ML"], 0.065, loadableCargoWeight);
        await fillCargo(cargoStations["N"], 0.155, loadableCargoWeight);
        await fillCargo(cargoStations["Lower12"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower13"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower14"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower21"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower22"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower23"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower24"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower25"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower31"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower32"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower33"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower41"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["Lower42"], 0.0114, loadableCargoWeight);
        await fillCargo(cargoStations["bulk"], 1, remainingWeight);
    }
    
    async loadPaxPayload() {
        for (const paxStation of Object.values(this.paxStations)) {
            await SimVar.SetSimVarValue(`PAYLOAD STATION WEIGHT:${paxStation.stationIndex}`, "KG", paxStation.pax * PAX_WEIGHT);
        }
    }

    async loadCargoPayload() {
        for (const loadStation of Object.values(this.cargoStations)) {
            await SimVar.SetSimVarValue(`PAYLOAD STATION WEIGHT:${loadStation.stationIndex}`, "KG", loadStation.load);
        }
    }

    async loadCargoZero() {
        for (const station of Object.values(this.cargoStations)) {
            await SimVar.SetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "KG", 0);
            await SimVar.SetSimVarValue(`L:${station.simVar}_REQUEST`, "KG", 0);
            await SimVar.SetSimVarValue(`L:${station.simVar}`, "KG", 0);
        }
    }
    
    async update(_deltaTime) {
        this.timeBoarding += _deltaTime;
        this.timeCargoLoading += _deltaTime;

        const boardingStartedByUser = SimVar.GetSimVarValue("L:B777_BOARDING_STARTED", "Bool");
        
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

        const isOnGround = SimVar.GetSimVarValue("SIM ON GROUND", "Bool");
        if (!boardingStartedByUser) {
            return;
        }

        if (
            (!HorizonSimBoarding.airplaneCanBoard() && boardingRate == "REAL") ||
            (!HorizonSimBoarding.airplaneCanBoard() && boardingRate == "FAST") ||
            (boardingRate == "INSTANT" && !isOnGround)
        ) {
            return;
        }

        const currentPax = Object.values(this.paxStations)
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}`, "Number"))
            .reduce((acc, cur) => acc + cur);
        const paxTarget = Object.values(this.paxStations)
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "Number"))
            .reduce((acc, cur) => acc + cur);
        const currentLoad = Object.values(this.cargoStations)
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}`, "KG"))
            .reduce((acc, cur) => acc + cur);
        const loadTarget = Object.values(this.cargoStations)
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "KG"))
            .reduce((acc, cur) => acc + cur);

        let isAllPaxStationFilled = true;

        for (const _station of Object.values(this.paxStations)) {
            const stationCurrentPax = SimVar.GetSimVarValue(`L:${_station.simVar}`, "KG");
            const stationCurrentPaxTarget = SimVar.GetSimVarValue(`L:${_station.simVar}_REQUEST`, "KG");

            if (stationCurrentPax !== stationCurrentPaxTarget) {
                isAllPaxStationFilled = false;
                break;
            }
        }

        let isAllCargoStationFilled = true;
        for (const _station of Object.values(this.cargoStations)) {
            const stationCurrentLoad = SimVar.GetSimVarValue(`L:${_station.simVar}`, "KG");
            const stationCurrentLoadTarget = SimVar.GetSimVarValue(`L:${_station.simVar}_REQUEST`, "KG");

            if (stationCurrentLoad !== stationCurrentLoadTarget) {
                isAllCargoStationFilled = false;
                break;
            }
        }

        if (currentPax === paxTarget && currentLoad === loadTarget && isAllPaxStationFilled && isAllCargoStationFilled) {
            // Finish boarding
            this.boardingState = "finished";
            await SimVar.SetSimVarValue("L:B777_BOARDING_STARTED", "Bool", false);
        } else if (currentPax < paxTarget || currentLoad < loadTarget) {
            this.boardingState = "boarding";
        } else if (currentPax === paxTarget && currentLoad === loadTarget) {
            this.boardingState = "finished";
        }
        //working
        if (boardingRate == "INSTANT") {
            // Instant
            for (const paxStation of Object.values(this.paxStations)) {
                const stationCurrentPaxTarget = SimVar.GetSimVarValue(`L:${paxStation.simVar}_REQUEST`, "KG");
                await this.fillPaxStation(paxStation, stationCurrentPaxTarget);
            }
            for (const loadStation of Object.values(this.cargoStations)) {
                const stationCurrentLoadTarget = SimVar.GetSimVarValue(`L:${loadStation.simVar}_REQUEST`, "KG");
                await this.fillCargoStation(loadStation, stationCurrentLoadTarget);
            }
            await this.loadPaxPayload();
            await this.loadCargoPayload();
            return;
        }

        let msDelayBoarding = 60;
        let msDelayCargo = 140;

        if (boardingRate == "REAL") {
            msDelayBoarding = 4000;
            msDelayCargo = 6000;
        }

        if (this.timeBoarding > msDelayBoarding) {
            this.timeBoarding = 0;

            // Stations logic:
            for (const paxStation of Object.values(this.paxStations).reverse()) {
                const stationCurrentPax = SimVar.GetSimVarValue(`L:${paxStation.simVar}`, "KG");
                const stationCurrentPaxTarget = SimVar.GetSimVarValue(`L:${paxStation.simVar}_REQUEST`, "KG");

                if (stationCurrentPax < stationCurrentPaxTarget) {
                    this.fillPaxStation(paxStation, stationCurrentPax + 1);
                    break;
                } else if (stationCurrentPax > stationCurrentPaxTarget) {
                    this.fillPaxStation(paxStation, stationCurrentPax - 1);
                    break;
                } else {
                    continue;
                }
            }

            await this.loadPaxPayload();
        }

        if (this.timeCargoLoading > msDelayCargo) {
            this.timeCargoLoading = 0;

            // Stations logic:
            for (const loadStation of Object.values(this.cargoStations)) {
                const stationCurrentLoad = SimVar.GetSimVarValue(`L:${loadStation.simVar}`, "KG");
                const stationCurrentLoadTarget = SimVar.GetSimVarValue(`L:${loadStation.simVar}_REQUEST`, "KG");

                if (stationCurrentLoad < stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) > 1200) {
                    this.fillCargoStation(loadStation, stationCurrentLoad + 1200);
                    break;
                } else if (stationCurrentLoad < stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) <= 1200) {
                    this.fillCargoStation(loadStation, stationCurrentLoad + Math.abs(stationCurrentLoadTarget - stationCurrentLoad));
                    break;
                } else if (stationCurrentLoad > stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) > 1200) {
                    this.fillCargoStation(loadStation, stationCurrentLoad - 1200);
                    break;
                } else if (stationCurrentLoad > stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) <= 1200) {
                    this.fillCargoStation(loadStation, stationCurrentLoad - Math.abs(stationCurrentLoad - stationCurrentLoadTarget));
                    break;
                } else {
                    continue;
                }
            }
            await this.loadCargoPayload();
        }


        if (isAllPaxStationFilled && isAllCargoStationFilled) {
            SimVar.SetSimVarValue("L:B777_BOARDING_STARTED", "Bool", false);
        }
    }

    static airplaneCanBoard() {
        const gs = SimVar.GetSimVarValue("GPS GROUND SPEED", "knots");
        const isOnGround = SimVar.GetSimVarValue("SIM ON GROUND", "Bool");
        const eng1Running = SimVar.GetSimVarValue("ENG COMBUSTION:1", "Bool");
        const eng2Running = SimVar.GetSimVarValue("ENG COMBUSTION:2", "Bool");

        return !(gs > 0.1 || eng1Running || eng2Running || !isOnGround);
    }
}

//teevee replacement
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