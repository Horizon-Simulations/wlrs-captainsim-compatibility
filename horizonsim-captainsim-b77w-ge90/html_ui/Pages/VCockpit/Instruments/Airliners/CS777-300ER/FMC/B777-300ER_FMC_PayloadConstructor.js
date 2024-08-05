class PayloadConstructor {
    constructor() {
        //based on https://www.seatguru.com/airlines/Air_New_Zealand/Air_New_Zealand_Boeing_777-200_NL.php
        //this works? yes:D
        this.paxStations = {
            rearEconomy: {
                name: 'Rear Economy',
                seats: 122,
                weight: 22592,      //10248kg
                pax: 0,
                paxTarget: 0,
                stationIndex: 6 + 1,
                position: -65.75,
                seatsRange: [181, 312],
                simVar: "PAYLOAD STATION WEIGHT:7"
            },
            forwardEconomy: {
                name: 'Foward Economy',
                seats: 202,
                weight: 37408,  //16968kg
                pax: 0,
                paxTarget: 0,
                stationIndex: 5 + 1,
                position: -11.75,
                seatsRange: [79, 180],
                simVar: "PAYLOAD STATION WEIGHT:6"
            },
            premiumEconomy: {
                name: 'Premium Economy',
                seats: 48,
                weight: 8889,   //4032kg
                pax: 0,
                paxTarget: 0,
                stationIndex: 4 + 1,
                position: 34.7,
                seatsRange: [31, 79],
                simVar: "PAYLOAD STATION WEIGHT:5"
            },
            businessClass: {
                name: 'Business Class',
                seats: 30,
                weight: 5555,       //2520kg does it matters?
                pax: 0,
                paxTarget: 0,
                stationIndex: 3 + 1,
                position: 70.01,
                seatsRange: [1, 30],
                simVar: "PAYLOAD STATION WEIGHT:4"
            }
        };

        this.cargoStations = {
            fwdBag: {
                name: 'Foward baggage',
                weight: 22225,  //update this
                load: 0,
                stationIndex: 7 + 1,
                position: 45.083,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:8',
            },
            aftBag: {
                name: 'Rear baggage',
                weight: 15875,      //update this
                load: 0,
                stationIndex: 8 + 1,
                position: -35.75,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:9',
            },
            bulkBag: {
                name: 'Bulk baggage',
                weight: 5800,       //update this
                load: 0,
                stationIndex: 9 + 1,
                position: -65,
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
const PAX_WEIGHT = 84;  //kg
const BAG_WEIGHT = 22;  //kg

/**
 * Calculate %MAC ZWFCG of all stations
 */
function getZfwcg() {
    const currentPaxWeight = PAX_WEIGHT + BAG_WEIGHT;

    const leMacZ = -1.31; // Value from Debug Weight
    const macSize = 44; // Value from Debug Aircraft Sim Tunning??   % MAC?

    const emptyWeight = 370000 * 0.453592; // Value from flight_model.cfg to kgs
    const emptyPosition = -8.44; // Value from flight_model.cfg
    const emptyMoment = emptyPosition * emptyWeight;

    const paxTotalMass = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "KG") * currentPaxWeight)
        .reduce((acc, cur) => acc + cur, 0);
    const paxTotalMoment = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "Number") * currentPaxWeight * station.position)
        .reduce((acc, cur) => acc + cur, 0);

    const cargoTotalMass = Object.values(cargoStations)
        .map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "KG"))
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
        .map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "KG"))
        .reduce((acc, cur) => acc + cur, 0);

    return cargoTotalMass;
}

/* Get total payload weight (pax + cargo) */
function getTotalPayload() {
    const currentPaxWeight = PAX_WEIGHT;

    const paxTotalMass = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}`, "KG") * currentPaxWeight)
        .reduce((acc, cur) => acc + cur, 0);
    const cargoTotalMass = getTotalCargo();

    return paxTotalMass + cargoTotalMass;
}

/* Get ZFW */
function getZfw() {
    const emptyWeight = 370000 * 0.453592; // Value from flight_model.cfg to kgs
    return emptyWeight + getTotalPayload();
}