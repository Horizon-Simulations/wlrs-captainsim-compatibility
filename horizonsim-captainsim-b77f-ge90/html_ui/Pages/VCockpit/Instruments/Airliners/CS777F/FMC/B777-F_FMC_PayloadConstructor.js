class PayloadConstructor {
    constructor() {
        //based on https://www.seatguru.com/airlines/Air_New_Zealand/Air_New_Zealand_Boeing_777-200_NL.php
        //this works? yes:D
        this.paxStations = {
            reliefPilot: {
                name: 'Relief Pilot',
                seats: 1,
                weight: 190,
                pax: 0,
                paxTarget: 0,
                stationIndex: 43 + 1,
                position: 74.0,
                seatsRange: [1, 2],
                simVar: "PAYLOAD STATION WEIGHT:44"
            },
            jumpseatPilot: {
                name: 'Jumpseat Pilot',
                seats: 1,
                weight: 190,
                pax: 0,
                paxTarget: 0,
                stationIndex: 44 + 1,
                position: 74,
                seatsRange: [2, 3],
                simVar: "PAYLOAD STATION WEIGHT:45"
            },
            crew: {
                name: 'Crew',
                seats: 4,
                weight: 760,
                pax: 0,
                paxTarget: 0,
                stationIndex: 45 + 1,
                position: 64,
                seatsRange: [3, 7],
                simVar: "PAYLOAD STATION WEIGHT:46"
            }
        };

        this.cargoStations = {
            AR: {
                name: "AR",
                weight: 14491,
                load: 0,
                stationIndex: 2+1,
                position: 56.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:3',
            },
            AL: {
                name: "AL",
                weight: 14491,
                load: 0,
                stationIndex: 3+1,
                position: 56.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:4',
            },
            BR: {
                name: "BR",
                weight: 3501,
                load: 0,
                stationIndex: 4+1,
                position: 46.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:5',
            },
            BL: {
                name: "BL",
                weight: 3501,
                load: 0,
                stationIndex: 5+1,
                position: 46.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:6',
            },
            CR: {
                name: "CR",
                weight: 14491,
                load: 0,
                stationIndex: 7,
                position: 35.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:7',
            },
            CL: {
                name: "CL",
                weight: 3501,
                load: 0,
                stationIndex: 7+1,
                position: 35.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:8',
            },
            DR: {
                name: "DR",
                weight: 3501,
                load: 0,
                stationIndex: 8+1,
                position: 24.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:9',
            },
            DL: {
                name: "DL",
                weight: 3501,
                load: 0,
                stationIndex: 9+1,
                position: 24.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:10',
            },
            ER: {
                name: "ER",
                weight: 3501,
                load: 0,
                stationIndex: 10+1,
                position: 14.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:11',
            },
            EL: {
                name: "EL",
                weight: 3501,
                load: 0,
                stationIndex: 11+1,
                position: 14.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:12',
            },
            FR: {
                name: "FR",
                weight: 3501,
                load: 0,
                stationIndex: 12+1,
                position: 4.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:13',
            },
            FL: {
                name: "FL",
                weight: 3501,
                load: 0,
                stationIndex: 13+1,
                position: 4.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:14',
            },
            GR: {
                name: "GR",
                weight: 3501,
                load: 0,
                stationIndex: 14+1,
                position: -6.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:15',
            },
            GL: {
                name: "GL",
                weight: 3501,
                load: 0,
                stationIndex: 15+1,
                position: -6.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:16',
            },
            HR: {
                name: "HR",
                weight: 3501,
                load: 0,
                stationIndex: 16+1,
                position: -17.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:17',
            },
            HL: {
                name: "HL",
                weight: 3501,
                load: 0,
                stationIndex: 17+1,
                position: -17.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:18',
            },
            IR: {
                name: "IR",
                weight: 3501,
                load: 0,
                stationIndex: 18+1,
                position: -27.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:19',
            },
            IL: {
                name: "IL",
                weight: 3501,
                load: 0,
                stationIndex: 19+1,
                position: -27.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:20',
            },
            JR: {
                name: "JR",
                weight: 3501,
                load: 0,
                stationIndex: 20+1,
                position: -38.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:21',
            },
            JL: {
                name: "JL",
                weight: 3501,
                load: 0,
                stationIndex: 21+1,
                position: -38.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:22',
            },
            KR: {
                name: "KR",
                weight: 3501,
                load: 0,
                stationIndex: 22+1,
                position: -48.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:23',
            },
            KL: {
                name: "KL",
                weight: 3501,
                load: 0,
                stationIndex: 23+1,
                position: -48.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:24',
            },
            LR: {
                name: "LR",
                weight: 3501,
                load: 0,
                stationIndex: 24+1,
                position: -59.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:25',
            },
            LL: {
                name: "LL",
                weight: 3501,
                load: 0,
                stationIndex: 25+1,
                position: -59.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:26',
            },
            MR: {
                name: "MR",
                weight: 14491,
                load: 0,
                stationIndex: 26+1,
                position: -69.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:27',
            },
            ML: {
                name: "ML",
                weight: 14491,
                load: 0,
                stationIndex: 27+1,
                position: -69.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:28',
            },
            N: {
                name: "N",
                weight: 36000,
                load: 0,
                stationIndex: 28+1,
                position: -77.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:29',
            },

            lower12: {
                name: "Lower12",
                weight: 2645,
                load: 0,
                stationIndex: 29+1,
                position: 55.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:30',
            },
            lower13: {
                name: "Lower13",
                weight: 2645,
                load: 0,
                stationIndex: 30+1,
                position: 49.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:31',
            },
            lower14: {
                name: "Lower14",
                weight: 2645,
                load: 0,
                stationIndex: 31+1,
                position: 44.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:32',
            },
            lower21: {
                name: "Lower21",
                weight: 2645,
                load: 0,
                stationIndex: 32+1,
                position: 38.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:33',
            },
            lower22: {
                name: "Lower22",
                weight: 2645,
                load: 0,
                stationIndex: 33+1,
                position: 33.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:34',
            },
            lower23: {
                name: "Lower23",
                weight: 2645,
                load: 0,
                stationIndex: 34+1,
                position: 27.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:35',
            },
            lower24: {
                name: "Lower24",
                weight: 2645,
                load: 0,
                stationIndex: 35+1,
                position: 21.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:36',
            },
            lower25: {
                name: "Lower25",
                weight: 2645,
                load: 0,
                stationIndex: 36+1,
                position: 15.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:37',
            },
            lower31: {
                name: "Lower31",
                weight: 2645,
                load: 0,
                stationIndex: 37+1,
                position: -33.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:38',
            },
            lower32: {
                name: "Lower32",
                weight: 2645,
                load: 0,
                stationIndex: 38+1,
                position: -39.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:39',
            },
            lower33: {
                name: "Lower33",
                weight: 2645,
                load: 0,
                stationIndex: 39+1,
                position: -45.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:40',
            },
            lower41: {
                name: "Lower41",
                weight: 2645,
                load: 0,
                stationIndex: 40+1,
                position: -50.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:41',
            },
            lower42: {
                name: "Lower42",
                weight: 2645,
                load: 0,
                stationIndex: 41+1,
                position: -56.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:42',
            },

            bulk: {
                name: "bulk",
                weight: 36000,
                load: 0,
                stationIndex: 42+1,
                position: -69.0,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:43',
            }
        };
    }
}

const payloadConstruct = new PayloadConstructor();
const paxStations = payloadConstruct.paxStations;
const cargoStations = payloadConstruct.cargoStations;

const MAX_SEAT_AVAILABLE = 6;   //25 acording to simbrief
const PAX_WEIGHT = 84;  //kg
const BAG_WEIGHT = 22;  //kg

/**
 * Calculate %MAC ZWFCG of all stations
 */
function getZfwcg() {
    const currentPaxWeight = PAX_WEIGHT + BAG_WEIGHT;

    const leMacZ = -0.94; // Value from Debug Weight
    const macSize = 36.68; // Value from Debug Aircraft Sim Tunning??

    const emptyWeight = 318300 * 0.453592; // Value from flight_model.cfg to kgs
    const emptyPosition = -9.73; // Value from flight_model.cfg
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
    const emptyWeight = 318300 * 0.453592; // Value from flight_model.cfg to kgs
    return emptyWeight + getTotalPayload();
}