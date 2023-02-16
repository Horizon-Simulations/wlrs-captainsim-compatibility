class B77HS_CDU_MainDisplay extends FMCMainDisplay {
    constructor() {
        super(...arguments);
        this._registered = false;
        this._forceNextAltitudeUpdate = false;
        this._lastUpdateAPTime = NaN;
        this.refreshFlightPlanCooldown = 0;
        this.updateAutopilotCooldown = 0;
        this._lastHasReachFlex = false;
        this._apMasterStatus = false;
        this._hasReachedTopOfDescent = false;
        this._apCooldown = 500;
        this._lastRequestedFLCModeWaypointIndex = -1;
        this.messages = [];
        this.sentMessages = [];
        this.activeSystem = 'FMGC';
        this._cruiseEntered = false;
        this._blockFuelEntered = false;
        this._gpsprimaryack = 0;
        this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_PREFLIGHT;
        this.activeWaypointIdx = -1;
        this.constraintAlt = 0;
        this.constraintAltCached = 0;
        this.fcuSelAlt = 0;
        this.updateTypeIIMessage = false;
        this.altLock = 0;
        this.messageQueue = [];
        this._destDataChecked = false;
        this._towerHeadwind = 0;
        this._conversionWeight = parseFloat(NXDataStore.get("CONFIG_USING_METRIC_UNIT", "1"));
        this._EfobBelowMinClr = false;
        this.simbrief = {
            route: "",
            cruiseAltitude: "",
            originIcao: "",
            destinationIcao: "",
            blockFuel: "",
            payload: undefined,
            estZfw: "",
            sendStatus: "READY",
            costIndex: "",
            navlog: [],
            icao_airline: "",
            flight_number: "",
            alternateIcao: "",
            avgTropopause: "",
            ete: "",
            blockTime: "",
            outTime: "",
            onTime: "",
            inTime: "",
            offTime: "",
            taxiFuel: "",
            tripFuel: ""
        };
        this.aocWeight = {
            blockFuel: undefined,
            estZfw: undefined,
            taxiFuel: undefined,
            tripFuel: undefined,
            payload: undefined
        };
        this.aocTimes = {
            doors: 0,
            off: 0,
            out: 0,
            on: 0,
            in: 0,
        };
    }
    get templateID() {
        return "B777_CDU";
    }
    connectedCallback() {
        super.connectedCallback();
        RegisterViewListener("JS_LISTENER_KEYEVENT", () => {
            console.log("JS_LISTENER_KEYEVENT registered.");
            RegisterViewListener("JS_LISTENER_FACILITY", () => {
                console.log("JS_LISTENER_FACILITY registered.");
                this._registered = true;
            });
        });
    }
    Init() {
        super.Init();

        this.B77HSCore = new this.B77HS_Core()
        this.B77HSCore.init(this._lastTime);

        const flightNo = SimVar.GetSimVarValue("ATC FLIGHT NUMBER", "string");
        NXApi.connectTelex(flightNo)
            .catch((err) => {
                if (err !== NXApi.disabledError) {
                    this.showErrorMessage("FLT NBR IN USE");
                }
            });

        this.defaultInputErrorMessage = "NOT ALLOWED";
    }
}
registerInstrument("b77hs-cdu-main-display", B77HS_CDU_MainDisplay);