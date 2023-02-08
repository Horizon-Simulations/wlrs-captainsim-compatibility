// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { Geometry } from '@aims/guidance/Geometry';
import { PseudoWaypoint } from '@aims/guidance/PsuedoWaypoint';
import { PseudoWaypoints } from '@aims/guidance/lnav/PseudoWaypoints';
import { EfisVectors } from '@aims/efis/EfisVectors';
import { Coordinates } from '@aims/flightplanning/data/geo';
import { EfisState } from '@aims/guidance/FmsState';
import { EfisSide, EfisNdMode, rangeSettings } from '@shared/NavigationDisplay';
import { TaskCategory, TaskQueue } from '@aims/guidance/TaskQueue';
import { HMLeg } from '@aims/guidance/lnav/legs/HX';
import { SimVarString } from '@shared/simvar';
import { getFlightPhaseManager } from '@aims/flightphase';
import { AimsFlightPhase } from '@shared/flightphase';
import { LnavDriver } from './lnav/LnavDriver';
import { FlightPlanManager, FlightPlans } from '../flightplanning/FlightPlanManager';
import { GuidanceManager } from './GuidanceManager';
import { VnavDriver } from './vnav/VnavDriver';

// How often the (milliseconds)
const GEOMETRY_RECOMPUTATION_TIMER = 5_000;

export class GuidanceController {
    flightPlanManager: FlightPlanManager;

    guidanceManager: GuidanceManager;

    lnavDriver: LnavDriver;

    vnavDriver: VnavDriver;

    pseudoWaypoints: PseudoWaypoints;

    efisVectors: EfisVectors;

    activeGeometry: Geometry | null;

    temporaryGeometry: Geometry | null;

    activeLegIndex: number;

    temporaryLegIndex: number = -1;

    activeTransIndex: number;

    activeLegDtg: NauticalMiles;

    activeLegCompleteLegPathDtg: NauticalMiles;

    displayActiveLegCompleteLegPathDtg: NauticalMiles;

    focusedWaypointCoordinates: Coordinates = { lat: 0, long: 0 };

    currentPseudoWaypoints: PseudoWaypoint[] = [];

    automaticSequencing: boolean = true;

    leftEfisState: EfisState

    rightEfisState: EfisState

    efisStateForSide: { L: EfisState, R: EfisState }

    private approachMessage: string = ''

    taskQueue = new TaskQueue();

    private listener = RegisterViewListener('JS_LISTENER_SIMVARS', null, true);

    get hasTemporaryFlightPlan() {
        // eslint-disable-next-line no-underscore-dangle
        return this.flightPlanManager._currentFlightPlanIndex === FlightPlans.Temporary;
    }

    private updateEfisState(side: EfisSide, state: EfisState): void {
        const ndMode = SimVar.GetSimVarValue(`L:A32NX_EFIS_${side}_ND_MODE`, 'Enum') as EfisNdMode;
        const ndRange = rangeSettings[SimVar.GetSimVarValue(`L:A32NX_EFIS_${side}_ND_RANGE`, 'Enum')];

        if (state?.mode !== ndMode || state?.range !== ndRange) {
            this.taskQueue.cancelAllInCategory(TaskCategory.EfisVectors);
            this.efisVectors.forceUpdate();
        }

        state.mode = ndMode;
        state.range = ndRange;

        this.updateEfisApproachMessage();
    }

    private lastFocusedWpIndex = -1;

    private updateMrpState() {
        // PLAN mode center

        const focusedWpIndex = SimVar.GetSimVarValue('L:A32NX_SELECTED_WAYPOINT', 'number');
        const focusedWp = this.flightPlanManager.getWaypoint(focusedWpIndex);

        if (this.lastFocusedWpIndex !== focusedWpIndex) {
            this.lastFocusedWpIndex = focusedWpIndex;

            this.efisVectors.forceUpdate();
        }

        if (focusedWp) {
            this.focusedWaypointCoordinates.lat = focusedWp.infos.coordinates.lat;
            this.focusedWaypointCoordinates.long = focusedWp.infos.coordinates.long;

            SimVar.SetSimVarValue('L:A32NX_SELECTED_WAYPOINT_LAT', 'Degrees', this.focusedWaypointCoordinates.lat);
            SimVar.SetSimVarValue('L:A32NX_SELECTED_WAYPOINT_LONG', 'Degrees', this.focusedWaypointCoordinates.long);
        }
    }

    private updateMapPartlyDisplayed() {
        if (this.efisStateForSide.L.dataLimitReached || this.efisStateForSide.L.legsCulled) {
            SimVar.SetSimVarValue('L:A32NX_EFIS_L_MAP_PARTLY_DISPLAYED', 'boolean', true);
        } else {
            SimVar.SetSimVarValue('L:A32NX_EFIS_L_MAP_PARTLY_DISPLAYED', 'boolean', false);
        }

        if (this.efisStateForSide.R.dataLimitReached || this.efisStateForSide.R.legsCulled) {
            SimVar.SetSimVarValue('L:A32NX_EFIS_R_MAP_PARTLY_DISPLAYED', 'boolean', true);
        } else {
            SimVar.SetSimVarValue('L:A32NX_EFIS_R_MAP_PARTLY_DISPLAYED', 'boolean', false);
        }
    }

    private updateEfisIdent() {
        // Update EFIS ident

        const efisIdent = this.activeGeometry.legs.get(this.activeLegIndex)?.ident ?? 'PPOS';

        const efisVars = SimVarString.pack(efisIdent, 9);
        // setting the simvar as a number greater than about 16 million causes precision error > 1... but this works..
        SimVar.SetSimVarValue('L:A32NX_EFIS_L_TO_WPT_IDENT_0', 'string', efisVars[0].toString());
        SimVar.SetSimVarValue('L:A32NX_EFIS_L_TO_WPT_IDENT_1', 'string', efisVars[1].toString());
        SimVar.SetSimVarValue('L:A32NX_EFIS_R_TO_WPT_IDENT_0', 'string', efisVars[0].toString());
        SimVar.SetSimVarValue('L:A32NX_EFIS_R_TO_WPT_IDENT_1', 'string', efisVars[1].toString());
    }

    private updateEfisApproachMessage() {
        let apprMsg = '';
        const appr = this.flightPlanManager.getApproach(FlightPlans.Active);
        if (appr && appr.approachType !== ApproachType.APPROACH_TYPE_UNKNOWN) {
            const phase = getFlightPhaseManager().phase;
            if (phase > AimsFlightPhase.Cruise || (phase === AimsFlightPhase.Cruise && this.flightPlanManager.getDistanceToDestination(FlightPlans.Active) < 250)) {
                apprMsg = appr.name;
            }
        }

        if (apprMsg !== this.approachMessage) {
            this.approachMessage = apprMsg;
            const apprMsgVars = SimVarString.pack(apprMsg, 9);
            // setting the simvar as a number greater than about 16 million causes precision error > 1... but this works..
            SimVar.SetSimVarValue('L:A32NX_EFIS_L_APPR_MSG_0', 'string', apprMsgVars[0].toString());
            SimVar.SetSimVarValue('L:A32NX_EFIS_L_APPR_MSG_1', 'string', apprMsgVars[1].toString());
            SimVar.SetSimVarValue('L:A32NX_EFIS_R_APPR_MSG_0', 'string', apprMsgVars[0].toString());
            SimVar.SetSimVarValue('L:A32NX_EFIS_R_APPR_MSG_1', 'string', apprMsgVars[1].toString());
        }
    }

    constructor(flightPlanManager: FlightPlanManager, guidanceManager: GuidanceManager) {
        this.flightPlanManager = flightPlanManager;
        this.guidanceManager = guidanceManager;

        this.lnavDriver = new LnavDriver(this);
        this.vnavDriver = new VnavDriver(this);
        this.pseudoWaypoints = new PseudoWaypoints(this);
        this.efisVectors = new EfisVectors(this);
    }

    init() {
        console.log('[aims/Guidance] GuidanceController initialized!');

        this.lnavDriver.ppos.lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
        this.lnavDriver.ppos.long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');

        this.activeLegIndex = this.flightPlanManager.getActiveWaypointIndex(false, false, FlightPlans.Active);

        this.updateGeometries();

        this.leftEfisState = { mode: EfisNdMode.ARC, range: 10, dataLimitReached: false, legsCulled: false };
        this.rightEfisState = { mode: EfisNdMode.ARC, range: 10, dataLimitReached: false, legsCulled: false };
        this.efisStateForSide = {
            L: this.leftEfisState,
            R: this.rightEfisState,
        };

        this.updateEfisState('L', this.leftEfisState);
        this.updateEfisState('R', this.rightEfisState);

        this.efisStateForSide.L = this.leftEfisState;
        this.efisStateForSide.R = this.leftEfisState;

        this.lnavDriver.init();
        this.vnavDriver.init();
        this.pseudoWaypoints.init();

        Coherent.on('A32NX_IMM_EXIT', (fpIndex, immExit) => {
            const leg = this.activeGeometry.legs.get(fpIndex);
            const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', 'Knots');
            if (leg instanceof HMLeg) {
                leg.setImmediateExit(immExit, this.lnavDriver.ppos, tas);
                this.flightPlanManager.updateFlightPlanVersion();
                this.automaticSequencing = true;
            }
        }, undefined);
    }

    private lastFlightPlanVersion = SimVar.GetSimVarValue(FlightPlanManager.FlightPlanVersionKey, 'number');

    private geometryRecomputationTimer = GEOMETRY_RECOMPUTATION_TIMER + 1;

    update(deltaTime: number) {
        this.geometryRecomputationTimer += deltaTime;

        this.activeLegIndex = this.flightPlanManager.getActiveWaypointIndex(false, false, FlightPlans.Active);
        this.temporaryLegIndex = this.flightPlanManager.getActiveWaypointIndex(false, false, FlightPlans.Temporary);

        this.updateEfisState('L', this.leftEfisState);
        this.updateEfisState('R', this.rightEfisState);

        // Generate new geometry when flight plan changes
        // TODO also need to do it when FMS perf params change, e.g. speed limit/alt, climb/crz/des speeds
        const newFlightPlanVersion = this.flightPlanManager.currentFlightPlanVersion;
        if (newFlightPlanVersion !== this.lastFlightPlanVersion) {
            this.lastFlightPlanVersion = newFlightPlanVersion;

            try {
                this.updateGeometries();
                this.geometryRecomputationTimer = GEOMETRY_RECOMPUTATION_TIMER + 1;
            } catch (e) {
                console.error('[FMS] Error during update of geometry. See exception below.');
                console.error(e);
            }
        }

        if (this.geometryRecomputationTimer > GEOMETRY_RECOMPUTATION_TIMER) {
            this.geometryRecomputationTimer = 0;

            try {
                this.recomputeGeometries();

                if (this.activeGeometry) {
                    this.vnavDriver.acceptMultipleLegGeometry(this.activeGeometry);
                    this.pseudoWaypoints.acceptMultipleLegGeometry(this.activeGeometry);
                }
            } catch (e) {
                console.error('[FMS] Error during geometry recomputation. See exception below.');
                console.error(e);
            }
        }

        try {
            this.updateMrpState();
        } catch (e) {
            console.error('[FMS] Error during map state computation. See exception below.');
            console.error(e);
        }

        try {
            this.updateMapPartlyDisplayed();
        } catch (e) {
            console.error('[FMS] Error during map partly displayed computation. See exception below.');
            console.error(e);
        }

        try {
            this.lnavDriver.update(deltaTime);
        } catch (e) {
            console.error('[FMS] Error during LNAV driver update. See exception below.');
            console.error(e);
        }

        try {
            this.vnavDriver.update(deltaTime);
        } catch (e) {
            console.error('[FMS] Error during VNAV driver update. See exception below.');
            console.error(e);
        }

        try {
            this.pseudoWaypoints.update(deltaTime);
        } catch (e) {
            console.error('[FMS] Error during pseudo waypoints update. See exception below.');
            console.error(e);
        }

        try {
            this.efisVectors.update(deltaTime);
        } catch (e) {
            console.error('[FMS] Error during EFIS vectors update. See exception below.');
            console.error(e);
        }

        try {
            this.taskQueue.update(deltaTime);
        } catch (e) {
            console.error('[FMS] Error during task queue update. See exception below.');
            console.error(e);
        }
    }

    /**
     * Called when the lateral flight plan is changed
     */
    updateGeometries() {
        this.updateActiveGeometry();

        if (this.flightPlanManager.getFlightPlan(FlightPlans.Temporary)) {
            this.updateTemporaryGeometry();
        } else {
            this.temporaryGeometry = undefined;
        }

        this.recomputeGeometries();

        this.updateEfisIdent();

        this.geometryRecomputationTimer = 0;
        this.vnavDriver.acceptMultipleLegGeometry(this.activeGeometry);
        this.pseudoWaypoints.acceptMultipleLegGeometry(this.activeGeometry);
    }

    private updateActiveGeometry() {
        const wptCount = this.flightPlanManager.getWaypointsCount(FlightPlans.Active);
        const activeIdx = this.flightPlanManager.getActiveWaypointIndex(false, false, FlightPlans.Active);

        if (this.activeGeometry) {
            this.guidanceManager.updateGeometry(this.activeGeometry, FlightPlans.Active, activeIdx, wptCount);
        } else {
            this.activeGeometry = this.guidanceManager.getMultipleLegGeometry();
        }
    }

    private updateTemporaryGeometry() {
        const wptCount = this.flightPlanManager.getWaypointsCount(FlightPlans.Temporary);
        const activeIdx = this.flightPlanManager.getActiveWaypointIndex(false, false, FlightPlans.Temporary);

        if (this.temporaryGeometry) {
            this.guidanceManager.updateGeometry(this.temporaryGeometry, FlightPlans.Temporary, activeIdx, wptCount);
        } else {
            this.temporaryGeometry = this.guidanceManager.getMultipleLegGeometry(true);
        }
    }

    recomputeGeometries() {
        const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', 'Knots');
        const gs = SimVar.GetSimVarValue('GPS GROUND SPEED', 'Knots');
        const trueTrack = SimVar.GetSimVarValue('GPS GROUND TRUE TRACK', 'degree');

        if (this.activeGeometry) {
            this.activeGeometry.recomputeWithParameters(
                tas,
                gs,
                this.lnavDriver.ppos,
                trueTrack,
                this.activeLegIndex,
                this.activeTransIndex,
            );
        }

        if (this.temporaryGeometry) {
            this.temporaryGeometry.recomputeWithParameters(
                tas,
                gs,
                this.lnavDriver.ppos,
                trueTrack,
                this.temporaryLegIndex,
                this.temporaryLegIndex - 1,
            );
        }
    }

    /**
     * Notifies the FMS that a pseudo waypoint must be sequenced.
     *
     * This is to be sued by {@link LnavDriver} only.
     *
     * @param pseudoWaypoint the {@link PseudoWaypoint} to sequence.
     */
    sequencePseudoWaypoint(pseudoWaypoint: PseudoWaypoint): void {
        this.pseudoWaypoints.sequencePseudoWaypoint(pseudoWaypoint);
    }

    isManualHoldActive(): boolean {
        if (this.activeGeometry) {
            const activeLeg = this.activeGeometry.legs.get(this.activeLegIndex);
            return activeLeg instanceof HMLeg;
        }
        return false;
    }

    isManualHoldNext(): boolean {
        if (this.activeGeometry) {
            const nextLeg = this.activeGeometry.legs.get(this.activeLegIndex + 1);
            return nextLeg instanceof HMLeg;
        }
        return false;
    }

    setHoldSpeed(tas: Knots) {
        let holdLeg: HMLeg;
        if (this.isManualHoldActive()) {
            holdLeg = this.activeGeometry.legs.get(this.activeLegIndex) as unknown as HMLeg;
        } else if (this.isManualHoldNext()) {
            holdLeg = this.activeGeometry.legs.get(this.activeLegIndex + 1) as unknown as HMLeg;
        }

        if (holdLeg) {
            holdLeg.setPredictedTas(tas);
        }
    }
}
