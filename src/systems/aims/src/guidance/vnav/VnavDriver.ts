//  Copyright (c) 2021 FlyByWire Simulations
//  SPDX-License-Identifier: GPL-3.0

import { TheoreticalDescentPathCharacteristics } from '@aims/guidance/vnav/descent/TheoreticalDescentPath';
import { DecelPathBuilder, DecelPathCharacteristics } from '@aims/guidance/vnav/descent/DecelPathBuilder';
import { DescentBuilder } from '@aims/guidance/vnav/descent/DescentBuilder';
import { VnavConfig } from '@aims/guidance/vnav/VnavConfig';
import { GuidanceController } from '@aims/guidance/GuidanceController';
import { RequestedVerticalMode, TargetAltitude, TargetVerticalSpeed } from '@aims/guidance/ControlLaws';
import { AtmosphericConditions } from '@aims/guidance/vnav/AtmosphericConditions';
import { VerticalMode } from '@shared/autopilot';
import { CoarsePredictions } from '@aims/guidance/vnav/CoarsePredictions';
import { FlightPlans } from '@aims/flightplanning/FlightPlanManager';
import { Geometry } from '../Geometry';
import { GuidanceComponent } from '../GuidanceComponent';
import { ClimbPathBuilder } from './climb/ClimbPathBuilder';
import { ClimbProfileBuilderResult } from './climb/ClimbProfileBuilderResult';

export class VnavDriver implements GuidanceComponent {
    atmosphericConditions: AtmosphericConditions = new AtmosphericConditions();

    currentClimbProfile: ClimbProfileBuilderResult;

    currentDescentProfile: TheoreticalDescentPathCharacteristics

    currentApproachProfile?: DecelPathCharacteristics;

    private guidanceMode: RequestedVerticalMode;

    private targetVerticalSpeed: TargetVerticalSpeed;

    private targetAltitude: TargetAltitude;

    // eslint-disable-next-line camelcase
    private coarsePredictionsUpdate = new B77HS_Util.UpdateThrottler(5000);

    constructor(
        private readonly guidanceController: GuidanceController,
    ) {
    }

    init(): void {
        console.log('[aims/Guidance] VnavDriver initialized!');
    }

    acceptMultipleLegGeometry(geometry: Geometry) {
        this.computeVerticalProfile(geometry);
    }

    lastCruiseAltitude: Feet = 0;

    update(deltaTime: number): void {
        this.atmosphericConditions.update();

        if (this.coarsePredictionsUpdate.canUpdate(deltaTime) !== -1) {
            CoarsePredictions.updatePredictions(this.guidanceController, this.atmosphericConditions);
        }

        const newCruiseAltitude = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number');
        if (newCruiseAltitude !== this.lastCruiseAltitude) {
            this.lastCruiseAltitude = newCruiseAltitude;

            if (DEBUG) {
                console.log('[FMS/VNAV] Computed new vertical profile because of new cruise altitude.');
            }

            this.computeVerticalProfile(this.guidanceController.activeGeometry);
        }

        this.updateGuidance();
    }

    private computeVerticalProfile(geometry: Geometry) {
        if (geometry.legs.size > 0) {
            if (VnavConfig.VNAV_CALCULATE_CLIMB_PROFILE) {
                this.currentClimbProfile = ClimbPathBuilder.computeClimbPath(geometry);
            }
            if (this.guidanceController.flightPlanManager.getApproach(FlightPlans.Active)) {
                this.currentApproachProfile = DecelPathBuilder.computeDecelPath(geometry);
            } else {
                this.currentApproachProfile = null;
            }
            this.currentDescentProfile = DescentBuilder.computeDescentPath(geometry, this.currentApproachProfile);

            this.guidanceController.pseudoWaypoints.acceptVerticalProfile();
        } else if (DEBUG) {
            console.warn('[FMS/VNAV] Did not compute vertical profile. Reason: no legs in flight plan.');
        }
    }

    private updateGuidance(): void {
        let newGuidanceMode = RequestedVerticalMode.None;
        let newVerticalSpeed = 0;
        let newAltitude = 0;

        if (this.guidanceController.isManualHoldActive()) {
            const fcuVerticalMode = SimVar.GetSimVarValue('L:B77HS_FMA_VERTICAL_MODE', 'Enum');
            if (fcuVerticalMode === VerticalMode.DES) {
                const holdSpeed = SimVar.GetSimVarValue('L:B77HS_FM_HOLD_SPEED', 'number');
                const atHoldSpeed = this.atmosphericConditions.currentAirspeed <= (holdSpeed + 5);
                if (atHoldSpeed) {
                    newGuidanceMode = RequestedVerticalMode.VsSpeed;
                    newVerticalSpeed = -1000;
                    newAltitude = 0;
                }
            }
        }

        if (this.guidanceController.isManualHoldActive() || this.guidanceController.isManualHoldNext()) {
            let holdSpeedCas = SimVar.GetSimVarValue('L:B77HS_FM_HOLD_SPEED', 'number');
            const holdDecelReached = SimVar.GetSimVarValue('L:B77HS_FM_HOLD_DECEL', 'bool');

            const speedControlManual = Simplane.getAutoPilotAirspeedSelected();
            const isMach = Simplane.getAutoPilotMachModeActive();
            if (speedControlManual && holdDecelReached) {
                if (isMach) {
                    const holdValue = Simplane.getAutoPilotMachHoldValue();
                    holdSpeedCas = this.atmosphericConditions.computeCasFromMach(this.atmosphericConditions.currentAltitude, holdValue);
                } else {
                    holdSpeedCas = Simplane.getAutoPilotAirspeedHoldValue();
                }
            }

            const holdSpeedTas = this.atmosphericConditions.computeTasFromCas(this.atmosphericConditions.currentAltitude, holdSpeedCas);

            this.guidanceController.setHoldSpeed(holdSpeedTas);
        }

        if (newGuidanceMode !== this.guidanceMode) {
            this.guidanceMode = newGuidanceMode;
            SimVar.SetSimVarValue('L:B77HS_FG_REQUESTED_VERTICAL_MODE', 'number', this.guidanceMode);
        }
        if (newVerticalSpeed !== this.targetVerticalSpeed) {
            this.targetVerticalSpeed = newVerticalSpeed;
            SimVar.SetSimVarValue('L:B77HS_FG_TARGET_VERTICAL_SPEED', 'number', this.targetVerticalSpeed);
        }
        if (newAltitude !== this.targetAltitude) {
            this.targetAltitude = newAltitude;
            SimVar.SetSimVarValue('L:B77HS_FG_TARGET_ALTITUDE', 'number', this.targetAltitude);
        }
    }
}
