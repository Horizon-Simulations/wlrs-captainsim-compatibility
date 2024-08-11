class B777_FMC_MainDisplay extends Boeing_FMC {
    constructor() {
        super(...arguments);
        this.activeSystem = "FMC";
        this._registered = false;
        this._lastActiveWP = 0;
        this._wasApproachActive = false;
        this.selectedApproachFlap = NaN;
        this.selectedApproachSpeed = NaN;
        this._climbN1Table = [
            [96.5,  97.2,  97.0,  97.4,  96.7,  95.1,  96.1,  95.1,  94.7],
            [97.6,  98.7,  99.0,  99.6,  98.9,  97.3,  98.2,  95.0,  93.8],
            [98.8,  99.8, 100.4, 101.2, 101.0,  99.3, 100.1,  97.0,  95.8],
            [99.1, 101.1, 101.6, 102.4, 102.5, 101.2, 101.9,  98.8,  97.7],    
            [97.5, 101.3, 103.3, 103.8, 104.1, 102.8, 103.4, 100.5,  99.4],
            [95.8,  99.6, 102.9, 104.4, 105.6, 104.6, 104.7, 102.6, 100.9],
            [94.2,  97.8, 101.1, 102.6, 105.0, 106.9, 106.5, 104.3, 102.4],
            [92.5,  96.1,  99.4, 100.8, 103.2, 105.3, 107.1, 106.3, 104.3],
            [90.8,  94.3,  97.6,  99.0, 101.5, 103.4, 105.1, 106.5, 106.4],
            [89.1,  92.4,  95.7,  97.1,  99.7, 101.5, 103.2, 104.4, 104.4],
            [87.3,  90.5,  93.9,  95.2,  97.8,  99.5, 101.2, 102.2, 102.2],
            [85.5,  88.6,  91.9,  93.3,  95.8,  97.5,  99.1, 100.1, 100.1]
        ];
        this._climbN1TempRow = [60, 50, 40, 30, 20, 10, 0, -10, -20, -30, -40, -50];
        this._takeOffN1Table = [
            [106.1, 106.1, 105.9, 105.5, 105.1, 104.9, 104.7],
            [106.8, 106.9, 106.8, 106.5, 106.1, 105.9, 105.7],
            [107.5, 107.5, 107.5, 107.3, 107.0, 106.9, 106.6],
            [108.2, 108.2, 108.2, 108.0, 107.9, 107.8, 107.7],
            [109.0, 108.9, 109.0, 108.8, 108.7, 108.7, 108.6],
            [109.1, 109.8, 109.8, 109.7, 109.6, 109.7, 103.6],
            [108.2, 108.9, 110.3, 110.6, 110.5, 110.6, 110.6],
            [107.3, 108.0, 109.4, 110.6, 111.3, 112.0, 112.1],
            [106.4, 107.1, 108.5, 109.7, 110.0, 112.0, 112.1],
            [105.5, 106.2, 107.5, 108.8, 110.0, 111.3, 112.1],
            [103.6, 104.3, 105.7, 106.9, 108.1, 109.4, 110.1],
            [101.7, 102.4, 103.8, 104.9, 106.1, 107.4, 108.1],
            [ 99.8, 100.4, 101.8, 103.0, 104.2, 105.4, 106.1],
            [ 97.9,  98.5,  99.8, 101.0, 102.2, 103.4, 104.0],
            [ 95.9,  96.4,  97.8,  99.0, 100.1, 101.3, 102.0],
            [ 93.8,  94.4,  95.8,  96.9,  98.0,  99.2,  99.8]
        ];
        this._takeOffN1TempRow = [55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 0, -10, -20, -30, -40, -50];
        this._thrustTakeOffMode = 0;
        this._thrustCLBMode = 0;
        this._thrustTakeOffTemp = 20;
        this._lastUpdateAPTime = NaN;
        this.refreshFlightPlanCooldown = 0;
        this.updateAutopilotCooldown = 0;
        this._hasSwitchedToHoldOnTakeOff = false;
        this._previousApMasterStatus = false;
        this._apMasterStatus = false;
        this._apHasDeactivated = false;
        this._previousAThrStatus = false;
        this._aThrStatus = false;
        this._aThrHasActivated = false;
        this._hasReachedTopOfDescent = false;
        this._apCooldown = 500;
        this._pilotWaypoints = undefined;
        this._lnav = undefined;
        this._fpHasChanged = false;
        this._activatingDirectTo = false;
        this._activatingDirectToExisting = false;
        this.vfrLandingRunway = undefined;
        this.vfrRunwayExtension = undefined;
        this.modVfrRunway = false;
        this.deletedVfrLandingRunway = undefined;
        this.selectedWaypoint = undefined;
        this.throttleHasIdled = false;
        this.landingReverseAvail = false;
        this.togaSpeedSet = false;

        //Timer for periodic page refresh
        this._pageRefreshTimer = null;

        /* SALTY VARS */
        this._TORwyWindHdg = "";
        this._TORwyWindSpd = "";
        this.messages = [];
        this.sentMessages = [];
        this.units;
        this.useLbs;
        this.atcComm = {            
            estab: false,
            loggedTo: "",
            nextCtr: "",
            maxUlDelay: "",
            ads: "",
            adsEmerg: "",
            dlnkStatus: "NO COMM",
            uplinkPeding: false,
            fltNo: "",
            origin: "",
            planDep: "",
            dest: "",
            eta: "",
            altn: "",
            company: ""
        };
        this.companyComm = {
            estab: false,
            company: "",
        };
        this.simbrief = {
            route: "",
            cruiseAltitude: "",
            originIcao: "",
            destinationIcao: "",
            blockFuel: "",
            payload: "",
            estZfw: "",
            costIndex: "",
            navlog: "",
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
            tripFuel: "",
            altnFuel: "",
            finResFuel: "",
            contFuel: "",
            route_distance: "",
            rteUplinkReady: false,            
            perfUplinkReady: false
        }
        this.fixInfo = [];
        this.pdc = {
            fltNo: "",
            dept: "",
            atis: "",
            stand: "",
            acType: "",
            dest: "",
            freeText: "",
            ats: "",
            sendStatus: ""
        }
    }
    get templateID() { return "B777_FMC"; }
    
    // Property for EXEC handling
    get fpHasChanged() {
        return this._fpHasChanged;
    }
    set fpHasChanged(value) {
        this._fpHasChanged = value;
        if (this._fpHasChanged) {
            SimVar.SetSimVarValue("L:FMC_EXEC_ACTIVE", "number", 1);
        } else {
            SimVar.SetSimVarValue("L:FMC_EXEC_ACTIVE", "number", 0);
        }
    }

    connectedCallback() {
        super.connectedCallback();
        if (!this._registered) {
            RegisterViewListener("JS_LISTENER_KEYEVENT", () => {
                console.log("JS_LISTENER_KEYEVENT registered.");
                RegisterViewListener("JS_LISTENER_FACILITY", () => {
                    console.log("JS_LISTENER_FACILITY registered.");
                    this._registered = true;
                });
            });

            this.addEventListener("FlightStart", async function () {
                if (localStorage.length > 0) {
                    localStorage.clear();
                }
            }.bind(this));
        }
    }
    Init() {
        super.Init();
        // Maybe this gets rid of slowdown on first fpln mod
        this.flightPlanManager.copyCurrentFlightPlanInto(1);
        this.timer = 0;
        let oat = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        this._thrustTakeOffTemp = Math.ceil(oat / 10) * 10;
        this.aircraftType = Aircraft.B777;
        this.maxCruiseFL = 430;
        this.HorizonSimBase = new HorizonSimBase();
        this.saltyModules = new SaltyModules();
        this.HorizonSimBase.init();
        if (WTDataStore.get("OPTIONS_UNITS", "KG") == "KG") {
            this.units = true;
            this.useLbs = false;
        } else if (WTDataStore.get("OPTIONS_UNITS", "KG") == "LBS") {
            this.units = false;
            this.useLbs = true;
        }
        this.updateVREF30();
        this.onInit = () => {
            B777_FMC_InitRefIndexPage.ShowPage1(this);
        };
        this.onLegs = () => {
            B777_FMC_LegsPage.ShowPage1(this);
        };
        this.onRte = () => {
            FMCRoutePage.ShowPage1(this);
        };
        this.onAltn = () => {
            FMCRoutePage.ShowPage2(this);
        };
        this.onDepArr = () => {
            B777_FMC_DepArrIndexPage.ShowPage1(this);
        };
        this.onRad = () => {
            B777_FMC_NavRadioPage.ShowPage(this);
        };
        this.onVNAV = () => {
            if (Simplane.getCurrentFlightPhase() <= FlightPhase.FLIGHT_PHASE_CLIMB) {
                B777_FMC_VNAVPage.ShowPage1(this);
            }
            else if (Simplane.getCurrentFlightPhase() === FlightPhase.FLIGHT_PHASE_CRUISE) {
                B777_FMC_VNAVPage.ShowPage2(this);
                this.flightPhaseHasChangedToCruise === false;
            }
            else {
                B777_FMC_VNAVPage.ShowPage3(this);
                this.flightPhaseHasChangedToDescent === false;
            }
        };
        this.onProg = () => {
            B777_FMC_ProgPage.ShowPage1(this);
        };
        this.onAtc = () => { 
            //FMC_ATC_Index.ShowPage(this);
        };
        this.onFmcComm = () => { 
            FMC_COMM_Index.ShowPage(this);
        };
        this.onMenu = () => { 
            FMC_Menu.ShowPage(this);
        };
        this.onHold = () => {
            B777_FMC_HoldsPage.handleHoldPressed(this);
        };
        FMC_Menu.ShowPage(this);
        this._pilotWaypoints = new CJ4_FMC_PilotWaypoint_Manager(this);
        this._pilotWaypoints.activate();
    }
    onInteractionEvent(args) {
        super.onInteractionEvent(args);
        const apPrefix = "B777_AP_";
        if (args[0].startsWith(apPrefix)) {
            this._navModeSelector.onNavChangedEvent(args[0].substring(apPrefix.length));
        }
    }
    onPowerOn() {
        super.onPowerOn();
        Coherent.call("GENERAL_ENG_THROTTLE_MANAGED_MODE_SET", ThrottleMode.HOLD);
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.updateAutopilot();
        //this.updateAutoThrottle();        //will implement with the switch later
        this.updateUnits();
        this.updateAltitudeAlerting();
        if (this.timer == 1000) {
            this.updateVREF20();
            this.updateVREF25();
            this.updateVREF30();
            this.timer = 0;
        }
        
        this.saltyModules.update(_deltaTime);
        this.timer ++;

		this.updatePaxSignal();
        this.APStateManager();
        this.flapsSlatsManager();

        if (this.refreshPageCallback && this._lastActiveWP != this.currFlightPlanManager.getActiveWaypointIndex() || this._wasApproachActive != this.currFlightPlanManager.isActiveApproach()) {
            this._lastActiveWP = this.currFlightPlanManager.getActiveWaypointIndex();
            this._wasApproachActive = this.currFlightPlanManager.isActiveApproach();
            //this.refreshPageCallback();
        }
        
		this.HorizonSimBase.update(_deltaTime);
    }
    updateUnits() {
        if (WTDataStore.get("OPTIONS_UNITS", "KG") == "KG") {
            this.units = true;
            this.useLbs = false;
        } else if (WTDataStore.get("OPTIONS_UNITS", "KG") == "LBS") {
            this.units = false;
            this.useLbs = true;
        }
    }
    flapsSlatsManager() {
        //FLAPS LIMIT ARE IN FM.CFG
        //AUTOFLAPS retract
        if (SimVar.GetSimVarValue("INDICATED ALTITUDE", "feet") > 20000) {
            SimVar.SetSimVarValue("LEADING EDGE FLAPS LEFT PERCENT", "Percent Over 100", 0);
            SimVar.SetSimVarValue("TRAILING EDGE FLAPS LEFT PERCENT", "Percent Over 100", 0);
            SimVar.SetSimVarValue("LEADING EDGE FLAPS RIGHT PERCENT", "Percent Over 100", 0);
            SimVar.SetSimVarValue("TRAILING EDGE FLAPS RIGHT PERCENT", "Percent Over 100", 0);
        }
        //AUTOSLATS anti stall. Disabled due to imediate response
        /*
        if (SimVar.GetSimVarValue("AIRSPEED INDICATED", "Kts") < SimVar.GetSimVarValue("L:B777_FMC_MIN_MANUEVER_SPEED", "Kts")) {
            SimVar.SetSimVarValue("LEADING EDGE FLAPS LEFT PERCENT", "Percent Over 100", 1);
            SimVar.SetSimVarValue("LEADING EDGE FLAPS RIGHT PERCENT", "Percent Over 100", 1);
        }
        else {
            let slatPosition = [0, 0.5, 0.5, 0.5, 0.5, 1, 1];
            //set to handle. This will overrides the handle in fm and cockpit anw
            let index = SimVar.GetSimVarValue("FLAPS HANDLE INDEX", "Number");
            SimVar.SetSimVarValue("LEADING EDGE FLAPS LEFT PERCENT", "Percent Over 100", slatPosition[index]);
            SimVar.SetSimVarValue("LEADING EDGE FLAPS RIGHT PERCENT", "Percent Over 100", slatPosition[index]);
        }
        */
    }
	APStateManager() {
        let isOn = SimVar.GetSimVarValue("AUTOPILOT MASTER", "Bool");
        SimVar.SetSimVarValue("L:B777_Boeing_Autopilot_Disconnected", "Bool", isOn ? 0 : 1);
    }
    updatePaxSignal() {
        if ((SimVar.GetSimVarValue("L:WT_SEAT_BELTS_MODE", "number") == 1 && SimVar.GetSimVarValue("A:INDICATED ALTITUDE", "feet") < 10000) || SimVar.GetSimVarValue("L:WT_SEAT_BELTS_MODE", "number") == 2) {
            SimVar.SetSimVarValue("L:XMLVAR_SEAT_BELTS_ON", "Bool", true);
        }
        else {
            SimVar.SetSimVarValue("L:XMLVAR_SEAT_BELTS_ON", "Bool", false);
        }

        if ((SimVar.GetSimVarValue("L:NO_SMOKING_KNOB", "number") == 1 && SimVar.GetSimVarValue("A:INDICATED ALTITUDE", "feet") < 10000) || SimVar.GetSimVarValue("L:NO_SMOKING_KNOB", "number") == 2) {
            SimVar.SetSimVarValue("L:XMLVAR_NO_SMOKING_ON", "Bool", true);
        }
        else {
            SimVar.SetSimVarValue("L:XMLVAR_NO_SMOKING_ON", "Bool", false);
        }
    }
    onInputAircraftSpecific(input) {
        console.log("B777_FMC_MainDisplay.onInputAircraftSpecific input = '" + input + "'");
        if (input === "LEGS") {
            if (this.onLegs) {
                this.onLegs();
            }
            return true;
        }
        if (input === "RTE") {
            if (this.onRte) {
                this.onRte();
            }
            return true;
        }
        if (input === "VNAV") {
            if (this.onVNAV) {
                this.onVNAV();
            }
        }
        if (input === "PROG") {
            if (this.onProg) {
                this.onProg();
            }
        }
        if (input === "ATC") {
            if (this.onAtc) {
                this.onAtc();
            }
        }
        if (input === "FMCCOMM") {
            if (this.onFmcComm) {
                this.onFmcComm();
            }
        }
        if (input === "MENU") {
            if (this.onMenu) {
                this.onMenu();
            }
        }
        return false;
    }
    /**
 * Registers a periodic page refresh with the FMC display.
 * @param {number} interval The interval, in ms, to run the supplied action.
 * @param {function} action An action to run at each interval. Can return a bool to indicate if the page refresh should stop.
 * @param {boolean} runImmediately If true, the action will run as soon as registered, and then after each
 * interval. If false, it will start after the supplied interval.
 */
    registerPeriodicPageRefresh(action, interval, runImmediately) {
        this.unregisterPeriodicPageRefresh();

        const refreshHandler = () => {
            const isBreak = action();
            if (isBreak) {
                return;
            }
            this._pageRefreshTimer = setTimeout(refreshHandler, interval);
        };

        if (runImmediately) {
            refreshHandler();
        } else {
            this._pageRefreshTimer = setTimeout(refreshHandler, interval);
        }
    }

    /**
     * Unregisters a periodic page refresh with the FMC display.
     */
    unregisterPeriodicPageRefresh() {
        if (this._pageRefreshTimer) {
            clearInterval(this._pageRefreshTimer);
        }
    }
    setMsg(value = "") {
        this.userMsg = value;
        if (value === "") {
            this.setFmsMsg();
        } else {
            this.showErrorMessage(value);
        }
    }

    setFmsMsg(value = "") {
        if (value === "") {
            if (this._fmcMsgReceiver.hasMsg()) {
                value = this._fmcMsgReceiver.getMsgText();
            }
        }
        if (value !== this._msg) {
            this._msg = value;
            if (this.userMsg === "") {
                this.showErrorMessage(value);
            }
        }
    }
    _getIndexFromTemp(temp) {
        if (temp < -10)
            return 0;
        if (temp < 0)
            return 1;
        if (temp < 10)
            return 2;
        if (temp < 20)
            return 3;
        if (temp < 30)
            return 4;
        if (temp < 40)
            return 5;
        if (temp < 43)
            return 6;
        if (temp < 45)
            return 7;
        if (temp < 47)
            return 8;
        if (temp < 49)
            return 9;
        if (temp < 51)
            return 10;
        if (temp < 53)
            return 11;
        if (temp < 55)
            return 12;
        if (temp < 57)
            return 13;
        if (temp < 59)
            return 14;
        if (temp < 61)
            return 15;
        if (temp < 63)
            return 16;
        if (temp < 65)
            return 17;
        if (temp < 66)
            return 18;
        return 19;
    }
    getTakeOffFLapHandle(){
        switch(this.getTakeOffFlap()){
            case 0: return 0;
            case 1: return 1;
            case 5: return 2;
            case 15: return 3;
            case 20: return 4;
            case 25: return 5;
            case 30: return 6;
        }
    }
    _computeV1Speed() {
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            console.log(runway);
            if (runway) {
                let f = (runway.length - 1500) / (2500 - 1500);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
        }
        let dWeightCoeff = (this.getWeight(true) - 550) / (1000 - 550);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.73 + (1.13 - 0.73) * dWeightCoeff;
        let flapsHandleIndex = this.getTakeOffFLapHandle();
        let temp = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let index = this._getIndexFromTemp(temp);
        console.log("Index From Temp = " + index);
        let min = B777_FMC_MainDisplay._v1s[index][0];
        let max = B777_FMC_MainDisplay._v1s[index][1];
        this.v1Speed = min * (1 - runwayCoef) + max * runwayCoef;
        this.v1Speed *= dWeightCoeff;
        this.v1Speed -= (flapsHandleIndex - 3) * 12;
        this.v1Speed = Math.round(this.v1Speed);
        SimVar.SetSimVarValue("L:AIRLINER_V1_SPEED", "Knots", this.v1Speed);
        console.log("Computed V1Speed = " + this.v1Speed);
    }
    _computeVRSpeed() {
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            console.log(runway);
            if (runway) {
                let f = (runway.length - 1500) / (2500 - 1500);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
        }
        let dWeightCoeff = (this.getWeight(true) - 550) / (1000 - 550);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.8 + (1.22 - 0.8) * dWeightCoeff;
        let flapsHandleIndex = this.getTakeOffFLapHandle();
        let temp = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let index = this._getIndexFromTemp(temp);
        console.log("Index From Temp = " + index);
        let min = B777_FMC_MainDisplay._vRs[index][0];
        let max = B777_FMC_MainDisplay._vRs[index][1];
        this.vRSpeed = min * (1 - runwayCoef) + max * runwayCoef;
        this.vRSpeed *= dWeightCoeff;
        this.vRSpeed -= (flapsHandleIndex - 3) * 11;
        this.vRSpeed = Math.round(this.vRSpeed);
        SimVar.SetSimVarValue("L:AIRLINER_VR_SPEED", "Knots", this.vRSpeed);
        console.log("Computed VRSpeed = " + this.vRSpeed);
    }
    _computeV2Speed() {
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            console.log(runway);
            if (runway) {
                let f = (runway.length - 1500) / (2500 - 1500);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
        }
        let dWeightCoeff = (this.getWeight(true) - 550) / (1000 - 550);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.93 + (1.26 - 0.93) * dWeightCoeff;
        let flapsHandleIndex = this.getTakeOffFLapHandle();
        let temp = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let index = this._getIndexFromTemp(temp);
        console.log("Index From Temp = " + index);
        let min = B777_FMC_MainDisplay._v2s[index][0];
        let max = B777_FMC_MainDisplay._v2s[index][1];
        this.v2Speed = min * (1 - runwayCoef) + max * runwayCoef;
        this.v2Speed *= dWeightCoeff;
        this.v2Speed -= (flapsHandleIndex - 3) * 12;
        this.v2Speed = Math.round(this.v2Speed);
        SimVar.SetSimVarValue("L:AIRLINER_V2_SPEED", "Knots", this.v2Speed);
        console.log("Computed VRSpeed = " + this.v2Speed);
    }
    getFlapTakeOffSpeed() {
        let dWeight = (this.getWeight(true) - 200) / (528 - 200);
        return 119 + 53 * dWeight;
    }
    getSlatTakeOffSpeed() {
        let dWeight = (this.getWeight(true) - 200) / (528 - 200);
        return 119 + 58 * dWeight;
    }
    getCleanTakeOffSpeed() {
        let dWeight = (this.getWeight(true) - 200) / (528 - 200);
        return 121 + 56 * dWeight;
    }


    /* Sets VNAV CLB or DES speed restriction and altitude */
    setSpeedRestriction(_speed, _altitude, _isDescent) {
        if (!_isDescent) {
            SimVar.SetSimVarValue("L:SALTY_SPEED_RESTRICTION", "knots", _speed);
            SimVar.SetSimVarValue("L:SALTY_SPEED_RESTRICTION_ALT", "feet", _altitude);
        }
        else {
            SimVar.SetSimVarValue("L:SALTY_SPEED_RESTRICTION_DES", "knots", _speed);
            SimVar.SetSimVarValue("L:SALTY_SPEED_RESTRICTION_DES_ALT", "feet", _altitude);
        }
    }

    //VNAV climb speed commands 5 knots below current flap placard speed
    getClbManagedSpeed(_cduPageEconRequest) {
        let flapsHandleIndex = Simplane.getFlapsHandleIndex();
        let flapLimitSpeed = Simplane.getFlapsLimitSpeed(this.aircraft, flapsHandleIndex);
        let alt = Simplane.getAltitude();
        let speedTrans = 10000;
        let speed = flapLimitSpeed - 5;
        let flapsUPmanueverSpeed = SimVar.GetSimVarValue("L:B777_VREF30", "knots") + 80;
        let speedRestr = SimVar.GetSimVarValue("L:SALTY_SPEED_RESTRICTION", "knots");
        let speedRestrAlt = SimVar.GetSimVarValue("L:SALTY_SPEED_RESTRICTION_ALT", "feet");
        let clbMode = SimVar.GetSimVarValue("L:SALTY_VNAV_CLB_MODE", "Enum");
        let mach = this.getCrzMach();
        let machCross = SimVar.GetGameVarValue("FROM MACH TO KIAS", "number", mach);
        let machMode = Simplane.getAutoPilotMachModeActive();
        let isSpeedIntervention = SimVar.GetSimVarValue("L:AP_SPEED_INTERVENTION_ACTIVE", "number");
        //When flaps 1 - commands UP + 20 or speed transition, whichever higher 
        if (flapsHandleIndex <= 1 && alt <= speedTrans) {
            speed = Math.max(flapsUPmanueverSpeed, 250);
        }
        //ECON SPEED Above 10000 commands lowest of UP + 100, 355kts or Cruise Mach
        if ((flapsHandleIndex <= 1 && alt > speedTrans) || _cduPageEconRequest) {
            speed = Math.min(flapsUPmanueverSpeed + 100, 355, machCross);
            if (_cduPageEconRequest) {
                return speed;
            }
            if (speed < machCross && machMode && !isSpeedIntervention) {
                this.managedMachOff();
            }
        }
        if (clbMode == 2) {
            speed = SimVar.GetSimVarValue("L:SALTY_VNAV_CLB_SPEED", "knots");
            if (machMode && !isSpeedIntervention) {
                this.managedMachOff();
            }
            return speed;
        }
        if (speed >= machCross) {
            if (!machMode) {
                this.managedMachOn();
            }
        }
        if (alt < speedRestrAlt && speedRestrAlt !== 0) {
            speed = Math.min(speed, speedRestr);
        }
        return speed;
    }

    /* Returns VNAV cruise speed target in accordance with active VNAV mode */
    getCrzManagedSpeed(cduSpeedRequest) {
        let flapsUPmanueverSpeed = SimVar.GetSimVarValue("L:B777_VREF30", "knots") + 80;
        let mach = this.getCrzMach();
        let machlimit = SimVar.GetGameVarValue("FROM MACH TO KIAS", "number", mach);
        let machMode = Simplane.getAutoPilotMachModeActive();
        let crzMode = SimVar.GetSimVarValue("L:SALTY_VNAV_CRZ_MODE", "Enum");
        let speed = Math.min(flapsUPmanueverSpeed + 100, 350, machlimit);
        let isSpeedIntervention = SimVar.GetSimVarValue("L:AP_SPEED_INTERVENTION_ACTIVE", "number");
        if (crzMode == 0) {
            if (speed >= machlimit && !machMode && !isSpeedIntervention && !cduSpeedRequest) {
                this.managedMachOn();
            }
            else if (speed < machlimit && machMode && !isSpeedIntervention && !cduSpeedRequest) {
                this.managedMachOff();
            }
        }
        else if (crzMode == 3) {
            speed = SimVar.GetSimVarValue("L:SALTY_CRZ_SPEED", "knots");
            if (machMode && !isSpeedIntervention && !cduSpeedRequest) {
                this.managedMachOff();
            }
        }
        else if (crzMode == 4) {
            let mach = SimVar.GetSimVarValue("L:SALTY_CRZ_MACH", "mach");
            speed = SimVar.GetGameVarValue("FROM MACH TO KIAS", "knots", mach);
            if (!machMode && !isSpeedIntervention && !cduSpeedRequest) {
                this.managedMachOn();
            }
        }
        if (this.cruiseFlightLevel < 100) {
            speed = Math.max(flapsUPmanueverSpeed + 40, 250);
        }
        return speed;
    }

    /* Returns VNAV descent speed target in accordance with active VNAV mode */
    getDesManagedSpeed(_cduPageEconRequest) {
        let mach = this.getCrzMach();
        let machlimit = SimVar.GetGameVarValue("FROM MACH TO KIAS", "number", mach);
        let altitude = Simplane.getAltitude();
        let desMode = SimVar.GetSimVarValue("L:SALTY_VNAV_DES_MODE" , "Enum");
        let machMode = Simplane.getAutoPilotMachModeActive();
        let speed = Math.min(280, machlimit);
        let isSpeedIntervention = SimVar.GetSimVarValue("L:AP_SPEED_INTERVENTION_ACTIVE", "number");
        if (_cduPageEconRequest) {
            return speed;
        }
        if (altitude <= 10500) {
            if (machMode && !isSpeedIntervention) {
                this.managedMachOff();
            }
            return speed = 240;
        }
        else if (desMode == 2) {
            speed = SimVar.GetSimVarValue("L:SALTY_DES_SPEED", "knots");
            if (machMode && !isSpeedIntervention) {
                this.managedMachOff();
            }
        }
        else if (desMode == 3) {
            let mach = SimVar.GetSimVarValue("L:SALTY_ECON_DES_MACH", "mach");
            speed = SimVar.GetGameVarValue("FROM MACH TO KIAS", "knots", mach);
        }
        else if (desMode == 0) {
            if (speed < machlimit && machMode && !isSpeedIntervention) {
                this.managedMachOff();
            }
            else if (speed >= machlimit && !machMode && !isSpeedIntervention) {
                this.managedMachOn();

            }
        }
        return speed;
    }

    /* Gets Cruise Mach number from altitude - Used regression from B744 data using weight correction factor needs B748 data to refine */
    getCrzMach() {
        let roundedFlightLevel = Math.ceil(this.cruiseFlightLevel / 10) * 10;
        let weightCorrectionFactor = 0.999;
        let grossWeight = this.getWeight(false) * weightCorrectionFactor * 1000;
        let crzMach = 0.80;
        const flightLeveltoGradient = {
            230: 2.01697e-6,
            240: 1.95485e-6,
            250: 1.89273e-6,
            260: 1.80455e-6,
            270: 1.71636e-6,
            280: 1.58606e-6,
            290: 1.45576e-6,
            300: 1.27879e-6,
            310: 1.10182e-6,
            320: 9.08788e-7,
            330: 7.15758e-7,
            340: 8.36905e-7,
            350: 4.91667e-7,
            360: 5.98214e-7,
            370: 3.89286e-7,
            380: 3.3e-7,
            390: 1.05714e-7,
            400: 1.65e-7,
            410: -1.20e-7,
            420: -1.5e-7,
            430: -3.00e-8
        };
        const flightLeveltoIntercept = {
            230: 0.403339394,
            240: 0.42349697,
            250: 0.443654545,
            260: 0.466890909,
            270: 0.490127273,
            280: 0.518421212,
            290: 0.546715152,
            300: 0.579875758,
            310: 0.613036364,
            320: 0.646475758,
            330: 0.679915152,
            340: 0.671642857,
            350: 0.721388889,
            360: 0.713517857,
            370: 0.743964286,
            380: 0.755,
            390: 0.785285714,
            400: 0.7809,
            410: 0.8148,
            420: 0.818,
            430: 0.834

        };
        if (this.cruiseFlightLevel <= 240) {
            crzMach = 1;
        }
        else {
            crzMach = Math.min(0.804, (grossWeight * flightLeveltoGradient[roundedFlightLevel] + flightLeveltoIntercept[roundedFlightLevel]));
        }
        return crzMach;
    }
    getManagedApproachSpeed() {
        if (SimVar.GetSimVarValue("L:AIRLINER_VREF_SPEED", "knots")) {
            return SimVar.GetSimVarValue("L:AIRLINER_VREF_SPEED", "knots") + 5;
        }
        return SimVar.GetSimVarValue("L:B777_VREF30", "knots") + 5;
    }
    getCleanApproachSpeed() {
        let cleanApproachSpeed = SimVar.GetSimVarValue("L:B777_VREF30", "knots") + 80;
        return cleanApproachSpeed;
    }

    /* Turns off VNAV Mach speed mode */
    managedMachOff() {
        if (this.getIsVNAVActive()){
            SimVar.SetSimVarValue("K:AP_MANAGED_SPEED_IN_MACH_OFF", "number", 1);
            SimVar.SetSimVarValue("L:XMLVAR_AirSpeedIsInMach", "bool", 0);
        }
    }

    /* Turns on VNAV Mach speed mode */
    managedMachOn() {
        if (this.getIsVNAVActive()){
            SimVar.SetSimVarValue("K:AP_MANAGED_SPEED_IN_MACH_ON", "number", 1);
            SimVar.SetSimVarValue("L:XMLVAR_AirSpeedIsInMach", "bool", 1);
        }
    }

    /* Calculates VREF for Flap 20 using Polynomial regression derived from FCOM data */
    updateVREF20() {
        let coefficients = [
            2.75495921e+003,
           -1.27295624e-001,
            2.47580310e-006,
           -2.50018575e-011,
            1.39228098e-016,
           -4.06250000e-022,
            4.86111111e-028
        ];
        let vRef20 = 0;
        let grossWeight = SimVar.GetSimVarValue("TOTAL WEIGHT", "kilograms");
        let i;
        for (i = 0; i < coefficients.length; i++) {
            let a = coefficients[i] * (Math.pow(grossWeight, i) );
            vRef20 += a;
        }
        SimVar.SetSimVarValue("L:B777_VREF20", "knots", Math.round(vRef20));
    }

    /* Calculates VREF for Flap 25 using Polynomial regression derived from FCOM data */
    updateVREF25() {
        let coefficients = [
            1.06051981e+003,
           -3.64663287e-002,
            5.41978438e-007,
           -3.89656177e-012,
            1.37820513e-017,
           -1.92307692e-023,
           -3.47109028e-040
         ];
         let vRef25 = 0;
         let grossWeight = SimVar.GetSimVarValue("TOTAL WEIGHT", "kilograms");
         let i;
         for (i = 0; i < coefficients.length; i++) {
             let a = coefficients[i] * (Math.pow(grossWeight, i) );
             vRef25 += a;
         }
         SimVar.SetSimVarValue("L:B777_VREF25", "knots", Math.round(vRef25));
    }

    /* Calculates VREF for Flap 30 using Polynomial regression derived from FCOM data */
    updateVREF30() {
        let coefficients = [
            1.45406737e+004,
           -6.32322401e-001,
            1.13868120e-005,
           -1.07933057e-010,
            5.68552350e-016,
           -1.57852564e-021,
            1.80555556e-027
        ];
        let vRef30 = 0;
        let grossWeight = SimVar.GetSimVarValue("TOTAL WEIGHT", "kilograms");
        let i;
        for (i = 0; i < coefficients.length; i++) {
            let a = coefficients[i] * (Math.pow(grossWeight, i) );
            vRef30 += a;
        }
        SimVar.SetSimVarValue("L:B777_VREF30", "knots", Math.round(vRef30));
    }
    setSelectedApproachFlapSpeed(s) {
        let flap = NaN;
        let speed = NaN;
        if (s) {
            let sSplit = s.split("/");
            flap = parseInt(sSplit[0]);
            speed = parseInt(sSplit[1]);
        }
        if (isFinite(flap) || isFinite(speed)) {
            if (isFinite(flap) && flap >= 0 && flap < 60) {
                this.selectedApproachFlap = flap;
                SimVar.SetSimVarValue("L:SALTY_SELECTED_APPROACH_FLAP", "number", this.selectedApproachFlap);
                SimVar.SetSimVarValue("H:B777_EICAS_2_UPDATE_ECL", "bool", 1);
            }
            if (isFinite(speed) && speed >= 100 && speed < 300) {
                this.selectedApproachSpeed = speed;
                SimVar.SetSimVarValue("L:AIRLINER_VREF_SPEED", "Knots", speed);
            }
            return true;
        }
        this.showErrorMessage(this.defaultInputErrorMessage);
        return false;
    }
    clearDisplay() {
        super.clearDisplay();
        this.onPrevPage = EmptyCallback.Void;
        this.onNextPage = EmptyCallback.Void;
    }
    getOrSelectWaypointByIdent(ident, callback) {
        this.dataManager.GetWaypointsByIdent(ident).then((waypoints) => {
            if (!waypoints || waypoints.length === 0) {
                return callback(undefined);
            }
            if (waypoints.length === 1) {
                return callback(waypoints[0]);
            }
            B777_FMC_SelectWptPage.ShowPage(this, waypoints, callback);
        });
    }
    getClimbThrustN1(temperature, altitude) {
        let lineIndex = 0;
        for (let i = 0; i < this._climbN1TempRow.length; i++) {
            lineIndex = i;
            if (temperature > this._climbN1TempRow[i]) {
                break;
            }
        }
        let rowIndex = Math.floor(altitude / 5000);
        rowIndex = Math.max(0, rowIndex);
        rowIndex = Math.min(rowIndex, this._climbN1Table[0].length - 1);
        return this._climbN1Table[lineIndex][rowIndex];
    }
    getTakeOffThrustN1(temperature, airportAltitude) {
        let lineIndex = 0;
        for (let i = 0; i < this._takeOffN1TempRow.length; i++) {
            lineIndex = i;
            if (temperature > this._takeOffN1TempRow[i]) {
                break;
            }
            lineIndex = i;
        }
        let rowIndex = Math.floor(airportAltitude / 1000) + 1;
        rowIndex = Math.max(0, rowIndex);
        rowIndex = Math.min(rowIndex, this._takeOffN1Table[0].length - 1);
        return this._takeOffN1Table[lineIndex][rowIndex];
    }
    getThrustTakeOffMode() {
        return this._thrustTakeOffMode;
    }
    setThrustTakeOffMode(m) {
        if (m >= 0 && m <= 2) {
            this._thrustTakeOffMode = m;
            SimVar.SetSimVarValue("L:AIRLINER_THRUST_TAKEOFF_MODE", "number", this._thrustTakeOffMode);
        }
    }
    getThrustCLBMode() {
        return this._thrustCLBMode;
    }
    setThrustCLBMode(m) {
        if (m >= 0 && m <= 2) {
            this._thrustCLBMode = m;
            SimVar.SetSimVarValue("L:AIRLINER_THRUST_CLIMB_MODE", "number", this._thrustCLBMode);
        }
    }
    getThrustTakeOffTemp() {
        return this._thrustTakeOffTemp;
    }
    setThrustTakeOffTemp(s) {
        let v = parseFloat(s);
        if (isFinite(v)) {
            let oat = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
            if (v >= oat && v < 80) {
                this._thrustTakeOffTemp = v;
                this.getThrustTakeOffLimit();
                return true;
            }
            this.showErrorMessage("OUT OF RANGE");
            return false;
        }
        this.showErrorMessage(this.defaultInputErrorMessage);
        return false;
    }
    getThrustTakeOffLimit() {
        let airport = this.flightPlanManager.getOrigin();
        if (airport) {
            let altitude = airport.infos.coordinates.alt;
            let n1 = this.getTakeOffThrustN1(this.getThrustTakeOffTemp(), altitude) - this.getThrustTakeOffMode() * 10;
            return n1;
        } else {
            return 99;
        }
    }
    getThrustClimbLimit() {
        let altitude = Simplane.getAltitude();
        let temperature = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let n1 = this.getClimbThrustN1(temperature, altitude) - this.getThrustCLBMode() * 8.6;
        return n1;
    }
    updateAutopilot() {
        let now = performance.now();
        let dt = now - this._lastUpdateAPTime;
        this._lastUpdateAPTime = now;
        if (isFinite(dt)) {
            this.updateAutopilotCooldown -= dt;
        }
        if (SimVar.GetSimVarValue("L:AIRLINER_FMC_FORCE_NEXT_UPDATE", "number") === 1) {
            SimVar.SetSimVarValue("L:AIRLINER_FMC_FORCE_NEXT_UPDATE", "number", 0);
            this.updateAutopilotCooldown = -1;
        }
        if (this.updateAutopilotCooldown < 0) {
            let currentApMasterStatus = SimVar.GetSimVarValue("AUTOPILOT MASTER", "boolean");
            if (currentApMasterStatus != this._apMasterStatus) {
                this._apMasterStatus = currentApMasterStatus;
                this._forceNextAltitudeUpdate = true;
            }
            this._apHasDeactivated = !currentApMasterStatus && this._previousApMasterStatus;
            this._previousApMasterStatus = currentApMasterStatus;
            if (this.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
                let n1 = this.getThrustTakeOffLimit() / 100;
                SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
            }
            if (!this._navModeSelector) {
                this._navModeSelector = new B777RSNavModeSelector(this.flightPlanManager);
            }
            
            //RUN VNAV ALWAYS
            if (this._vnav === undefined) {
                this._vnav = new WT_BaseVnav(this.flightPlanManager, this);
                this._vnav.activate();
            } else {
                try {
                    this._vnav.update();
                } catch (error) {
                    console.error(error);
                }
            }

            //RUN LNAV ALWAYS
            if (this._lnav === undefined) {
                this._lnav = new LNavDirector(this.flightPlanManager, this._navModeSelector);
            } else {
                try {
                    this._lnav.update();
                } catch (error) {
                    console.error(error);
                }
            }

            this._navModeSelector.generateInputDataEvents();
            this._navModeSelector.processEvents();

            //RUN VERTICAL AP ALWAYS
            if (this._currentVerticalAutopilot === undefined) {
                this._currentVerticalAutopilot = new WT_VerticalAutopilot(this._vnav, this._navModeSelector);
                this._currentVerticalAutopilot.activate();
            } else {
                try {
                    this._currentVerticalAutopilot.update();
                } catch (error) {
                    console.error(error);
                }
            }

            // RUN SPEED RESTRICTION OBSERVER
            /*if (this._speedObs === undefined) {
                this._speedObs = new CJ4_SpeedObserver(this.flightPlanManager);
            } else {
                try {
                    this._speedObs.update();
                } catch (error) {
                    console.error(error);
                }
            }*/
            if (this._pendingVNAVActivation) {
                let altitude = Simplane.getAltitudeAboveGround();
                if (altitude > 400) {
                    this._pendingVNAVActivation = false;
                    SimVar.SetSimVarValue("L:WT_CJ4_VNAV_ON", "bool", 1);
                    this._navModeSelector.currentAutoThrottleStatus = AutoThrottleModeState.THRREF;
                    this._navModeSelector.onNavChangedEvent('VNAV_PRESSED');
                }
            }
            //IDLE at 25' RA if AT still engaged.
            if (SimVar.GetSimVarValue("L:AIRLINER_FLIGHT_PHASE", "number") >= 5) {
                let altitude = Simplane.getAltitudeAboveGround();
                if (altitude < 25 && this.throttleHasIdled === false) {
                    this._navModeSelector.currentAutoThrottleStatus = AutoThrottleModeState.IDLE;
                    SimVar.SetSimVarValue("K:AP_N1_HOLD", "bool", 1);
                    SimVar.SetSimVarValue("K:AP_N1_REF_SET", "number", 0);
                    this.throttleHasIdled = true;
                }
                if (Simplane.getIsGrounded() && this.landingReverseAvail === false) {
                    setTimeout(() => {
                        SimVar.SetSimVarValue("K:AP_N1_HOLD", "bool", 0);
                        Coherent.call("GENERAL_ENG_THROTTLE_MANAGED_MODE_SET", ThrottleMode.HOLD);
                        this._navModeSelector.currentAutoThrottleStatus = AutoThrottleModeState.NONE;
                      }, 1000);
                    this.landingReverseAvail = true;
                }
            }
            if (Simplane.getAutoPilotThrottleArmed() && this._navModeSelector.togaPushedForTO === true) {
                if (!this._hasSwitchedToHoldOnTakeOff) {
                    let speed = Simplane.getIndicatedSpeed();
                    if (speed > 65) {
                        this._navModeSelector.handleThrottleToHold();
                        this._hasSwitchedToHoldOnTakeOff = true;
                    }
                }
            }
            if (this._navModeSelector.currentVerticalActiveState === VerticalNavModeState.TO || this._navModeSelector.currentVerticalActiveState === VerticalNavModeState.GA) {
                this.handleTogaMode();
            }
            if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_TAKEOFF) {
                if (this.getIsVNAVActive()) {
                    let speed = this.getTakeOffManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.B777);
                    //Sets CLB Thrust when passing thrust reduction altitude
                    let alt = Simplane.getAltitudeAboveGround();
                    let thrRedAlt = SimVar.GetSimVarValue("L:AIRLINER_THR_RED_ALT", "number");
                    let n1 = 99;
                    if (alt < thrRedAlt) {
                        n1 = this.getThrustTakeOffLimit() / 100;
                        SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
                    }  
                    else {
                        n1 = this.getThrustClimbLimit() / 100;
                        speed = this.getClbManagedSpeed();
                        SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
                    }
                }
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
                if (this.getIsVNAVActive()) {
                    let speed = this.getClbManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.B777);
                    let alt = Simplane.getAltitudeAboveGround();
                    let n1 = 99;
                    if (alt < this.thrustReductionAltitude) {
                        n1 = this.getThrustTakeOffLimit() / 100;
                    }
                    else {
                        n1 = this.getThrustClimbLimit() / 100;
                    }
                    SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
                }
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
                if (this.getIsVNAVActive()) {
                    let speed = this.getCrzManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.B777);
                    let alt = Simplane.getAltitudeAboveGround();
                    let n1 = 100;
                    if (alt < this.thrustReductionAltitude) {
                        n1 = this.getThrustTakeOffLimit() / 100;
                    }
                    else {
                        n1 = this.getThrustClimbLimit() / 100;
                    }
                    SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
                }
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
                if (this.getIsVNAVActive()) {
                    let speed = this.getDesManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.B777);
                }
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
                if (this.getIsVNAVActive()) {
                    let speed = this.getDesManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.B777);
                }
            }
            this.updateAutopilotCooldown = this._apCooldown;
        }
    }
    handleTogaMode() {
        let vSpeed = Simplane.getVerticalSpeed();
        if (vSpeed > 900) {
            if (!this.togaSpeedSet && this._navModeSelector.currentVerticalActiveState === VerticalNavModeState.TO) {
                Coherent.call("AP_SPD_VAR_SET", 1, this.v2Speed + 10);
                this.togaSpeedSet = true;
            }
            if (!SimVar.GetSimVarValue("AUTOPILOT FLIGHT LEVEL CHANGE", "Boolean")) {
                SimVar.SetSimVarValue("K:FLIGHT_LEVEL_CHANGE_ON", "Number", 1);
            }
        }
    }
    updateAltitudeAlerting() {
        let alertState = SimVar.GetSimVarValue("L:SALTY_ALT_ALERT", "bool");
        let mcpAlt = Simplane.getAutoPilotDisplayedAltitudeLockValue();
        let alt = Simplane.getAltitude();
        let vSpeed = Simplane.getVerticalSpeed();
        if (vSpeed > 400) {
            if (mcpAlt - alt <= 900 && mcpAlt - alt >= 200) {
                SimVar.SetSimVarValue("L:SALTY_ALT_ALERT", "bool", 1);
            } 
        }
        else if (vSpeed < -400) {
            if (alt - mcpAlt <= 900 && alt - mcpAlt >= 200) {
                SimVar.SetSimVarValue("L:SALTY_ALT_ALERT", "bool", 1);
            }
        }
        if (alertState !== 0) {
            if (Math.abs(mcpAlt - alt) < 200 || Math.abs(mcpAlt - alt) > 900) {
                SimVar.SetSimVarValue("L:SALTY_ALT_ALERT", "bool", 0);
            }
        }
    }
    static stringTohhmm(value) {
        value = value.padStart(4, "0");
        const h = parseInt(value.slice(0, 2));
        const m = parseInt(value.slice(2, 4));
        return h.toFixed(0).padStart(2, "0") + ":" + m.toFixed(0).padStart(2, "0");
    }
    
    refreshGrossWeight(_force = false) {
        let gw = 0;
        let isInMetric = BaseAirliners.unitIsMetric(Aircraft.A320_NEO);
        if (isInMetric) {
            gw = Math.round(SimVar.GetSimVarValue("TOTAL WEIGHT", "kg"));
            if (this.gwUnit)
                this.gwUnit.textContent = "KG";
        }
        else {
            gw = Math.round(SimVar.GetSimVarValue("TOTAL WEIGHT", "lbs"));
            if (this.gwUnit)
                this.gwUnit.textContent = "LBS";
        }
        if ((gw != this.currentGW) || _force) {
            this.currentGW = gw;
            if (this.gwValue != null) {
                this.gwValue.textContent = this.currentGW.toString();
            }
        }
    }

    // SALTY FUNCTIONS
    // INCOMING AOC MESSAGES
    getMessages() {
        return this.messages;
    }
    getMessage(id, type) {
        const messages = this.messages;
        const currentMessageIndex = messages.findIndex(m => m["id"].toString() === id.toString());
        if (type === 'previous') {
            if (messages[currentMessageIndex - 1]) {
                return messages[currentMessageIndex - 1];
            }
            return null;
        } else if (type === 'next') {
            if (messages[currentMessageIndex + 1]) {
                return messages[currentMessageIndex + 1];
            }
            return null;
        }
        return messages[currentMessageIndex];
    }
    getMessageIndex(id) {
        return this.messages.findIndex(m => m["id"].toString() === id.toString());
    }
    addMessage(message) {
        this.messages.unshift(message);
        const cMsgCnt = SimVar.GetSimVarValue("L:B777_COMPANY_MSG_COUNT", "Number");
        SimVar.SetSimVarValue("L:B777_COMPANY_MSG_COUNT", "Number", cMsgCnt + 1);
    }
    deleteMessage(id) {
        if (!this.messages[id]["opened"]) {
            const cMsgCnt = SimVar.GetSimVarValue("L:B777_COMPANY_MSG_COUNT", "Number");
            SimVar.SetSimVarValue("L:B777_COMPANY_MSG_COUNT", "Number", cMsgCnt <= 1 ? 0 : cMsgCnt - 1);
        }
        this.messages.splice(id, 1);
    }

    // OUTGOING/SENT AOC MESSAGES

    /* Delay when uplinking data */
    getUplinkDelay() {
        return 1000 + 750 * Math.random();
    }
    /* Delay when inserting data */
    getInsertDelay() {
        return 650 + 500 * Math.random();
    }
    getSentMessages() {
        return this.sentMessages;
    }
    getSentMessage(id, type) {
        const messages = this.sentMessages;
        const currentMessageIndex = messages.findIndex(m => m["id"].toString() === id.toString());
        if (type === 'previous') {
            if (messages[currentMessageIndex - 1]) {
                return messages[currentMessageIndex - 1];
            }
            return null;
        } else if (type === 'next') {
            if (messages[currentMessageIndex + 1]) {
                return messages[currentMessageIndex + 1];
            }
            return null;
        }
        return messages[currentMessageIndex];
    }
    getSentMessageIndex(id) {
        return this.sentMessages.findIndex(m => m["id"].toString() === id.toString());
    }
    addSentMessage(message) {
        this.sentMessages.unshift(message);
    }
    deleteSentMessage(id) {
        this.sentMessages.splice(id, 1);
    }
    getTimeString(time) {
        var hours = time.getUTCHours();
        hours = hours.toString();
        hours = hours.padStart(2, "0");
        var minutes = time.getUTCMinutes();
        minutes = minutes.toString();
        minutes = minutes.padStart(2, "0");
        var timeString = hours + minutes + "Z";
        return timeString
    }

    /* VISUALS */

    _formatCell(str) {
        return str
            .replace(/{white}/g, "<span class='white'>")
            .replace(/{blue}/g, "<span class='blue'>")
            .replace(/{yellow}/g, "<span class='yellow'>")
            .replace(/{green}/g, "<span class='green'>")
            .replace(/{red}/g, "<span class='red'>")
            .replace(/{magenta}/g, "<span class='magenta'>")
            .replace(/{inop}/g, "<span class='inop'>")
            .replace(/{small}/g, "<span class='s-text'>")
            .replace(/{sp}/g, "&nbsp;")
            .replace(/{end}/g, "</span>");
    }

    getTitle() {
        if (this._title === undefined) {
            this._title = this._titleElement.textContent;
        }
        return this._title;
    }
    setTitle(content) {
        let color = content.split("[color]")[1];
        if (!color) {
            color = "white";
        }
        this._title = content.split("[color]")[0];
        this._titleElement.classList.remove("white", "blue", "yellow", "green", "red", "inop", "magenta");
        this._titleElement.classList.add(color);
        this._titleElement.innerHTML = this._title;
    }
    getPageCurrent() {
        if (this._pageCurrent === undefined) {
            this._pageCurrent = parseInt(this._pageCurrentElement.textContent);
        }
        return this._pageCurrent;
    }
    setPageCurrent(value) {
        if (typeof (value) === "number") {
            this._pageCurrent = value;
        }
        else if (typeof (value) === "string") {
            this._pageCurrent = parseInt(value);
        }
        this._pageCurrentElement.textContent = (this._pageCurrent > 0 ? this._pageCurrent : "") + "";
    }
    getPageCount() {
        if (this._pageCount === undefined) {
            this._pageCount = parseInt(this._pageCountElement.textContent);
        }
        return this._pageCount;
    }
    setPageCount(value) {
        if (typeof (value) === "number") {
            this._pageCount = value;
        }
        else if (typeof (value) === "string") {
            this._pageCount = parseInt(value);
        }
        this._pageCountElement.textContent = (this._pageCount > 0 ? this._pageCount : "") + "";
        if (this._pageCount === 0) {
            this.getChildById("page-slash").textContent = "";
        }
        else {
            this.getChildById("page-slash").textContent = "/";
        }
    }
    getLabel(row, col = 0) {
        if (!this._labels[row]) {
            this._labels[row] = [];
        }
        return this._labels[row][col];
    }
    setLabel(label, row, col = -1) {
        if (col >= this._labelElements[row].length) {
            return;
        }
        if (!this._labels[row]) {
            this._labels[row] = [];
        }
        if (!label) {
            label = "";
        }
        if (col === -1) {
            for (let i = 0; i < this._labelElements[row].length; i++) {
                this._labels[row][i] = "";
                this._labelElements[row][i].textContent = "";
            }
            col = 0;
        }
        if (label === "__FMCSEPARATOR") {
            label = "---------------------------";
        }
        if (label !== "") {
            let color = label.split("[color]")[1];
            if (!color) {
                color = "white";
            }
            let e = this._labelElements[row][col];
            e.classList.remove("white", "blue", "yellow", "green", "red", "inop", "magenta");
            e.classList.add(color);
            label = label.split("[color]")[0];
        }
        this._labels[row][col] = label;
        this._labelElements[row][col].textContent = label;
    }
    getLine(row, col = 0) {
        if (!this._lines[row]) {
            this._lines[row] = [];
        }
        return this._lines[row][col];
    }
    setLine(content, row, col = -1) {
        if (col >= this._lineElements[row].length) {
            return;
        }
        if (!content) {
            content = "";
        }
        if (!this._lines[row]) {
            this._lines[row] = [];
        }
        if (col === -1) {
            for (let i = 0; i < this._lineElements[row].length; i++) {
                this._lines[row][i] = "";
                this._lineElements[row][i].textContent = "";
            }
            col = 0;
        }
        if (content === "__FMCSEPARATOR") {
            content = "------------------------";
        }
        if (content !== "") {
            if (content.indexOf("[s-text]") !== -1) {
                content = content.replace("[s-text]", "");
                this._lineElements[row][col].classList.add("s-text");
            }
            else {
                this._lineElements[row][col].classList.remove("s-text");
            }
            let color = content.split("[color]")[1];
            if (!color) {
                color = "white";
            }
            let e = this._lineElements[row][col];
            e.classList.remove("white", "blue", "yellow", "green", "red", "magenta", "inop");
            e.classList.add(color);
            content = content.split("[color]")[0];
        }
        content = content.replace("\<", "&lt");
        this._lines[row][col] = content;
        this._lineElements[row][col].innerHTML = this._lines[row][col];
    }
    get inOut() {
        return this.getInOut();
    }
    getInOut() {
        if (this._inOut === undefined) {
            this._inOut = this._inOutElement.textContent;
        }
        return this._inOut;
    }
    set inOut(v) {
        this.setInOut(v);
    }
    setInOut(content) {
        this._inOut = content;
        this._inOutElement.textContent = this._inOut;
        if (content === FMCMainDisplay.clrValue) {
            this._inOutElement.style.paddingLeft = "8%";
        }
        else {
            this._inOutElement.style.paddingLeft = "";
        }
    }
    setTemplate(template) {
        if (template[0]) {
            this.setTitle(template[0][0]);
            this.setPageCurrent(template[0][1]);
            this.setPageCount(template[0][2]);
        }
        for (let i = 0; i < 6; i++) {
            let tIndex = 2 * i + 1;
            if (template[tIndex]) {
                if (template[tIndex][1] !== undefined) {
                    this.setLabel(template[tIndex][0], i, 0);
                    this.setLabel(template[tIndex][1], i, 1);
                    this.setLabel(template[tIndex][2], i, 2);
                    this.setLabel(template[tIndex][3], i, 3);
                }
                else {
                    this.setLabel(template[tIndex][0], i, -1);
                }
            }
            tIndex = 2 * i + 2;
            if (template[tIndex]) {
                if (template[tIndex][1] !== undefined) {
                    this.setLine(template[tIndex][0], i, 0);
                    this.setLine(template[tIndex][1], i, 1);
                    this.setLine(template[tIndex][2], i, 2);
                    this.setLine(template[tIndex][3], i, 3);
                }
                else {
                    this.setLine(template[tIndex][0], i, -1);
                }
            }
        }
        if (template[13]) {
            this.setInOut(template[13][0]);
        }
        SimVar.SetSimVarValue("L:AIRLINER_MCDU_CURRENT_FPLN_WAYPOINT", "number", this.currentFlightPlanWaypointIndex);
        // Apply formatting helper to title page, lines and labels
        if (this._titleElement !== null) {
            this._titleElement.innerHTML = this._formatCell(this._titleElement.innerHTML);
        }
        this._lineElements.forEach((row) => {
            row.forEach((column) => {
                if (column !== null) {
                    column.innerHTML = this._formatCell(column.innerHTML);
                }
            });
        });
        this._labelElements.forEach((row) => {
            row.forEach((column) => {
                if (column !== null) {
                    column.innerHTML = this._formatCell(column.innerHTML);
                }
            });
        });
    }
}
B777_FMC_MainDisplay._v1s = [
    [130, 156],
    [128, 154],
    [127, 151],
    [125, 149],
    [123, 147],
    [122, 145],
    [121, 143],
    [120, 143],
    [120, 143],
    [120, 142],
    [119, 142],
    [119, 142],
    [119, 142],
    [119, 141],
    [118, 141],
    [118, 141],
    [118, 140],
    [118, 140],
    [117, 140],
    [117, 140],
];
B777_FMC_MainDisplay._vRs = [
    [130, 158],
    [128, 156],
    [127, 154],
    [125, 152],
    [123, 150],
    [122, 148],
    [121, 147],
    [120, 146],
    [120, 146],
    [120, 145],
    [119, 145],
    [119, 144],
    [119, 144],
    [119, 143],
    [118, 143],
    [118, 142],
    [118, 142],
    [118, 141],
    [117, 141],
    [117, 140],
];
B777_FMC_MainDisplay._v2s = [
    [135, 163],
    [133, 160],
    [132, 158],
    [130, 157],
    [129, 155],
    [127, 153],
    [127, 151],
    [126, 150],
    [125, 150],
    [125, 149],
    [124, 149],
    [124, 148],
    [124, 148],
    [123, 147],
    [123, 146],
    [123, 146],
    [123, 145],
    [122, 145],
    [122, 144],
    [121, 144],
];
registerInstrument("fmc-b777-main-display", B777_FMC_MainDisplay);