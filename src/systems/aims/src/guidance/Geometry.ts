// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { Transition } from '@aims/guidance/lnav/Transition';
import { FixedRadiusTransition } from '@aims/guidance/lnav/transitions/FixedRadiusTransition';
import { Coordinates } from '@aims/flightplanning/data/geo';
import { SegmentType } from '@aims/flightplanning/FlightPlanSegment';
import { Leg } from '@aims/guidance/lnav/legs/Leg';
import { Guidable } from '@aims/guidance/Guidable';
import { LnavConfig } from '@aims/guidance/LnavConfig';
import { CourseCaptureTransition } from '@aims/guidance/lnav/transitions/CourseCaptureTransition';
import { DirectToFixTransitionGuidanceState, DirectToFixTransition } from '@aims/guidance/lnav/transitions/DirectToFixTransition';
import { PathVector } from '@aims/guidance/lnav/PathVector';
import { CALeg } from '@aims/guidance/lnav/legs/CA';
import { isCourseReversalLeg, isHold } from '@aims/guidance/lnav/legs';
import { maxBank } from '@aims/guidance/lnav/CommonGeometry';
import { CILeg } from '@aims/guidance/lnav/legs/CI';
import { CRLeg } from '@aims/guidance/lnav/legs/CR';
import { VMLeg } from '@aims/guidance/lnav/legs/VM';
import { TransitionPicker } from '@aims/guidance/lnav/TransitionPicker';
import { ControlLaw, CompletedGuidanceParameters, LateralPathGuidance } from './ControlLaws';

function isGuidableCapturingPath(guidable: Guidable): boolean {
    return !(
        guidable instanceof CALeg
        || guidable instanceof CILeg
        || guidable instanceof CRLeg
        || guidable instanceof VMLeg
        || guidable instanceof CourseCaptureTransition
    );
}

export class Geometry {
    /**
     * The list of transitions between legs.
     * - entry n: transition after leg n
     */
    transitions: Map<number, Transition>;

    /**
     * The list of legs in this geometry, possibly connected through transitions:
     * - entry n: nth leg, before transition n
     */
    legs: Map<number, Leg>;

    public version = 0;

    private listener = RegisterViewListener('JS_LISTENER_SIMVARS', null, true);

    constructor(transitions: Map<number, Transition>, legs: Map<number, Leg>, private temp: boolean) {
        this.transitions = transitions;
        this.legs = legs;
    }

    public isComputed = false;

    private cachedVectors = [];

    public cachedVectorsVersion = 0;

    public getAllPathVectors(activeLegIndex?: number): PathVector[] {
        if (this.version === this.cachedVectorsVersion) {
            return this.cachedVectors;
        }

        const transmitHoldEntry = !this.temp;

        const ret = [];

        for (const [index, leg] of this.legs.entries()) {
            if (leg.isNull) {
                continue;
            }

            // TODO don't transmit any course reversals when this side range >= 160
            const transmitCourseReversal = LnavConfig.DEBUG_FORCE_INCLUDE_COURSE_REVERSAL_VECTORS || index === activeLegIndex || index === (activeLegIndex + 1);
            if (activeLegIndex !== undefined) {
                if (isCourseReversalLeg(leg) && !transmitCourseReversal) {
                    continue;
                }
                if (index < activeLegIndex) {
                    continue;
                }
            }
            const legInboundTransition = leg.inboundGuidable instanceof Transition ? leg.inboundGuidable : null;

            if (legInboundTransition && !legInboundTransition.isNull && (!isHold(leg) || transmitHoldEntry)) {
                ret.push(...legInboundTransition.predictedPath);
            }

            if (leg) {
                ret.push(...leg.predictedPath);
            }
        }

        this.cachedVectors = ret;
        this.cachedVectorsVersion = this.version;

        return ret;
    }

    /**
     * Recomputes the guidable using new parameters
     *
     * @param tas             predicted true airspeed speed of the current leg (for a leg) or the next leg (for a transition) in knots
     * @param gs              predicted ground speed of the current leg
     * @param ppos            present position coordinates
     * @param trueTrack       present true track
     * @param activeLegIdx    current active leg index
     * @param activeTransIdx  current active transition index
     */
    recomputeWithParameters(tas: Knots, gs: Knots, ppos: Coordinates, trueTrack: DegreesTrue, activeLegIdx: number, _activeTransIdx: number) {
        this.version++;

        if (LnavConfig.DEBUG_GEOMETRY) {
            console.log(`[FMS/Geometry] Recomputing geometry with current_tas: ${tas}kts`);
            console.time('geometry_recompute');
        }

        for (let i = activeLegIdx ?? 0; this.legs.get(i) || this.legs.get(i + 1); i++) {
            if (!this.legs.has(i)) {
                continue;
            }

            const leg = this.legs.get(i);
            const wasNull = leg.isNull;

            this.computeLeg(i, activeLegIdx, ppos, trueTrack, tas, gs);

            // If a leg became null/not null, we immediately recompute it to calculate the new guidables and transitions
            if (!wasNull && leg.isNull || wasNull && !leg.isNull) {
                this.computeLeg(i, activeLegIdx, ppos, trueTrack, tas, gs);
            }
        }

        if (LnavConfig.DEBUG_GEOMETRY) {
            console.timeEnd('geometry_recompute');
        }
    }

    static getLegPredictedTas(leg: Leg, currentTas: number) {
        return Math.max(LnavConfig.DEFAULT_MIN_PREDICTED_TAS, leg.predictedTas ?? currentTas);
    }

    static getLegPredictedGs(leg: Leg, currentGs: number) {
        return Math.max(LnavConfig.DEFAULT_MIN_PREDICTED_TAS, leg.predictedGs ?? currentGs);
    }

    private computeLeg(index: number, activeLegIdx: number, ppos: Coordinates, trueTrack: DegreesTrue, tas: Knots, gs: Knots) {
        const prevLeg = this.legs.get(index - 1);
        const leg = this.legs.get(index);
        const nextLeg = this.legs.get(index + 1);
        const nextNextLeg = this.legs.get(index + 2);

        const inboundTransition = this.transitions.get(index - 1);
        const outboundTransition = this.transitions.get(index);

        const legPredictedTas = Geometry.getLegPredictedTas(leg, tas);
        const legPredictedGs = Geometry.getLegPredictedGs(leg, gs);

        // If the leg is null, we compute the following:
        //  - transition from prevLeg to nextLeg
        //  - nextLeg
        //  - transition from nextLeg to nextNextLeg (in order to compute nextLeg)
        if (leg?.isNull) {
            if (nextLeg) {
                let newInboundTransition: Transition;
                if ((LnavConfig.NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE === -1) || index - activeLegIdx < LnavConfig.NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE) {
                    newInboundTransition = TransitionPicker.forLegs(prevLeg, nextLeg);
                }

                let newOutboundTransition: Transition;
                if (nextNextLeg && (LnavConfig.NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE === -1) || (index + 1) - activeLegIdx < LnavConfig.NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE) {
                    newOutboundTransition = TransitionPicker.forLegs(nextLeg, nextNextLeg);
                }

                if (newInboundTransition && prevLeg) {
                    const prevLegPredictedLegTas = Geometry.getLegPredictedTas(prevLeg, tas);
                    const prevLegPredictedLegGs = Geometry.getLegPredictedGs(prevLeg, gs);

                    newInboundTransition.setNeighboringGuidables(prevLeg, nextLeg);
                    newInboundTransition.recomputeWithParameters(
                        activeLegIdx === index,
                        prevLegPredictedLegTas,
                        prevLegPredictedLegGs,
                        ppos,
                        trueTrack,
                    );
                }

                const nextLegPredictedLegTas = Geometry.getLegPredictedTas(nextLeg, tas);
                const nextLegPredictedLegGs = Geometry.getLegPredictedGs(nextLeg, gs);

                nextLeg.setNeighboringGuidables(newInboundTransition ?? prevLeg, newOutboundTransition ?? nextNextLeg);
                nextLeg.recomputeWithParameters(
                    activeLegIdx === index,
                    nextLegPredictedLegTas,
                    nextLegPredictedLegGs,
                    ppos,
                    trueTrack,
                );

                if (newOutboundTransition) {
                    newOutboundTransition.setNeighboringGuidables(nextLeg, nextNextLeg);
                    newOutboundTransition.recomputeWithParameters(
                        activeLegIdx === index + 1,
                        nextLegPredictedLegTas,
                        nextLegPredictedLegGs,
                        ppos,
                        trueTrack,
                    );

                    nextLeg.recomputeWithParameters(
                        activeLegIdx === index,
                        nextLegPredictedLegTas,
                        nextLegPredictedLegGs,
                        ppos,
                        trueTrack,
                    );
                }
            }
        }

        if (inboundTransition && prevLeg) {
            const prevLegPredictedLegTas = Geometry.getLegPredictedTas(prevLeg, tas);
            const prevLegPredictedLegGs = Geometry.getLegPredictedGs(prevLeg, gs);

            inboundTransition.setNeighboringGuidables(prevLeg, leg);
            inboundTransition.setNeighboringLegs(prevLeg, leg);
            inboundTransition.recomputeWithParameters(
                activeLegIdx === index,
                prevLegPredictedLegTas,
                prevLegPredictedLegGs,
                ppos,
                trueTrack,
            );
        }

        // Compute leg and outbound if previous leg isn't null (we already computed 1 leg forward the previous iteration)
        if (!(prevLeg && prevLeg.isNull)) {
            leg.setNeighboringGuidables(inboundTransition ?? prevLeg, outboundTransition ?? nextLeg);
            leg.recomputeWithParameters(
                activeLegIdx === index,
                legPredictedTas,
                legPredictedGs,
                ppos,
                trueTrack,
            );

            if (outboundTransition && nextLeg) {
                outboundTransition.setNeighboringGuidables(leg, nextLeg);
                outboundTransition.setNeighboringLegs(leg, nextLeg);
                outboundTransition.recomputeWithParameters(
                    activeLegIdx === index + 1,
                    legPredictedTas,
                    legPredictedGs,
                    ppos,
                    trueTrack,
                );

                // Since the outbound transition can have TAD, we recompute the leg again to make sure the end point is at the right place for this cycle
                leg.setNeighboringGuidables(inboundTransition ?? prevLeg, outboundTransition);
                leg.recomputeWithParameters(
                    activeLegIdx === index,
                    legPredictedTas,
                    legPredictedGs,
                    ppos,
                    trueTrack,
                );
            }
        }
    }

    /**
     * @param activeLegIdx
     * @param ppos
     * @param trueTrack
     * @param gs
     * @param tas
     */
    getGuidanceParameters(activeLegIdx: number, ppos: Coordinates, trueTrack: DegreesTrue, gs: Knots, tas: Knots): CompletedGuidanceParameters | undefined {
        const activeLeg = this.legs.get(activeLegIdx);
        const nextLeg = this.legs.get(activeLegIdx + 1);

        // TODO handle in guidance controller state
        const autoSequencing = !activeLeg?.disableAutomaticSequencing;

        let activeGuidable: Guidable | null = null;
        let nextGuidable: Guidable | null = null;

        // first, check if we're abeam with one of the transitions (start or end)
        const fromTransition = this.transitions.get(activeLegIdx - 1);
        const toTransition = this.transitions.get(activeLegIdx);
        if (fromTransition && !fromTransition.isNull && fromTransition.isAbeam(ppos)) {
            if (!fromTransition.isFrozen) {
                fromTransition.freeze();
            }

            // Since CA leg CourseCaptureTransition inbound starts at PPOS, we always consider the CA leg as the active guidable
            if (fromTransition instanceof CourseCaptureTransition && activeLeg instanceof CALeg) {
                activeGuidable = activeLeg;
                nextGuidable = toTransition;
            } else {
                activeGuidable = fromTransition;
                nextGuidable = activeLeg;
            }
        } else if (toTransition && !toTransition.isNull && autoSequencing) {
            // TODO need to check that the previous leg is actually flown first...
            if (toTransition.isAbeam(ppos)) {
                if (toTransition instanceof FixedRadiusTransition && !toTransition.isFrozen) {
                    toTransition.freeze();
                }

                activeGuidable = toTransition;
                nextGuidable = nextLeg;
            } else if (activeLeg) {
                activeGuidable = activeLeg;
                nextGuidable = toTransition;
            }
        } else if (activeLeg) {
            activeGuidable = activeLeg;
            if (nextLeg && autoSequencing) {
                nextGuidable = nextLeg;
            }
        }

        // figure out guidance params and roll anticipation
        let guidanceParams: CompletedGuidanceParameters;
        let rad;
        let dtg;
        if (activeGuidable) {
            const phiLimit = maxBank(tas, isGuidableCapturingPath(activeGuidable));
            guidanceParams = {
                ...activeGuidable.getGuidanceParameters(ppos, trueTrack, tas, gs),
                phiLimit,
            };
            dtg = activeGuidable.getDistanceToGo(ppos);

            if (activeGuidable && nextGuidable) {
                rad = this.getGuidableRollAnticipationDistance(gs, activeGuidable, nextGuidable);
                if (rad > 0 && dtg <= rad) {
                    const nextGuidanceParams = nextGuidable.getGuidanceParameters(ppos, trueTrack, tas, gs);

                    if (nextGuidanceParams.law === ControlLaw.LATERAL_PATH) {
                        (guidanceParams as LateralPathGuidance).phiCommand = nextGuidanceParams?.phiCommand ?? 0;
                    }
                }
            }
        }

        if (LnavConfig.DEBUG_GUIDANCE) {
            this.listener.triggerToAllSubscribers('A32NX_FM_DEBUG_LNAV_STATUS',
                // eslint-disable-next-line prefer-template
                'A32NX FMS LNAV STATUS\n'
                + `XTE ${(guidanceParams as LateralPathGuidance).crossTrackError?.toFixed(3) ?? '(NO DATA)'}\n`
                + `TAE ${(guidanceParams as LateralPathGuidance).trackAngleError?.toFixed(3) ?? '(NO DATA)'}\n`
                + `PHI ${(guidanceParams as LateralPathGuidance).phiCommand?.toFixed(5) ?? '(NO DATA)'}\n`
                + '---\n'
                + `CURR GUIDABLE ${activeGuidable?.repr ?? '---'}\n`
                + `CURR GUIDABLE DTG ${dtg?.toFixed(3) ?? '---'}\n`
                + ((activeGuidable instanceof DirectToFixTransition) ? `DFX STATE ${DirectToFixTransitionGuidanceState[(activeGuidable as DirectToFixTransition).state]}\n` : '')
                + '---\n'
                + `RAD GUIDABLE ${nextGuidable?.repr ?? '---'}\n`
                + `RAD DISTANCE ${rad?.toFixed(3) ?? '---'}\n`
                + '---\n'
                + `L0 ${this.legs.get(activeLegIdx - 1)?.repr ?? '---'}\n`
                + `T0 ${this.transitions.get(activeLegIdx - 1)?.repr ?? '---'}\n`
                + `L1 ${this.legs.get(activeLegIdx)?.repr ?? '---'}\n`
                + `T1 ${this.transitions.get(activeLegIdx)?.repr ?? '---'}\n`
                + `L2 ${this.legs.get(activeLegIdx + 1)?.repr ?? '---'}\n`);
        }

        return guidanceParams;
    }

    getGuidableRollAnticipationDistance(gs: Knots, from: Guidable, to: Guidable) {
        if (!from.endsInCircularArc && !to.startsInCircularArc) {
            return 0;
        }

        // get nominal phi from previous and next leg
        const phiNominalFrom = from.endsInCircularArc ? from.getNominalRollAngle(gs) : 0;
        const phiNominalTo = to.startsInCircularArc ? to.getNominalRollAngle(gs) : 0;

        // TODO consider case where RAD > transition distance

        return Geometry.getRollAnticipationDistance(gs, phiNominalFrom, phiNominalTo);
    }

    static getRollAnticipationDistance(gs: Knots, bankA: Degrees, bankB: Degrees): NauticalMiles {
        // calculate delta phi
        const deltaPhi = Math.abs(bankA - bankB);

        // calculate RAD
        const maxRollRate = 5; // deg / s, TODO picked off the wind
        const k2 = 0.0038;
        const rad = gs / 3600 * (Math.sqrt(1 + 2 * k2 * 9.81 * deltaPhi / maxRollRate) - 1) / (k2 * 9.81);

        return rad;
    }

    getDistanceToGo(activeLegIdx: number, ppos: LatLongAlt): number | null {
        const activeLeg = this.legs.get(activeLegIdx);
        if (activeLeg) {
            return activeLeg.getDistanceToGo(ppos);
        }

        return null;
    }

    shouldSequenceLeg(activeLegIdx: number, ppos: LatLongAlt): boolean {
        const activeLeg = this.legs.get(activeLegIdx);
        const inboundTransition = this.transitions.get(activeLegIdx - 1);

        // Restrict sequencing in cases where we are still in inbound transition. Make an exception for very short legs as the transition could be overshooting.
        if (!inboundTransition?.isNull && inboundTransition?.isAbeam(ppos) && activeLeg.distance > 0.01) {
            return false;
        }

        const dtg = activeLeg.getDistanceToGo(ppos);

        if (dtg <= 0 || activeLeg.isNull) {
            return true;
        }

        if (activeLeg) {
            return activeLeg.getDistanceToGo(ppos) < 0.001;
        }

        return false;
    }

    onLegSequenced(_sequencedLeg: Leg, nextLeg: Leg, followingLeg: Leg): void {
        if (isCourseReversalLeg(nextLeg) || isCourseReversalLeg(followingLeg)) {
            this.version++;
        }
    }

    legsInSegment(segmentType: SegmentType): Map<number, Leg> {
        const newMap = new Map<number, Leg>();

        for (const entry of this.legs.entries()) {
            if (entry[1].segment === segmentType) {
                newMap.set(...entry);
            }
        }

        return newMap;
    }

    /**
     * Returns DTG for a complete leg path, taking into account transitions (including split FXR)
     *
     * @param ppos      present position
     * @param leg       the leg guidable
     * @param inbound   the inbound transition guidable, if present
     * @param outbound  the outbound transition guidable, if present
     */
    static completeLegPathDistanceToGo(
        ppos: LatLongData,
        leg: Leg,
        inbound?: Transition,
        outbound?: Transition,
    ) {
        const [, legPartLength, outboundTransLength] = Geometry.completeLegPathLengths(
            leg,
            inbound,
            outbound,
        );

        if (outbound && outbound.isAbeam(ppos)) {
            return outbound.getDistanceToGo(ppos) - outbound.distance / 2; // Remove half of the transition length, since it is split (Type I)
        }

        if (inbound && inbound.isAbeam(ppos)) {
            return inbound.getDistanceToGo(ppos) + legPartLength + outboundTransLength;
        }

        return (leg.getDistanceToGo(ppos) - (outbound && outbound instanceof FixedRadiusTransition ? outbound.unflownDistance : 0)) + outboundTransLength;
    }

    /**
     * Returns lengths of the different segments of a leg, taking into account transitions (including split FXR)
     *
     * @param leg       the leg guidable
     * @param inbound   the inbound transition guidable, if present
     * @param outbound  the outbound transition guidable, if present
     */
    static completeLegPathLengths(
        leg: Leg,
        inbound?: Transition,
        outbound?: Transition,
    ): [number, number, number] {
        let inboundLength = 0;
        let outboundLength = 0;

        if (outbound) {
            if (outbound instanceof FixedRadiusTransition) {
                // Type I transitions are split between the prev and next legs
                outboundLength = outbound.distance / 2;
            }
        }

        if (inbound) {
            if (inbound instanceof FixedRadiusTransition) {
                // Type I transitions are split between the prev and next legs
                inboundLength = inbound.distance / 2;
            } else {
                inboundLength = inbound.distance;
            }
        }

        return [inboundLength, leg.distance, outboundLength];
    }
}
