const B77HS_Util = {};

let nxNotificationsListener;

B77HS_Util.createDeltaTimeCalculator = (startTime = Date.now()) => {
    let lastTime = startTime;

    return () => {
        const nowTime = Date.now();
        const deltaTime = nowTime - lastTime;
        lastTime = nowTime;

        return deltaTime;
    };
};

B77HS_Util.createFrameCounter = (interval = 5) => {
    let count = 0;
    return () => {
        const c = count++;
        if (c == interval) {
            count = 0;
        }
        return c;
    };
};

B77HS_Util.createMachine = (machineDef) => {
    const machine = {
        value: machineDef.init,
        action(event) {
            const currStateDef = machineDef[machine.value];
            const destTransition = currStateDef.transitions[event];
            if (!destTransition) {
                return;
            }
            const destState = destTransition.target;

            machine.value = destState;
        },
        setState(newState) {
            const valid = machineDef[newState];
            if (valid) {
                machine.value = newState;
            }
        },
    };
    return machine;
};

/**
 * Compute a true heading from a magnetic heading
 * @param {Number} heading true heading
 * @param {Number=} magVar falls back to current aircraft position magvar
 * @returns magnetic heading
 */
B77HS_Util.trueToMagnetic = (heading, magVar) => (720 + heading - (magVar || SimVar.GetSimVarValue('MAGVAR', 'degree'))) % 360;

/**
 * Compute a magnetic heading from a true heading
 * @param {Number} heading magnetic heading
 * @param {Number=} magVar falls back to current aircraft position magvar
 * @returns true heading
 */
B77HS_Util.magneticToTrue = (heading, magVar) => (720 + heading + (magVar || SimVar.GetSimVarValue('MAGVAR', 'degree'))) % 360;

/**
 * Takes a LatLongAlt or LatLong and returns a vector of spherical co-ordinates
 * @param {(LatLong | LatLongAlt)} ll
 */
B77HS_Util.latLonToSpherical = (ll) => [
    Math.cos(ll.lat * Avionics.Utils.DEG2RAD) * Math.cos(ll.long * Avionics.Utils.DEG2RAD),
    Math.cos(ll.lat * Avionics.Utils.DEG2RAD) * Math.sin(ll.long * Avionics.Utils.DEG2RAD),
    Math.sin(ll.lat * Avionics.Utils.DEG2RAD),
];

/**
 * Takes a vector of spherical co-ordinates and returns a LatLong
 * @param {[x: number, y: number, z: number]} s
 * @returns {LatLong}
 */
B77HS_Util.sphericalToLatLon = (s) => new LatLong(Math.asin(s[2]) * Avionics.Utils.RAD2DEG, Math.atan2(s[1], s[0]) * Avionics.Utils.RAD2DEG);

/**
 * Computes the intersection point of two (true) bearings on a great circle
 * @param {(LatLong | LatLongAlt)} latlon1
 * @param {number} brg1
 * @param {(LatLong | LatLongAlt)} latlon2
 * @param {number} brg2
 * @returns {LatLong}
 */
B77HS_Util.greatCircleIntersection = (latlon1, brg1, latlon2, brg2) => {
    // c.f. https://blog.mbedded.ninja/mathematics/geometry/spherical-geometry/finding-the-intersection-of-two-arcs-that-lie-on-a-sphere/
    const Pa11 = B77HS_Util.latLonToSpherical(latlon1);
    const latlon12 = Avionics.Utils.bearingDistanceToCoordinates(brg1 % 360, 100, latlon1.lat, latlon1.long);
    const Pa12 = B77HS_Util.latLonToSpherical(latlon12);
    const Pa21 = B77HS_Util.latLonToSpherical(latlon2);
    const latlon22 = Avionics.Utils.bearingDistanceToCoordinates(brg2 % 360, 100, latlon2.lat, latlon2.long);
    const Pa22 = B77HS_Util.latLonToSpherical(latlon22);

    const N1 = math.cross(Pa11, Pa12);
    const N2 = math.cross(Pa21, Pa22);

    const L = math.cross(N1, N2);
    const l = math.norm(L);

    const I1 = math.divide(L, l);
    const I2 = math.multiply(I1, -1);

    const s1 = B77HS_Util.sphericalToLatLon(I1);
    const s2 = B77HS_Util.sphericalToLatLon(I2);

    const brgTos1 = Avionics.Utils.computeGreatCircleHeading(latlon1, s1);
    const brgTos2 = Avionics.Utils.computeGreatCircleHeading(latlon1, s2);

    const delta1 = Math.abs(brg1 - brgTos1);
    const delta2 = Math.abs(brg1 - brgTos2);

    return delta1 < delta2 ? s1 : s2;
};

B77HS_Util.bothGreatCircleIntersections = (latlon1, brg1, latlon2, brg2) => {
    // c.f. https://blog.mbedded.ninja/mathematics/geometry/spherical-geometry/finding-the-intersection-of-two-arcs-that-lie-on-a-sphere/
    const Pa11 = B77HS_Util.latLonToSpherical(latlon1);
    const latlon12 = Avionics.Utils.bearingDistanceToCoordinates(brg1 % 360, 100, latlon1.lat, latlon1.long);
    const Pa12 = B77HS_Util.latLonToSpherical(latlon12);
    const Pa21 = B77HS_Util.latLonToSpherical(latlon2);
    const latlon22 = Avionics.Utils.bearingDistanceToCoordinates(brg2 % 360, 100, latlon2.lat, latlon2.long);
    const Pa22 = B77HS_Util.latLonToSpherical(latlon22);

    const N1 = math.cross(Pa11, Pa12);
    const N2 = math.cross(Pa21, Pa22);

    const L = math.cross(N1, N2);
    const l = math.norm(L);

    const I1 = math.divide(L, l);
    const I2 = math.multiply(I1, -1);

    const s1 = B77HS_Util.sphericalToLatLon(I1);
    const s2 = B77HS_Util.sphericalToLatLon(I2);

    return [s1, s2];
};

/**
 * Returns the ISA temperature for a given altitude
 * @param alt {number} altitude in ft
 * @returns {number} ISA temp in C°
 */
B77HS_Util.getIsaTemp = (alt = Simplane.getAltitude()) => Math.min(alt, 36089) * -0.0019812 + 15;

/**
 * Returns the deviation from ISA temperature and OAT at given altitude
 * @param alt {number} altitude in ft
 * @returns {number} ISA temp deviation from OAT in C°
 */
B77HS_Util.getIsaTempDeviation = (alt = Simplane.getAltitude(), sat = Simplane.getAmbientTemperature()) => sat - B77HS_Util.getIsaTemp(alt);

/**
 * Utility class to throttle instrument updates
 */
class UpdateThrottler {
    /**
     * @param {number} intervalMs Interval between updates, in milliseconds
     */
    constructor(intervalMs) {
        this.intervalMs = intervalMs;
        this.currentTime = 0;
        this.lastUpdateTime = 0;

        // Take a random offset to space out updates from different instruments among different
        // frames as much as possible.
        this.refreshOffset = Math.floor(Math.random() * intervalMs);
        this.refreshNumber = 0;
    }

    /**
     * Checks whether the instrument should be updated in the current frame according to the
     * configured update interval.
     *
     * @param {number} deltaTime
     * @param {boolean} [forceUpdate = false] - True if you want to force an update during this frame.
     * @returns -1 if the instrument should not update, or the time elapsed since the last
     *          update in milliseconds
     */
    canUpdate(deltaTime, forceUpdate = false) {
        this.currentTime += deltaTime;
        const number = Math.floor((this.currentTime + this.refreshOffset) / this.intervalMs);
        const update = number > this.refreshNumber;
        this.refreshNumber = number;
        if (update || forceUpdate) {
            const accumulatedDelta = this.currentTime - this.lastUpdateTime;
            this.lastUpdateTime = this.currentTime;
            return accumulatedDelta;
        }
        return -1;
    }
}

B77HS_Util.UpdateThrottler = UpdateThrottler;

/**
 * NotificationParams class container for popups to package popup metadata
 */
class NotificationParams {
    constructor() {
        this.__Type = 'SNotificationParams';
        this.buttons = [];
        this.style = 'normal';
        this.displayGlobalPopup = true;
    }
}

/**
 * NXPopUp utility class to create a pop-up UI element
 */
class NXPopUp {
    constructor() {
        this.params = new NotificationParams();
        this.popupListener;
        this.params.title = 'B77HS POPUP';
        this.params.time = new Date().getTime();
        this.params.id = `${this.params.title}_${this.params.time}`;
        this.params.contentData = 'Default Message';
        this.params.style = 'small';
        this.params.buttons.push(new NotificationButton('TT:MENU.YES', `B77HS_POP_${this.params.id}_YES`));
        this.params.buttons.push(new NotificationButton('TT:MENU.NO', `B77HS_POP_${this.params.id}_NO`));
    }

    _showPopUp(params) {
        try {
            Coherent.trigger('SHOW_POP_UP', params);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Show popup with given or already initiated parameters
     * @param {string} title Title for popup - will show in menu bar
     * @param {string} message Popup message
     * @param {string} style Style/Type of popup. Valid types are small|normal|big|big-help
     * @param {function} callbackYes Callback function -> YES button is clicked.
     * @param {function} callbackNo Callback function -> NO button is clicked.
     */
    showPopUp(title, message, style, callbackYes, callbackNo) {
        if (title) {
            this.params.title = title;
        }
        if (message) {
            this.params.contentData = message;
        }
        if (style) {
            this.params.style = style;
        }
        if (callbackYes) {
            const yes = (typeof callbackYes === 'function') ? callbackYes : () => callbackYes;
            Coherent.on(`B77HS_POP_${this.params.id}_YES`, () => {
                Coherent.off(`B77HS_POP_${this.params.id}_YES`, null, null);
                yes();
            });
        }
        if (callbackNo) {
            const no = (typeof callbackNo === 'function') ? callbackNo : () => callbackNo;
            Coherent.on(`B77HS_POP_${this.params.id}_NO`, () => {
                Coherent.off(`B77HS_POP_${this.params.id}_NO`, null, null);
                no();
            });
        }

        if (!this.popupListener) {
            this.popupListener = RegisterViewListener('JS_LISTENER_POPUP', this._showPopUp.bind(null, this.params));
        } else {
            this._showPopUp();
        }
    }
}

/**
 * NXNotif utility class to create a notification event and element
 */

class NXNotifManager {
    constructor() {
        Coherent.on('keyIntercepted', (key) => this.registerIntercepts(key));
        Coherent.call('INTERCEPT_KEY_EVENT', 'PAUSE_TOGGLE', 0);
        Coherent.call('INTERCEPT_KEY_EVENT', 'PAUSE_ON', 0);
        Coherent.call('INTERCEPT_KEY_EVENT', 'PAUSE_OFF', 0);
        Coherent.call('INTERCEPT_KEY_EVENT', 'PAUSE_SET', 0);
        this.notifications = [];
    }

    registerIntercepts(key) {
        switch (key) {
        case 'PAUSE_TOGGLE':
        case 'PAUSE_ON':
        case 'PAUSE_OFF':
        case 'PAUSE_SET':
            this.notifications.forEach((notif) => {
                notif.hideNotification();
            });
            this.notifications.length = 0;
            break;
        default:
            break;
        }
    }

    showNotification(params = {}) {
        const notif = new NXNotif();
        notif.showNotification(params);
        this.notifications.push(notif);
    }
}

class NXNotif {
    constructor() {
        const title = 'B77HS ALERT';
        this.time = new Date().getTime();
        this.params = {
            id: `${title}_${this.time}`,
            title,
            type: 'MESSAGE',
            theme: 'GAMEPLAY',
            image: 'IMAGE_NOTIFICATION',
            description: 'Default Message',
            timeout: 10000,
            time: this.time,
        };
    }

    setData(params = {}) {
        if (params.title) {
            this.params.title = params.title;
            this.params.id = `${params.title}_${new Date().getTime()}`;
        }
        if (params.type) {
            this.params.type = params.type;
        }
        if (params.theme) {
            this.params.theme = params.theme;
        }
        if (params.image) {
            this.params.image = params.image;
        }
        if (params.message) {
            this.params.description = params.message;
        }
        if (params.timeout) {
            this.params.timeout = params.timeout;
        }
    }

    /**
     * Show notification with given or already initiated parametrs.
     * @param {string} params.title Title for notification - will show as the message header
     * @param {string} params.type Type of Notification - Valid types are MESSAGE|SUBTITLES
     * @param {string} params.theme Theme of Notification. Valid types are TIPS|GAMEPLAY|SYSTEM
     * @param {string} params.image Notification image. Valid types are IMAGE_NOTIFICATION|IMAGE_SCORE
     * @param {string} params.message Notification message
     * @param {number} params.timeout Time in ms before notification message will disappear
     */
    showNotification(params = {}) {
        this.setData(params);

        if (!nxNotificationsListener) {
            nxNotificationsListener = RegisterViewListener('JS_LISTENER_NOTIFICATIONS');
        }
        nxNotificationsListener.triggerToAllSubscribers('SendNewNotification', this.params);
        setTimeout(() => {
            this.hideNotification();
        }, this.params.timeout);
    }

    // TODO FIXME: May break in the future, check every update
    hideNotification() {
        nxNotificationsListener.triggerToAllSubscribers('HideNotification', this.params.type, null, this.params.id);
    }
}

B77HS_Util.meterToFeet = (meterValue) => meterValue / 0.3048;
