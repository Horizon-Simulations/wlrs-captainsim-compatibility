class PayloadConstructor {
    constructor() {
        //based on https://www.seatguru.com/airlines/Air_New_Zealand/Air_New_Zealand_Boeing_777-200_NL.php
        //this works? yes:D
        this.paxStations = {
            rearEconomy: {
                name: 'Rear Economy',
                seats: 126,
                weight: 21632,
                pax: 0,
                paxTarget: 0,
                stationIndex: 6 + 1,
                position: -45.042,
                seatsRange: [181, 312],
                simVar: "PAYLOAD STATION WEIGHT:7"
            },
            forwardEconomy: {
                name: 'Foward Economy',
                seats: 123,
                weight: 3744,
                pax: 0,
                paxTarget: 0,
                stationIndex: 5 + 1,
                position: -11.042,
                seatsRange: [58, 180],
                simVar: "PAYLOAD STATION WEIGHT:6"
            },
            premiumEconomy: {
                name: 'Premium Economy',
                seats: 40,
                weight: 3328,
                pax: 0,
                paxTarget: 0,
                stationIndex: 4 + 1,
                position: 20.708,
                seatsRange: [27, 57],
                simVar: "PAYLOAD STATION WEIGHT:5"
            },
            businessClass: {
                name: 'Business Class',
                seats: 26,
                weight: 5400,
                pax: 0,
                paxTarget: 0,
                stationIndex: 3 + 1,
                position: 46.875,
                seatsRange: [1, 26],
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
const PAX_WEIGHT = WTDataStore.get("PAYLOAD PAX WEIGHT", 84);  //kg
const BAG_WEIGHT = WTDataStore.get("PAYLOAD BAG WEIGHT", 22);  //kg

/**
 * Calculate %MAC ZWFCG of all stations
 */
function getZfwcg() {
    const currentPaxWeight = PAX_WEIGHT + BAG_WEIGHT;

    const leMacZ = 1.12; // Value from Debug Weight
    const macSize = 44; // Value from Debug Aircraft Sim Tunning?? Weight  % MAC?

    const emptyWeight = 320800 * 0.453592; // Value from flight_model.cfg to kgs
    const emptyPosition = -10.15; // Value from flight_model.cfg
    const emptyMoment = emptyPosition * emptyWeight;

    const paxTotalMass = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "KG") * currentPaxWeight)
        .reduce((acc, cur) => acc + cur, 0);
    const paxTotalMoment = Object.values(paxStations)
        .map((station) => SimVar.GetSimVarValue(`L:${station.simVar}_REQUEST`, "KG") * currentPaxWeight * station.position)
        .reduce((acc, cur) => acc + cur, 0);

    const cargoTotalMass = Object.values(cargoStations)
        .map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "KG"))
        .reduce((acc, cur) => acc + cur, 0);
    const cargoTotalMoment = Object.values(cargoStations)
        .map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, "KG") * station.position)
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
    const emptyWeight = 320800 * 0.453592; // Value from flight_model.cfg to kgs
    return emptyWeight + getTotalPayload();
}