// Copyright (c) 2022 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { GuidanceController } from '@aims/guidance/GuidanceController';
import { FlightPlans } from '@aims/flightplanning/FlightPlanManager';
import { AtmosphericConditions } from '@aims/guidance/vnav/AtmosphericConditions';
import { LnavConfig } from '@aims/guidance/LnavConfig';

/**
 * This class exists to provide very coarse predictions for
 * LNAV turn prediction while we await the full VNAV experience
 */
export class CoarsePredictions {
    static updatePredictions(guidanceController: GuidanceController, atmosphere: AtmosphericConditions) {
        const flightPlanManager = guidanceController.flightPlanManager;

        for (let i = 0; i < flightPlanManager.getWaypointsCount(FlightPlans.Active); i++) {
            const wp = flightPlanManager.getWaypoint(i, FlightPlans.Active, true);
            const leg = guidanceController.activeGeometry.legs.get(i);
            if (!wp || !leg) {
                continue;
            }

            if (LnavConfig.DEBUG_USE_SPEED_LVARS) {
                leg.predictedTas = SimVar.GetSimVarValue('L:B77HS_DEBUG_FM_TAS', 'knots');
                leg.predictedGs = SimVar.GetSimVarValue('L:B77HS_DEBUG_FM_GS', 'knots');
                continue;
            }

            const alt = wp.additionalData.predictedAltitude;
            const cas = wp.additionalData.predictedSpeed;
            let tas = atmosphere.computeTasFromCas(alt, cas);
            let gs = tas;

            // predicted with live data for active and next two legs
            if (i >= guidanceController.activeLegIndex && i < (guidanceController.activeLegIndex + 3)) {
                tas = atmosphere.currentTrueAirspeed;
                gs = tas + atmosphere.currentWindSpeed;
            }

            leg.predictedTas = Number.isFinite(tas) ? tas : undefined;
            leg.predictedGs = Number.isFinite(gs) ? gs : tas;
        }
    }
}
