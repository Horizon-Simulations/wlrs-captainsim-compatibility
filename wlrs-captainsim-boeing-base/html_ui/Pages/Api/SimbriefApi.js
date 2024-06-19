class SimBriefApi {   
    static getFltPlanUserID(userid) {
        if (!userid) {
            throw ("No SimBrief username provided");
        }

        return fetch(`${SimBriefApi.url}&userid=${userid}`)
            .then((response) => {
                if (!response.ok) {
                    throw (response);
                }

                return response.json();
            });
    }

    static getFltPlanUsername(username) {
        if (!username) {
            throw ("No SimBrief username provided");
        }

        return fetch(`${SimBriefApi.url}&username=${username}`)
            .then((response) => {
                if (!response.ok) {
                    throw (response);
                }

                return response.json();
            });
    }
}
SimBriefApi.url = "http://www.simbrief.com/api/xml.fetcher.php?json=1";