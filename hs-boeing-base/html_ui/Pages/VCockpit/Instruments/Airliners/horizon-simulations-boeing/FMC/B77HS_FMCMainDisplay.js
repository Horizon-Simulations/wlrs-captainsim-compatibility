class FMCMainDisplay extends BaseAirliners {
    constructor() {
        super(...arguments);
        FMCMainDisplay.DEBUG_INSTANCE = this;
        this.flightPhaseUpdateThrottler = new UpdateThrottler(800);
        this.fmsUpdateThrottler = new UpdateThrottler(250);
        this._progBrgDistUpdateThrottler = new UpdateThrottler(2000);
        this.ilsUpdateThrottler = new UpdateThrottler(5000);
        this._apCooldown = 500;
        this._radioNavOn = false;
        this._vhf1Frequency = 0;
        this._vhf2Frequency = 0;
        this._rcl1Frequency = 0;
        this._pre2Frequency = 0;
        this._atc1Frequency = 0;
        this.lastFlightPlanVersion = 0;
        this._messageQueue = new B77HS_MessageQueue(this);

        /** Declaration of every variable used (NOT initialization) */
        this.currentFlightPlanWaypointIndex = undefined;
        this.costIndex = undefined;
        this.costIndexSet = undefined;
        this.maxCruiseFL = undefined;
        this.routeIndex = undefined;
        this.coRoute = { routeNumber: undefined, routes: undefined };
        this.perfTOTemp = undefined;
        this._overridenFlapApproachSpeed = undefined;
        this._overridenSlatApproachSpeed = undefined;
        this._routeFinalFuelWeight = undefined;
        this._routeFinalFuelTime = undefined;
        this._routeFinalFuelTimeDefault = undefined;
        this._routeReservedWeight = undefined;
        this._routeReservedPercent = undefined;
        this.takeOffWeight = undefined;
        this.landingWeight = undefined;
        this.averageWind = undefined;
        this.perfApprQNH = undefined;
        this.perfApprTemp = undefined;
        this.perfApprWindHeading = undefined;
        this.perfApprWindSpeed = undefined;
        this.v1Speed = undefined;
        this.vRSpeed = undefined;
        this.v2Speed = undefined;
        this._v1Checked = undefined;
        this._vRChecked = undefined;
        this._v2Checked = undefined;
        this._toFlexChecked = undefined;
        this.toRunway = undefined;
        this.vApp = undefined;
        this.perfApprMDA = undefined;
        this.perfApprDH = undefined;
        this.perfApprFlaps3 = undefined;
        this._lockConnectIls = undefined;
        this._apNavIndex = undefined;
        this._canSwitchToNav = undefined;
        this._vhf1Frequency = undefined;
        this._vhf2Frequency = undefined;
        this._vor1Frequency = undefined;
        this._vor1Course = undefined;
        this._vor2Frequency = undefined;
        this._vor2Course = undefined;
        this._ilsFrequency = undefined;
        this._ilsIcao = undefined;
        this._ilsIdent = undefined;
        this._ilsFrequencyPilotEntered = undefined;
        this._ilsIdentPilotEntered = undefined;
        this._ilsCourse = undefined;
        this._adf1Frequency = undefined;
        this._adf2Frequency = undefined;
        this._rcl1Frequency = undefined;
        this._pre2Frequency = undefined;
        this._atc1Frequency = undefined;
        this._radioNavOn = undefined;
        this._debug = undefined;
        this._checkFlightPlan = undefined;
        this.thrustReductionAltitude = undefined;
        this.thrustReductionAltitudeGoaround = undefined;
        this.thrustReductionAltitudeIsPilotEntered = undefined;
        this.accelerationAltitude = undefined;
        this.accelerationAltitudeGoaround = undefined;
        this.accelerationAltitudeIsPilotEntered = undefined;
        this.engineOutAccelerationAltitude = undefined;
        this.engineOutAccelerationAltitudeGoaround = undefined;
        this.engineOutAccelerationAltitudeIsPilotEntered = undefined;
        this._windDirections = undefined;
        this._fuelPlanningPhases = undefined;
        this._zeroFuelWeightZFWCGEntered = undefined;
        this._taxiEntered = undefined;
        this._windDir = undefined;
        this._DistanceToAlt = undefined;
        this._routeAltFuelWeight = undefined;
        this._routeAltFuelTime = undefined;
        this._routeTripFuelWeight = undefined;
        this._routeTripTime = undefined;
        this._defaultTaxiFuelWeight = undefined;
        this._rteRsvPercentOOR = undefined;
        this._rteReservedWeightEntered = undefined;
        this._rteReservedPctEntered = undefined;
        this._rteFinalCoeffecient = undefined;
        this._rteFinalWeightEntered = undefined;
        this._rteFinalTimeEntered = undefined;
        this._routeAltFuelEntered = undefined;
        this._minDestFob = undefined;
        this._minDestFobEntered = undefined;
        this._defaultRouteFinalTime = undefined;
        this._fuelPredDone = undefined;
        this._fuelPlanningPhase = undefined;
        this._blockFuelEntered = undefined;
        this._initMessageSettable = undefined;
        this._checkWeightSettable = undefined;
        this._gwInitDisplayed = undefined;
        /* CPDLC Fields */
        this.tropo = undefined;
        this._destDataChecked = undefined;
        this._towerHeadwind = undefined;
        this._EfobBelowMinClr = undefined;
        this.simbrief = undefined;
        this.aocWeight = undefined;
        this.aocTimes = undefined;
        this.winds = undefined;
        this.computedVgd = undefined;
        this.computedVfs = undefined;
        this.computedVss = undefined;
        this.computedVls = undefined;
        this.approachSpeeds = undefined; // based on selected config, not current config
        this._cruiseEntered = undefined;
        this._blockFuelEntered = undefined;
        this.constraintAlt = undefined;
        this.fcuSelAlt = undefined;
        this._forceNextAltitudeUpdate = undefined;
        this._lastUpdateAPTime = undefined;
        this.updateAutopilotCooldown = undefined;
        this._lastHasReachFlex = undefined;
        this._apMasterStatus = undefined;
        this._lastRequestedFLCModeWaypointIndex = undefined;
        this._cruiseFlightLevel = undefined;
        this._activeCruiseFlightLevel = undefined;
        this._activeCruiseFlightLevelDefaulToFcu = undefined;
        this._progBrgDist = undefined;
        this.preSelectedClbSpeed = undefined;
        this.preSelectedCrzSpeed = undefined;
        this.preSelectedDesSpeed = undefined;
        this.managedSpeedTarget = undefined;
        this.managedSpeedTargetIsMach = undefined;
        this.climbSpeedLimit = undefined;
        this.climbSpeedLimitAlt = undefined;
        this.climbSpeedLimitPilot = undefined;
        this.descentSpeedLimit = undefined;
        this.descentSpeedLimitAlt = undefined;
        this.descentSpeedLimitPilot = undefined;
        this.managedSpeedClimb = undefined;
        this.managedSpeedClimbIsPilotEntered = undefined;
        this.managedSpeedClimbMach = undefined;
        // this.managedSpeedClimbMachIsPilotEntered = undefined;
        this.managedSpeedCruise = undefined;
        this.managedSpeedCruiseIsPilotEntered = undefined;
        this.managedSpeedCruiseMach = undefined;
        // this.managedSpeedCruiseMachIsPilotEntered = undefined;
        this.managedSpeedDescend = undefined;
        this.managedSpeedDescendIsPilotEntered = undefined;
        this.managedSpeedDescendMach = undefined;
        // this.managedSpeedDescendMachIsPilotEntered = undefined;
        this.cruiseFlightLevelTimeOut = undefined;
        this.flaps = undefined;
        this.ths = undefined;
        this.ilsAutoFrequency = undefined;
        this.ilsAutoIcao = undefined;
        this.ilsAutoIdent = undefined;
        this.ilsAutoCourse = undefined;
        this.ilsAutoTuned = undefined;
        this.tempFpPendingAutoTune = undefined;
        this.ilsTakeoffAutoTuned = undefined;
        this.ilsApproachAutoTuned = undefined;
        this.altDestination = undefined;
        this.flightNumber = undefined;
        this.cruiseTemperature = undefined;
        this.taxiFuelWeight = undefined;
        this.blockFuel = undefined;
        this.zeroFuelWeight = undefined;
        this.zeroFuelWeightMassCenter = undefined;
        this.activeWpIdx = undefined;
        this.efisSymbols = undefined;
        this.groundTempAuto = undefined;
        this.groundTempPilot = undefined;
        this.backupNavTuning = false;
        this.manualNavTuning = false;
        /**
         * Landing elevation in feet MSL.
         * This is the destination runway threshold elevation, or airport elevation if runway is not selected.
         */
        this.landingElevation = undefined;
        /*
         * Latitude part of the touch down coordinate.
         * This is the destination runway coordinate, or airport coordinate if runway is not selected
         */
        this.destinationLatitude = undefined;
        /*
         * Latitude part of the touch down coordinate.
         * This is the destination runway coordinate, or airport coordinate if runway is not selected
         */
        this.destinationLongitude = undefined;

        // ATSU data
        this.atsu = undefined;
        this.holdSpeedTarget = undefined;
        this.holdIndex = undefined;
        this.holdDecelReached = undefined;
        this.setHoldSpeedMessageActive = undefined;
        this.managedProfile = undefined;
        this.speedLimitExceeded = undefined;

        this.onAirport = undefined;
    }

    Init() {
        super.Init();
        this.initVariables();

        this.B77HSCore = new B77HS_Core();
        this.B77HSCore.init(this._lastTime);

        this.dataManager = new FMCDataManager(this);

        this.guidanceManager = new Aims.GuidanceManager(this.flightPlanManager);
        this.guidanceController = new Aims.GuidanceController(this.flightPlanManager, this.guidanceManager, this);
        this.navRadioManager = new Aims.NavRadioManager(this);
        this.efisSymbols = new Aims.EfisSymbols(this.flightPlanManager, this.guidanceController);
        this.navigation = new Aims.Navigation(this.flightPlanManager);

        Aims.initAimsLoop(this, this.flightPlanManager);

        this.guidanceController.init();
        this.efisSymbols.init();
        this.navigation.init();

        this.tempCurve = new Avionics.Curve();
        this.tempCurve.interpolationFunction = Avionics.CurveTool.NumberInterpolation;
        this.tempCurve.add(-10 * 3.28084, 21.50);
        this.tempCurve.add(0, 15.00);
        this.tempCurve.add(10 * 3.28084, 8.50);
        this.tempCurve.add(20 * 3.28084, 2.00);
        this.tempCurve.add(30 * 3.28084, -4.49);
        this.tempCurve.add(40 * 3.28084, -10.98);
        this.tempCurve.add(50 * 3.28084, -17.47);
        this.tempCurve.add(60 * 3.28084, -23.96);
        this.tempCurve.add(70 * 3.28084, -30.45);
        this.tempCurve.add(80 * 3.28084, -36.94);
        this.tempCurve.add(90 * 3.28084, -43.42);
        this.tempCurve.add(100 * 3.28084, -49.90);
        this.tempCurve.add(150 * 3.28084, -56.50);
        this.tempCurve.add(200 * 3.28084, -56.50);
        this.tempCurve.add(250 * 3.28084, -51.60);
        this.tempCurve.add(300 * 3.28084, -46.64);
        this.tempCurve.add(400 * 3.28084, -22.80);
        this.tempCurve.add(500 * 3.28084, -2.5);
        this.tempCurve.add(600 * 3.28084, -26.13);
        this.tempCurve.add(700 * 3.28084, -53.57);
        this.tempCurve.add(800 * 3.28084, -74.51);

        this.cruiseFlightLevel = SimVar.GetGameVarValue("AIRCRAFT CRUISE ALTITUDE", "feet");
        this.cruiseFlightLevel /= 100;
        this._cruiseFlightLevel = this.cruiseFlightLevel;

        this.flightPlanManager.onCurrentGameFlightLoaded(() => {
            this.flightPlanManager.updateFlightPlan(() => {
                this.flightPlanManager.updateCurrentApproach();
                const callback = () => {
                    this.flightPlanManager.createNewFlightPlan();
                    SimVar.SetSimVarValue("L:AIRLINER_V1_SPEED", "Knots", NaN);
                    SimVar.SetSimVarValue("L:AIRLINER_V2_SPEED", "Knots", NaN);
                    SimVar.SetSimVarValue("L:AIRLINER_VR_SPEED", "Knots", NaN);
                    const cruiseAlt = Math.floor(this.flightPlanManager.cruisingAltitude / 100);
                    console.log("FlightPlan Cruise Override. Cruising at FL" + cruiseAlt + " instead of default FL" + this.cruiseFlightLevel);
                    if (cruiseAlt > 0) {
                        this.cruiseFlightLevel = cruiseAlt;
                        this._cruiseFlightLevel = cruiseAlt;
                    }
                };
                const arrivalIndex = this.flightPlanManager.getArrivalProcIndex();
                if (arrivalIndex >= 0) {
                    this.flightPlanManager.setArrivalProcIndex(arrivalIndex, callback).catch(console.error);
                } else {
                    callback();
                }
            });
        });

        this.updateFuelVars();
        this.updatePerfSpeeds();

        CDUPerformancePage.UpdateThrRedAccFromOrigin(this);
        CDUPerformancePage.UpdateEngOutAccFromOrigin(this);

        this.flightPhaseManager.init();
        this.flightPhaseManager.addOnPhaseChanged(this.onFlightPhaseChanged.bind(this));

        // Start the check routine for system health and status
        setInterval(() => {
            if (this.flightPhaseManager.phase === AimsFlightPhases.CRUISE && !this._destDataChecked) {
                const adirLat = ADIRS.getLatitude();
                const adirLong = ADIRS.getLongitude();
                const ppos = (adirLat.isNormalOperation() && adirLong.isNormalOperation()) ? {
                    lat: ADIRS.getLatitude().value,
                    long: ADIRS.getLongitude().value,
                } : {
                    lat: NaN,
                    long: NaN
                };
                const stats = this.flightPlanManager.getCurrentFlightPlan().computeWaypointStatistics(ppos);
                const dest = this.flightPlanManager.getDestination();
                const destStats = stats.get(this.flightPlanManager.getCurrentFlightPlan().waypoints.length - 1);
                if (dest && destStats.distanceFromPpos < 180) {
                    this._destDataChecked = true;
                    this.checkDestData();
                }
            }
        }, 15000);

        SimVar.SetSimVarValue('L:B77HS_FM_LS_COURSE', 'number', -1);
    }

    initVariables() {
        this.currentFlightPlanWaypointIndex = -1;
        this.costIndex = 0;
        this.costIndexSet = false;
        this.maxCruiseFL = 431;
        this.routeIndex = 0;
        this.resetCoroute();
        this.perfTOTemp = NaN;
        this._overridenFlapApproachSpeed = NaN;
        this._overridenSlatApproachSpeed = NaN;
        this._routeFinalFuelWeight = 0;
        this._routeFinalFuelTime = 30;
        this._routeFinalFuelTimeDefault = 30;
        this._routeReservedWeight = 0;
        this._routeReservedPercent = 5;
        this.takeOffWeight = NaN;
        this.landingWeight = NaN;
        this.averageWind = 0;
        this.perfApprQNH = NaN;
        this.perfApprTemp = NaN;
        this.perfApprWindHeading = NaN;
        this.perfApprWindSpeed = NaN;
        this.v1Speed = undefined;
        this.vRSpeed = undefined;
        this.v2Speed = undefined;
        this._v1Checked = true;
        this._vRChecked = true;
        this._v2Checked = true;
        this._toFlexChecked = true;
        this.toRunway = "";
        this.vApp = NaN;
        this.perfApprMDA = NaN;
        this.perfApprDH = NaN;
        this.perfApprFlaps3 = false;
        this._lockConnectIls = false;
        this._apNavIndex = 1;
        this._canSwitchToNav = false;
        this._vor1Frequency = 0;
        this._vor1Course = 0;
        this._vor2Frequency = 0;
        this._vor2Course = 0;
        this._ilsFrequency = 0;
        this._ilsIcao = undefined;
        this._ilsIdent = undefined;
        this._ilsFrequencyPilotEntered = false;
        this._ilsIdentPilotEntered = false;
        this._ilsCourse = undefined;
        this._adf1Frequency = 0;
        this._adf2Frequency = 0;
        this._debug = 0;
        this._checkFlightPlan = 0;
        this.thrustReductionAltitude = NaN;
        this.thrustReductionAltitudeGoaround = NaN;
        this.thrustReductionAltitudeIsPilotEntered = false;
        this.accelerationAltitude = NaN;
        this.accelerationAltitudeGoaround = NaN;
        this.accelerationAltitudeIsPilotEntered = false;
        this.accelerationAltitudeGoaroundIsPilotEntered = false;
        this.engineOutAccelerationAltitude = NaN;
        this.engineOutAccelerationAltitudeGoaround = NaN;
        this.engineOutAccelerationAltitudeIsPilotEntered = false;
        this._windDirections = {
            TAILWIND : "TL",
            HEADWIND : "HD"
        };
        this._fuelPlanningPhases = {
            PLANNING : 1,
            IN_PROGRESS : 2,
            COMPLETED : 3
        };
        this._zeroFuelWeightZFWCGEntered = false;
        this._taxiEntered = false;
        this._windDir = this._windDirections.HEADWIND;
        this._DistanceToAlt = 0;
        this._routeAltFuelWeight = 0;
        this._routeAltFuelTime = 0;
        this._routeTripFuelWeight = 0;
        this._routeTripTime = 0;
        this._defaultTaxiFuelWeight = 0.2;
        this._rteRsvPercentOOR = false;
        this._rteReservedWeightEntered = false;
        this._rteReservedPctEntered = false;
        this._rteFinalCoeffecient = 0;
        this._rteFinalWeightEntered = false;
        this._rteFinalTimeEntered = false;
        this._routeAltFuelEntered = false;
        this._minDestFob = 0;
        this._minDestFobEntered = false;
        this._defaultRouteFinalTime = 45;
        this._fuelPredDone = false;
        this._fuelPlanningPhase = this._fuelPlanningPhases.PLANNING;
        this._blockFuelEntered = false;
        this._initMessageSettable = false;
        this._checkWeightSettable = true;
        this._gwInitDisplayed = 0;
        /* CPDLC Fields */
        this.tropo = undefined;
        this._destDataChecked = false;
        this._towerHeadwind = 0;
        this._EfobBelowMinClr = false;
        this.simbrief = {
            route: "",
            cruiseAltitude: "",
            originIcao: "",
            destinationIcao: "",
            blockFuel: "",
            paxCount: "",
            cargo: undefined,
            payload: undefined,
            estZfw: "",
            sendStatus: "READY",
            costIndex: "",
            navlog: [],
            callsign: "",
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
        this.winds = {
            climb: [],
            cruise: [],
            des: [],
            alternate: null
        };
        this.computedVgd = undefined;
        this.computedVfs = undefined;
        this.computedVss = undefined;
        this.computedVls = undefined;
        this.approachSpeeds = undefined; // based on selected config, not current config
        this._cruiseEntered = false;
        this._blockFuelEntered = false;
        this.constraintAlt = 0;
        this.fcuSelAlt = 0;
        this._forceNextAltitudeUpdate = false;
        this._lastUpdateAPTime = NaN;
        this.updateAutopilotCooldown = 0;
        this._apMasterStatus = false;
        this._lastRequestedFLCModeWaypointIndex = -1;
        this._cruiseFlightLevel = undefined;
        this._activeCruiseFlightLevel = 0;
        this._activeCruiseFlightLevelDefaulToFcu = false;
        const payloadConstruct = new B77HS_PayloadConstructor();
        this.paxStations = payloadConstruct.paxStations;
        this.payloadStations = payloadConstruct.payloadStations;
        this.fmsUpdateThrottler = new UpdateThrottler(250);
        this._progBrgDist = undefined;
        this.preSelectedClbSpeed = undefined;
        this.preSelectedCrzSpeed = undefined;
        this.preSelectedDesSpeed = undefined;
        this.managedSpeedTarget = NaN;
        this.managedSpeedTargetIsMach = false;
        this.climbSpeedLimit = 250;
        this.climbSpeedLimitAlt = 10000;
        this.climbSpeedLimitPilot = false;
        this.descentSpeedLimit = 250;
        this.descentSpeedLimitAlt = 10000;
        this.descentSpeedLimitPilot = false;
        this.managedSpeedClimb = 310;
        this.managedSpeedClimbIsPilotEntered = false;
        this.managedSpeedClimbMach = .85;
        // this.managedSpeedClimbMachIsPilotEntered = false;
        this.managedSpeedCruise = 310;
        this.managedSpeedCruiseIsPilotEntered = false;
        this.managedSpeedCruiseMach = .85;
        // this.managedSpeedCruiseMachIsPilotEntered = false;
        this.managedSpeedDescend = 310;
        this.managedSpeedDescendIsPilotEntered = false;
        this.managedSpeedDescendMach = .85;
        // this.managedSpeedDescendMachIsPilotEntered = false;
        this.cruiseFlightLevelTimeOut = undefined;
        this.flaps = NaN;
        this.ths = NaN;
        this.ilsAutoFrequency = undefined;
        this.ilsAutoIcao = undefined;
        this.ilsAutoIdent = undefined;
        this.ilsAutoCourse = undefined;
        this.ilsAutoTuned = false;
        this.ilsTakeoffAutoTuned = false;
        this.ilsApproachAutoTuned = false;
        this.tempFpPendingAutoTune = false;
        this.altDestination = undefined;
        this.flightNumber = undefined;
        this.cruiseTemperature = undefined;
        this.taxiFuelWeight = 0.2;
        this.blockFuel = undefined;
        this.zeroFuelWeight = undefined;
        this.zeroFuelWeightMassCenter = undefined;
        this.holdSpeedTarget = undefined;
        this.holdIndex = 0;
        this.holdDecelReached = false;
        this.setHoldSpeedMessageActive = false;
        this.managedProfile = new Map();
        this.speedLimitExceeded = false;
        this.groundTempAuto = undefined;
        this.groundTempPilot = undefined;
        this.landingElevation = undefined;
        this.destinationLatitude = undefined;
        this.destinationLongitude = undefined;

        this.onAirport = () => { };

        if (this.navigation) {
            this.navigation.requiredPerformance.clearPilotRnp();
        }

        // AIMS Message Queue
        this._messageQueue.resetQueue();

        // ATSU data
        this.atsu = new Atsu.Atsu(this);

        // Reset SimVars
        SimVar.SetSimVarValue("L:AIRLINER_V1_SPEED", "Knots", NaN);
        SimVar.SetSimVarValue("L:AIRLINER_V2_SPEED", "Knots", NaN);
        SimVar.SetSimVarValue("L:AIRLINER_VR_SPEED", "Knots", NaN);

        CDUPerformancePage.UpdateThrRedAccFromOrigin(this);
        CDUPerformancePage.UpdateEngOutAccFromOrigin(this);
        SimVar.SetSimVarValue("L:AIRLINER_THR_RED_ALT", "Number", this.thrustReductionAltitude);
        SimVar.SetSimVarValue("L:B77HS_ENG_OUT_ACC_ALT", "feet", this.engineOutAccelerationAltitude);

        SimVar.SetSimVarValue("L:B77HS_SPEEDS_MANAGED_PFD", "knots", 0);
        SimVar.SetSimVarValue("L:B77HS_SPEEDS_MANAGED_ATHR", "knots", 0);

        SimVar.SetSimVarValue('L:B77HS_MachPreselVal', 'mach', -1);
        SimVar.SetSimVarValue('L:B77HS_SpeedPreselVal', 'knots', -1);

        SimVar.SetSimVarValue("L:AIRLINER_DECISION_HEIGHT", "feet", -1);
        SimVar.SetSimVarValue("L:AIRLINER_MINIMUM_DESCENT_ALTITUDE", "feet", 0);

        SimVar.SetSimVarValue("L:B77HS_FG_ALTITUDE_CONSTRAINT", "feet", this.constraintAlt);
        SimVar.SetSimVarValue("L:B77HS_FM_GROSS_WEIGHT", "Number" , 0);

        if (SimVar.GetSimVarValue("L:B77HS_AUTOTHRUST_DISABLED", "number") === 1) {
            SimVar.SetSimVarValue("K:B77HS.ATHR_RESET_DISABLE", "number", 1);
        }

        SimVar.SetSimVarValue("L:B77HS_PFD_MSG_SET_HOLD_SPEED", "bool", false);
    }

    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);

        this.navRadioManager.update(_deltaTime, this.manualNavTuning, this.backupNavTuning);

        this.flightPlanManager.update(_deltaTime);
        const flightPlanChanged = this.flightPlanManager.currentFlightPlanVersion !== this.lastFlightPlanVersion;
        if (flightPlanChanged) {
            this.lastFlightPlanVersion = this.flightPlanManager.currentFlightPlanVersion;
        }

        Aims.updateAimsLoop(_deltaTime);

        if (this._debug++ > 180) {
            this._debug = 0;
        }
        const flightPhaseManagerDelta = this.flightPhaseUpdateThrottler.canUpdate(_deltaTime);
        if (flightPhaseManagerDelta !== -1) {
            this.flightPhaseManager.shouldActivateNextPhase(flightPhaseManagerDelta);
        }
        this._checkFlightPlan--;
        if (this._checkFlightPlan <= 0) {
            this._checkFlightPlan = 120;
            this.flightPlanManager.updateFlightPlan();
            this.flightPlanManager.updateCurrentApproach();
        }

        if (this.fmsUpdateThrottler.canUpdate(_deltaTime) !== -1) {
            this.updateRadioNavState();
            this.checkSpeedLimit();
            this.navigation.update();
            this.getGW();
            this.checkGWParams();
        }

        this.B77HSCore.update();

        if (flightPlanChanged) {
            this.updateManagedProfile();
            this.updateDestinationData();
        }

        this.updateAutopilot();

        if (this._progBrgDistUpdateThrottler.canUpdate(_deltaTime) !== -1) {
            this.updateProgDistance();
        }

        if (this.guidanceController) {
            this.guidanceController.update(_deltaTime);
        }

        if (this.ilsUpdateThrottler.canUpdate(_deltaTime) !== -1) {
            this.updateIls();
        }

        if (this.efisSymbols) {
            this.efisSymbols.update(_deltaTime);
        }
    }

    /**
     * This method is called by the FlightPhaseManager after a flight phase change
     * This method initializes AP States, initiates FMCPerformancePage changes and other set other required states
     * @param prevPhase {AimsFlightPhases} Previous AimsFlightPhase
     * @param nextPhase {AimsFlightPhases} New AimsFlightPhase
     */
    onFlightPhaseChanged(prevPhase, nextPhase) {
        this.updateConstraints();
        this.updateManagedSpeed();

        switch (nextPhase) {
            case AimsFlightPhases.TAKEOFF: {
                this._destDataChecked = false;

                if (this.page.Current === this.page.PerformancePageTakeoff) {
                    CDUPerformancePage.ShowTAKEOFFPage(this);
                } else if (this.page.Current === this.page.ProgressPage) {
                    CDUProgressPage.ShowPage(this);
                }

                /** Arm preselected speed/mach for next flight phase */
                this.updatePreSelSpeedMach(this.preSelectedClbSpeed);

                break;
            }

            case AimsFlightPhases.CLIMB: {

                this._destDataChecked = false;

                if (this.page.Current === this.page.ProgressPage) {
                    CDUProgressPage.ShowPage(this);
                } else {
                    this.tryUpdatePerfPage(prevPhase, nextPhase);
                }

                /** Activate pre selected speed/mach */
                if (prevPhase === AimsFlightPhases.TAKEOFF) {
                    this.activatePreSelSpeedMach(this.preSelectedClbSpeed);
                }

                /** Arm preselected speed/mach for next flight phase */
                this.updatePreSelSpeedMach(this.preSelectedCrzSpeed);

                if (!this.cruiseFlightLevel) {
                    this.cruiseFlightLevel = Simplane.getAutoPilotDisplayedAltitudeLockValue('feet') / 100;
                }

                break;
            }

            case AimsFlightPhases.CRUISE: {
                if (this.page.Current === this.page.ProgressPage) {
                    CDUProgressPage.ShowPage(this);
                } else {
                    this.tryUpdatePerfPage(prevPhase, nextPhase);
                }

                SimVar.SetSimVarValue("L:B77HS_GOAROUND_PASSED", "bool", 0);
                Coherent.call("GENERAL_ENG_THROTTLE_MANAGED_MODE_SET", ThrottleMode.AUTO).catch(console.error).catch(console.error);

                /** Activate pre selected speed/mach */
                if (prevPhase === AimsFlightPhases.CLIMB) {
                    this.activatePreSelSpeedMach(this.preSelectedCrzSpeed);
                }

                /** Arm preselected speed/mach for next flight phase */
                this.updatePreSelSpeedMach(this.preSelectedDesSpeed);

                // This checks against the pilot defined cruise altitude and the automatically populated cruise altitude
                if (this.cruiseFlightLevel !== this._cruiseFlightLevel) {
                    this._cruiseFlightLevel = this.cruiseFlightLevel;
                    this.addMessageToQueue(NXSystemMessages.newCrzAlt.getModifiedMessage(this._cruiseFlightLevel * 100));
                }

                break;
            }

            case AimsFlightPhases.DESCENT: {
                if (this.page.Current === this.page.ProgressPage) {
                    CDUProgressPage.ShowPage(this);
                } else {
                    this.tryUpdatePerfPage(prevPhase, nextPhase);
                }

                this.checkDestData();

                Coherent.call("GENERAL_ENG_THROTTLE_MANAGED_MODE_SET", ThrottleMode.AUTO).catch(console.error).catch(console.error);

                /** Activate pre selected speed/mach */
                if (prevPhase === AimsFlightPhases.CRUISE) {
                    this.activatePreSelSpeedMach(this.preSelectedDesSpeed);
                }

                /** Clear pre selected speed/mach */
                this.updatePreSelSpeedMach(undefined);

                this.cruiseFlightLevel = undefined;

                break;
            }

            case AimsFlightPhases.APPROACH: {
                if (this.page.Current === this.page.ProgressPage) {
                    CDUProgressPage.ShowPage(this);
                } else {
                    this.tryUpdatePerfPage(prevPhase, nextPhase);
                }

                this.connectIls();

                this.flightPlanManager.activateApproach().catch(console.error);

                Coherent.call("GENERAL_ENG_THROTTLE_MANAGED_MODE_SET", ThrottleMode.AUTO).catch(console.error);
                SimVar.SetSimVarValue("L:B77HS_GOAROUND_PASSED", "bool", 0);

                this.checkDestData();

                break;
            }

            case AimsFlightPhases.GOAROUND: {
                SimVar.SetSimVarValue("L:B77HS_GOAROUND_GATRK_MODE", "bool", 0);
                SimVar.SetSimVarValue("L:B77HS_GOAROUND_HDG_MODE", "bool", 0);
                SimVar.SetSimVarValue("L:B77HS_GOAROUND_NAV_MODE", "bool", 0);
                SimVar.SetSimVarValue("L:B77HS_GOAROUND_INIT_SPEED", "number", Simplane.getIndicatedSpeed());
                SimVar.SetSimVarValue("L:B77HS_GOAROUND_INIT_APP_SPEED", "number", this.getVApp());
                //delete override logic when we have valid nav data -aka goaround path- after goaround!
                SimVar.SetSimVarValue("L:B77HS_GOAROUND_NAV_OVERRIDE", "bool", 0);

                if (SimVar.GetSimVarValue("AUTOPILOT MASTER", "Bool") === 1) {
                    SimVar.SetSimVarValue("K:AP_LOC_HOLD_ON", "number", 1); // Turns AP localizer hold !!ON/ARMED!! and glide-slope hold mode !!OFF!!
                    SimVar.SetSimVarValue("K:AP_LOC_HOLD_OFF", "number", 1); // Turns !!OFF!! localizer hold mode
                    SimVar.SetSimVarValue("K:AUTOPILOT_OFF", "number", 1);
                    SimVar.SetSimVarValue("K:AUTOPILOT_ON", "number", 1);
                    SimVar.SetSimVarValue("L:B77HS_AUTOPILOT_APPR_MODE", "bool", 0);
                    SimVar.SetSimVarValue("L:B77HS_AUTOPILOT_LOC_MODE", "bool", 0);
                } else if (SimVar.GetSimVarValue("AUTOPILOT MASTER", "Bool") === 0 && SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean") === 1) {
                    SimVar.SetSimVarValue("AP_APR_HOLD_OFF", "number", 1);
                    SimVar.SetSimVarValue("L:B77HS_AUTOPILOT_APPR_MODE", "bool", 0);
                    SimVar.SetSimVarValue("L:B77HS_AUTOPILOT_LOC_MODE", "bool", 0);
                }

                const currentHeading = Simplane.getHeadingMagnetic();
                Coherent.call("HEADING_BUG_SET", 1, currentHeading).catch(console.error);

                if (this.page.Current === this.page.ProgressPage) {
                    CDUProgressPage.ShowPage(this);
                } else {
                    this.tryUpdatePerfPage(prevPhase, nextPhase);
                }

                break;
            }

            case AimsFlightPhases.DONE:

                CDUIdentPage.ShowPage(this);

                this.flightPlanManager.clearFlightPlan().then(() => {
                    this.initVariables();
                    this.initFmcVariables();
                    this.dataManager.deleteAllStoredWaypoints();
                    this.setScratchpadText('');
                    SimVar.SetSimVarValue('L:B77HS_COLD_AND_DARK_SPAWN', 'Bool', true).then(() => {
                        CDUIdentPage.ShowPage(this);
                    });
                }).catch(console.error);
                break;
        }
    }

    /** FIXME these functions are in the new VNAV but not in this branch, remove when able */
    /**
     *
     * @param {Feet} alt geopotential altitude
     * @returns °C
     */
    getIsaTemp(alt) {
        if (alt > (this.tropo ? this.tropo : 36090)) {
            return -56.5;
        }
        return 15 - (0.0019812 * alt);
    }

    /**
     *
     * @param {Feet} alt geopotential altitude
     * @param {Degrees} isaDev temperature deviation from ISA conditions
     * @returns °C
     */
    getTemp(alt, isaDev = 0) {
        return this.getIsaTemp(alt) + isaDev;
    }

    /**
     *
     * @param {Feet} alt geopotential altitude
     * @param {Degrees} isaDev temperature deviation from ISA conditions
     * @returns hPa
     */
    getPressure(alt, isaDev = 0) {
        if (alt > (this.tropo ? this.tropo : 36090)) {
            return ((216.65 + isaDev) / 288.15) ** 5.25588 * 1013.2;
        }
        return ((288.15 - 0.0019812 * alt + isaDev) / 288.15) ** 5.25588 * 1013.2;
    }

    /**
     * @returns {Degrees} temperature deviation from ISA conditions
     */
    getIsaDeviation() {
        const geoAlt = SimVar.GetSimVarValue('INDICATED ALTITUDE', 'feet');
        const temperature = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
        return temperature - this.getIsaTemp(geoAlt);
    }
    /** FIXME ^these functions are in the new VNAV but not in this branch, remove when able */

    // TODO better decel distance calc
    calculateDecelDist(fromSpeed, toSpeed) {
        return Math.min(20, Math.max(3, (fromSpeed - toSpeed) * 0.15));
    }

    /*
        When the aircraft is in the holding, predictions assume that the leg is flown at holding speed
        with a vertical speed equal to - 1000 ft/mn until reaching a restrictive altitude constraint, the
        FCU altitude or the exit fix. If FCU or constraint altitude is reached first, the rest of the
        pattern is assumed to be flown level at that altitude
        */
    getHoldingSpeed(speedConstraint = undefined, altitude = undefined) {
        const fcuAltitude = SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:3', 'feet');
        const alt = Math.max(fcuAltitude, altitude ? altitude : 0);

        let kcas = SimVar.GetSimVarValue('L:B77HS_SPEEDS_GD', 'number');
        if (this.flightPhaseManager.phase === AimsFlightPhases.APPROACH) {
            kcas = this.getAppManagedSpeed();
        }

        if (speedConstraint > 100) {
            kcas = Math.min(kcas, speedConstraint);
        }

        // apply icao limits
        if (alt < 14000) {
            kcas = Math.min(230, kcas);
        } else if (alt < 20000) {
            kcas = Math.min(240, kcas);
        } else if (alt < 34000) {
            kcas = Math.min(265, kcas);
        } else {
            const isaDeviation = this.getIsaDeviation();
            const temperature = 273.15 + this.getTemp(alt, isaDeviation);
            const pressure = this.getPressure(alt, isaDeviation);
            kcas = Math.min(
                _convertMachToKCas(0.83, temperature, pressure),
                kcas,
            );
        }

        // apply speed limit/alt
        if (this.flightPhaseManager.phase <= AimsFlightPhases.CRUISE) {
            if (this.climbSpeedLimit !== undefined && alt <= this.climbSpeedLimitAlt) {
                kcas = Math.min(this.climbSpeedLimit, kcas);
            }
        } else if (this.flightPhaseManager.phase < AimsFlightPhases.GOAROUND) {
            if (this.descentSpeedLimit !== undefined && alt <= this.descentSpeedLimitAlt) {
                kcas = Math.min(this.descentSpeedLimit, kcas);
            }
        }

        kcas = Math.max(kcas, this.computedVls);

        return Math.ceil(kcas);
    }

    updateHoldingSpeed() {
        const currentLegIndex = this.guidanceController.activeLegIndex;
        const nextLegIndex = currentLegIndex + 1;
        const currentLegConstraints = this.managedProfile.get(currentLegIndex) || {};
        const nextLegConstraints = this.managedProfile.get(nextLegIndex) || {};

        const currentLeg = this.flightPlanManager.getWaypoint(currentLegIndex);
        const nextLeg = this.flightPlanManager.getWaypoint(nextLegIndex);

        const casWord = ADIRS.getCalibratedAirspeed();
        const cas = casWord.isNormalOperation() ? casWord.value : 0;

        let enableHoldSpeedWarning = false;
        let holdSpeedTarget = 0;
        let holdDecelReached = this.holdDecelReached;
        // FIXME big hack until VNAV can do this
        if (currentLeg && currentLeg.additionalData.legType === 14 /* HM */) {
            holdSpeedTarget = this.getHoldingSpeed(currentLegConstraints.descentSpeed, currentLegConstraints.descentAltitude);
            holdDecelReached = true;
            enableHoldSpeedWarning = !Simplane.getAutoPilotAirspeedManaged();
            this.holdIndex = this.flightPlanManager.getActiveWaypointIndex();
        } else if (nextLeg && nextLeg.additionalData.legType === 14 /* HM */) {
            const adirLat = ADIRS.getLatitude();
            const adirLong = ADIRS.getLongitude();
            if (adirLat.isNormalOperation() && adirLong.isNormalOperation()) {
                holdSpeedTarget = this.getHoldingSpeed(nextLegConstraints.descentSpeed, nextLegConstraints.descentAltitude);

                const ppos = {
                    lat: adirLat.value,
                    long: adirLong.value,
                };
                const stats = this.flightPlanManager.getCurrentFlightPlan().computeWaypointStatistics(ppos);
                const dtg = stats.get(this.flightPlanManager.getActiveWaypointIndex()).distanceFromPpos;
                // decel range limits are [3, 20] NM
                const decelDist = this.calculateDecelDist(cas, holdSpeedTarget);
                if (dtg < decelDist) {
                    holdDecelReached = true;
                }

                const gsWord = ADIRS.getGroundSpeed();
                const gs = gsWord.isNormalOperation() ? gsWord.value : 0;
                const warningDist = decelDist + gs / 120;
                if (!Simplane.getAutoPilotAirspeedManaged() && dtg <= warningDist) {
                    enableHoldSpeedWarning = true;
                }
            }
            this.holdIndex = this.flightPlanManager.getActiveWaypointIndex() + 1;
        } else {
            this.holdIndex = 0;
            holdDecelReached = false;
        }

        if (holdDecelReached !== this.holdDecelReached) {
            this.holdDecelReached = holdDecelReached;
            SimVar.SetSimVarValue('L:B77HS_FM_HOLD_DECEL', 'bool', this.holdDecelReached);
        }

        if (holdSpeedTarget !== this.holdSpeedTarget) {
            this.holdSpeedTarget = holdSpeedTarget;
            SimVar.SetSimVarValue('L:B77HS_FM_HOLD_SPEED', 'number', this.holdSpeedTarget);
        }

        if (enableHoldSpeedWarning && (cas - this.holdSpeedTarget) > 5) {
            if (!this.setHoldSpeedMessageActive) {
                this.setHoldSpeedMessageActive = true;
                this.addMessageToQueue(
                    NXSystemMessages.setHoldSpeed,
                    () => !this.setHoldSpeedMessageActive,
                    () => SimVar.SetSimVarValue("L:B77HS_PFD_MSG_SET_HOLD_SPEED", "bool", false),
                );
                SimVar.SetSimVarValue("L:B77HS_PFD_MSG_SET_HOLD_SPEED", "bool", true);
            }
        } else if (this.setHoldSpeedMessageActive) {
            SimVar.SetSimVarValue("L:B77HS_PFD_MSG_SET_HOLD_SPEED", "bool", false);
            this.setHoldSpeedMessageActive = false;
        }
    }

    getManagedTargets(v, m) {
        //const vM = _convertMachToKCas(m, _convertCtoK(Simplane.getAmbientTemperature()), SimVar.GetSimVarValue("AMBIENT PRESSURE", "millibar"));
        const vM = SimVar.GetGameVarValue("FROM MACH TO KIAS", "number", m);
        return v > vM ? [vM, true] : [v, false];
    }

    updateManagedSpeeds() {
        if (!this.managedSpeedClimbIsPilotEntered) {
            this.managedSpeedClimb = this.getClbManagedSpeedFromCostIndex();
        }
        if (!this.managedSpeedCruiseIsPilotEntered) {
            this.managedSpeedCruise = this.getCrzManagedSpeedFromCostIndex();
        }
        if (!this.managedSpeedDescendIsPilotEntered) {
            this.managedSpeedDescend = this.getDesManagedSpeedFromCostIndex();
        }
    }

    updateManagedSpeed() {
        let vPfd = 0;
        let isMach = false;

        this.updateHoldingSpeed();

        if (SimVar.GetSimVarValue("L:B77HS_FMA_EXPEDITE_MODE", "number") === 1) {
            const verticalMode = SimVar.GetSimVarValue("L:B77HS_FMA_VERTICAL_MODE", "number");
            if (verticalMode === 12) {
                switch (SimVar.GetSimVarValue("L:B77HS_FLAPS_HANDLE_INDEX", "Number")) {
                    case 0: {
                        this.managedSpeedTarget = SimVar.GetSimVarValue("L:B77HS_SPEEDS_GD", "number");
                        break;
                    }
                    case 1: {
                        this.managedSpeedTarget = SimVar.GetSimVarValue("L:B77HS_SPEEDS_S", "number");
                        break;
                    }
                    default: {
                        this.managedSpeedTarget = SimVar.GetSimVarValue("L:B77HS_SPEEDS_F", "number");
                    }
                }
            } else if (verticalMode === 13) {
                this.managedSpeedTarget = SimVar.GetSimVarValue("L:B77HS_FLAPS_HANDLE_INDEX", "Number") === 0 ? Math.min(340, SimVar.GetGameVarValue("FROM MACH TO KIAS", "number", 0.8)) : SimVar.GetSimVarValue("L:B77HS_SPEEDS_VMAX", "number") - 10;
            }
            vPfd = this.managedSpeedTarget;
        } else if (this.holdDecelReached) {
            vPfd = this.holdSpeedTarget;
            this.managedSpeedTarget = this.holdSpeedTarget;
        } else {
            if (this.setHoldSpeedMessageActive) {
                this.setHoldSpeedMessageActive = false;
                SimVar.SetSimVarValue("L:B77HS_PFD_MSG_SET_HOLD_SPEED", "bool", false);
                this.removeMessageFromQueue(NXSystemMessages.setHoldSpeed.text);
            }

            switch (this.flightPhaseManager.phase) {
                case AimsFlightPhases.PREFLIGHT: {
                    if (this.v2Speed) {
                        vPfd = this.v2Speed;
                        this.managedSpeedTarget = this.v2Speed + 10;
                    }
                    break;
                }
                case AimsFlightPhases.TAKEOFF: {
                    if (this.v2Speed) {
                        vPfd = this.v2Speed;
                        this.managedSpeedTarget = this.isAllEngineOn() ? this.v2Speed + 10 : this.v2Speed + 20;
                    }
                    break;
                }
                case AimsFlightPhases.CLIMB: {
                    let speed = this.managedSpeedClimb;

                    if (this.climbSpeedLimit !== undefined && SimVar.GetSimVarValue("INDICATED ALTITUDE", "feet") < this.climbSpeedLimitAlt) {
                        speed = Math.min(speed, this.climbSpeedLimit);
                    }

                    speed = Math.min(speed, this.getSpeedConstraint());

                    [this.managedSpeedTarget, isMach] = this.getManagedTargets(speed, this.managedSpeedClimbMach);
                    vPfd = this.managedSpeedTarget;
                    break;
                }
                case AimsFlightPhases.CRUISE: {
                    let speed = this.managedSpeedCruise;

                    if (this.climbSpeedLimit !== undefined && SimVar.GetSimVarValue("INDICATED ALTITUDE", "feet") < this.climbSpeedLimitAlt) {
                        speed = Math.min(speed, this.climbSpeedLimit);
                    }

                    [this.managedSpeedTarget, isMach] = this.getManagedTargets(speed, this.managedSpeedCruiseMach);
                    vPfd = this.managedSpeedTarget;
                    break;
                }
                case AimsFlightPhases.DESCENT: {
                    let speed = this.managedSpeedDescend;

                    if (this.descentSpeedLimit !== undefined && Math.round(SimVar.GetSimVarValue("INDICATED ALTITUDE", "feet") / 10) * 10 < 20 * (speed - this.descentSpeedLimit) + 300 + this.descentSpeedLimitAlt) {
                        speed = Math.min(speed, this.descentSpeedLimit);
                    }

                    // TODO we really need VNAV to predict where along the leg we should slow to the constraint
                    speed = Math.min(speed, this.getSpeedConstraint());

                    [this.managedSpeedTarget, isMach] = this.getManagedTargets(speed, this.managedSpeedDescendMach);
                    vPfd = this.managedSpeedTarget;
                    break;
                }
                case AimsFlightPhases.APPROACH: {
                    // the displayed target is Vapp (with GSmini)
                    // the guidance target is lower limited by FAC manouvering speeds (O, S, F) unless in landing config
                    // constraints are not considered
                    const speed = this.getAppManagedSpeed();
                    vPfd = this.getVAppGsMini();

                    this.managedSpeedTarget = Math.max(speed, vPfd);
                    break;
                }
                case AimsFlightPhases.GOAROUND: {
                    if (Simplane.getAltitude() < this.accelerationAltitudeGoaround) {
                        const speed = Math.min(
                            this.computedVls + (this.isAllEngineOn() ? 25 : 15),
                            Math.max(
                                SimVar.GetSimVarValue("L:B77HS_GOAROUND_INIT_SPEED", "number"),
                                SimVar.GetSimVarValue("L:B77HS_GOAROUND_INIT_APP_SPEED", "number")
                            )
                        );

                        SimVar.SetSimVarValue("L:B77HS_TOGA_SPEED", "number", speed); //TODO: figure that this does

                        vPfd = speed;
                        this.managedSpeedTarget = speed;
                    } else {
                        vPfd = this.computedVgd;
                        this.managedSpeedTarget = this.computedVgd;
                    }
                    break;
                }
            }
        }

        // Automatically change fcu mach/speed mode
        if (this.managedSpeedTargetIsMach !== isMach) {
            if (isMach) {
                SimVar.SetSimVarValue("K:AP_MANAGED_SPEED_IN_MACH_ON", "number", 1);
            } else {
                SimVar.SetSimVarValue("K:AP_MANAGED_SPEED_IN_MACH_OFF", "number", 1);
            }
            this.managedSpeedTargetIsMach = isMach;
        }

        // Overspeed protection
        const Vtap = Math.min(this.managedSpeedTarget, SimVar.GetSimVarValue("L:B77HS_SPEEDS_VMAX", "number"));

        SimVar.SetSimVarValue("L:B77HS_SPEEDS_MANAGED_PFD", "knots", vPfd);
        SimVar.SetSimVarValue("L:B77HS_SPEEDS_MANAGED_ATHR", "knots", Vtap);

        if (this.isAirspeedManaged()) {
            Coherent.call("AP_SPD_VAR_SET", 0, Vtap).catch(console.error);
        }
    }

    activatePreSelSpeedMach(preSel) {
        if (preSel) {
            if (preSel < 1) {
                SimVar.SetSimVarValue("H:B77HS_FCU_USE_PRE_SEL_MACH", "number", 1);
            } else {
                SimVar.SetSimVarValue("H:B77HS_FCU_USE_PRE_SEL_SPEED", "number", 1);
            }
        }
    }

    updatePreSelSpeedMach(preSel) {
        // The timeout is required to create a delay for the current value to be read and the new one to be set
        setTimeout(() => {
            if (preSel) {
                if (preSel > 1) {
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", preSel);
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
                } else {
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", preSel);
                }
            } else {
                SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
                SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
            }
        }, 200);
    }

    checkSpeedLimit() {
        let speedLimit;
        let speedLimitAlt;
        switch (this.flightPhaseManager.phase) {
            case AimsFlightPhases.CLIMB:
            case AimsFlightPhases.CRUISE:
                speedLimit = this.climbSpeedLimit;
                speedLimitAlt = this.climbSpeedLimitAlt;
                break;
            case AimsFlightPhases.DESCENT:
                speedLimit = this.descentSpeedLimit;
                speedLimitAlt = this.descentSpeedLimitAlt;
                break;
            default:
                // no speed limit in other phases
                this.speedLimitExceeded = false;
                return;
        }

        if (speedLimit === undefined) {
            this.speedLimitExceeded = false;
            return;
        }

        const cas = ADIRS.getCalibratedAirspeed();
        const alt = ADIRS.getBaroCorrectedAltitude();

        if (this.speedLimitExceeded) {
            const resetLimitExceeded = !cas.isNormalOperation() || !alt.isNormalOperation() || alt.value > speedLimitAlt || cas.value <= (speedLimit + 5);
            if (resetLimitExceeded) {
                this.speedLimitExceeded = false;
                this.removeMessageFromQueue(NXSystemMessages.spdLimExceeded.text);
            }
        } else if (cas.isNormalOperation() && alt.isNormalOperation()) {
            const setLimitExceeded = alt.value < (speedLimitAlt - 150) && cas.value > (speedLimit + 10);
            if (setLimitExceeded) {
                this.speedLimitExceeded = true;
                this.addMessageToQueue(NXSystemMessages.spdLimExceeded, () => !this.speedLimitExceeded);
            }
        }
    }

    updateRadioNavState() {
        if (this.isPrimary) {
            const radioNavOn = this.isRadioNavActive();
            if (radioNavOn !== this._radioNavOn) {
                this._radioNavOn = radioNavOn;
                if (!radioNavOn) {
                    this.initRadioNav(false);
                }
                if (this.refreshPageCallback) {
                    this.refreshPageCallback();
                }
            }
            let apNavIndex = 1;
            let gpsDriven = true;
            const apprHold = SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "Bool");
            if (apprHold) {
                if (this.canSwitchToNav()) {
                    let navid = 0;
                    const ils = this.radioNav.getBestILSBeacon();
                    if (ils.id > 0) {
                        navid = ils.id;
                    } else {
                        const vor = this.radioNav.getBestVORBeacon();
                        if (vor.id > 0) {
                            navid = vor.id;
                        }
                    }
                    if (navid > 0) {
                        apNavIndex = navid;
                        const hasFlightplan = Simplane.getAutopilotGPSActive();
                        const apprCaptured = Simplane.getAutoPilotAPPRCaptured();
                        if (apprCaptured || !hasFlightplan) {
                            gpsDriven = false;
                        }
                    }
                }
            }
            if (apNavIndex !== this._apNavIndex) {
                SimVar.SetSimVarValue("K:AP_NAV_SELECT_SET", "number", apNavIndex);
                this._apNavIndex = apNavIndex;
            }
            const curState = SimVar.GetSimVarValue("GPS DRIVES NAV1", "Bool");
            if (!!curState !== gpsDriven) {
                SimVar.SetSimVarValue("K:TOGGLE_GPS_DRIVES_NAV1", "Bool", 0);
            }
        }

        this.backupNavTuning = SimVar.GetSimVarValue("L:B77HS_RMP_L_NAV_BUTTON_SELECTED", "Bool")
            || SimVar.GetSimVarValue("L:B77HS_RMP_R_NAV_BUTTON_SELECTED", "Bool");

        // Cannot be manual if RMP tuned. It erases everything
        if (this.backupNavTuning && this.manualNavTuning) {
            this.vor1IdIsPilotEntered = false;
            this.vor1FreqIsPilotEntered = false;
            this.vor2IdIsPilotEntered = false;
            this.vor2FreqIsPilotEntered = false;
            this._ilsFrequencyPilotEntered = false;
            this._ilsIdentPilotEntered = false;
            this.adf1IdIsPilotEntered = false;
            this.adf1FreqIsPilotEntered = false;
            this.adf2IdIsPilotEntered = false;
            this.adf2FreqIsPilotEntered = false;

            this.manualNavTuning = false;
        } else {
            this.manualNavTuning = this.vor1IdIsPilotEntered || this.vor1FreqIsPilotEntered ||
                    this.vor2IdIsPilotEntered || this.vor2FreqIsPilotEntered ||
                    this._ilsFrequencyPilotEntered || this._ilsIdentPilotEntered ||
                    this.adf1IdIsPilotEntered || this.adf1FreqIsPilotEntered ||
                    this.adf2IdIsPilotEntered || this.adf2FreqIsPilotEntered;
        }
    }

    updateAutopilot() {
        const now = performance.now();
        const dt = now - this._lastUpdateAPTime;
        let apLogicOn = (this._apMasterStatus || Simplane.getAutoPilotFlightDirectorActive(1));
        this._lastUpdateAPTime = now;
        if (isFinite(dt)) {
            this.updateAutopilotCooldown -= dt;
        }
        if (SimVar.GetSimVarValue("L:AIRLINER_FMC_FORCE_NEXT_UPDATE", "number") === 1) {
            SimVar.SetSimVarValue("L:AIRLINER_FMC_FORCE_NEXT_UPDATE", "number", 0);
            this.updateAutopilotCooldown = -1;
        }

        if (this.updateAutopilotCooldown < 0) {
            this.updatePerfSpeeds();
            this.updateConstraints();
            this.updateManagedSpeed();
            const currentApMasterStatus = SimVar.GetSimVarValue("AUTOPILOT MASTER", "boolean");
            if (currentApMasterStatus !== this._apMasterStatus) {
                this._apMasterStatus = currentApMasterStatus;
                apLogicOn = (this._apMasterStatus || Simplane.getAutoPilotFlightDirectorActive(1));
                this._forceNextAltitudeUpdate = true;
                console.log("Enforce AP in Altitude Lock mode. Cause : AP Master Status has changed.");
                SimVar.SetSimVarValue("L:B77HS_FCU_FORCE_IDLE_VS", "Number", 1);
                if (this._apMasterStatus) {
                    if (this.flightPlanManager.getWaypointsCount() === 0) {
                        this._onModeSelectedAltitude();
                        this._onModeSelectedHeading();
                    }
                }
            }
            if (apLogicOn) {
                if (!Simplane.getAutoPilotFLCActive() && !SimVar.GetSimVarValue("AUTOPILOT AIRSPEED HOLD", "Boolean")) {
                    SimVar.SetSimVarValue("K:AP_PANEL_SPEED_HOLD", "Number", 1);
                }
                if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
                    if (!SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "Boolean")) {
                        SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
                    }
                }
            }

            if (this.isAltitudeManaged()) {
                const prevWaypoint = this.flightPlanManager.getPreviousActiveWaypoint();
                const nextWaypoint = this.flightPlanManager.getActiveWaypoint();

                if (prevWaypoint && nextWaypoint) {
                    const activeWpIdx = this.flightPlanManager.getActiveWaypointIndex();

                    if (activeWpIdx !== this.activeWpIdx) {
                        this.activeWpIdx = activeWpIdx;
                    }
                    if (this.constraintAlt) {
                        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, this.constraintAlt, this._forceNextAltitudeUpdate).catch(console.error);
                        this._forceNextAltitudeUpdate = false;
                    } else {
                        const altitude = Simplane.getAutoPilotSelectedAltitudeLockValue("feet");
                        if (isFinite(altitude)) {
                            Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, altitude, this._forceNextAltitudeUpdate).catch(console.error);
                            this._forceNextAltitudeUpdate = false;
                        }
                    }
                } else {
                    const altitude = Simplane.getAutoPilotSelectedAltitudeLockValue("feet");
                    if (isFinite(altitude)) {
                        SimVar.SetSimVarValue("L:B77HS_FG_ALTITUDE_CONSTRAINT", "feet", 0);
                        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, altitude, this._forceNextAltitudeUpdate).catch(console.error);
                        this._forceNextAltitudeUpdate = false;
                    }
                }
            }
            if (this.flightPlanManager.isLoadedApproach() && !this.flightPlanManager.isActiveApproach() && (this.flightPlanManager.getActiveWaypointIndex() === -1 || (this.flightPlanManager.getActiveWaypointIndex() > this.flightPlanManager.getLastIndexBeforeApproach()))) {
                if (SimVar.GetSimVarValue("L:FMC_FLIGHT_PLAN_IS_TEMPORARY", "number") !== 1) {
                    this.flightPlanManager.tryAutoActivateApproach();
                }
            }
            if (Simplane.getAutoPilotAltitudeManaged() && SimVar.GetSimVarValue("L:B77HS_FCU_STATE", "number") !== 1) {
                const currentWaypointIndex = this.flightPlanManager.getActiveWaypointIndex();
                if (currentWaypointIndex !== this._lastRequestedFLCModeWaypointIndex) {
                    this._lastRequestedFLCModeWaypointIndex = currentWaypointIndex;
                    setTimeout(() => {
                        if (Simplane.getAutoPilotAltitudeManaged()) {
                            this._onModeManagedAltitude();
                        }
                    }, 1000);
                }
            }

            if (this.flightPhaseManager.phase === AimsFlightPhases.GOAROUND && apLogicOn) {
                //depending if on HDR/TRK or NAV mode, select appropriate Alt Mode (WIP)
                //this._onModeManagedAltitude();
                this._onModeSelectedAltitude();
            }
            this.updateAutopilotCooldown = this._apCooldown;
        }
    }

    /**
     * Updates performance speeds such as GD, F, S, Vls and approach speeds
     */
    updatePerfSpeeds() {
        this.computedVgd = SimVar.GetSimVarValue("L:B77HS_SPEEDS_GD", "number");
        this.computedVfs = SimVar.GetSimVarValue("L:B77HS_SPEEDS_F", "number");
        this.computedVss = SimVar.GetSimVarValue("L:B77HS_SPEEDS_S", "number");
        this.computedVls = SimVar.GetSimVarValue("L:B77HS_SPEEDS_VLS", "number");

        let weight = this.tryEstimateLandingWeight();
        // Actual weight is used during approach phase (FCOM bulletin 46/2), and we also assume during go-around
        // Fallback gross weight set to 200.5T (MZFW 200ER), which is replaced by FMGW once input in FMS to avoid function returning undefined results.
        if (this.flightPhaseManager.phase >= AimsFlightPhases.APPROACH || !isFinite(weight)) {
            weight = (this.getGW() == 0) ? 200.5 : this.getGW();
        }
        // if pilot has set approach wind in MFMC we use it, otherwise fall back to current measured wind
        if (isFinite(this.perfApprWindSpeed) && isFinite(this.perfApprWindHeading)) {
            this.approachSpeeds = new NXSpeedsApp(weight, this.perfApprFlaps3, this._towerHeadwind);
        } else {
            this.approachSpeeds = new NXSpeedsApp(weight, this.perfApprFlaps3);
        }
        this.approachSpeeds.valid = this.flightPlanManager.phase >= AimsFlightPhases.APPROACH || isFinite(weight);
    }

    updateConstraints() {
        const activeFpIndex = this.flightPlanManager.getActiveWaypointIndex();
        const constraints = this.managedProfile.get(activeFpIndex);
        const fcuSelAlt = Simplane.getAutoPilotDisplayedAltitudeLockValue("feet");

        let constraintAlt = 0;
        if (constraints) {
            if ((this.flightPhaseManager.phase < AimsFlightPhases.CRUISE || this.flightPhaseManager.phase === AimsFlightPhases.GOAROUND) && isFinite(constraints.climbAltitude) && constraints.climbAltitude < fcuSelAlt) {
                constraintAlt = constraints.climbAltitude;
            }

            if ((this.flightPhaseManager.phase > AimsFlightPhases.CRUISE && this.flightPhaseManager.phase < AimsFlightPhases.GOAROUND) && isFinite(constraints.descentAltitude) && constraints.descentAltitude > fcuSelAlt) {
                constraintAlt = constraints.descentAltitude;
            }
        }

        if (constraintAlt !== this.constraintAlt) {
            this.constraintAlt = constraintAlt;
            SimVar.SetSimVarValue("L:B77HS_FG_ALTITUDE_CONSTRAINT", "feet", this.constraintAlt);
        }
    }

    // TODO/VNAV: Speed constraint
    getSpeedConstraint() {
        if (!this.navModeEngaged()) {
            return Infinity;
        }

        const activeLegIndex = this.guidanceController.activeTransIndex >= 0 ? this.guidanceController.activeTransIndex : this.guidanceController.activeLegIndex;
        const constraints = this.managedProfile.get(activeLegIndex);
        if (constraints) {
            if (this.flightPhaseManager.phase < AimsFlightPhases.CRUISE || this.flightPhaseManager.phase === AimsFlightPhases.GOAROUND) {
                return constraints.climbSpeed;
            }

            if (this.flightPhaseManager.phase > AimsFlightPhases.CRUISE && this.flightPhaseManager.phase < AimsFlightPhases.GOAROUND) {
                // FIXME proper decel calc
                if (this.guidanceController.activeLegDtg < this.calculateDecelDist(Math.min(constraints.previousDescentSpeed, this.managedSpeedDescend), constraints.descentSpeed)) {
                    return constraints.descentSpeed;
                } else {
                    return constraints.previousDescentSpeed;
                }
            }
        }

        return Infinity;
    }

    updateManagedProfile() {
        this.managedProfile.clear();

        const origin = this.flightPlanManager.getPersistentOrigin(FlightPlans.Active);
        const originElevation = origin ? origin.infos.coordinates.alt : 0;
        const destination = this.flightPlanManager.getDestination(FlightPlans.Active);
        const destinationElevation = destination ? destination.infos.coordinates.alt : 0;

        // TODO should we save a constraint already propagated to the current leg?

        // propagate descent speed constraints forward
        let currentSpeedConstraint = Infinity;
        let previousSpeedConstraint = Infinity;
        for (let index = 0; index < this.flightPlanManager.getWaypointsCount(FlightPlans.Active); index++) {
            const wp = this.flightPlanManager.getWaypoint(index, FlightPlans.Active);
            if (wp.additionalData.constraintType === 2 /* DES */) {
                if (wp.speedConstraint > 0) {
                    currentSpeedConstraint = Math.min(currentSpeedConstraint, Math.round(wp.speedConstraint));
                }
            }
            this.managedProfile.set(index, {
                descentSpeed: currentSpeedConstraint,
                previousDescentSpeed: previousSpeedConstraint,
                climbSpeed: Infinity,
                previousClimbSpeed: Infinity,
                climbAltitude: Infinity,
                descentAltitude: -Infinity,
            });
            previousSpeedConstraint = currentSpeedConstraint;
        }

        // propagate climb speed constraints backward
        // propagate alt constraints backward
        currentSpeedConstraint = Infinity;
        previousSpeedConstraint = Infinity;
        let currentDesConstraint = -Infinity;
        let currentClbConstraint = Infinity;
        for (let index = this.flightPlanManager.getWaypointsCount(FlightPlans.Active) - 1; index >= 0; index--) {
            const wp = this.flightPlanManager.getWaypoint(index, FlightPlans.Active);
            if (wp.additionalData.constraintType === 1 /* CLB */) {
                if (wp.speedConstraint > 0) {
                    currentSpeedConstraint = Math.min(currentSpeedConstraint, Math.round(wp.speedConstraint));
                }
                switch (wp.legAltitudeDescription) {
                    case 1: // at alt 1
                    case 3: // at or below alt 1
                    case 4: // between alt 1 and alt 2
                        currentClbConstraint = Math.min(currentClbConstraint, Math.round(wp.legAltitude1));
                        break;
                    default:
                        // not constraining
                }
            } else if (wp.additionalData.constraintType === 2 /* DES */) {
                switch (wp.legAltitudeDescription) {
                    case 1: // at alt 1
                    case 2: // at or above alt 1
                        currentDesConstraint = Math.max(currentDesConstraint, Math.round(wp.legAltitude1));
                        break;
                    case 4: // between alt 1 and alt 2
                        currentDesConstraint = Math.max(currentDesConstraint, Math.round(wp.legAltitude2));
                        break;
                    default:
                        // not constraining
                }
            }
            const profilePoint = this.managedProfile.get(index);
            profilePoint.climbSpeed = currentSpeedConstraint;
            profilePoint.previousClimbSpeed = previousSpeedConstraint;
            profilePoint.climbAltitude = currentClbConstraint;
            profilePoint.descentAltitude = Math.max(destinationElevation, currentDesConstraint);
            previousSpeedConstraint = currentSpeedConstraint;

            // set some data for LNAV to use for coarse predictions while we lack vnav
            if (wp.additionalData.constraintType === 1 /* CLB */) {
                wp.additionalData.predictedSpeed = Math.min(profilePoint.climbSpeed, this.managedSpeedClimb);
                if (this.climbSpeedLimitAlt && profilePoint.climbAltitude < this.climbSpeedLimitAlt) {
                    wp.additionalData.predictedSpeed = Math.min(wp.additionalData.predictedSpeed, this.climbSpeedLimit);
                }
                wp.additionalData.predictedAltitude = Math.min(profilePoint.climbAltitude, this._cruiseFlightLevel * 100);
            } else if (wp.additionalData.constraintType === 2 /* DES */) {
                wp.additionalData.predictedSpeed = Math.min(profilePoint.descentSpeed, this.managedSpeedDescend);
                if (this.descentSpeedLimitAlt && profilePoint.climbAltitude < this.descentSpeedLimitAlt) {
                    wp.additionalData.predictedSpeed = Math.min(wp.additionalData.predictedSpeed, this.descentSpeedLimit);
                }
                wp.additionalData.predictedAltitude = Math.min(profilePoint.descentAltitude, this._cruiseFlightLevel * 100); ;
            } else {
                wp.additionalData.predictedSpeed = this.managedSpeedCruise;
                wp.additionalData.predictedAltitude = this._cruiseFlightLevel * 100;
            }
            // small hack to ensure the terminal procedures and transitions to/from enroute look nice despite lack of altitude predictions
            if (index <= this.flightPlanManager.getEnRouteWaypointsFirstIndex(FlightPlans.Active)) {
                wp.additionalData.predictedAltitude = Math.min(originElevation + 10000, wp.additionalData.predictedAltitude);
                wp.additionalData.predictedSpeed = Math.min(250, wp.additionalData.predictedSpeed);
            } else if (index >= this.flightPlanManager.getEnRouteWaypointsLastIndex(FlightPlans.Active)) {
                wp.additionalData.predictedAltitude = Math.min(destinationElevation + 10000, wp.additionalData.predictedAltitude);
                wp.additionalData.predictedSpeed = Math.min(250, wp.additionalData.predictedSpeed);
            }
        }
    }

    async updateDestinationData() {
        let landingElevation;
        let latitude;
        let longitude;

        /** @type {OneWayRunway} */
        const runway = this.flightPlanManager.getDestinationRunway(FlightPlans.Active);
        if (runway) {
            landingElevation = B77HS_Util.meterToFeet(runway.thresholdElevation);
            latitude = runway.thresholdCoordinates.lat;
            longitude = runway.thresholdCoordinates.long;
        } else {
            const airport = this.flightPlanManager.getDestination(FlightPlans.Active);
            if (airport) {
                const ele = await this.facilityLoader.GetAirportFieldElevation(airport.icao);
                landingElevation = isFinite(ele) ? ele : undefined;
                latitude = airport.GetInfos().coordinates.lat;
                longitude = airport.GetInfos().coordinates.long;
            }
        }

        if (this.landingElevation !== landingElevation) {
            this.landingElevation = landingElevation;

            //const ssm = landingElevation !== undefined ? Arinc429Word.SignStatusMatrix.NormalOperation : Arinc429Word.SignStatusMatrix.NoComputedData;

            //this.setBnrArincSimVar('LANDING_ELEVATION', landingElevation ? landingElevation : 0, ssm, 14, 16384, -2048);
            // FIXME CPCs should use the FM ARINC vars, and transmit their own vars as well
            SimVar.SetSimVarValue("L:B77HS_PRESS_AUTO_LANDING_ELEVATION", "feet", landingElevation ? landingElevation : 0);
        }

        if (this.destinationLatitude !== latitude) {
            this.destinationLatitude = latitude;

            //const ssm = latitude !== undefined ? Arinc429Word.SignStatusMatrix.NormalOperation : Arinc429Word.SignStatusMatrix.NoComputedData;

            //this.setBnrArincSimVar('DEST_LAT', latitude ? latitude : 0, ssm, 18, 180, -180);
        }

        if (this.destinationLongitude !== longitude) {
            this.destinationLongitude = longitude;

            //const ssm = longitude !== undefined ? Arinc429Word.SignStatusMatrix.NormalOperation : Arinc429Word.SignStatusMatrix.NoComputedData;

            //this.setBnrArincSimVar('DEST_LONG', longitude ? longitude : 0, ssm, 18, 180, -180);
        }
    }

/*     async setBnrArincSimVar(name, value, ssm, bits, rangeMax, rangeMin = 0) {
        const quantum = Math.max(Math.abs(rangeMin), rangeMax) / 2 ** bits;
        const data = Math.max(rangeMin, Math.min(rangeMax, Math.round(value / quantum) * quantum));

        // TODO change our ARINC429 format so JS can write it, then drop the SSM simvars
        return Promise.all([
            SimVar.SetSimVarValue(`L:B77HS_FM1_${name}`, "number", data),
            SimVar.SetSimVarValue(`L:B77HS_FM1_${name}_SSM`, "number", ssm),
            SimVar.SetSimVarValue(`L:B77HS_FM2_${name}`, "number", data),
            SimVar.SetSimVarValue(`L:B77HS_FM2_${name}_SSM`, "number", ssm),
        ]);
    } */

    getClbManagedSpeedFromCostIndex() {
        const dCI = (this.costIndex / 999) ** 2;
        return 290 * (1 - dCI) + 330 * dCI;
    }

    getCrzManagedSpeedFromCostIndex() {
        const dCI = (this.costIndex / 999) ** 2;
        return 290 * (1 - dCI) + 310 * dCI;
    }

    getDesManagedSpeedFromCostIndex() {
        const dCI = this.costIndex / 999;
        return 288 * (1 - dCI) + 300 * dCI;
    }

    getAppManagedSpeed() {
        switch (SimVar.GetSimVarValue("L:B77HS_FLAPS_HANDLE_INDEX", "Number")) {
            case 0: return this.computedVgd;
            case 1: return this.computedVss;
            case 3: return this.perfApprFlaps3 ? this.getVApp() : this.computedVfs;
            case 4: return this.getVApp();
            default: return this.computedVfs;
        }
    }

    /* FMS EVENTS */

    onPowerOn() {
        super.onPowerOn();
        const gpsDriven = SimVar.GetSimVarValue("GPS DRIVES NAV1", "Bool");
        if (!gpsDriven) {
            SimVar.SetSimVarValue("K:TOGGLE_GPS_DRIVES_NAV1", "Bool", 0);
        }
        this.initRadioNav(true);

        this._onModeSelectedHeading();
        this._onModeSelectedAltitude();

        FMCPerformancePage.UpdateThrRedAccFromOrigin(this);
        FMCPerformancePage.UpdateThrRedAccFromDestination(this);

        SimVar.SetSimVarValue("K:VS_SLOT_INDEX_SET", "number", 1);

        this.taxiFuelWeight = 0.2;
        FMCInitPage.updateTowIfNeeded(this);
    }

    onEvent(_event) {
        if (_event === "MODE_SELECTED_HEADING") {
            SimVar.SetSimVarValue("L:B77HS_GOAROUND_HDG_MODE", "bool", 1);
            SimVar.SetSimVarValue("L:B77HS_GOAROUND_NAV_MODE", "bool", 0);
            if (Simplane.getAutoPilotHeadingManaged()) {
                if (SimVar.GetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number") === 0) {
                    const currentHeading = Simplane.getHeadingMagnetic();
                    Coherent.call("HEADING_BUG_SET", 1, currentHeading).catch(console.error);
                }
            }
            this._onModeSelectedHeading();
        }
        if (_event === "MODE_MANAGED_HEADING") {
            SimVar.SetSimVarValue("L:B77HS_GOAROUND_HDG_MODE", "bool", 0);
            SimVar.SetSimVarValue("L:B77HS_GOAROUND_NAV_MODE", "bool", 1);
            if (this.flightPlanManager.getWaypointsCount() === 0) {
                return;
            }
            this._onModeManagedHeading();
        }
        if (_event === "MODE_SELECTED_ALTITUDE") {
            const dist = this.flightPlanManager.getDistanceToDestination();
            this.flightPhaseManager.handleFcuAltKnobPushPull(dist);
            this._onModeSelectedAltitude();
            this._onStepClimbDescent();
        }
        if (_event === "MODE_MANAGED_ALTITUDE") {
            const dist = this.flightPlanManager.getDistanceToDestination();
            this.flightPhaseManager.handleFcuAltKnobPushPull(dist);
            this._onModeManagedAltitude();
            this._onStepClimbDescent();
        }
        if (_event === "AP_DEC_ALT" || _event === "AP_INC_ALT") {
            const dist = this.flightPlanManager.getDistanceToDestination();
            this.flightPhaseManager.handleFcuAltKnobTurn(dist);
            this._onTrySetCruiseFlightLevel();
        }
        if (_event === "AP_DEC_HEADING" || _event === "AP_INC_HEADING") {
            if (SimVar.GetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number") === 0) {
                const currentHeading = Simplane.getHeadingMagnetic();
                Coherent.call("HEADING_BUG_SET", 1, currentHeading).catch(console.error);
            }
            SimVar.SetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number", 1);
        }
        if (_event === "VS") {
            const dist = this.flightPlanManager.getDistanceToDestination();
            this.flightPhaseManager.handleFcuVSKnob(dist, this._onStepClimbDescent.bind(this));
        }
    }

    _onModeSelectedHeading() {
        if (SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean")) {
            return;
        }
        if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
            SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
        }
        SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 1);
        SimVar.SetSimVarValue("L:B77HS_GOAROUND_HDG_MODE", "bool", 1);
    }

    _onModeManagedHeading() {
        if (SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean")) {
            return;
        }
        if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
            SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
        }
        SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
        SimVar.SetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number", 0);
    }

    _onModeSelectedAltitude() {
        if (!Simplane.getAutoPilotGlideslopeHold()) {
            SimVar.SetSimVarValue("L:A320_NEO_FCU_FORCE_IDLE_VS", "Number", 1);
        }
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 1);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate).catch(console.error);
    }

    _onModeManagedAltitude() {
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 2);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate).catch(console.error);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate).catch(console.error);
        if (!Simplane.getAutoPilotGlideslopeHold()) {
            this.requestCall(() => {
                SimVar.SetSimVarValue("L:A320_NEO_FCU_FORCE_IDLE_VS", "Number", 1);
            });
        }
    }

    _onStepClimbDescent() {
        if (!(this.flightPhaseManager.phase === AimsFlightPhases.CLIMB || this.flightPhaseManager.phase === AimsFlightPhases.CRUISE)) {
            return;
        }

        const _targetFl = Simplane.getAutoPilotDisplayedAltitudeLockValue() / 100;

        if (
            (this.flightPhaseManager.phase === AimsFlightPhases.CLIMB && _targetFl > this.cruiseFlightLevel) ||
            (this.flightPhaseManager.phase === AimsFlightPhases.CRUISE && _targetFl !== this.cruiseFlightLevel)
        ) {
            this.addMessageToQueue(NXSystemMessages.newCrzAlt.getModifiedMessage(_targetFl * 100));
            this.cruiseFlightLevel = _targetFl;
            this._cruiseFlightLevel = _targetFl;
        }
    }

    /***
     * Executed on every alt knob turn, checks whether or not the crz fl can be changed to the newly selected fcu altitude
     * It creates a timeout to simulate real life delay which resets every time the fcu knob alt increases or decreases.
     * @private
     */
    _onTrySetCruiseFlightLevel() {
        if (!(this.flightPhaseManager.phase === AimsFlightPhases.CLIMB || this.flightPhaseManager.phase === AimsFlightPhases.CRUISE)) {
            return;
        }

        const activeVerticalMode = SimVar.GetSimVarValue('L:B77HS_FMA_VERTICAL_MODE', 'enum');

        if ((activeVerticalMode >= 11 && activeVerticalMode <= 15) || (activeVerticalMode >= 21 && activeVerticalMode <= 23)) {
            const fcuFl = Simplane.getAutoPilotDisplayedAltitudeLockValue() / 100;

            if (this.flightPhaseManager.phase === AimsFlightPhases.CLIMB && fcuFl > this.cruiseFlightLevel ||
                this.flightPhaseManager.phase === AimsFlightPhases.CRUISE && fcuFl !== this.cruiseFlightLevel
            ) {
                if (this.cruiseFlightLevelTimeOut) {
                    clearTimeout(this.cruiseFlightLevelTimeOut);
                    this.cruiseFlightLevelTimeOut = undefined;
                }

                this.cruiseFlightLevelTimeOut = setTimeout(() => {
                    if (fcuFl === Simplane.getAutoPilotDisplayedAltitudeLockValue() / 100 &&
                        (
                            this.flightPhaseManager.phase === AimsFlightPhases.CLIMB && fcuFl > this.cruiseFlightLevel ||
                            this.flightPhaseManager.phase === AimsFlightPhases.CRUISE && fcuFl !== this.cruiseFlightLevel
                        )
                    ) {
                        this.addMessageToQueue(NXSystemMessages.newCrzAlt.getModifiedMessage(fcuFl * 100));
                        this.cruiseFlightLevel = fcuFl;
                        this._cruiseFlightLevel = fcuFl;
                        if (this.page.Current === this.page.ProgressPage) {
                            FMCProgressPage.ShowPage(this);
                        }
                    }
                }, 3000);
            }
        }
    }

    /* END OF FMS EVENTS */
    /* FMS CHECK ROUTINE */

    checkDestData() {
        this.addMessageToQueue(NXSystemMessages.enterDestData, () => {
            return isFinite(this.perfApprQNH) && isFinite(this.perfApprTemp) && isFinite(this.perfApprWindHeading) && isFinite(this.perfApprWindSpeed);
        });
    }

    checkGWParams() {
        const fmGW = SimVar.GetSimVarValue("L:B77HS_FM_GROSS_WEIGHT", "Number");
        const eng1state = SimVar.GetSimVarValue("L:B77HS_ENGINE_STATE:1", "Number");
        const eng2state = SimVar.GetSimVarValue("L:B77HS_ENGINE_STATE:2", "Number");
        const gs = SimVar.GetSimVarValue("GPS GROUND SPEED", "knots");
        const actualGrossWeight = SimVar.GetSimVarValue("TOTAL WEIGHT", "Kilograms") / 1000; //TO-DO Source to be replaced with FAC-GW
        const gwMismatch = (Math.abs(fmGW - actualGrossWeight) > 7) ? true : false;

        if (eng1state == 2 || eng2state == 2) {
            if (this._gwInitDisplayed < 1 && this.flightPhaseManager.phase < AimsFlightPhases.TAKEOFF) {
                this._initMessageSettable = true;
            }
        }
        //INITIALIZE WEIGHT/CG
        if (this.isAnEngineOn() && fmGW === 0 && this._initMessageSettable) {
            this.addMessageToQueue(NXSystemMessages.initializeWeightOrCg);
            this._gwInitDisplayed++;
            this._initMessageSettable = false;
        }

        //CHECK WEIGHT
        //TO-DO Ground Speed used for redundancy and to simulate delay (~10s) for FAC parameters to be calculated, remove once FAC is available.
        if (!this.isOnGround() && gwMismatch && this._checkWeightSettable && gs > 180) {
            this.addMessageToQueue(NXSystemMessages.checkWeight);
            this._checkWeightSettable = false;
        } else if (!gwMismatch) {
            this.removeMessageFromQueue(NXSystemMessages.checkWeight.text);
            this._checkWeightSettable = true;
        }
    }

    /* END OF FMS CHECK ROUTINE */
    /* MCDU GET/SET METHODS */

    get cruiseFlightLevel() {
        return this._activeCruiseFlightLevel;
    }

    set cruiseFlightLevel(fl) {
        this._activeCruiseFlightLevel = Math.round(fl);
        SimVar.SetSimVarValue("L:AIRLINER_CRUISE_ALTITUDE", "number", this._activeCruiseFlightLevel * 100);
    }

    setCruiseFlightLevelAndTemperature(input) {
        if (input === FMCMainDisplay.clrValue) {
            this.cruiseFlightLevel = undefined;
            this._cruiseFlightLevel = undefined;
            this.cruiseTemperature = undefined;
            return true;
        }
        const flString = input.split("/")[0].replace("FL", "");
        const tempString = input.split("/")[1];
        const onlyTemp = flString.length === 0;

        if (!!flString && !onlyTemp && this.trySetCruiseFl(parseFloat(flString))) {
            if (SimVar.GetSimVarValue("L:B77HS_CRZ_ALT_SET_INITIAL", "bool") === 1 && SimVar.GetSimVarValue("L:B77HS_GOAROUND_PASSED", "bool") === 1) {
                SimVar.SetSimVarValue("L:B77HS_NEW_CRZ_ALT", "number", this.cruiseFlightLevel);
            } else {
                SimVar.SetSimVarValue("L:B77HS_CRZ_ALT_SET_INITIAL", "bool", 1);
            }
            if (!tempString) {
                return true;
            }
        }
        if (!!tempString) {
            const temp = parseInt(tempString.replace("M", "-"));
            console.log("tS: " + tempString);
            console.log("ti: " + temp);
            if (isFinite(temp) && this._cruiseEntered) {
                if (temp > -270 && temp < 100) {
                    this.cruiseTemperature = temp;
                    return true;
                } else {
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }
            } else {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return false;
            }
        }
        this.setScratchpadMessage(NXSystemMessages.formatError);
        return false;
    }

    tryUpdateCostIndex(costIndex) {
        const value = parseInt(costIndex);
        if (isFinite(value)) {
            if (value >= 0) {
                if (value < 1000) {
                    this.costIndexSet = true;
                    this.costIndex = value;
                    this.updateManagedSpeeds();
                    return true;
                } else {
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }
            }
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    /**
     * Any tropopause altitude up to 60,000 ft is able to be entered
     * @param {string} tropo Format: NNNN or NNNNN Leading 0’s must be included. Entry is rounded to the nearest 10 ft
     * @return {boolean} Whether tropopause could be set or not
     */
    tryUpdateTropo(tropo) {
        if (tropo === FMCMainDisplay.clrValue) {
            if (this.tropo) {
                this.tropo = undefined;
                return true;
            }
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }

        if (!tropo.match(/^(?=(\D*\d){4,5}\D*$)/g)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }

        const value = parseInt(tropo);
        if (isFinite(value) && value >= 0 && value <= 60000) {
            this.tropo = Math.round(value / 10) * 10;
            return true;
        }

        this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
        return false;
    }

    ensureCurrentFlightPlanIsTemporary(callback = EmptyCallback.Boolean) {
        if (this.flightPlanManager.getCurrentFlightPlanIndex() === 0) {
            this.flightPlanManager.copyCurrentFlightPlanInto(1, () => {
                this.flightPlanManager.setCurrentFlightPlanIndex(1, (result) => {
                    SimVar.SetSimVarValue("L:FMC_FLIGHT_PLAN_IS_TEMPORARY", "number", 1);
                    SimVar.SetSimVarValue("L:MAP_SHOW_TEMPORARY_FLIGHT_PLAN", "number", 1);
                    callback(result);
                });
            }).catch(console.error);
        } else {
            callback(true);
        }
    }

    resetCoroute() {
        this.coRoute.routeNumber = undefined;
        this.coRoute.routes = [];
    }

    /** MCDU Init page method for FROM/TO, NOT for programmatic use */
    tryUpdateFromTo(fromTo, callback = EmptyCallback.Boolean) {
        if (fromTo === FMCMainDisplay.clrValue) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return callback(false);
        }

        const match = fromTo.match(/^([A-Z]{4})\/([A-Z]{4})$/);
        if (match === null) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return callback(false);
        }
        const [, from, to] = match;

        this.resetCoroute();

        this.setFromTo(from, to).then(() => {
            this.getCoRouteList().then(() => callback(true)).catch(console.log);
        }).catch((e) => {
            if (e instanceof CduMessage) {
                this.setScratchpadMessage(e);
            } else {
                console.warn(e);
            }
            callback(false);
        });
    }

    /**
     * Programmatic method to set from/to
     * @param {string} from 4-letter icao code for origin airport
     * @param {string} to 4-letter icao code for destination airport
     * @throws NXSystemMessage on error (you are responsible for pushing to the scratchpad if appropriate)
     */
    async setFromTo(from, to) {
        let airportFrom, airportTo;
        try {
            airportFrom = await this.dataManager.GetAirportByIdent(from);
            airportTo = await this.dataManager.GetAirportByIdent(to);
            if (!airportFrom || !airportTo) {
                throw NXSystemMessages.notInDatabase;
            }
        } catch (e) {
            console.log(e);
            throw NXSystemMessages.notInDatabase;
        }

        this.atsu.atc.resetAtisAutoUpdate();

        return new Promise((resolve, reject) => {
            this.eraseTemporaryFlightPlan(() => {
                this.flightPlanManager.clearFlightPlan(() => {
                    this.tempFpPendingAutoTune = true;
                    this.flightPlanManager.setOrigin(airportFrom.icao, () => {
                        this.setGroundTempFromOrigin();
                        this.flightPlanManager.setDestination(airportTo.icao, () => resolve(true)).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            });
        });
    }

    /**
     * Computes distance between destination and alternate destination
     */
    tryUpdateDistanceToAlt() {
        this._DistanceToAlt = Avionics.Utils.computeGreatCircleDistance(
            this.flightPlanManager.getDestination().infos.coordinates,
            this.altDestination.infos.coordinates);
    }

    // only used by trySetRouteAlternateFuel
    isAltFuelInRange(fuel) {
        return 0 < fuel && fuel < (this.blockFuel - this._routeTripFuelWeight);
    }

    async trySetRouteAlternateFuel(altFuel) {
        if (altFuel === FMCMainDisplay.clrValue) {
            this._routeAltFuelEntered = false;
            return true;
        }
        if (!this.altDestination) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }

        const value = NXUnits.userToKg(parseFloat(altFuel));
        if (isFinite(value)) {
            if (this.isAltFuelInRange(value)) {
                this._routeAltFuelEntered = true;
                this._routeAltFuelWeight = value;
                this._routeAltFuelTime = FMCMainDisplay.minutesTohhmm(B77HS_FuelPred.computeUserAltTime(this._routeAltFuelWeight * 1000, 290));
                return true;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
        }
        this.setScratchpadMessage(NXSystemMessages.formatError);
        return false;
    }

    async trySetMinDestFob(fuel) {
        if (fuel === FMCMainDisplay.clrValue) {
            this._minDestFobEntered = false;
            return true;
        }
        if (!this.representsDecimalNumber(fuel)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }

        const value = NXUnits.userToKg(parseFloat(fuel));
        if (isFinite(value)) {
            if (this.isMinDestFobInRange(value)) {
                this._minDestFobEntered = true;
                if (value < this._minDestFob) {
                    this.setScratchpadMessage(NXSystemMessages.checkMinDestFob);
                }
                this._minDestFob = value;
                return true;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
        }
        this.setScratchpadMessage(NXSystemMessages.formatError);
        return false;
    }

    async tryUpdateAltDestination(altDestIdent) {
        if (altDestIdent === "NONE" || altDestIdent === FMCMainDisplay.clrValue) {
            this.atsu.atc.resetAtisAutoUpdate();
            this.altDestination = undefined;
            this._DistanceToAlt = 0;
            return true;
        }
        const airportAltDest = await this.dataManager.GetAirportByIdent(altDestIdent).catch(console.error);
        if (airportAltDest) {
            this.atsu.atc.resetAtisAutoUpdate();
            this.altDestination = airportAltDest;
            this.tryUpdateDistanceToAlt();
            return true;
        }
        this.setScratchpadMessage(NXSystemMessages.notInDatabase);
        return false;
    }

    /**
     * Updates the Fuel weight cell to tons. Uses a place holder FL120 for 30 min
     */
    tryUpdateRouteFinalFuel() {
        if (this._routeFinalFuelTime <= 0) {
            this._routeFinalFuelTime = this._defaultRouteFinalTime;
        }
        this._routeFinalFuelWeight = B77HS_FuelPred.computeHoldingTrackFF(this.zeroFuelWeight, 120) / 1000;
        this._rteFinalCoeffecient = B77HS_FuelPred.computeHoldingTrackFF(this.zeroFuelWeight, 120) / 30;
    }

    /**
     * Updates the alternate fuel and time values using a place holder FL of 330 until that can be set
     */
    tryUpdateRouteAlternate() {
        if (this._DistanceToAlt < 20) {
            this._routeAltFuelWeight = 0;
            this._routeAltFuelTime = 0;
        } else {
            const placeholderFl = 120;
            let airDistance = 0;
            if (this._windDir === this._windDirections.TAILWIND) {
                airDistance = B77HS_FuelPred.computeAirDistance(Math.round(this._DistanceToAlt), this.averageWind);
            } else if (this._windDir === this._windDirections.HEADWIND) {
                airDistance = B77HS_FuelPred.computeAirDistance(Math.round(this._DistanceToAlt), -this.averageWind);
            }

            const deviation = (this.zeroFuelWeight + this._routeFinalFuelWeight - B77HS_FuelPred.refWeight) * B77HS_FuelPred.computeNumbers(airDistance, placeholderFl, B77HS_FuelPred.computations.CORRECTIONS, true);
            if ((20 < airDistance && airDistance < 200) && (100 < placeholderFl && placeholderFl < 290)) { //This will always be true until we can setup alternate routes
                this._routeAltFuelWeight = (B77HS_FuelPred.computeNumbers(airDistance, placeholderFl, B77HS_FuelPred.computations.FUEL, true) + deviation) / 1000;
                this._routeAltFuelTime = B77HS_FuelPred.computeNumbers(airDistance, placeholderFl, B77HS_FuelPred.computations.TIME, true);
            }
        }
    }

    /**
     * Attempts to calculate trip information. Is dynamic in that it will use liveDistanceTo the destination rather than a
     * static distance. Works down to 20NM airDistance and FL100 Up to 3100NM airDistance and FL390, anything out of those ranges and values
     * won't be updated.
     */
    tryUpdateRouteTrip(dynamic = false) {
        let airDistance = 0;
        const groundDistance = dynamic ? this.flightPlanManager.getDistanceToDestination(0) : this.flightPlanManager.getDestination().cumulativeDistanceInFP;
        if (this._windDir === this._windDirections.TAILWIND) {
            airDistance = B77HS_FuelPred.computeAirDistance(groundDistance, this.averageWind);
        } else if (this._windDir === this._windDirections.HEADWIND) {
            airDistance = B77HS_FuelPred.computeAirDistance(groundDistance, -this.averageWind);
        }

        let altToUse = this.cruiseFlightLevel;
        // Use the cruise level for calculations otherwise after cruise use descent altitude down to 10,000 feet.
        if (this.flightPhaseManager.phase >= AimsFlightPhases.DESCENT) {
            altToUse = SimVar.GetSimVarValue("PLANE ALTITUDE", 'Feet') / 100;
        }

        if ((20 <= airDistance && airDistance <= 3100) && (100 <= altToUse && altToUse <= 390)) {
            const deviation = (this.zeroFuelWeight + this._routeFinalFuelWeight + this._routeAltFuelWeight - B77HS_FuelPred.refWeight) * B77HS_FuelPred.computeNumbers(airDistance, altToUse, B77HS_FuelPred.computations.CORRECTIONS, false);

            this._routeTripFuelWeight = (B77HS_FuelPred.computeNumbers(airDistance, altToUse, B77HS_FuelPred.computations.FUEL, false) + deviation) / 1000;
            this._routeTripTime = B77HS_FuelPred.computeNumbers(airDistance, altToUse, B77HS_FuelPred.computations.TIME, false);
            // TODO FIXME: Remove placeholder efob logic
            if (this._routeTripFuelWeight) {
                SimVar.SetSimVarValue('L:B77HS_DESTINATION_FUEL_ON_BOARD', 'Kilograms', this.getDestEFOB(true) * 1000);
            }
        }
    }

    tryUpdateMinDestFob() {
        this._minDestFob = this._routeAltFuelWeight + this.getRouteFinalFuelWeight();
    }

    tryUpdateTOW() {
        this.takeOffWeight = this.zeroFuelWeight + this.blockFuel - this.taxiFuelWeight;
    }

    tryUpdateLW() {
        this.landingWeight = this.takeOffWeight - this._routeTripFuelWeight;
    }

    /**
     * Computes extra fuel
     * @param {boolean}useFOB - States whether to use the FOB rather than block fuel when computing extra fuel
     * @returns {number}
     */
    tryGetExtraFuel(useFOB = false) {
        const isFlying = parseInt(SimVar.GetSimVarValue("GROUND VELOCITY", "knots")) > 30;

        if (useFOB) {
            return this.getFOB() - this.getTotalTripFuelCons() - this._minDestFob - this.taxiFuelWeight - (isFlying ? 0 : this.getRouteReservedWeight());
        } else {
            return this.blockFuel - this.getTotalTripFuelCons() - this._minDestFob - this.taxiFuelWeight - (isFlying ? 0 : this.getRouteReservedWeight());
        }
    }

    /**
     * EXPERIMENTAL
     * Attempts to calculate the extra time
     */
    tryGetExtraTime(useFOB = false) {
        if (this.tryGetExtraFuel(useFOB) <= 0) {
            return 0;
        }
        const tempWeight = this.getGW() - this._minDestFob;
        const tempFFCoefficient = B77HS_FuelPred.computeHoldingTrackFF(tempWeight, 180) / 30;
        return (this.tryGetExtraFuel(useFOB) * 1000) / tempFFCoefficient;
    }

    getRouteAltFuelWeight() {
        return this._routeAltFuelWeight;
    }

    getRouteAltFuelTime() {
        return this._routeAltFuelTime;
    }

    setOriginRunwayIndex(runwayIndex, callback = EmptyCallback.Boolean) {
        this.ensureCurrentFlightPlanIsTemporary(() => {
            this.tempFpPendingAutoTune = true;
            this.flightPlanManager.setDepartureProcIndex(-1, () => {
                this.flightPlanManager.setOriginRunwayIndex(runwayIndex, () => {
                    return callback(true);
                }).catch(console.error);
            }).catch(console.error);
        });
    }

    setRunwayIndex(runwayIndex, callback = EmptyCallback.Boolean) {
        this.ensureCurrentFlightPlanIsTemporary(() => {
            const routeOriginInfo = this.flightPlanManager.getOrigin().infos;
            this.tempFpPendingAutoTune = true;
            if (!this.flightPlanManager.getOrigin()) {
                this.setScratchpadMessage(NXFictionalMessages.noOriginSet);
                return callback(false);
            } else if (runwayIndex === -1) {
                this.flightPlanManager.setDepartureRunwayIndex(-1, () => {
                    this.flightPlanManager.setOriginRunwayIndex(-1, () => {
                        return callback(true);
                    }).catch(console.error);
                }).catch(console.error);
            } else if (routeOriginInfo instanceof AirportInfo) {
                if (routeOriginInfo.oneWayRunways[runwayIndex]) {
                    this.flightPlanManager.setDepartureRunwayIndex(runwayIndex, () => {
                        return callback(true);
                    }).catch(console.error);
                }
            } else {
                this.setScratchpadMessage(NXSystemMessages.notInDatabase);
                callback(false);
            }
        });
    }

    setDepartureIndex(departureIndex, callback = EmptyCallback.Boolean) {
        this.ensureCurrentFlightPlanIsTemporary(() => {
            const currentRunway = this.flightPlanManager.getOriginRunway();
            this.flightPlanManager.setDepartureProcIndex(departureIndex, () => {
                if (currentRunway) {
                    SimVar.SetSimVarValue("L:B77HS_DEPARTURE_ELEVATION", "feet", B77HS_Util.meterToFeet(currentRunway.elevation));
                    const departure = this.flightPlanManager.getDeparture();
                    const departureRunwayIndex = departure ? departure.runwayTransitions.findIndex(t => {
                        return t.runwayNumber === currentRunway.number && t.runwayDesignation === currentRunway.designator;
                    }) : -1;
                    if (departureRunwayIndex >= -1) {
                        return this.flightPlanManager.setDepartureRunwayIndex(departureRunwayIndex, () => {
                            return callback(true);
                        }).catch(console.error);
                    }
                }
                return callback(true);
            }).catch(console.error);
        });
    }

    setDepartureTransitionIndex(transIndex, callback = EmptyCallback.Boolean) {
        this.ensureCurrentFlightPlanIsTemporary(() => {
            this.flightPlanManager.setDepartureEnRouteTransitionIndex(transIndex, callback);
        });
    }

    setApproachTransitionIndex(transitionIndex, callback = EmptyCallback.Boolean) {
        //console.log("FMCMainDisplay: setApproachTransitionIndex = ", transitionIndex);
        const arrivalIndex = this.flightPlanManager.getArrivalProcIndex();
        this.ensureCurrentFlightPlanIsTemporary(() => {
            this.flightPlanManager.setApproachTransitionIndex(transitionIndex, () => {
                this.flightPlanManager.setArrivalProcIndex(arrivalIndex, () => {
                    callback(true);
                }).catch(console.error);
            }).catch(console.error);
        });
    }

    setArrivalProcIndex(arrivalIndex, callback = EmptyCallback.Boolean) {
        //console.log("FMCMainDisplay: setArrivalProcIndex = ", arrivalIndex);
        this.ensureCurrentFlightPlanIsTemporary(() => {
            this.flightPlanManager.setArrivalProcIndex(arrivalIndex, () => {
                callback(true);
            }).catch(console.error);
        });
    }

    setArrivalIndex(arrivalIndex, transitionIndex, callback = EmptyCallback.Boolean) {
        //console.log("FMCMainDisplay: setArrivalIndex: arrivalIndex=", arrivalIndex, " transitionIndex=", transitionIndex);
        this.ensureCurrentFlightPlanIsTemporary(() => {
            this.flightPlanManager.setArrivalEnRouteTransitionIndex(transitionIndex, () => {
                this.flightPlanManager.setArrivalProcIndex(arrivalIndex, () => {
                    callback(true);
                }).catch(console.error);
            }).catch(console.error);
        });
    }

    setApproachIndex(approachIndex, callback = EmptyCallback.Boolean) {
        //console.log("FMCMainDisplay: setApproachIndex = ", approachIndex);
        this.ensureCurrentFlightPlanIsTemporary(() => {
            this.flightPlanManager.setApproachIndex(approachIndex, () => {
                this.tempFpPendingAutoTune = true;
                callback(true);
            }).catch(console.error);
        });
    }

    /** @param {RawApproach} appr */
    async tuneIlsFromApproach(appr) {
        const finalLeg = appr.finalLegs[appr.finalLegs.length - 1];
        const ilsIcao = finalLeg.originIcao.trim();
        if (ilsIcao.length > 0) {
            try {
                const ils = await this.facilityLoader.getFacility(ilsIcao).catch(console.error);
                if (ils && ils.infos.frequencyMHz > 1) {
                    this.ilsAutoFrequency = ils.infos.frequencyMHz;
                    this.ilsAutoIcao = ils.infos.icao;
                    this.ilsAutoIdent = ils.infos.ident;
                    this.ilsAutoCourse = Math.round(finalLeg.course) % 360;
                    this.ilsAutoTuned = true;
                    if (!this._ilsFrequencyPilotEntered && !this._ilsIdentPilotEntered) {
                        this.connectIlsFrequency(this.ilsAutoFrequency);
                    }
                    if (this.ilsCourse) {
                        this.checkRunwayLsCourseMismatch();
                    } else {
                        await this.updateIlsCourse();
                    }
                    if (this.flightPhaseManager.phase > AimsFlightPhases.TAKEOFF) {
                        this.ilsApproachAutoTuned = true;
                    } else {
                        this.ilsTakeoffAutoTuned = true;
                    }
                    this.checkRunwayLsMismatch();
                    return true;
                }
            } catch (error) {
                console.error('tuneIlsFromApproach', error);
                return false;
            }
        }
        return false;
    }

    clearAutotunedIls() {
        this.ilsAutoTuned = false;
        this.ilsApproachAutoTuned = false;
        this.ilsTakeoffAutoTuned = false;
        this.ilsAutoFrequency = undefined;
        this.ilsAutoIdent = undefined;
        this.ilsAutoCourse = undefined;
        this.updateIlsCourse();
    }

    async updateIls() {
        if (this.backupNavTuning) {
            if (this.ilsAutoTuned) {
                this.clearAutotunedIls();
            }
            return;
        }

        await this.updateIlsCourse();

        if (this.flightPhaseManager.phase > AimsFlightPhases.TAKEOFF) {
            if (this.ilsApproachAutoTuned || this.flightPlanManager.getCurrentFlightPlanIndex() !== 0) {
                return;
            }
            this.ilsAutoTuned = false;
            // for unknown reasons, the approach returned here doesn't have the approach waypoints which we need
            const appr = this.flightPlanManager.getApproach();
            if (appr) {
                if (appr.approachType !== ApproachType.APPROACH_TYPE_ILS && appr.approachType !== ApproachType.APPROACH_TYPE_LOCALIZER) {
                    return;
                }
                const runway = this.flightPlanManager.getDestinationRunway();

                const planeLla = new LatLongAlt(
                    SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude"),
                    SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude")
                );
                if (runway && runway.beginningCoordinates) {
                    const runwayDistance = Avionics.Utils.computeGreatCircleDistance(planeLla, runway.beginningCoordinates);
                    if (runwayDistance > 300) {
                        return;
                    }
                }

                await this.tuneIlsFromApproach(appr);
            }
        } else {
            if (this.ilsTakeoffAutoTuned || this.flightPlanManager.getCurrentFlightPlanIndex() !== 0) {
                return;
            }
            this.ilsAutoTuned = false;
            const airport = this.flightPlanManager.getOrigin();
            const runway = this.flightPlanManager.getOriginRunway();

            // If the airport has correct navdata, the ILS will be listed as the reference navaid (originIcao in MSFS land) on at least the last leg of the
            // ILS approach procedure(s). Tuning this way gives us the ident, and the course
            if (airport && airport.infos && airport.infos.icao.charAt(0) === 'A' && runway) {
                for (let i = 0; i < airport.infos.approaches.length && !this.ilsAutoTuned; i++) {
                    const appr = airport.infos.approaches[i];
                    // L(eft), C(entre), R(ight), T(true North) are the possible runway designators (ARINC424)
                    // If there are multiple procedures for the same type of approach, an alphanumeric suffix is added to their names (last subpattern)
                    // We are a little more lenient than ARINC424 in an effort to match non-perfect navdata, so we allow dashes, spaces, or nothing before the suffix
                    if (appr && appr.finalLegs) {
                        if (
                            (appr.approachType === ApproachType.APPROACH_TYPE_ILS)
                            && appr.runwayNumber === runway.number
                            && appr.runwayDesignator === runway.designator
                            && appr.finalLegs.length > 0
                        ) {
                            await this.tuneIlsFromApproach(appr);
                        }
                    }
                }
            }
        }
    }

    async updateIlsCourse() {
        let course = -1;
        if (this.ilsCourse !== undefined) {
            course = this.ilsCourse;
        } else if (this.ilsAutoTuned && (!this._ilsIdentPilotEntered || this._ilsIcao === this.ilsAutoIcao) && !this._ilsFrequencyPilotEntered) {
            course = this.ilsAutoCourse;
        } else if (this.ilsFrequency > 0 && SimVar.GetSimVarValue('L:B77HS_RADIO_RECEIVER_LOC_IS_VALID', 'number') === 1) {
            course = SimVar.GetSimVarValue('NAV LOCALIZER:3', 'degrees');
        }
        SimVar.SetSimVarValue('L:B77HS_RMP_ILS_TUNED', 'boolean', false);

        return SimVar.SetSimVarValue('L:B77HS_FM_LS_COURSE', 'number', course);
    }

    isRunwayLsMismatched() {
        if (this.backupNavTuning || !this.ilsAutoTuned || this.flightPhaseManager.phase === AimsFlightPhases.DONE) {
            return false;
        }

        return (this._ilsFrequencyPilotEntered && Math.abs(this.ilsFrequency - this.ilsAutoFrequency) >= 0.05) || (this._ilsIdentPilotEntered && this._ilsIcao !== this.ilsAutoIcao);
    }

    isRunwayLsCourseMismatched() {
        if (this.backupNavTuning || !this.ilsAutoTuned || this.ilsCourse === undefined) {
            return false;
        }

        return Math.abs(Avionics.Utils.diffAngle(this.ilsCourse, this.ilsAutoCourse)) > 3;
    }

    checkRunwayLsMismatch() {
        if (this.isRunwayLsMismatched()) {
            this.addMessageToQueue(NXSystemMessages.rwyLsMismatch, () => !(this.isRunwayLsMismatched() || this.isRunwayLsCourseMismatched()));
        }

        // manually entered course mismatch is handled separately to avoid unwanted messages
    }

    checkRunwayLsCourseMismatch() {
        if (this.isRunwayLsCourseMismatched()) {
            this.addMessageToQueue(NXSystemMessages.rwyLsMismatch, () => !(this.isRunwayLsMismatched() || this.isRunwayLsCourseMismatched()));
        }
    }

    updateFlightNo(flightNo, callback = EmptyCallback.Boolean) {
        if (flightNo.length > 7) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return callback(false);
        }

        SimVar.SetSimVarValue("ATC FLIGHT NUMBER", "string", flightNo, "FMC").then(() => {
            this.atsu.connectToNetworks(flightNo)
                .then((code) => {
                    if (code !== Atsu.AtsuStatusCodes.Ok) {
                        SimVar.SetSimVarValue("L:B77HS_FMC_FLT_NO_SET", "boolean", 0);
                        this.addNewAtsuMessage(code);
                        this.flightNo = "";
                        return callback(false);
                    }

                    SimVar.SetSimVarValue("L:B77HS_FMC_FLT_NO_SET", "boolean", 1);
                    this.flightNumber = flightNo;
                    return callback(true);
                });
        });
    }

    async updateCoRoute(coRouteNum, callback = EmptyCallback.Boolean) {
        try {
            if (coRouteNum.length > 2 && (coRouteNum !== FMCMainDisplay.clrValue)) {
                if (coRouteNum.length < 10) {
                    if (coRouteNum === "NONE") {
                        this.resetCoroute();
                    } else {
                        const {success, data} = await SimBridgeClient.CompanyRoute.getCoRoute(coRouteNum);
                        if (success) {
                            this.coRoute["originIcao"] = data.origin.icao_code;
                            this.coRoute["destinationIcao"] = data.destination.icao_code;
                            this.coRoute["route"] = data.general.route;
                            if (data.alternate) {
                                this.coRoute["alternateIcao"] = data.alternate.icao_code;
                            }
                            this.coRoute["navlog"] = data.navlog.fix;

                            insertCoRoute(this);
                            this.coRoute["routeNumber"] = coRouteNum;
                        } else {
                            this.setScratchpadMessage(NXSystemMessages.notInDatabase);
                        }
                    }
                    return callback(true);
                }
            }
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return callback(false);
        } catch (error) {
            console.error(`Error retrieving coroute from SimBridge ${error}`);
            this.setScratchpadMessage(NXFictionalMessages.unknownDownlinkErr);
            return callback(false);
        }
    }

    async getCoRouteList() {
        try {
            const origin = this.flightPlanManager.getOrigin().ident;
            const dest = this.flightPlanManager.getDestination().ident;
            const {success, data} = await SimBridgeClient.CompanyRoute.getRouteList(origin, dest);

            if (success) {
                data.forEach((route => {
                    this.coRoute.routes.push({
                        originIcao: route.origin.icao_code,
                        destinationIcao: route.destination.icao_code,
                        alternateIcao: route.alternate ? route.alternate : undefined,
                        route: route.general.route,
                        navlog: route.navlog.fix,
                        routeName: route.name
                    });
                }));
            } else {
                this.setScratchpadMessage(NXSystemMessages.notInDatabase);
            }
        } catch (error) {
            console.info(`Error retrieving coroute list ${error}`);
        }
    }

    getTotalTripTime() {
        return this._routeTripTime;
    }

    getTotalTripFuelCons() {
        return this._routeTripFuelWeight;
    }

    _getOrSelectWaypoints(getter, ident, callback) {
        getter(ident).then((waypoints) => {
            if (waypoints.length === 0) {
                return callback(undefined);
            }
            if (waypoints.length === 1) {
                return callback(waypoints[0]);
            }
            B777_CDU_SelectWptPage.ShowPage(this, waypoints, callback);
        });
    }

    getOrSelectILSsByIdent(ident, callback) {
        this._getOrSelectWaypoints(this.dataManager.GetILSsByIdent.bind(this.dataManager), ident, callback);
    }
    getOrSelectVORsByIdent(ident, callback) {
        this._getOrSelectWaypoints(this.dataManager.GetVORsByIdent.bind(this.dataManager), ident, callback);
    }
    getOrSelectNDBsByIdent(ident, callback) {
        this._getOrSelectWaypoints(this.dataManager.GetNDBsByIdent.bind(this.dataManager), ident, callback);
    }

    getOrSelectWaypointByIdent(ident, callback) {
        this._getOrSelectWaypoints(this.dataManager.GetWaypointsByIdent.bind(this.dataManager), ident, callback);
    }

    insertWaypoint(newWaypointTo, index, callback = EmptyCallback.Boolean, immediately) {
        if (newWaypointTo === "" || newWaypointTo === FMCMainDisplay.clrValue) {
            return callback(false);
        }
        try {
            this.getOrCreateWaypoint(newWaypointTo, true).then((waypoint) => {
                if (!waypoint) {
                    return callback(false);
                }
                if (immediately) {
                    if (this.flightPlanManager.isCurrentFlightPlanTemporary()) {
                        this.setScratchpadMessage(NXSystemMessages.notAllowed);
                        return callback(false);
                    }
                    if (waypoint.additionalData && waypoint.additionalData.storedType !== undefined) {
                        this.flightPlanManager.addUserWaypoint(waypoint, index, () => {
                            return callback(true);
                        }).catch(console.error);
                    } else {
                        this.flightPlanManager.addWaypoint(waypoint.icao, index, () => {
                            return callback(true);
                        }).catch(console.error);
                    }
                } else {
                    this.ensureCurrentFlightPlanIsTemporary(async () => {
                        if (waypoint.additionalData && waypoint.additionalData.storedType !== undefined) {
                            this.flightPlanManager.addUserWaypoint(waypoint, index, () => {
                                return callback(true);
                            }).catch(console.error);
                        } else {
                            this.flightPlanManager.addWaypoint(waypoint.icao, index, () => {
                                return callback(true);
                            }).catch(console.error);
                        }
                    });
                }
            }).catch((err) => {
                if (err instanceof CduMessage) {
                    this.setScratchpadMessage(err);
                } else if (err) {
                    console.error(err);
                }
                return callback(false);
            });
        } catch (err) {
            if (err instanceof CduMessage) {
                this.setScratchpadMessage(err);
            } else {
                console.error(err);
            }
            return callback(false);
        }
    }

    /**
     *
     * @param {string} lastWaypointIdent The waypoint along the airway to insert up to
     * @param {number} index the flight plan index of the from waypoint
     * @param {string} airwayName the name/ident of the airway
     * @param {boolean} smartAirway true if the intersection is computed by the smart airways function
     * @returns index of the last waypoint inserted or -1 on error
     */
    async insertWaypointsAlongAirway(lastWaypointIdent, index, airwayName, smartAirway = false) {
        const referenceWaypoint = this.flightPlanManager.getWaypoint(index - 1);
        const lastWaypointIdentPadEnd = lastWaypointIdent.padEnd(5, " ");
        if (referenceWaypoint) {
            const infos = referenceWaypoint.infos;
            if (infos instanceof WayPointInfo) {
                await referenceWaypoint.infos.UpdateAirway(airwayName).catch(console.error); // Sometimes the waypoint is initialized without waiting to the airways array to be filled
                const airway = infos.airways.find(a => {
                    return a.name === airwayName;
                });
                if (airway) {
                    const firstIndex = airway.icaos.indexOf(referenceWaypoint.icao);
                    const lastWaypointIcao = airway.icaos.find(icao => icao.substring(7, 12) === lastWaypointIdentPadEnd);
                    const lastIndex = airway.icaos.indexOf(lastWaypointIcao);
                    if (firstIndex >= 0) {
                        if (lastIndex >= 0) {
                            let inc = 1;
                            if (lastIndex < firstIndex) {
                                inc = -1;
                            }
                            index -= 1;
                            const count = Math.abs(lastIndex - firstIndex);
                            for (let i = 1; i < count + 1; i++) { // 9 -> 6
                                const syncInsertWaypointByIcao = async (icao, idx) => {
                                    return new Promise(resolve => {
                                        console.log("add icao:" + icao + " @ " + idx);
                                        this.flightPlanManager.addWaypoint(icao, idx, () => {
                                            const waypoint = this.flightPlanManager.getWaypoint(idx);
                                            waypoint.infos.airwayIn = airwayName;
                                            if (i < count) {
                                                waypoint.infos.airwayOut = airwayName;
                                            }
                                            waypoint.additionalData.smartAirway = smartAirway;
                                            waypoint.additionalData.annotation = airwayName;
                                            console.log("icao:" + icao + " added");
                                            resolve();
                                        }).catch(console.error);
                                    });
                                };

                                await syncInsertWaypointByIcao(airway.icaos[firstIndex + i * inc], index + i).catch(console.error);
                            }
                            return index + count;
                        }
                        this.setScratchpadMessage(NXFictionalMessages.secondIndexNotFound);
                        return -1;
                    }
                    this.setScratchpadMessage(NXFictionalMessages.firstIndexNotFound);
                    return -1;
                }
                this.setScratchpadMessage(NXFictionalMessages.noRefWpt);
                return -1;
            }
            this.setScratchpadMessage(NXFictionalMessages.noWptInfos);
            return -1;
        }
        this.setScratchpadMessage(NXFictionalMessages.noRefWpt);
        return -1;
    }

    // Copy airway selections from temporary to active flightplan
    async copyAirwaySelections() {
        const temporaryFPWaypoints = this.flightPlanManager.getWaypoints(1);
        const activeFPWaypoints = this.flightPlanManager.getWaypoints(0);
        for (let i = 0; i < activeFPWaypoints.length; i++) {
            if (activeFPWaypoints[i].infos && temporaryFPWaypoints[i] && activeFPWaypoints[i].icao === temporaryFPWaypoints[i].icao && temporaryFPWaypoints[i].infos) {
                activeFPWaypoints[i].infos.airwayIn = temporaryFPWaypoints[i].infos.airwayIn;
                activeFPWaypoints[i].infos.airwayOut = temporaryFPWaypoints[i].infos.airwayOut;
            }
        }
    }

    removeWaypoint(index, callback = EmptyCallback.Void, immediately = false) {
        if (immediately) {
            if (this.flightPlanManager.isCurrentFlightPlanTemporary()) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return callback(false);
            }
            this.flightPlanManager.removeWaypoint(index, false, callback);
        } else {
            this.ensureCurrentFlightPlanIsTemporary(() => {
                this.flightPlanManager.removeWaypoint(index, false, callback);
            });
        }
    }

    addWaypointOverfly(index, callback = EmptyCallback.Void, immediately = false) {
        if (immediately) {
            if (this.flightPlanManager.isCurrentFlightPlanTemporary()) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return callback(false);
            }
            this.flightPlanManager.addWaypointOverfly(index, true, callback);
        } else {
            this.ensureCurrentFlightPlanIsTemporary(() => {
                this.flightPlanManager.addWaypointOverfly(index, true, callback);
            });
        }
    }

    removeWaypointOverfly(index, callback = EmptyCallback.Void, immediately = false) {
        if (immediately) {
            if (this.flightPlanManager.isCurrentFlightPlanTemporary()) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return callback(false);
            }
            this.flightPlanManager.removeWaypointOverfly(index, true, callback);
        } else {
            this.ensureCurrentFlightPlanIsTemporary(() => {
                this.flightPlanManager.removeWaypointOverfly(index, true, callback);
            });
        }
    }

    clearDiscontinuity(index, callback = EmptyCallback.Void, immediately = false) {
        if (immediately) {
            if (this.flightPlanManager.isCurrentFlightPlanTemporary()) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return callback(false);
            }
            if (!this.flightPlanManager.clearDiscontinuity(index)) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return callback(false);
            }
            callback();
        } else {
            this.ensureCurrentFlightPlanIsTemporary(() => {
                if (!this.flightPlanManager.clearDiscontinuity(index)) {
                    this.setScratchpadMessage(NXSystemMessages.notAllowed);
                    return callback(false);
                }
                callback();
            });
        }
    }

    setDestinationAfterWaypoint(icao, index, callback = EmptyCallback.Boolean) {
        this.dataManager.GetAirportByIdent(icao).then((airportTo) => {
            if (airportTo) {
                this.ensureCurrentFlightPlanIsTemporary(() => {
                    this.flightPlanManager.truncateWaypoints(index);
                    // add the new destination, which will insert a discontinuity
                    this.flightPlanManager.setDestination(airportTo.icao, () => {
                        callback(true);
                    }).catch(console.error);
                });
            } else {
                this.setScratchpadMessage(NXSystemMessages.notInDatabase);
                callback(false);
            }
        }).catch(console.error);
    }

    eraseTemporaryFlightPlan(callback = EmptyCallback.Void) {
        this.flightPlanManager.setCurrentFlightPlanIndex(0, () => {
            this.flightPlanManager.deleteFlightPlan(FlightPlans.Temporary);
            SimVar.SetSimVarValue("L:FMC_FLIGHT_PLAN_IS_TEMPORARY", "number", 0);
            SimVar.SetSimVarValue("L:MAP_SHOW_TEMPORARY_FLIGHT_PLAN", "number", 0);
            this.tempFpPendingAutoTune = false;
            callback();
        });
    }

    insertTemporaryFlightPlan(callback = EmptyCallback.Void) {
        if (this.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
            this.flightPlanManager.copyCurrentFlightPlanInto(0, () => {
                this.flightPlanManager.setCurrentFlightPlanIndex(0, () => {
                    this.flightPlanManager.getCurrentFlightPlan().updateTurningPoint(true);
                    this.flightPlanManager.deleteFlightPlan(FlightPlans.Temporary);
                    SimVar.SetSimVarValue("L:FMC_FLIGHT_PLAN_IS_TEMPORARY", "number", 0);
                    SimVar.SetSimVarValue("L:MAP_SHOW_TEMPORARY_FLIGHT_PLAN", "number", 0);
                    if (this.tempFpPendingAutoTune) {
                        this.clearAutotunedIls();
                        this.tempFpPendingAutoTune = false;
                    }
                    callback();
                });
            }).catch(console.error);
        }
    }

    /*
     * validates the waypoint type
     * return values:
     *    0 = lat-lon coordinate
     *    1 = time
     *    2 = place definition
     *   -1 = unknown
     */
    async waypointType(cdu, waypoint) {
        if (cdu.isLatLonFormat(waypoint)) {
            return [0, null];
        }

        // time formatted
        if (/([0-2][0-4][0-5][0-9]Z?)/.test(waypoint) && waypoint.length <= 5) {
            return [1, null];
        }

        // place formatted
        if (/^[A-Z0-9]{2,7}/.test(waypoint)) {
            return cdu.dataManager.GetWaypointsByIdent.bind(cdu.dataManager)(waypoint).then((waypoints) => {
                if (waypoints.length !== 0) {
                    return [2, null];
                } else {
                    return [-1, NXSystemMessages.notInDatabase];
                }
            });
        }

        return [-1, NXSystemMessages.formatError];
    }

    vSpeedsValid() {
        return this._v1Checked && this._vRChecked && this._v2Checked ? (
            (!!this.v1Speed && !!this.vRSpeed ? this.v1Speed <= this.vRSpeed : true)
            && (!!this.vRSpeed && !!this.v2Speed ? this.vRSpeed <= this.v2Speed : true)
            && (!!this.v1Speed && !!this.v2Speed ? this.v1Speed <= this.v2Speed : true)
        ) : true;
    }

    vSpeedDisagreeCheck() {
        this.addMessageToQueue(NXSystemMessages.vToDisagree, this.vSpeedsValid.bind(this));
    }

    //Needs PR Merge #3082
    trySetV1Speed(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }
        const v = parseInt(s);
        if (!isFinite(v) || !/^\d{2,3}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        if (v < 90 || v > 350) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        this.removeMessageFromQueue(NXSystemMessages.checkToData.text);
        this._v1Checked = true;
        this.v1Speed = v;
        SimVar.SetSimVarValue("L:AIRLINER_V1_SPEED", "Knots", this.v1Speed).then(() => {
            this.vSpeedDisagreeCheck();
        });
        return true;
    }

    //Needs PR Merge #3082
    trySetVRSpeed(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }
        const v = parseInt(s);
        if (!isFinite(v) || !/^\d{2,3}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        if (v < 90 || v > 350) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        this.removeMessageFromQueue(NXSystemMessages.checkToData.text);
        this._vRChecked = true;
        this.vRSpeed = v;
        SimVar.SetSimVarValue("L:AIRLINER_VR_SPEED", "Knots", this.vRSpeed).then(() => {
            this.vSpeedDisagreeCheck();
        });
        return true;
    }

    //Needs PR Merge #3082
    trySetV2Speed(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }
        const v = parseInt(s);
        if (!isFinite(v) || !/^\d{2,3}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        if (v < 90 || v > 350) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        this.removeMessageFromQueue(NXSystemMessages.checkToData.text);
        this._v2Checked = true;
        this.v2Speed = v;
        SimVar.SetSimVarValue("L:AIRLINER_V2_SPEED", "Knots", this.v2Speed).then(() => {
            this.vSpeedDisagreeCheck();
        });
        return true;
    }

    trySetTakeOffTransAltitude(s) {
        if (s === FMCMainDisplay.clrValue) {
            // TODO when possible fetch default from database
            this.flightPlanManager.setOriginTransitionAltitude();
            return true;
        }

        let value = parseInt(s);
        if (!isFinite(value) || !/^\d{4,5}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }

        value = Math.round(value / 10) * 10;
        if (value < 1000 || value > 45000) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }

        this.flightPlanManager.setOriginTransitionAltitude(value);
        return true;
    }

    //Needs PR Merge #3082
    async trySetThrustReductionAccelerationAltitude(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.thrustReductionAltitudeIsPilotEntered = false;
            this.accelerationAltitudeIsPilotEntered = false;
            CDUPerformancePage.UpdateThrRedAccFromOrigin(this);
            return true;
        }

        const [match, checkThrRedAlt, slash1, , slash2, checkAccAlt] = s.match(/^([0-9]{4,5})?(\/?)?((\/)([0-9]{4,5}))?$/) || [];
        if (!match || (slash1 && slash2) || (!checkThrRedAlt && !checkAccAlt)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }

        let [thrRedAlt, accAlt] = s.split("/");

        if (thrRedAlt === undefined || thrRedAlt == "") {
            thrRedAlt = 0;
        }

        if (accAlt === undefined || accAlt == "") {
            accAlt = 0;
        }

        if (thrRedAlt > 45000 || accAlt > 45000) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }

        let currentThrRedAlt = this.thrustReductionAltitude;
        let currentAccAlt = this.accelerationAltitude;
        let updateAccAlt = false;
        let updateThrRedAlt = false;

        const origin = this.flightPlanManager.getOrigin();
        let elevation = SimVar.GetSimVarValue("GROUND ALTITUDE", "feet");
        if (origin) {
            elevation = await this.facilityLoader.GetAirportFieldElevation(origin.icao);
        }

        const minimumAltitude = elevation + 400;

        if (thrRedAlt > 0) {
            thrRedAlt = parseInt(thrRedAlt);
            thrRedAlt = Math.round(thrRedAlt / 10) * 10;
            currentThrRedAlt = thrRedAlt;
        }

        if (accAlt > 0) {
            accAlt = parseInt(accAlt);
            accAlt = Math.round(accAlt / 10) * 10;
            currentAccAlt = accAlt;
        }

        if (thrRedAlt > 0 && (thrRedAlt < minimumAltitude || thrRedAlt > currentAccAlt)) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        } else if (thrRedAlt > 0) {
            updateThrRedAlt = true;
        }

        if (accAlt > 0 && (accAlt < minimumAltitude || accAlt < currentThrRedAlt)) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        } else if (accAlt > 0) {
            updateAccAlt = true;
        }

        if (updateThrRedAlt == true) {
            this.thrustReductionAltitude = thrRedAlt;
            this.thrustReductionAltitudeIsPilotEntered = true;
            SimVar.SetSimVarValue("L:AIRLINER_THR_RED_ALT", "Number", thrRedAlt);
        } else {
            this.thrustReductionAltitude = currentThrRedAlt;
            SimVar.SetSimVarValue("L:AIRLINER_THR_RED_ALT", "Number", currentThrRedAlt);
        }

        if (updateAccAlt == true) {
            this.accelerationAltitude = accAlt;
            this.accelerationAltitudeIsPilotEntered = true;
            SimVar.SetSimVarValue("L:AIRLINER_ACC_ALT", "Number", accAlt);
        } else {
            this.accelerationAltitude = currentAccAlt;
            SimVar.SetSimVarValue("L:AIRLINER_ACC_ALT", "Number", currentAccAlt);
        }
        return true;
    }
    async trySetEngineOutAcceleration(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.engineOutAccelerationAltitudeIsPilotEntered = false;
            CDUPerformancePage.UpdateEngOutAccFromOrigin(this);
            return true;
        }

        if (!/^\d{4,5}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }

        const origin = this.flightPlanManager.getOrigin();

        let elevation = SimVar.GetSimVarValue("GROUND ALTITUDE", "feet");
        if (origin) {
            elevation = await this.facilityLoader.GetAirportFieldElevation(origin.icao);
        }

        const minimumAltitude = elevation + 400;

        let engineOutAccAlt = parseInt(s);
        engineOutAccAlt = Math.round(engineOutAccAlt / 10) * 10;
        if (engineOutAccAlt < minimumAltitude || engineOutAccAlt > 45000) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }

        this.engineOutAccelerationAltitude = engineOutAccAlt;
        this.engineOutAccelerationAltitudeIsPilotEntered = true;
        SimVar.SetSimVarValue("L:B77HS_ENG_OUT_ACC_ALT", "feet", engineOutAccAlt);
        return true;
    }

    //Needs PR Merge #3082
    // look at this
    async trySetThrustReductionAccelerationAltitudeGoaround(s) {
        let thrRed = NaN;
        let accAlt = NaN;
        if (s) {
            const sSplit = s.split("/");
            thrRed = parseInt(sSplit[0]);
            accAlt = parseInt(sSplit[1]);
        }
        if ((isFinite(thrRed) || isFinite(accAlt)) && thrRed <= accAlt) {
            if (isFinite(thrRed)) {
                this.thrustReductionAltitudeGoaround = thrRed;
                SimVar.SetSimVarValue("L:AIRLINER_THR_RED_ALT_GOAROUND", "Number", this.thrustReductionAltitudeGoaround);
            }
            if (isFinite(accAlt)) {
                this.accelerationAltitudeGoaround = accAlt;
                SimVar.SetSimVarValue("L:AIRLINER_ACC_ALT_GOAROUND", "Number", this.accelerationAltitudeGoaround);
            }
            return true;
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    async trySetEngineOutAccelerationAltitudeGoaround(s) {
        const engOutAcc = parseInt(s);
        if (isFinite(engOutAcc)) {
            this.engineOutAccelerationAltitudeGoaround = engOutAcc;
            SimVar.SetSimVarValue("L:AIRLINER_ENG_OUT_ACC_ALT_GOAROUND", "Number", this.engineOutAccelerationAltitudeGoaround);
            return true;
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    //Needs PR Merge #3082
    //TODO: with FADEC no longer needed
    setPerfTOFlexTemp(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.perfTOTemp = NaN;
            // In future we probably want a better way of checking this, as 0 is
            // in the valid flex temperature range (-99 to 99).
            SimVar.SetSimVarValue("L:AIRLINER_TO_FLEX_TEMP", "Number", 0);
            return true;
        }
        let value = parseInt(s);
        if (!isFinite(value) || !/^[+\-]?\d{1,2}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        if (value < -99 || value > 99) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        // As the sim uses 0 as a sentinel value to detect that no flex
        // temperature is set, we'll just use 0.1 as the actual value for flex 0
        // and make sure we never display it with decimals.
        if (value === 0) {
            value = 0.1;
        }
        this.perfTOTemp = value;
        SimVar.SetSimVarValue("L:AIRLINER_TO_FLEX_TEMP", "Number", value);
        return true;
    }

    /**
     * Attempts to predict required block fuel for trip
     * @returns {boolean}
     */
    //TODO: maybe make this part of an update routine?
    tryFuelPlanning() {
        if (this._fuelPlanningPhase === this._fuelPlanningPhases.IN_PROGRESS) {
            this._blockFuelEntered = true;
            this._fuelPlanningPhase = this._fuelPlanningPhases.COMPLETED;
            return true;
        }
        const tempRouteFinalFuelTime = this._routeFinalFuelTime;
        this.tryUpdateRouteFinalFuel();
        this.tryUpdateRouteAlternate();
        this.tryUpdateRouteTrip();

        this._routeFinalFuelTime = tempRouteFinalFuelTime;
        this._routeFinalFuelWeight = (this._routeFinalFuelTime * this._rteFinalCoeffecient) / 1000;

        this.tryUpdateMinDestFob();

        this.blockFuel = this.getTotalTripFuelCons() + this._minDestFob + this.taxiFuelWeight + this.getRouteReservedWeight();
        this._fuelPlanningPhase = this._fuelPlanningPhases.IN_PROGRESS;
        return true;
    }

    trySetTaxiFuelWeight(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.taxiFuelWeight = this._defaultTaxiFuelWeight;
            this._taxiEntered = false;
            return true;
        }
        if (!this.representsDecimalNumber(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        const value = NXUnits.userToKg(parseFloat(s));
        if (isFinite(value)) {
            if (this.isTaxiFuelInRange(value)) {
                this._taxiEntered = true;
                this.taxiFuelWeight = value;
                return true;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    getRouteFinalFuelWeight() {
        if (isFinite(this._routeFinalFuelWeight)) {
            this._routeFinalFuelWeight = (this._routeFinalFuelTime * this._rteFinalCoeffecient) / 1000;
            return this._routeFinalFuelWeight;
        }
    }

    getRouteFinalFuelTime() {
        return this._routeFinalFuelTime;
    }

    /**
     * This method is used to set initial Final Time for when INIT B is making predictions
     * @param {String} s - containing time value
     * @returns {boolean}
     */
    async trySetRouteFinalTime(s) {
        if (s) {
            if (s === FMCMainDisplay.clrValue) {
                this._routeFinalFuelTime = this._routeFinalFuelTimeDefault;
                this._rteFinalWeightEntered = false;
                this._rteFinalTimeEntered = false;
                return true;
            }
            // Time entry must start with '/'
            if (s.startsWith("/")) {
                const rteFinalTime = s.slice(1);

                if (!/^\d{1,4}$/.test(rteFinalTime)) {
                    this.setScratchpadMessage(NXSystemMessages.formatError);
                    return false;
                }

                if (this.isFinalTimeInRange(rteFinalTime)) {
                    this._rteFinalWeightEntered = false;
                    this._rteFinalTimeEntered = true;
                    this._routeFinalFuelTime = FMCMainDisplay.hhmmToMinutes(rteFinalTime.padStart(4,"0"));
                    return true;
                } else {
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }
            }
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    /**
     *
     * @param {string} s
     * @returns {Promise<boolean>}
     */
    async trySetRouteFinalFuel(s) {
        if (s === FMCMainDisplay.clrValue) {
            this._routeFinalFuelTime = this._routeFinalFuelTimeDefault;
            this._rteFinalWeightEntered = false;
            this._rteFinalTimeEntered = false;
            return true;
        }
        if (s) {
            // Time entry must start with '/'
            if (s.startsWith("/")) {
                return this.trySetRouteFinalTime(s);
            } else {
                // If not time, try to parse as weight
                // Weight can be entered with optional trailing slash, if so remove it before parsing the value
                const enteredValue = s.endsWith("/") ? s.slice(0, -1) : s;

                if (!this.representsDecimalNumber(enteredValue)) {
                    this.setScratchpadMessage(NXSystemMessages.formatError);
                    return false;
                }

                const rteFinalWeight = NXUnits.userToKg(parseFloat(enteredValue));

                if (this.isFinalFuelInRange(rteFinalWeight)) {
                    this._rteFinalWeightEntered = true;
                    this._rteFinalTimeEntered = false;
                    this._routeFinalFuelWeight = rteFinalWeight;
                    this._routeFinalFuelTime = (rteFinalWeight * 1000) / this._rteFinalCoeffecient;
                    return true;
                } else {
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }
            }
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    getRouteReservedWeight() {
        if (!this.routeReservedEntered() && (this._rteFinalCoeffecient !== 0)) {
            const fivePercentWeight = this._routeReservedPercent * this._routeTripFuelWeight / 100;
            const fiveMinuteHoldingWeight = (5 * this._rteFinalCoeffecient) / 1000;

            return fivePercentWeight > fiveMinuteHoldingWeight ? fivePercentWeight : fiveMinuteHoldingWeight;
        }
        if (isFinite(this._routeReservedWeight) && this._routeReservedWeight !== 0) {
            return this._routeReservedWeight;
        } else {
            return this._routeReservedPercent * this._routeTripFuelWeight / 100;
        }
    }

    getRouteReservedPercent() {
        if (isFinite(this._routeReservedWeight) && isFinite(this.blockFuel) && this._routeReservedWeight !== 0) {
            return this._routeReservedWeight / this._routeTripFuelWeight * 100;
        }
        return this._routeReservedPercent;
    }

    trySetRouteReservedPercent(s) {
        if (s) {
            if (s === FMCMainDisplay.clrValue) {
                this._rteReservedWeightEntered = false;
                this._rteReservedPctEntered = false;
                this._routeReservedWeight = 0;
                this._routeReservedPercent = 5;
                this._rteRsvPercentOOR = false;
                return true;
            }
            // Percentage entry must start with '/'
            if (s.startsWith("/")) {
                const enteredValue = s.slice(1);

                if (!this.representsDecimalNumber(enteredValue)) {
                    this.setScratchpadMessage(NXSystemMessages.formatError);
                    return false;
                }

                const rteRsvPercent = parseFloat(enteredValue);

                if (!this.isRteRsvPercentInRange(rteRsvPercent)) {
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }

                this._rteRsvPercentOOR = false;
                this._rteReservedPctEntered = true;
                this._rteReservedWeightEntered = false;

                if (isFinite(rteRsvPercent)) {
                    this._routeReservedWeight = NaN;
                    this._routeReservedPercent = rteRsvPercent;
                    return true;
                }
            }
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    /**
     * Checks input and passes to trySetCruiseFl()
     * @param input
     * @returns {boolean} input passed checks
     */
    trySetCruiseFlCheckInput(input) {
        if (input === FMCMainDisplay.clrValue) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }
        const flString = input.replace("FL", "");
        if (!flString) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }
        return this.trySetCruiseFl(parseFloat(flString));
    }

    /**
     * Sets new Cruise FL if all conditions good
     * @param fl {number} Altitude or FL
     * @returns {boolean} input passed checks
     */
    trySetCruiseFl(fl) {
        if (!isFinite(fl)) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return false;
        }
        if (fl >= 1000) {
            fl = Math.floor(fl / 100);
        }
        if (fl > this.maxCruiseFL) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        const phase = this.flightPhaseManager.phase;
        const selFl = Math.floor(Math.max(0, Simplane.getAutoPilotDisplayedAltitudeLockValue("feet")) / 100);
        if (fl < selFl && (phase === AimsFlightPhases.CLIMB || phase === AimsFlightPhases.APPROACH || phase === AimsFlightPhases.GOAROUND)) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }

        if (fl <= 0 || fl > this.maxCruiseFL) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }

        this.cruiseFlightLevel = fl;
        this._cruiseFlightLevel = fl;
        this._cruiseEntered = true;
        this._activeCruiseFlightLevelDefaulToFcu = false;
        this.cruiseTemperature = undefined;
        this.updateConstraints();

        this.flightPhaseManager.handleNewCruiseAltitudeEntered(fl);

        return true;
    }

    trySetRouteReservedFuel(s) {
        if (s) {
            if (s === FMCMainDisplay.clrValue) {
                this._rteReservedWeightEntered = false;
                this._rteReservedPctEntered = false;
                this._routeReservedWeight = 0;
                this._routeReservedPercent = 5;
                this._rteRsvPercentOOR = false;
                return true;
            }
            // Percentage entry must start with '/'
            if (s.startsWith("/")) {
                return this.trySetRouteReservedPercent(s);
            } else {
                // If not percentage, try to parse as weight
                // Weight can be entered with optional trailing slash, if so remove it before parsing the value
                const enteredValue = s.endsWith("/") ? s.slice(0, -1) : s;

                if (!this.representsDecimalNumber(enteredValue)) {
                    this.setScratchpadMessage(NXSystemMessages.formatError);
                    return false;
                }

                const rteRsvWeight = NXUnits.userToKg(parseFloat(enteredValue));

                if (!this.isRteRsvFuelInRange(rteRsvWeight)) {
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }

                this._rteReservedWeightEntered = true;
                this._rteReservedPctEntered = false;

                if (isFinite(rteRsvWeight)) {
                    this._routeReservedWeight = rteRsvWeight;
                    this._routeReservedPercent = 0;

                    if (!this.isRteRsvPercentInRange(this.getRouteReservedPercent())) { // Bit of a hacky method due previous tight coupling of weight and percentage calculations
                        this._rteRsvPercentOOR = true;
                    }

                    return true;
                }
            }
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    trySetZeroFuelWeightZFWCG(s) {
        if (s) {
            if (s.includes("/")) {
                const sSplit = s.split("/");
                const zfw = NXUnits.userToKg(parseFloat(sSplit[0]));
                const zfwcg = parseFloat(sSplit[1]);
                if (isFinite(zfw) && isFinite(zfwcg)) {
                    if (this.isZFWInRange(zfw) && this.isZFWCGInRange(zfwcg)) {
                        this._zeroFuelWeightZFWCGEntered = true;
                        this.zeroFuelWeight = zfw;
                        this.zeroFuelWeightMassCenter = zfwcg;
                        return true;
                    }
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }
                if (!this._zeroFuelWeightZFWCGEntered) {
                    this.setScratchpadMessage(NXSystemMessages.notAllowed);
                    return false;
                }
                if (this.isZFWInRange(zfw)) {
                    this.zeroFuelWeight = zfw;
                    return true;
                }
                if (this.isZFWCGInRange(zfwcg)) {
                    this.zeroFuelWeightMassCenter = zfwcg;
                    return true;
                }
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
            if (!this._zeroFuelWeightZFWCGEntered) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return false;
            }
            const zfw = NXUnits.userToKg(parseFloat(s));
            if (this.isZFWInRange(zfw)) {
                this.zeroFuelWeight = zfw;
                return true;
            }
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        this.setScratchpadMessage(NXSystemMessages.formatError);
        return false;
    }

    /**
     *
     * @returns {number} Returns estimated fuel on board when arriving at the destination
     */
    getDestEFOB(useFOB = false) {
        return (useFOB ? this.getFOB() : this.blockFuel) - this._routeTripFuelWeight - this.taxiFuelWeight;
    }

    /**
     * @returns {number} Returns EFOB when arriving at the alternate dest
     */
    getAltEFOB(useFOB = false) {
        return this.getDestEFOB(useFOB) - this._routeAltFuelWeight;
    }

    trySetBlockFuel(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.blockFuel = 0.0;
            this._blockFuelEntered = false;
            this._fuelPredDone = false;
            this._fuelPlanningPhase = this._fuelPlanningPhases.PLANNING;
            return true;
        }
        const value = NXUnits.userToKg(parseFloat(s));
        if (isFinite(value) && this.isBlockFuelInRange(value)) {
            if (this.isBlockFuelInRange(value)) {
                this.blockFuel = value;
                this._blockFuelEntered = true;
                return true;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    async trySetAverageWind(s) {
        const validDelims = ["TL", "T", "+", "HD", "H", "-"];
        const matchedIndex = validDelims.findIndex(element => s.startsWith(element));
        const digits = matchedIndex >= 0 ? s.replace(validDelims[matchedIndex], "") : s;
        const isNum = /^\d+$/.test(digits);
        if (!isNum) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        const wind = parseInt(digits);
        this._windDir = matchedIndex <= 2 ? this._windDirections.TAILWIND : this._windDirections.HEADWIND;
        if (wind > 250) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        this.averageWind = wind;
        return true;
    }

    trySetPreSelectedClimbSpeed(s) {
        const isNextPhase = this.flightPhaseManager.phase === AimsFlightPhases.TAKEOFF;
        if (s === FMCMainDisplay.clrValue) {
            this.preSelectedClbSpeed = undefined;
            if (isNextPhase) {
                SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
                SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
            }
            return true;
        }
        const v = parseFloat(s);
        if (isFinite(v)) {
            if (v < 1) {
                this.preSelectedClbSpeed = v;
                if (isNextPhase) {
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", v);
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
                }
            } else {
                this.preSelectedClbSpeed = Math.round(v);
                if (isNextPhase) {
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", this.preSelectedClbSpeed);
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
                }
            }
            return true;
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    trySetPreSelectedCruiseSpeed(s) {
        const isNextPhase = this.flightPhaseManager.phase === AimsFlightPhases.CLIMB;
        if (s === FMCMainDisplay.clrValue) {
            this.preSelectedCrzSpeed = undefined;
            if (isNextPhase) {
                SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
                SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
            }
            return true;
        }
        const v = parseFloat(s);
        if (isFinite(v)) {
            if (v < 1) {
                this.preSelectedCrzSpeed = v;
                if (isNextPhase) {
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", v);
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
                }
            } else {
                this.preSelectedCrzSpeed = Math.round(v);
                if (isNextPhase) {
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", this.preSelectedCrzSpeed);
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
                }
            }
            return true;
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    trySetPreSelectedDescentSpeed(s) {
        const isNextPhase = this.flightPhaseManager.phase === AimsFlightPhases.CRUISE;
        if (s === FMCMainDisplay.clrValue) {
            this.preSelectedDesSpeed = undefined;
            if (isNextPhase) {
                SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
                SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
            }
            return true;
        }
        const v = parseFloat(s);
        if (isFinite(v)) {
            if (v < 1) {
                this.preSelectedDesSpeed = v;
                if (isNextPhase) {
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", v);
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", -1);
                }
            } else {
                this.preSelectedDesSpeed = Math.round(v);
                if (isNextPhase) {
                    SimVar.SetSimVarValue("L:B77HS_SpeedPreselVal", "knots", this.preSelectedDesSpeed);
                    SimVar.SetSimVarValue("L:B77HS_MachPreselVal", "mach", -1);
                }
            }
            return true;
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    setPerfApprQNH(s) {
        if (s === FMCMainDisplay.clrValue) {
            const dest = this.flightPlanManager.getDestination();
            if (dest && dest.liveDistanceTo < 180) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return false;
            } else {
                this.perfApprQNH = NaN;
                return true;
            }
        }

        const value = parseFloat(s);
        const HPA_REGEX = /^[01]?[0-9]{3}$/;
        const INHG_REGEX = /^([23][0-9]|[0-9]{2}\.)[0-9]{2}$/;

        if (HPA_REGEX.test(s)) {
            if (value >= 745 && value <= 1050) {
                this.perfApprQNH = value;
                SimVar.SetSimVarValue("L:B77HS_DESTINATION_QNH", "Millibar", this.perfApprQNH);
                return true;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
        } else if (INHG_REGEX.test(s)) {
            if (value >= 2200 && value <= 3100) {
                this.perfApprQNH = value / 100;
                SimVar.SetSimVarValue("L:B77HS_DESTINATION_QNH", "Millibar", this.perfApprQNH * 33.8639);
                return true;
            } else if (value >= 22.0 && value <= 31.00) {
                this.perfApprQNH = value;
                SimVar.SetSimVarValue("L:B77HS_DESTINATION_QNH", "Millibar", this.perfApprQNH * 33.8639);
                return true;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
        }
        this.setScratchpadMessage(NXSystemMessages.formatError);
        return false;
    }

    setPerfApprTemp(s) {
        if (s === FMCMainDisplay.clrValue) {
            const dest = this.flightPlanManager.getDestination();
            if (dest && dest.liveDistanceTo < 180) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return false;
            } else {
                this.perfApprTemp = NaN;
                return true;
            }
        }

        if (!/^[\+\-]?\d{1,2}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        this.perfApprTemp = parseInt(s);
        return true;
    }

    setPerfApprWind(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.perfApprWindHeading = NaN;
            this.perfApprWindSpeed = NaN;
            return true;
        }

        // both must be entered
        if (!/^\d{1,3}\/\d{1,3}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        const [dir, mag] = s.split("/").map((v) => parseInt(v));
        if (dir > 360 || mag > 500) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        this.perfApprWindHeading = dir % 360; // 360 is displayed as 0
        this.perfApprWindSpeed = mag;
        return true;
    }

    setPerfApprTransAlt(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.flightPlanManager.setDestinationTransitionLevel();
            return true;
        }

        if (!/^\d{4,5}$/.test(s)) {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
        const value = Math.round(parseInt(s) / 10) * 10;
        if (value < 1000 || value > 45000) {
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }

        this.flightPlanManager.setDestinationTransitionLevel(Math.round(value / 100));
        return true;
    }

    /**
     * VApp for _selected_ landing config
     */
    getVApp() {
        if (isFinite(this.vApp)) {
            return this.vApp;
        }
        return this.approachSpeeds.vapp;
    }

    /**
     * VApp for _selected_ landing config with GSMini correction
     */
    getVAppGsMini() {
        let vAppTarget = this.getVApp();
        if (isFinite(this.perfApprWindSpeed) && isFinite(this.perfApprWindHeading)) {
            vAppTarget = NXSpeedsUtils.getVtargetGSMini(vAppTarget, NXSpeedsUtils.getHeadWindDiff(this._towerHeadwind));
        }
        return vAppTarget;
    }

    //Needs PR Merge #3154
    setPerfApprVApp(s) {
        if (s === FMCMainDisplay.clrValue) {
            if (isFinite(this.vApp)) {
                this.vApp = NaN;
                return true;
            }
        } else {
            if (s.includes(".")) {
                this.setScratchpadMessage(NXSystemMessages.formatError);
                return false;
            }
            const value = parseInt(s);
            if (isFinite(value) && value >= 90 && value <= 350) {
                this.vApp = value;
                return true;
            }
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        }
        this.setScratchpadMessage(NXSystemMessages.notAllowed);
        return false;
    }

    /**
     * Tries to estimate the landing weight at destination
     * NaN on failure
     */
    tryEstimateLandingWeight() {
        const altActive = false;
        const landingWeight = this.zeroFuelWeight + (altActive ? this.getAltEFOB(true) : this.getDestEFOB(true));
        return isFinite(landingWeight) ? landingWeight : NaN;
    }

    setPerfApprMDA(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.perfApprMDA = NaN;
            SimVar.SetSimVarValue("L:AIRLINER_MINIMUM_DESCENT_ALTITUDE", "feet", 0);
            return true;
        } else if (s.match(/^[0-9]{1,5}$/) !== null) {
            const value = parseInt(s);
            let ldgRwy = this.flightPlanManager.getDestinationRunway();
            if (!ldgRwy) {
                const dest = this.flightPlanManager.getDestination();
                if (dest && dest.infos && dest.infos.runways.length > 0) {
                    ldgRwy = dest.infos.runways[0];
                }
            }
            const limitLo = ldgRwy ? ldgRwy.elevation * 3.28084 : 0;
            const limitHi = ldgRwy ? ldgRwy.elevation * 3.28084 + 5000 : 39000;
            if (value >= limitLo && value <= limitHi) {
                this.perfApprMDA = value;
                SimVar.SetSimVarValue("L:AIRLINER_MINIMUM_DESCENT_ALTITUDE", "feet", this.perfApprMDA);
                return true;
            }
            this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
            return false;
        } else {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
    }

    setPerfApprDH(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.perfApprDH = NaN;
            SimVar.SetSimVarValue("L:AIRLINER_DECISION_HEIGHT", "feet", -1);
            return true;
        }

        if (s === "NO" || s === "NO DH" || s === "NODH") {
            this.perfApprDH = "NO DH";
            SimVar.SetSimVarValue("L:AIRLINER_DECISION_HEIGHT", "feet", -2);
            return true;
        } else if (s.match(/^[0-9]{1,5}$/) !== null) {
            const value = parseInt(s);
            if (value >= 0 && value <= 5000) {
                this.perfApprDH = value;
                SimVar.SetSimVarValue("L:AIRLINER_DECISION_HEIGHT", "feet", this.perfApprDH);
                return true;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }
        } else {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return false;
        }
    }

    setPerfApprFlaps3(s) {
        this.perfApprFlaps3 = s;
        SimVar.SetSimVarValue("L:B77HS_SPEEDS_LANDING_CONF3", "boolean", s);
    }

    connectIlsFrequency(_freq) {
        if (_freq >= 108 && _freq <= 111.95 && RadioNav.isHz50Compliant(_freq)) {
            this.ilsFrequency = _freq;
            this.connectIls();
            return true;
        }
        return false;
    }

    connectIls() {
        if (this.isRadioNavActive()) {
            return;
        }
        if (this._lockConnectIls) {
            return;
        }
        this._lockConnectIls = true;
        setTimeout(() => {
            this._lockConnectIls = false;
        }, 1000);

        if (Math.abs(this.radioNav.getILSActiveFrequency(1) - this.ilsFrequency) > 0.005) {
            this.radioNav.setILSActiveFrequency(1, this.ilsFrequency);
        }
    }

    setIlsFrequency(s, navpushbutton, callback) {
        if (navpushbutton) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return callback(false);
        }

        if (s === FMCMainDisplay.clrValue) {
            if (!this._ilsIdentPilotEntered && !this._ilsFrequencyPilotEntered) {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return callback(false);
            }

            this._ilsFrequencyPilotEntered = false;
            this._ilsIdentPilotEntered = false;
            this._ilsIcao = undefined;
            if (this.ilsAutoTuned) {
                this.connectIlsFrequency(this.ilsAutoFrequency);
                this.checkRunwayLsCourseMismatch();
            } else {
                this.ilsCourse = undefined;
                this.ilsFrequency = 0;
                this.radioNav.setILSActiveFrequency(1, 0);
            }
            this.updateIlsCourse().then(() => {
                callback(true);
            });
            return;
        }
        if (s.match(/^[0-9]{3}(\.[0-9]{1,2})$/) !== null) {
            const v = parseFloat(s);
            const freq = Math.round(v * 100) / 100;

            if (this.connectIlsFrequency(freq)) {
                this._ilsIcao = undefined;
                this._ilsIdent = undefined;
                this._ilsFrequencyPilotEntered = true;
                this._ilsIdentPilotEntered = false;
                this.ilsCourse = undefined;
                this.checkRunwayLsMismatch();
                this.updateIlsCourse().then(() => {
                    callback(true);
                });
                return;
            } else {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return callback(false);
            }
        } else if (s.match(/^[A-Z0-9]{1,4}$/) !== null) {
            this.getOrSelectILSsByIdent(s, (navaid) => {
                if (navaid) {
                    if (this.connectIlsFrequency(Math.round(navaid.infos.frequencyMHz * 100) / 100)) {
                        this._ilsIcao = navaid.infos.icao;
                        this._ilsIdent = s;
                        this._ilsFrequencyPilotEntered = false;
                        this._ilsIdentPilotEntered = true;
                        if (!this.ilsAutoTuned || this.ilsAutoIcao !== this._ilsIcao) {
                            this.ilsCourse = undefined;
                        }
                        this.checkRunwayLsMismatch();
                        this.updateIlsCourse().then(() => {
                            callback(true);
                        });
                        return;
                    } else {
                        this.setScratchpadMessage(NXSystemMessages.databaseCodingError);
                        return callback(false);
                    }
                } else {
                    // TODO should show new navaid page
                    this.setScratchpadMessage(NXSystemMessages.notInDatabase);
                    return callback(false);
                }
            });
        } else {
            this.setScratchpadMessage(NXSystemMessages.formatError);
            return callback(false);
        }
    }

    setLsCourse(s, navpushbutton, callback) {
        if ((!this.ilsAutoTuned && !this._ilsFrequencyPilotEntered && !this._ilsIdentPilotEntered) ||
                navpushbutton) {
            this.setScratchpadMessage(NXSystemMessages.notAllowed);
            return callback(false);
        }

        if (s === FMCMainDisplay.clrValue) {
            if (this.ilsCourse !== undefined) {
                this.ilsCourse = undefined;
                this.updateIlsCourse().then(() => {
                    callback(true);
                });
                return;
            } else {
                this.setScratchpadMessage(NXSystemMessages.notAllowed);
                return callback(false);
            }
        }

        const m = s.match(/^(F|B)?([0-9]{1,3})(F|B)?$/);
        const direction = m[1] || m[3];
        const course = parseInt(m[2]);
        if (m !== null && direction !== undefined && (m[1] === undefined || m[3] === undefined)) {
            if (course > 360) {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return callback(false);
            }
            if (direction === 'B') {
                this.setScratchpadMessage(NXFictionalMessages.notYetImplemented);
                return callback(false);
            }

            this.ilsCourse = course % 360;

            this.checkRunwayLsCourseMismatch();

            this.updateIlsCourse().then(() => {
                callback(true);
            });
            return;
        }

        this.setScratchpadMessage(NXSystemMessages.formatError);
        return callback(false);
    }

    initRadioNav(_boot) {
        if (this.isPrimary) {
            console.log("Init RadioNav");
            {
                if (_boot) {
                    this.vhf1Frequency = this.radioNav.getVHFActiveFrequency(this.instrumentIndex, 1);
                    this.vhf2Frequency = this.radioNav.getVHFActiveFrequency(this.instrumentIndex, 2);
                } else {
                    if (Math.abs(this.radioNav.getVHFActiveFrequency(this.instrumentIndex, 1) - this.vhf1Frequency) > 0.005) {
                        this.radioNav.setVHFActiveFrequency(this.instrumentIndex, 1, this.vhf1Frequency);
                    }
                    if (Math.abs(this.radioNav.getVHFActiveFrequency(this.instrumentIndex, 2) - this.vhf2Frequency) > 0.005) {
                        this.radioNav.setVHFActiveFrequency(this.instrumentIndex, 2, this.vhf2Frequency);
                    }
                }
            }
            {
                if (_boot) {
                    // Because by default, it's set to a frequency beyond operational range
                    this.radioNav.setILSStandbyFrequency(1, 108.9);
                }
                if (Math.abs(this.radioNav.getVORActiveFrequency(1) - this.vor1Frequency) > 0.005) {
                    this.radioNav.setVORActiveFrequency(1, this.vor1Frequency);
                }
                if (this.vor1Course >= 0) {
                    SimVar.SetSimVarValue("K:VOR1_SET", "number", this.vor1Course);
                }
                this.connectIls();
            }
            {
                if (Math.abs(this.radioNav.getVORActiveFrequency(2) - this.vor2Frequency) > 0.005) {
                    this.radioNav.setVORActiveFrequency(2, this.vor2Frequency);
                }
                if (this.vor2Course >= 0) {
                    SimVar.SetSimVarValue("K:VOR2_SET", "number", this.vor2Course);
                }
                if (Math.abs(this.radioNav.getILSActiveFrequency(2) - 0) > 0.005) {
                    this.radioNav.setILSActiveFrequency(2, 0);
                }
            }
            {
                if (Math.abs(this.radioNav.getADFActiveFrequency(1) - this.adf1Frequency) > 0.005) {
                    SimVar.SetSimVarValue("K:ADF_COMPLETE_SET", "Frequency ADF BCD32", Avionics.Utils.make_adf_bcd32(this.adf1Frequency * 1000)).then(() => {
                    });
                }
                if (Math.abs(this.radioNav.getADFActiveFrequency(2) - this.adf2Frequency) > 0.005) {
                    SimVar.SetSimVarValue("K:ADF2_COMPLETE_SET", "Frequency ADF BCD32", Avionics.Utils.make_adf_bcd32(this.adf2Frequency * 1000)).then(() => {
                    });
                }
            }
            {
                if (this.atc1Frequency > 0) {
                    SimVar.SetSimVarValue("K:XPNDR_SET", "Frequency BCD16", Avionics.Utils.make_xpndr_bcd16(this.atc1Frequency));
                } else {
                    this.atc1Frequency = SimVar.GetSimVarValue("TRANSPONDER CODE:1", "number");
                }
            }
        }
    }

    canSwitchToNav() {
        if (!this._canSwitchToNav) {
            const altitude = Simplane.getAltitudeAboveGround();
            if (altitude >= 500) {
                this._canSwitchToNav = true;
            }
        }
        return this._canSwitchToNav;
    }

    isRadioNavActive() {
        return this.radioNav.getRADIONAVActive((this.isPrimary) ? 1 : 2);
    }

    get vhf1Frequency() {
        return this._vhf1Frequency;
    }

    get vhf2Frequency() {
        return this._vhf2Frequency;
    }

    get vor1Frequency() {
        return this._vor1Frequency;
    }

    get vor1Course() {
        return this._vor1Course;
    }

    get vor2Frequency() {
        return this._vor2Frequency;
    }

    get vor2Course() {
        return this._vor2Course;
    }

    get ilsFrequency() {
        return this._ilsFrequency;
    }

    get ilsCourse() {
        return this._ilsCourse;
    }

    get adf1Frequency() {
        return this._adf1Frequency;
    }

    get adf2Frequency() {
        return this._adf2Frequency;
    }

    get rcl1Frequency() {
        return this._rcl1Frequency;
    }

    get pre2Frequency() {
        return this._pre2Frequency;
    }

    get atc1Frequency() {
        return this._atc1Frequency;
    }

    set vhf1Frequency(_frq) {
        this._vhf1Frequency = _frq;
    }

    set vhf2Frequency(_frq) {
        this._vhf2Frequency = _frq;
    }

    set vor1Frequency(_frq) {
        this._vor1Frequency = _frq;
        SimVar.SetSimVarValue("L:FMC_VOR_FREQUENCY:1", "Hz", _frq * 1000000);
    }

    set vor1Course(_crs) {
        this._vor1Course = _crs;
    }

    set vor2Frequency(_frq) {
        this._vor2Frequency = _frq;
        SimVar.SetSimVarValue("L:FMC_VOR_FREQUENCY:2", "Hz", _frq * 1000000);
    }

    set vor2Course(_crs) {
        this._vor2Course = _crs;
    }

    set ilsFrequency(_frq) {
        this._ilsFrequency = _frq;
    }

    set ilsCourse(crs) {
        this._ilsCourse = crs;
    }

    set adf1Frequency(_frq) {
        this._adf1Frequency = _frq;
    }

    set adf2Frequency(_frq) {
        this._adf2Frequency = _frq;
    }

    set rcl1Frequency(_frq) {
        this._rcl1Frequency = _frq;
    }

    set pre2Frequency(_frq) {
        this._pre2Frequency = _frq;
    }

    set atc1Frequency(_frq) {
        this._atc1Frequency = _frq;
    }

    updateFuelVars() {
        this.blockFuel = SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilograms") / 1000;
    }

    trySetFlapsTHS(s) {
        if (s === FMCMainDisplay.clrValue) {
            this.flaps = NaN;
            this.ths = NaN;
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_FLAPS", "number", 0);
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_FLAPS_ENTERED", "bool", false);
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_THS", "degree", 0);
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_THS_ENTERED", "bool", false);
            this.tryCheckToData();
            return true;
        }

        let newFlaps = null;
        let newThs = null;

        let [flaps, ths] = s.split("/");

        if (flaps && flaps.length > 0) {
            if (!/^\d$/.test(flaps)) {
                this.setScratchpadMessage(NXSystemMessages.formatError);
                return false;
            }

            flaps = parseInt(flaps);
            if (flaps < 0 || flaps > 3) {
                this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                return false;
            }

            newFlaps = flaps;
        }

        if (ths && ths.length > 0) {
            // allow AAN.N and N.NAA, where AA is UP or DN
            if (!/^(UP|DN)(\d|\d?\.\d|\d\.\d?)|(\d|\d?\.\d|\d\.\d?)(UP|DN)$/.test(ths)) {
                this.setScratchpadMessage(NXSystemMessages.formatError);
                return false;
            }

            let direction = null;
            ths = ths.replace(/(UP|DN)/g, (substr) => {
                direction = substr;
                return "";
            });

            if (direction) {
                ths = parseFloat(ths);
                if (direction === "DN") {
                    // Note that 0 *= -1 will result in -0, which is strictly
                    // the same as 0 (that is +0 === -0) and doesn't make a
                    // difference for the calculation itself. However, in order
                    // to differentiate between DN0.0 and UP0.0 we'll do check
                    // later when displaying this value using Object.is to
                    // determine whether the pilot entered DN0.0 or UP0.0.
                    ths *= -1;
                }
                if (!isFinite(ths) || ths < -5 || ths > 7) {
                    this.setScratchpadMessage(NXSystemMessages.entryOutOfRange);
                    return false;
                }
                newThs = ths;
            }
        }

        if (newFlaps !== null) {
            if (!isNaN(this.flaps)) {
                this.tryCheckToData();
            }
            this.flaps = newFlaps;
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_FLAPS", "number", newFlaps);
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_FLAPS_ENTERED", "bool", true);
        }
        if (newThs !== null) {
            if (!isNaN(this.ths)) {
                this.tryCheckToData();
            }
            this.ths = newThs;
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_THS", "degree", newThs);
            SimVar.SetSimVarValue("L:B77HS_TO_CONFIG_THS_ENTERED", "bool", true);
        }
        return true;
    }

    checkEFOBBelowMin() {
        if (!this._minDestFobEntered) {
            this.tryUpdateMinDestFob();
        }
        const EFOBBelMin = this.isAnEngineOn() ? this.getDestEFOB(true) : this.getDestEFOB(false);

        if (EFOBBelMin < this._minDestFob) {
            if (this.isAnEngineOn()) {
                setTimeout(() => {
                    this.addMessageToQueue(NXSystemMessages.destEfobBelowMin, () => {
                        return this._EfobBelowMinClr === true;
                    }, () => {
                        this._EfobBelowMinClr = true;
                    });
                }, 180000);
            } else {
                this.addMessageToQueue(NXSystemMessages.destEfobBelowMin, () => {
                    return this._EfobBelowMinClr === true;
                }, () => {
                    this._EfobBelowMinClr = true;
                });
            }
        }
    }

    updateTowerHeadwind() {
        if (isFinite(this.perfApprWindSpeed) && isFinite(this.perfApprWindHeading)) {
            const rwy = this.flightPlanManager.getDestinationRunway();
            if (rwy) {
                this._towerHeadwind = NXSpeedsUtils.getHeadwind(this.perfApprWindSpeed, this.perfApprWindHeading, rwy.direction);
            }
        }
    }
    _getV1Speed() {
        return (new NXSpeedsTo(this.getGW(), this.flaps, Simplane.getAltitude())).v1;
    }

    _getVRSpeed() {
        return (new NXSpeedsTo(this.getGW(), this.flaps, Simplane.getAltitude())).vr;
    }

    _getV2Speed() {
        return (new NXSpeedsTo(this.getGW(), this.flaps, Simplane.getAltitude())).v2;
    }

    /**
     * Called after Flaps or THS change
     */
    tryCheckToData() {
        if (isFinite(this.v1Speed) || isFinite(this.vRSpeed) || isFinite(this.v2Speed)) {
            this.addMessageToQueue(NXSystemMessages.checkToData);
        }
    }

    /**
     * Called after runway change
     * - Sets confirmation prompt state for every entry whether it is defined or not
     * - Adds message when at least one entry needs to be confirmed
     * Additional:
     *   Only prompt the confirmation of FLEX TEMP when the TO runway was changed, not on initial insertion of the runway
     */
    onToRwyChanged() {
        const selectedRunway = this.flightPlanManager.getOriginRunway();
        if (!!selectedRunway) {
            const toRunway = Avionics.Utils.formatRunway(selectedRunway.designation);
            if (toRunway === this.toRunway) {
                return;
            }
            if (!!this.toRunway) {
                this.toRunway = toRunway;
                this._toFlexChecked = !isFinite(this.perfTOTemp);
                this._v1Checked = !isFinite(this.v1Speed);
                this._vRChecked = !isFinite(this.vRSpeed);
                this._v2Checked = !isFinite(this.v2Speed);

                if (this._v1Checked && this._vRChecked && this._v2Checked && this._toFlexChecked) {
                    return;
                }
                this.addMessageToQueue(NXSystemMessages.checkToData, (cdu) => cdu._v1Checked && cdu._vRChecked && cdu._v2Checked && cdu._toFlexChecked);
            }
            this.toRunway = toRunway;
        }
    }

    /**
     * Switches to the next/new perf page (if new flight phase is in order) or reloads the current page
     * @param _old {AimsFlightPhases}
     * @param _new {AimsFlightPhases}
     */
    tryUpdatePerfPage(_old, _new) {
        // Ensure we have a performance page selected...
        if (this.page.Current < this.page.PerformancePageTakeoff || this.page.Current > this.page.PerformancePageGoAround) {
            return;
        }

        const curPerfPagePhase = (() => {
            switch (this.page.Current) {
                case this.page.PerformancePageTakeoff : return AimsFlightPhases.TAKEOFF;
                case this.page.PerformancePageClb : return AimsFlightPhases.CLIMB;
                case this.page.PerformancePageCrz : return AimsFlightPhases.CRUISE;
                case this.page.PerformancePageDes : return AimsFlightPhases.DESCENT;
                case this.page.PerformancePageAppr : return AimsFlightPhases.APPROACH;
                case this.page.PerformancePageGoAround : return AimsFlightPhases.GOAROUND;
            }
        })();

        if (_new > _old) {
            if (_new >= curPerfPagePhase) {
                CDUPerformancePage.ShowPage(this, _new);
            }
        } else if (_old === curPerfPagePhase) {
            CDUPerformancePage.ShowPage(this, _old);
        }
    }

    routeReservedEntered() {
        return this._rteReservedWeightEntered || this._rteReservedPctEntered;
    }

    routeFinalEntered() {
        return this._rteFinalWeightEntered || this._rteFinalTimeEntered;
    }

    /**
     * Check if a place is the correct format for a runway
     * @param {string} s
     * @returns true if valid runway format
     */
    isRunwayFormat(s) {
        return s.match(/^([A-Z]{4})([0-9]{2}[RCL]?)$/) !== null;
    }

    /**
     * Parse a runway string and return the location of the threshold
     * Returns undefined if invalid format or not in database
     * @param {string} place
     * @throws {CduMessage}
     * @returns {WayPoint}
     */
    async parseRunway(place) {
        const rwy = place.match(/^([A-Z]{4})([0-9]{2}[RCL]?)$/);
        if (rwy !== null) {
            const airport = await this.dataManager.GetAirportByIdent(rwy[1]);
            if (airport) {
                for (let i = 0; i < airport.infos.oneWayRunways.length; i++) {
                    if (Avionics.Utils.formatRunway(airport.infos.oneWayRunways[i].designation) === rwy[2]) {
                        return this.dataManager.createRunwayWaypoint(airport, airport.infos.oneWayRunways[i]);
                    }
                }
                throw NXSystemMessages.notInDatabase;
            }
        } else {
            throw NXSystemMessages.notInDatabase;
        }
    }

    /**
     * Check if a place is the correct format for a latitude/longitude
     * @param {string} s
     * @returns true if valid lat/lon format
     */
    isLatLonFormat(s) {
        return s.match(/^(N|S)?([0-9]{2,4}\.[0-9])(N|S)?\/(E|W)?([0-9]{2,5}\.[0-9])(E|W)?$/) !== null;
    }

    /**
     * Parse a lat/lon string into a position
     * @param {string} place
     * @throws {CduMessage}
     * @returns {LatLongAlt}
     */
    parseLatLon(place) {
        const latlon = place.match(/^(N|S)?([0-9]{2,4}\.[0-9])(N|S)?\/(E|W)?([0-9]{2,5}\.[0-9])(E|W)?$/);
        if (latlon !== null) {
            const latB = (latlon[1] || "") + (latlon[3] || "");
            const lonB = (latlon[4] || "") + (latlon[6] || "");
            const latDdigits = latlon[2].length === 4 ? 3 : 4;
            const latD = parseInt(latlon[2].substring(0, latlon[2].length - latDdigits));
            const latM = parseFloat(latlon[2].substring(latlon[2].length - latDdigits));
            const lonDdigits = latlon[5].length === 4 ? 3 : 4;
            const lonD = parseInt(latlon[5].substring(0, latlon[5].length - lonDdigits));
            const lonM = parseFloat(latlon[5].substring(latlon[5].length - lonDdigits));
            if (latB.length !== 1 || lonB.length !== 1 || !isFinite(latM) || !isFinite(lonM)) {
                throw NXSystemMessages.formatError;
            }
            if (latD > 90 || latM > 59.9 || lonD > 180 || lonM > 59.9) {
                throw NXSystemMessages.entryOutOfRange;
            }
            const lat = (latD + latM / 60) * (latB === "S" ? -1 : 1);
            const lon = (lonD + lonM / 60) * (lonB === "W" ? -1 : 1);
            return new LatLongAlt(lat, lon);
        }
        throw NXSystemMessages.formatError;
    }

    /**
     * Check if a place is the correct format
     * @param {string} s
     * @returns true if valid place format
     */
    isPlaceFormat(s) {
        return s.match(/^[A-Z0-9]{2,7}$/) !== null || this.isRunwayFormat(s);
    }

    /**
     * Parse a place string into a position
     * @param {string} place
     * @throws {CduMessage}
     * @returns {WayPoint}
     */
    async parsePlace(place) {
        if (this.isRunwayFormat(place)) {
            return this.parseRunway(place);
        }

        return new Promise((resolve, reject) => {
            this.getOrSelectWaypointByIdent(place, (waypoint) => {
                if (waypoint) {
                    return resolve(waypoint);
                } else {
                    return reject(NXSystemMessages.notInDatabase);
                }
            });
        });
    }

    /**
     * Check if a string is a valid place-bearing/place-bearing format
     * @param {string} s
     * @returns true if valid place format
     */
    isPbxFormat(s) {
        const pbx = s.match(/^([^\-\/]+)\-([0-9]{1,3})\/([^\-\/]+)\-([0-9]{1,3})$/);
        return pbx !== null && this.isPlaceFormat(pbx[1]) && this.isPlaceFormat(pbx[3]);
    }

    /**
     * Parse a place-bearing/place-bearing string
     * @param {string} s place-bearing/place-bearing
     * @throws {CduMessage}
     * @returns {[WayPoint, number, WayPoint, number]} place and true bearing * 2
     */
    async parsePbx(s) {
        const pbx = s.match(/^([^\-\/]+)\-([0-9]{1,3})\/([^\-\/]+)\-([0-9]{1,3})$/);
        if (pbx === null) {
            throw NXSystemMessages.formatError;
        }
        const brg1 = parseInt(pbx[2]);
        const brg2 = parseInt(pbx[4]);
        if (brg1 > 360 || brg2 > 360) {
            throw NXSystemMessages.entryOutOfRange;
        }
        const place1 = await this.parsePlace(pbx[1]);
        const magVar1 = Facilities.getMagVar(place1.infos.coordinates.lat, place1.infos.coordinates.long);
        const place2 = await this.parsePlace(pbx[3]);
        const magVar2 = Facilities.getMagVar(place2.infos.coordinates.lat, place2.infos.coordinates.long);

        return [place1, B77HS_Util.magneticToTrue(brg1, magVar1), place2, B77HS_Util.magneticToTrue(brg2, magVar2)];
    }

    /**
     * Check if string is in place/bearing/distance format
     * @param {String} s
     * @returns true if pbd
     */
    isPbdFormat(s) {
        const pbd = s.match(/^([^\/]+)\/([0-9]{1,3})\/([0-9]{1,3}(\.[0-9])?)$/);
        return pbd !== null && this.isPlaceFormat(pbd[1]);
    }

    /**
     * Split PBD format into components
     * @param {String} s PBD format string
     * @returns [{string} place, {number} bearing, {number} distance]
     */
    splitPbd(s) {
        let [place, brg, dist] = s.split("/");
        brg = parseInt(brg);
        dist = parseFloat(dist);
        return [place, brg, dist];
    }

    /**
     *
     * @param {string} s
     * @returns [wp: WayPoint, trueBearing: number, dist: number]
     */
    async parsePbd(s) {
        const [place, brg, dist] = this.splitPbd(s);
        if (brg > 360 || dist > 999.9) {
            throw NXSystemMessages.entryOutOfRange;
        }
        if (this.isPlaceFormat(place)) {
            const wp = await this.parsePlace(place);
            const magVar = Facilities.getMagVar(wp.infos.coordinates.lat, wp.infos.coordinates.long);
            return [wp, B77HS_Util.magneticToTrue(brg, magVar), dist];
        }
        throw NXSystemMessages.formatError;
    }

    isPdFormat(s) {
        const pd = s.match(/^([^\/]+)\/([0-9]{1,3}(\.[0-9])?)$/);
        return pd !== null && this.isPlaceFormat(pd[1]);
    }

    parsePlaceDist(s) {
        let [place, dist] = s.split('/');
        dist = parseInt(dist);
        // TODO get waypoint in flightplan
        //Aims.WaypointBuilder.fromPlaceAlongFlightPlan(ident: string, placeIndex: number, distance: number, instrument: BaseInstrument, fpm: FlightPlanManager);
        throw NXFictionalMessages.notYetImplemented;
    }

    /**
     * Set the progress page bearing/dist location
     * @param {string} ident ident of the waypoint or runway, will be replaced by "ENTRY" if brg/dist offset are specified
     * @param {LatLongAlt} coordinates co-ordinates of the waypoint/navaid/runway, without brg/dist offset
     * @param {string?} icao icao database id of the waypoint if applicable
     */
    _setProgLocation(ident, coordinates, icao) {
        console.log(`progLocation: ${ident} ${coordinates}`);
        this._progBrgDist = {
            icao,
            ident,
            coordinates,
            bearing: -1,
            distance: -1
        };

        this.updateProgDistance();
    }

    /**
     *
     * @param {string} s value to search for or create a waypoint from
     * @param {boolean} stored if a waypoint is created, should it be a stored waypoint?
     * @returns
     */
    async getOrCreateWaypoint(s, stored = true) {
        if (this.isLatLonFormat(s)) {
            const coordinates = this.parseLatLon(s);
            return this.dataManager.createLatLonWaypoint(coordinates, stored);
        } else if (this.isPbxFormat(s)) {
            const [place1, bearing1, place2, bearing2] = await this.parsePbx(s);
            return this.dataManager.createPlaceBearingPlaceBearingWaypoint(place1, bearing1, place2, bearing2, stored);
        } else if (this.isPdFormat(s)) {
            throw NXFictionalMessages.notYetImplemented;
        } else if (this.isPbdFormat(s)) {
            const [wp, bearing, dist] = await this.parsePbd(s);
            return this.dataManager.createPlaceBearingDistWaypoint(wp, bearing, dist, stored);
        } else if (this.isPlaceFormat(s)) {
            try {
                return await this.parsePlace(s);
            } catch (err) {
                if (err === NXSystemMessages.notInDatabase) {
                    this.setScratchpadMessage(err);
                    return new Promise((resolve, reject) => {
                        CDUNewWaypoint.ShowPage(this, (waypoint) => {
                            if (waypoint) {
                                resolve(waypoint);
                            } else {
                                reject();
                            }
                        }, { ident: s });
                    });
                } else {
                    throw err;
                }
            }
        } else {
            throw NXSystemMessages.formatError;
        }
    }

    /**
     * Try to set the progress page bearing/dist waypoint/location
     * @param {String} s scratchpad entry
     * @param {Function} callback callback taking boolean arg for success/failure
     */
    trySetProgWaypoint(s, callback = EmptyCallback.Boolean) {
        if (s === FMCMainDisplay.clrValue) {
            this._progBrgDist = undefined;
            return callback(true);
        }

        try {
            this.getOrCreateWaypoint(s, false).then((wp) => {
                this._setProgLocation(wp.additionalData.temporary ? "ENTRY" : wp.ident, wp.infos.coordinates, wp.infos.icao);
                return callback(true);
            }).catch((err) => {
                if (err instanceof CduMessage) {
                    this.setScratchpadMessage(err);
                } else if (err) {
                    console.error(err);
                }
                return callback(false);
            });
        } catch (err) {
            if (err instanceof CduMessage) {
                this.setScratchpadMessage(err);
            } else {
                console.error(err);
            }
            return callback(false);
        }
    }

    /**
     * Recalculate the bearing and distance for progress page
     */
    updateProgDistance() {
        if (!this._progBrgDist) {
            return;
        }

        const latitude = ADIRS.getLatitude();
        const longitude = ADIRS.getLongitude();

        if (!latitude.isNormalOperation() || !longitude.isNormalOperation()) {
            this._progBrgDist.distance = -1;
            this._progBrgDist.bearing = -1;
            return;
        }

        const planeLl = new LatLong(latitude.value, longitude.value);
        this._progBrgDist.distance = Avionics.Utils.computeGreatCircleDistance(planeLl, this._progBrgDist.coordinates);
        this._progBrgDist.bearing = B77HS_Util.trueToMagnetic(Avionics.Utils.computeGreatCircleHeading(planeLl, this._progBrgDist.coordinates));
    }

    get progBearing() {
        return this._progBrgDist ? this._progBrgDist.bearing : -1;
    }

    get progDistance() {
        return this._progBrgDist ? this._progBrgDist.distance : -1;
    }

    get progWaypointIdent() {
        return this._progBrgDist ? this._progBrgDist.ident : undefined;
    }

    isWaypointInUse(icao) {
        if (this.flightPlanManager.isWaypointInUse(icao)) {
            return true;
        }
        // TODO check tuned navaids
        if (this._progBrgDist && this._progBrgDist.icao === icao) {
            return true;
        }
        return false;
    }

    setGroundTempFromOrigin() {
        const origin = this.flightPlanManager.getPersistentOrigin(FlightPlans.Active);
        if (!origin) {
            return;
        }

        this.groundTempAuto = B77HS_Util.getIsaTemp(origin.infos.coordinates.alt);
    }

    trySetGroundTemp(scratchpadValue) {
        if (this.flightPhaseManager.phase !== AimsFlightPhases.PREFLIGHT) {
            throw NXSystemMessages.notAllowed;
        }

        if (scratchpadValue === FMCMainDisplay.clrValue) {
            this.groundTempPilot = undefined;
            return;
        }

        if (scratchpadValue.match(/^[+\-]?[0-9]{1,2}$/) === null) {
            throw NXSystemMessages.formatError;
        }

        this.groundTempPilot = parseInt(scratchpadValue);
    }

    get groundTemp() {
        return this.groundTempPilot !== undefined ? this.groundTempPilot : this.groundTempAuto;
    }

    navModeEngaged() {
        const lateralMode = SimVar.GetSimVarValue("L:B77HS_FMA_LATERAL_MODE", "Number");
        switch (lateralMode) {
            case 20: // NAV
            case 30: // LOC*
            case 31: // LOC
            case 32: // LAND
            case 33: // FLARE
            case 34: // ROLL OUT
                return true;
        }
        return false;
    }

    /**
     * Add type 2 message to Aims message queue
     * @param _message {TypeIIMessage} MessageObject
     * @param _isResolvedOverride {function(*)} Function that determines if the error is resolved at this moment (type II only).
     * @param _onClearOverride {function(*)} Function that executes when the error is actively cleared by the pilot (type II only).
     */
    addMessageToQueue(_message, _isResolvedOverride = undefined, _onClearOverride = undefined) {
        if (!_message.isTypeTwo) {
            return;
        }
        const message = _isResolvedOverride === undefined && _onClearOverride === undefined ? _message : _message.getModifiedMessage("", _isResolvedOverride, _onClearOverride);
        this._messageQueue.addMessage(message);
    }

    /**
     * Removes a message from the queue
     * @param value {String}
     */
    removeMessageFromQueue(value) {
        this._messageQueue.removeMessage(value);
    }

    updateMessageQueue() {
        this._messageQueue.updateDisplayedMessage();
    }

    /* END OF CDU GET/SET METHODS */
    /* UNSORTED CODE BELOW */

    //TODO: can this be util?
    static secondsToUTC(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds - h * 3600) / 60);
        return (h % 24).toFixed(0).padStart(2, "0") + m.toFixed(0).padStart(2, "0");
    }
    //TODO: can this be util?
    static secondsTohhmm(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds - h * 3600) / 60);
        return h.toFixed(0).padStart(2, "0") + m.toFixed(0).padStart(2, "0");
    }

    //TODO: can this be util?
    static minuteToSeconds(minutes) {
        return minutes * 60;
    }

    //TODO: can this be util?
    static hhmmToSeconds(hhmm) {
        if (!hhmm) {
            return NaN;
        }
        const h = parseInt(hhmm.substring(0, 2));
        const m = parseInt(hhmm.substring(2, 4));
        return h * 3600 + m * 60;
    }

    /**
     * Computes hour and minutes when given minutes
     * @param {number} minutes - minutes used to make the conversion
     * @returns {string} A string in the format "HHMM" e.g "0235"
     */
    //TODO: can this be util?
    static minutesTohhmm(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes - h * 60;
        return h.toFixed(0).padStart(2,"0") + m.toFixed(0).padStart(2, "0");
    }

    /**
     * computes minutes when given hour and minutes
     * @param {string} hhmm - string used to make the conversion
     * @returns {number} numbers in minutes form
     */
    //TODO: can this be util?
    static hhmmToMinutes(hhmm) {
        if (!hhmm) {
            return NaN;
        }
        const h = parseInt(hhmm.substring(0, 2));
        const m = parseInt(hhmm.substring(2, 4));
        return h * 60 + m;
    }

    //TODO: can this be util?
    getNavDataDateRange() {
        return SimVar.GetGameVarValue("FLIGHT NAVDATA DATE RANGE", "string");
    }
    /**
     * Generic function which returns true if engine(index) is ON (N2 > 20)
     * @returns {boolean}
     */
    isEngineOn(index) {
        return SimVar.GetSimVarValue(`L:B77HS_ENGINE_N2:${index}`, 'number') > 20;
    }
    /**
     * Returns true if any one engine is running (N2 > 20)
     * @returns {boolean}
     */
    //TODO: can this be an util?
    isAnEngineOn() {
        return this.isEngineOn(1) || this.isEngineOn(2);
    }

    /**
     * Returns true only if all engines are running (N2 > 20)
     * @returns {boolean}
     */
    //TODO: can this be an util?
    isAllEngineOn() {
        return this.isEngineOn(1) && this.isEngineOn(2);
    }

    isOnGround() {
        return SimVar.GetSimVarValue("L:B77HS_LGCIU_1_NOSE_GEAR_COMPRESSED", "Number") === 1 || SimVar.GetSimVarValue("L:B77HS_LGCIU_2_NOSE_GEAR_COMPRESSED", "Number") === 1;
    }
    /**
     * Returns the maximum cruise FL for ISA temp and GW
     * @param temp {number} ISA in C°
     * @param gw {number} GW in t
     * @returns {number} MAX FL
     */
    //TODO: can this be an util?
    getMaxFL(temp = B77HS_Util.getIsaTempDeviation(), gw = this.getGW()) {
        return Math.round(temp <= 10 ? -2.778 * gw + 578.667 : (temp * (-0.039) - 2.389) * gw + temp * (-0.667) + 585.334);
    }

    /**
     * Returns the maximum allowed cruise FL considering max service FL
     * @param fl {number} FL to check
     * @returns {number} maximum allowed cruise FL
     */
    //TODO: can this be an util?
    getMaxFlCorrected(fl = this.getMaxFL()) {
        return fl >= this.maxCruiseFL ? this.maxCruiseFL : fl;
    }

    // only used by trySetMinDestFob
    //TODO: Can this be util?
    isMinDestFobInRange(fuel) {
        return 0 <= fuel && fuel <= 80.0;
    }

    //TODO: Can this be util?
    isTaxiFuelInRange(taxi) {
        return 0 <= taxi && taxi <= 9.9;
    }

    //TODO: Can this be util?
    isFinalFuelInRange(fuel) {
        return 0 <= fuel && fuel <= 100;
    }

    //TODO: Can this be util?
    isFinalTimeInRange(time) {
        const convertedTime = FMCMainDisplay.hhmmToMinutes(time.padStart(4,"0"));
        return 0 <= convertedTime && convertedTime <= 90;
    }

    //TODO: Can this be util?
    isRteRsvFuelInRange(fuel) {
        return 0 <= fuel && fuel <= 10.0;
    }

    //TODO: Can this be util?
    isRteRsvPercentInRange(value) {
        return value >= 0 && value <= 15.0;
    }

    //TODO: Can this be util?
    isZFWInRange(zfw) {
        return 35.0 <= zfw && zfw <= 80.0;
    }

    //TODO: Can this be util?
    isZFWCGInRange(zfwcg) {
        return (8.0 <= zfwcg && zfwcg <= 50.0);
    }

    //TODO: Can this be util?
    isBlockFuelInRange(fuel) {
        return 0 <= fuel && fuel <= 80;
    }

    /**
     *
     * @returns {*}
     */
    //TODO: Can this be util?
    getFOB() {
        return (SimVar.GetSimVarValue("FUEL TOTAL QUANTITY WEIGHT", "pound") * 0.4535934) / 1000;
    }

    /**
     * retrieves GW in Tons
     * @returns {number}
     */
    //TODO: Can this be util?
    getGW() {
        let fmGW = 0;
        if (this.isAnEngineOn() && isFinite(this.zeroFuelWeight)) {
            fmGW = (this.getFOB() + this.zeroFuelWeight);
        } else if (isFinite(this.blockFuel) && isFinite(this.zeroFuelWeight)) {
            fmGW = (this.blockFuel + this.zeroFuelWeight);
        } else {
            fmGW = 0;
        }
        SimVar.SetSimVarValue("L:B77HS_FM_GROSS_WEIGHT", "Number", fmGW);
        return fmGW;
    }

    //TODO: Can this be util?
    getCG() {
        return SimVar.GetSimVarValue("CG PERCENT", "Percent over 100") * 100;
    }

    //TODO: make this util or local var?
    isAirspeedManaged() {
        return SimVar.GetSimVarValue("AUTOPILOT SPEED SLOT INDEX", "number") === 2;
    }

    //TODO: make this util or local var?
    isHeadingManaged() {
        return SimVar.GetSimVarValue("AUTOPILOT HEADING SLOT INDEX", "number") === 2;
    }

    //TODO: make this util or local var?
    isAltitudeManaged() {
        return SimVar.GetSimVarValue("AUTOPILOT ALTITUDE SLOT INDEX", "number") === 2;
    }

    /**
     * Check if the given string represents a decimal number.
     * This may be a whole number or a number with one or more decimals.
     * If the leading digit is 0 and one or more decimals are given, the leading digit may be omitted.
     * @param str {string} String to check
     * @returns {bool} True if str represents a decimal value, otherwise false
     */
    //TODO: Can this be util?
    representsDecimalNumber(str) {
        return /^[+-]?\d*(?:\.\d+)?$/.test(str);
    }
}

FMCMainDisplay.clrValue = "\xa0\xa0\xa0\xa0\xa0CLR";
FMCMainDisplay.ovfyValue = "\u0394";
FMCMainDisplay._AvailableKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const FlightPlans = Object.freeze({
    Active: 0,
    Temporary: 1,
});