class NXApi {
    static getMetar(icao, source) {
        if (!icao) {
            throw ("No ICAO provided");
        }

        return fetch(`${NXApi.url}/metar/${icao}?source=${source}`)
            .then((response) => {
                if (!response.ok) {
                    throw (response);
                }

                return response.json();
            });
    }

    static getTaf(icao, source) {
        if (!icao) {
            throw ("No ICAO provided");
        }

        return fetch(`${NXApi.url}/taf/${icao}?source=${source}`)
            .then((response) => {
                if (!response.ok) {
                    throw (response);
                }

                return response.json();
            });
    }

    static getAtis(icao, source) {
        if (!icao) {
            throw ("No ICAO provided");
        }

        return fetch(`${NXApi.url}/atis/${icao}?source=${source}`)
            .then((response) => {
                if (!response.ok) {
                    throw (response);
                }

                return response.json();
            });
    }
/*
    static postHoppieLogin(code, callsign, controller, type, packet) {
        if (!code) {
            throw ("Invalid logon code");
        }

        return fetch(`${NXApi.url}/api/v1/hoppie`)
            .then((response) => {
                if (!response.ok) {
                    throw (response);
                }

                return response.json();
                //404 - not found
                //201 - message addressed
            });
    }
*/
}

NXApi.url = "https://api.flybywiresim.com";