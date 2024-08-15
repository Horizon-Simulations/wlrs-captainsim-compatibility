class HorizonSimBoarding {
    constructor() {
        this.boardingState = "finished";
        this.timeBoarding = -200;
        this.timeCargoLoading = -300;
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
        
        await fillStation(paxStations["businessClass"], 0.07, numberOfPax);
        await fillStation(paxStations["premiumEconomy"], 0.12, numberOfPax);
        await fillStation(paxStations["forwardEconomy"], 0.51, numberOfPax);
        await fillStation(paxStations["rearEconomy"], 0.31, numberOfPax);
        //await fillStation(paxStations["rearEconomy"], 1, paxRemaining);
    }
    
    static async setTargetCargo(cargo) {
        SimVar.SetSimVarValue("L:B777_CARGO_REQUEST", "KG", cargo);

        const maxLoadInCargoHold = 56034; // from flight_model.cfg in kg
        const loadableCargoWeight = cargo > maxLoadInCargoHold ? maxLoadInCargoHold : cargo;

        let remainingWeight = loadableCargoWeight;

        async function fillCargo(station, percent, loadableCargoWeight) {
            const weight = Math.round(percent * loadableCargoWeight);
            station.load = weight;
            remainingWeight -= weight;
            await SimVar.SetSimVarValue(`L:${station.simVar}_REQUEST`, "KG", parseInt(weight));
        }
        
        await fillCargo(cargoStations["fwdBag"], 0.54, loadableCargoWeight);
        await fillCargo(cargoStations["aftBag"], 0.34, loadableCargoWeight);
        await fillCargo(cargoStations["bulkBag"], 1, remainingWeight);  //try not to use this last
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
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}`, "KG"))
            .reduce((acc, cur) => acc + cur);
        const paxTarget = Object.values(this.paxStations)
            .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "KG"))
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

                if (stationCurrentLoad < stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) > 40) {
                    this.fillCargoStation(loadStation, stationCurrentLoad + 40);
                    break;
                } else if (stationCurrentLoad < stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) <= 40) {
                    this.fillCargoStation(loadStation, stationCurrentLoad + Math.abs(stationCurrentLoadTarget - stationCurrentLoad));
                    break;
                } else if (stationCurrentLoad > stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) > 40) {
                    this.fillCargoStation(loadStation, stationCurrentLoad - 40);
                    break;
                } else if (stationCurrentLoad > stationCurrentLoadTarget && Math.abs(stationCurrentLoadTarget - stationCurrentLoad) <= 40) {
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