class PayloadConstructor {
    constructor() {
        //based on https://www.seatguru.com/airlines/Air_New_Zealand/Air_New_Zealand_Boeing_777-200_NL.php
        //this works? yes:D
        this.paxStations = {
            rearEconomy: {
                name: 'Rear Economy',
                seats: 208,
                weight: 21632,
                pax: 0,
                paxTarget: 0,
                stationIndex: 6 + 1,
                position: -148.319361,
                seatsRange: [157, 364],
                simVar: "PAYLOAD STATION WEIGHT:7"
            },
            forwardEconomy: {
                name: 'Foward Economy',
                seats: 36,
                weight: 3744,
                pax: 0,
                paxTarget: 0,
                stationIndex: 5 + 1,
                position: -81.274814,
                seatsRange: [121, 156],
                simVar: "PAYLOAD STATION WEIGHT:6"
            },
            premiumEconomy: {
                name: 'Premium Economy',
                seats: 32,
                weight: 3328,
                pax: 0,
                paxTarget: 0,
                stationIndex: 4 + 1,
                position: -100.362841,
                seatsRange: [89, 120],
                simVar: "PAYLOAD STATION WEIGHT:5"
            },
            businessClass: {
                name: 'Business Class',
                seats: 48,
                weight: 5400,
                pax: 0,
                paxTarget: 0,
                stationIndex: 3 + 1,
                position: -44.383345,
                seatsRange: [41, 88],
                simVar: "PAYLOAD STATION WEIGHT:4"
            }
        };

        this.cargoStations = {
            fwdBag: {
                name: 'Foward baggage',
                weight: 22225,
                load: 0,
                stationIndex: 7 + 1,
                position: -28.56284,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:8',
            },
            aftBag: {
                name: 'Rear baggage',
                weight: 15875,
                load: 0,
                stationIndex: 8 + 1,
                position: -138.077047,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:9',
            },
            bulkBag: {
                name: 'Bulk baggage',
                weight: 5800,
                load: 0,
                stationIndex: 9 + 1,
                position: -138.077047,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:10',
            }
        };
    }
}

const payloadConstruct = new PayloadConstructor();
const paxStations = payloadConstruct.paxStations;
const cargoStations = payloadConstruct.cargoStations;

const MAX_SEAT_AVAILABLE = 312;
const PAX_WEIGHT = WTDataStore.get("PAYLOAD PAX WEIGHT", 84);  //kg
const BAG_WEIGHT = WTDataStore.get("PAYLOAD BAG WEIGHT", 22);  //kg

/**
 * Calculate %MAC ZWFCG of all stations
 */
function getZfwcg() {
    const currentPaxWeight = PAX_WEIGHT + BAG_WEIGHT;

    const leMacZ = -1.47; // Value from Debug Weight
    const macSize = 36.68; // Value from Debug Aircraft Sim Tunning

    const emptyWeight = 489656 * 0.453592; // Value from flight_model.cfg to kgs
    const emptyPosition = -98; // Value from flight_model.cfg
    const emptyMoment = emptyPosition * emptyWeight;

    const paxTotalMass = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_DESIRED`, "Number") * currentPaxWeight)
        .reduce((acc, cur) => acc + cur, 0);
    const paxTotalMoment = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_DESIRED`, "Number") * currentPaxWeight * station.position)
        .reduce((acc, cur) => acc + cur, 0);

    const cargoTotalMass = Object.values(cargoStations)
        .map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "Number"))
        .reduce((acc, cur) => acc + cur, 0);
    const cargoTotalMoment = Object.values(cargoStations)
        .map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "Number") * station.position)
        .reduce((acc, cur) => acc + cur, 0);

    const totalMass = emptyWeight + paxTotalMass + cargoTotalMass;
    const totalMoment = emptyMoment + paxTotalMoment + cargoTotalMoment;

    const cgPosition = totalMoment / totalMass;
    const cgPositionToLemac = cgPosition - leMacZ;
    const cgPercentMac = -10 * (cgPositionToLemac / macSize);

    return cgPercentMac;
}

/* Get total cargo weight */
function getTotalCargo() {
    return Object.values(cargoStations)
        .filter((station) => station.visible)
        .map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "Number"))
        .reduce((acc, cur) => acc + cur, 0);

    return cargoTotalMass;
}

/* Get total payload weight (pax + cargo) */
function getTotalPayload() {
    const currentPaxWeight = PAX_WEIGHT;

    const paxTotalMass = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}`, "Number") * currentPaxWeight)
        .reduce((acc, cur) => acc + cur, 0);
    const cargoTotalMass = getTotalCargo();

    return paxTotalMass + cargoTotalMass;
}

/* Get ZFW */
function getZfw() {
    const emptyWeight = 489656 * 0.453592; // Value from flight_model.cfg to kgs
    return emptyWeight + getTotalPayload();
}
