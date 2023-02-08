// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { HALeg, HFLeg, HMLeg } from '@aims/guidance/lnav/legs/HX';
import { PILeg } from '@aims/guidance/lnav/legs/PI';
import { RFLeg } from '@aims/guidance/lnav/legs/RF';
import { TFLeg } from '@aims/guidance/lnav/legs/TF';
import { VMLeg } from '@aims/guidance/lnav/legs/VM';
import { Transition } from '@aims/guidance/lnav/Transition';
import { SegmentType } from '@aims/wtsdk';
import { Leg } from '@aims/guidance/lnav/legs/Leg';
import { CALeg } from '@aims/guidance/lnav/legs/CA';
import { LegType } from '@aims/types/fstypes/FSEnums';
import { TransitionPicker } from '@aims/guidance/lnav/TransitionPicker';
import { IFLeg } from '@aims/guidance/lnav/legs/IF';
import { DFLeg } from '@aims/guidance/lnav/legs/DF';
import { LnavConfig } from '@aims/guidance/LnavConfig';
import { CFLeg } from '@aims/guidance/lnav/legs/CF';
import { CRLeg } from '@aims/guidance/lnav/legs/CR';
import { CILeg } from '@aims/guidance/lnav/legs/CI';
import { XFLeg } from '@aims/guidance/lnav/legs/XF';
import { AFLeg } from '@aims/guidance/lnav/legs/AF';
import { legMetadataFromMsfsWaypoint } from '@aims/guidance/lnav/legs';
import { FlightPlanManager, FlightPlans } from '../flightplanning/FlightPlanManager';
import { Geometry } from './Geometry';

/**
 * This class will guide the aircraft by predicting a flight path and
 * calculating the autopilot inputs to follow the predicted flight path.
 */
export class GuidanceManager {
    flightPlanManager: FlightPlanManager;

    constructor(flightPlanManager: FlightPlanManager) {
        this.flightPlanManager = flightPlanManager;
    }

    /**
     * Returns a {@link Leg} from two {@link WayPoint} objects. Only for fpm v1.
     *
     * @param from      the FROM waypoint
     * @param to        the TO waypoint
     * @param toIndex   index of the TO waypoint
     * @param segment   flight plan segment
     *
     * @private
     */
    private static legFromWaypoints(
        prevLeg: Leg | undefined,
        nextLeg: Leg | undefined,
        from: WayPoint,
        to: WayPoint,
        toIndex: number,
        segment: SegmentType,
    ): Leg {
        if (to?.additionalData?.legType === LegType.IF) {
            const editableData = legMetadataFromMsfsWaypoint(to);

            if (prevLeg && prevLeg instanceof XFLeg && !prevLeg.fix.endsInDiscontinuity) {
                return new TFLeg(prevLeg.fix, to, editableData, segment);
            }

            return new IFLeg(to, editableData, segment);
        }

        if (!from || !to) {
            return null;
        }

        const metadata = legMetadataFromMsfsWaypoint(to);

        if (from.endsInDiscontinuity) {
            if (to?.additionalData.legType === LegType.CF || to?.additionalData.legType === LegType.TF) {
                return new IFLeg(to, metadata, segment);
            }

            return null;
        }

        if (to.additionalData) {
            if (to.additionalData.legType === LegType.AF) {
                return new AFLeg(to, to.additionalData.recommendedLocation, to.additionalData.rho, to.additionalData.thetaTrue, to.additionalData.course, metadata, segment);
            }

            if (to.additionalData.legType === LegType.CF) {
                return new CFLeg(to, to.additionalData.course, metadata, segment);
            }

            if (to.additionalData.legType === LegType.DF) {
                return new DFLeg(to, metadata, segment);
            }

            if (to.additionalData.legType === LegType.RF) {
                return new RFLeg(from, to, to.additionalData.center, metadata, segment);
            }

            // FIXME VALeg should be implemented to give proper heading guidance
            if (to.additionalData.legType === LegType.CA || to.additionalData.legType === LegType.VA) {
                const course = to.additionalData.course;
                const altitude = to.additionalData.vectorsAltitude;
                const extraLength = (from.additionalData.runwayLength ?? 0) / (2 * 1852);

                return new CALeg(course, altitude, metadata, segment, extraLength);
            }

            if (to.additionalData.legType === LegType.CI || to.additionalData.legType === LegType.VI) {
                if (!nextLeg) {
                    return null;
                }

                const course = to.additionalData.course;

                return new CILeg(course, nextLeg, metadata, segment);
            }

            if (to.additionalData.legType === LegType.CR) {
                // TODO clean this whole thing up
                const course = to.additionalData.course;
                const radial = to.additionalData.thetaTrue;
                const theta = to.additionalData.theta;
                const ident = WayPoint.formatIdentFromIcao(to.additionalData.recommendedIcao);

                const originObj = { coordinates: to.additionalData.recommendedLocation, ident, theta };

                return new CRLeg(course, originObj, radial, metadata, segment);
            }

            if (to.additionalData?.legType === LegType.HA) {
                return new HALeg(to, metadata, segment);
            }

            if (to.additionalData?.legType === LegType.HF) {
                return new HFLeg(to, metadata, segment);
            }

            if (to.additionalData?.legType === LegType.HM) {
                return new HMLeg(to, metadata, segment);
            }

            if (to.additionalData.legType === LegType.PI) {
                return new PILeg(to, nextLeg as CFLeg, metadata, segment);
            }
        }

        if (to.isVectors) {
            return new VMLeg(to.additionalData.course, metadata, segment);
        }

        return new TFLeg(from, to, metadata, segment);
    }

    getLeg(prevLeg: Leg | null, nextLeg: Leg | null, index: number, flightPlanIndex): Leg | null {
        const from = this.flightPlanManager.getWaypoint(index - 1, flightPlanIndex);
        const to = this.flightPlanManager.getWaypoint(index, flightPlanIndex);
        const segment = this.flightPlanManager.getSegmentFromWaypoint(to, flightPlanIndex).type;

        return GuidanceManager.legFromWaypoints(prevLeg, nextLeg, from, to, index, segment);
    }

    updateGeometry(geometry: Geometry, flightPlanIndex: FlightPlans, activeIdx: number, wptCount: number): void {
        if (LnavConfig.DEBUG_GEOMETRY) {
            console.log('[Fms/Geometry/Update] Starting geometry update.');
        }

        for (let i = activeIdx - 1; i < wptCount; i++) {
            const prevLeg = geometry.legs.get(i - 1);
            const oldLeg = geometry.legs.get(i);
            const nextLeg = this.getLeg(prevLeg, null, i + 1, flightPlanIndex);
            const newLeg = this.getLeg(prevLeg, nextLeg, i, flightPlanIndex);

            if (LnavConfig.DEBUG_GEOMETRY) {
                console.log(`[FMS/Geometry/Update] Old leg #${i} = ${oldLeg?.repr ?? '<none>'}`);
                console.log(`[FMS/Geometry/Update] New leg #${i} = ${newLeg?.repr ?? '<none>'}`);
            }

            const legsMatch = oldLeg?.repr === newLeg?.repr;

            if (legsMatch) {
                if (LnavConfig.DEBUG_GEOMETRY) {
                    console.log('[FMS/Geometry/Update] Old and new leg are the same. Keeping old leg.');
                }

                // Sync discontinuity info (FIXME until we have proper discontinuities)

                if (oldLeg instanceof XFLeg && newLeg instanceof XFLeg) {
                    oldLeg.fix = newLeg.fix;
                }

                // Sync metadata

                if (oldLeg && newLeg) {
                    oldLeg.metadata = { ...oldLeg.metadata, ...newLeg.metadata };
                }

                const prevLeg = geometry.legs.get(i - 1);

                const oldInboundTransition = geometry.transitions.get(i - 1);
                const newInboundTransition = TransitionPicker.forLegs(prevLeg, newLeg);

                const transitionsMatch = oldInboundTransition?.repr === newInboundTransition?.repr;

                if (!transitionsMatch) {
                    geometry.transitions.set(i - 1, newInboundTransition);
                }
            } else {
                if (LnavConfig.DEBUG_GEOMETRY) {
                    if (!oldLeg) console.log('[FMS/Geometry/Update] No old leg. Adding new leg.');
                    else if (!newLeg) console.log('[FMS/Geometry/Update] No new leg. Removing old leg.');
                    else console.log('[FMS/Geometry/Update] Old and new leg are different. Keeping new leg.');
                }

                if (newLeg) {
                    geometry.legs.set(i, newLeg);

                    const prevLeg = geometry.legs.get(i - 1);

                    const computeAllTransitions = LnavConfig.NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE === -1;

                    if (prevLeg && (computeAllTransitions || (i - activeIdx) <= LnavConfig.NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE)) {
                        const newInboundTransition = TransitionPicker.forLegs(prevLeg, newLeg);

                        if (LnavConfig.DEBUG_GEOMETRY) {
                            console.log(`[FMS/Geometry/Update] Set new inbound transition for new leg (${newInboundTransition?.repr ?? '<none>'})`);
                        }

                        if (newInboundTransition) {
                            geometry.transitions.set(i - 1, newInboundTransition);
                        } else {
                            geometry.transitions.delete(i - 1);
                        }
                    } else {
                        geometry.transitions.delete(i - 1);
                    }
                } else {
                    geometry.legs.delete(i);
                    geometry.transitions.delete(i - 1);
                    geometry.transitions.delete(i);
                }
            }
        }

        // Trim geometry

        for (const [index] of geometry.legs.entries()) {
            const legBeforePrev = index < activeIdx - 1;
            const legAfterLastWpt = index >= wptCount;

            if (legBeforePrev || legAfterLastWpt) {
                if (LnavConfig.DEBUG_GEOMETRY) {
                    console.log(`[FMS/Geometry/Update] Removed leg #${index} (${geometry.legs.get(index)?.repr ?? '<unknown>'}) because of trimming.`);
                }

                geometry.legs.delete(index);
                geometry.transitions.delete(index - 1);
            }
        }

        if (LnavConfig.DEBUG_GEOMETRY) {
            console.log('[Fms/Geometry/Update] Done with geometry update.');
        }
    }

    /**
     * The full leg path geometry, used for the ND and predictions on the F-PLN page.
     */
    getMultipleLegGeometry(temp? : boolean): Geometry | null {
        if (temp) {
            if (this.flightPlanManager.getFlightPlan(1) === undefined) {
                return undefined;
            }
        }

        const activeIdx = temp
            ? this.flightPlanManager.getFlightPlan(1).activeWaypointIndex
            : this.flightPlanManager.getCurrentFlightPlan().activeWaypointIndex;
        const legs = new Map<number, Leg>();
        const transitions = new Map<number, Transition>();

        const wpCount = temp
            ? this.flightPlanManager.getFlightPlan(1).length
            : this.flightPlanManager.getCurrentFlightPlan().length;

        for (let i = activeIdx - 1; i < wpCount; i++) {
            // Leg
            const prevLeg = legs.get(i - 1);
            const nextLeg = this.getLeg(prevLeg, null, i + 1, temp ? FlightPlans.Temporary : FlightPlans.Active);
            const currentLeg = this.getLeg(prevLeg, nextLeg, i, temp ? FlightPlans.Temporary : FlightPlans.Active);

            if (currentLeg) {
                legs.set(i, currentLeg);
            }

            // Transition
            const transition = TransitionPicker.forLegs(prevLeg, currentLeg);

            if (transition) {
                transitions.set(i - 1, transition);
            }
        }

        return new Geometry(transitions, legs, temp);
    }
}
