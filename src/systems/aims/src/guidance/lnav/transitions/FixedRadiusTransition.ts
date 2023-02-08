// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { MathUtils } from '@shared/MathUtils';
import { DFLeg } from '@aims/guidance/lnav/legs/DF';
import { PILeg } from '@aims/guidance/lnav/legs/PI';
import { TFLeg } from '@aims/guidance/lnav/legs/TF';
import { Transition } from '@aims/guidance/lnav/Transition';
import { PathCaptureTransition } from '@aims/guidance/lnav/transitions/PathCaptureTransition';
import { GuidanceParameters } from '@aims/guidance/ControlLaws';
import { Coordinates } from '@aims/flightplanning/data/geo';
import { CILeg } from '@aims/guidance/lnav/legs/CI';
import { arcDistanceToGo, arcGuidance, arcLength, maxBank, minBank } from '@aims/guidance/lnav/CommonGeometry';
import { TurnDirection } from '@aims/types/fstypes/FSEnums';
import { Constants } from '@shared/Constants';
import { LnavConfig } from '@aims/guidance/LnavConfig';
import { Geo } from '@aims/utils/Geo';
import { XFLeg } from '@aims/guidance/lnav/legs/XF';
import { distanceTo } from 'msfs-geo';
import { PathVector, PathVectorType } from '../PathVector';
import { CFLeg } from '../legs/CF';

type PrevLeg = CILeg | CFLeg | DFLeg | TFLeg;
type NextLeg = CFLeg | /* FALeg | FMLeg | */ PILeg | TFLeg;

const mod = (x: number, n: number) => x - Math.floor(x / n) * n;

/**
 * A type I transition uses a fixed turn radius between two fix-referenced legs.
 */
export class FixedRadiusTransition extends Transition {
    public radius: NauticalMiles;

    public tad: NauticalMiles;

    public clockwise: boolean;

    public isFrozen: boolean = false;

    private computedPath: PathVector[] = [];

    private sweepAngle: Degrees;

    private centre: Coordinates | undefined = undefined;

    private revertTo: PathCaptureTransition | undefined = undefined;

    constructor(
        public previousLeg: PrevLeg, // FIXME temporary
        public nextLeg: NextLeg, // FIXME temporary
    ) {
        super(previousLeg, nextLeg);
    }

    get isReverted(): boolean {
        return this.revertTo !== undefined;
    }

    getPathStartPoint(): Coordinates | undefined {
        if (this.revertTo) {
            return this.revertTo.getPathStartPoint();
        }

        if (this.isComputed) {
            return this.turningPoints[0];
        }

        throw Error('?');
    }

    getPathEndPoint(): Coordinates | undefined {
        if (this.revertTo) {
            return this.revertTo.getPathEndPoint();
        }

        if (this.isComputed) {
            return this.turningPoints[1];
        }

        throw Error('?');
    }

    recomputeWithParameters(isActive: boolean, tas: Knots, gs: Knots, ppos: Coordinates, trueTrack: DegreesTrue) {
        if (this.isFrozen) {
            if (DEBUG) {
                console.log('[FMS/Geometry] Not recomputing Type I transition as it is frozen.');
            }
            return;
        }

        // Sweep angle
        this.sweepAngle = MathUtils.diffAngle(this.previousLeg.outboundCourse, this.nextLeg.inboundCourse);

        // Start with half the track change
        const bankAngle = Math.abs(this.sweepAngle) / 2;

        // apply limits
        const finalBankAngle = Math.max(Math.min(bankAngle, maxBank(tas, true)), minBank(this.nextLeg.segment));

        // Turn radius
        this.radius = ((tas ** 2 / (9.81 * Math.tan(finalBankAngle * Avionics.Utils.DEG2RAD))) / 6997.84) * LnavConfig.TURN_RADIUS_FACTOR;

        // Turn anticipation distance
        this.tad = this.radius * Math.tan(Math.abs(this.sweepAngle / 2) * MathUtils.DEGREES_TO_RADIANS);

        // Check what the distance from the fix to the next leg is (to avoid being not lined up in some XF -> CF cases)
        const prevLegTermDistanceToNextLeg = Geo.distanceToLeg(
            this.previousLeg instanceof XFLeg ? this.previousLeg.fix.infos.coordinates : this.previousLeg.intercept,
            this.nextLeg,
        );

        const defaultTurnDirection = this.sweepAngle >= 0 ? TurnDirection.Right : TurnDirection.Left;
        const forcedTurn = (this.nextLeg.metadata.turnDirection === TurnDirection.Left || this.nextLeg.metadata.turnDirection === TurnDirection.Right)
            && defaultTurnDirection !== this.nextLeg.metadata.turnDirection;
        const tooBigForPrevious = this.previousLeg.distanceToTermination < this.tad + 0.1;
        const tooBigForNext = 'from' in this.nextLeg ? distanceTo(this.nextLeg.from.infos.coordinates, this.nextLeg.to.infos.coordinates) < this.tad + 0.1 : false;
        const notLinedUp = Math.abs(prevLegTermDistanceToNextLeg) >= 0.25; // "reasonable" distance

        // in some circumstances we revert to a path capture transition where the fixed radius won't work well
        const shouldRevert = Math.abs(this.sweepAngle) <= 3
            || Math.abs(this.sweepAngle) > 175
            || this.previousLeg.overflyTermFix || forcedTurn || tooBigForPrevious || tooBigForNext || notLinedUp;

        // We do not revert to a path capture if the previous leg was overshot anyway - draw the normal fixed radius turn
        const previousLegOvershot = 'overshot' in this.previousLeg && this.previousLeg.overshot;

        if (shouldRevert && !previousLegOvershot) {
            const shouldHaveTad = !this.previousLeg.overflyTermFix && !notLinedUp && (tooBigForPrevious || tooBigForNext);

            if (!this.revertTo) {
                const reverted = new PathCaptureTransition(this.previousLeg, this.nextLeg);

                reverted.startWithTad = shouldHaveTad;
                reverted.recomputeWithParameters(isActive, tas, gs, ppos, trueTrack);

                const reversionTad = reverted.tad;
                const fixDtg = this.previousLeg.getDistanceToGo(ppos) + this.tad;

                // See if there is enough space left for the reverted transition
                if (fixDtg > reversionTad) {
                    this.revertTo = reverted;
                    this.isComputed = this.revertTo.isComputed;
                    return;
                }
            } else {
                this.revertTo.startWithTad = shouldHaveTad;
                this.revertTo.recomputeWithParameters(isActive, tas, gs, ppos, trueTrack);
                this.isComputed = this.revertTo.isComputed;
                return;
            }
        }

        // Try to de-revert if needed
        if (this.revertTo) {
            // We assume we are inactive here
            const fixDtg = this.previousLeg.getDistanceToGo(ppos) + this.revertTo.tad;

            // Only de-revert if there is space for the fixed radius TAD
            if (fixDtg > this.tad + 0.05 || !isActive) {
                this.revertTo = undefined;
            }
        }

        // Turn direction
        this.clockwise = this.sweepAngle >= 0;

        // Turning points
        this.turningPoints = this.computeTurningPoints();

        this.computedPath.length = 0;
        this.computedPath.push(
            {
                type: PathVectorType.Arc,
                startPoint: this.getTurningPoints()[0],
                centrePoint: this.centre,
                endPoint: this.getTurningPoints()[1],
                sweepAngle: this.sweepAngle,
            },
        );

        this.isComputed = true;
    }

    get startsInCircularArc(): boolean {
        return true;
    }

    get endsInCircularArc(): boolean {
        return true;
    }

    isAbeam(ppos: LatLongData): boolean {
        if (this.revertTo !== undefined) {
            return this.revertTo.isAbeam(ppos);
        }

        const turningPoints = this.getTurningPoints();
        if (!turningPoints) {
            return false;
        }

        const [inbound, outbound] = turningPoints;

        const inBearingAc = Avionics.Utils.computeGreatCircleHeading(inbound, ppos);
        const inHeadingAc = Math.abs(MathUtils.diffAngle(this.previousLeg.outboundCourse, inBearingAc));

        const outBearingAc = Avionics.Utils.computeGreatCircleHeading(outbound, ppos);
        const outHeadingAc = Math.abs(MathUtils.diffAngle(this.nextLeg.inboundCourse, outBearingAc));

        return inHeadingAc <= 90 && outHeadingAc >= 90;
    }

    get distance(): NauticalMiles {
        if (this.revertTo) {
            return this.revertTo.distance;
        }

        return arcLength(this.radius, this.sweepAngle);
    }

    /**
     * Returns the distance between the inbound turning point and the reference fix
     */
    get unflownDistance() {
        if (this.revertTo) {
            return 0;
        }

        if (!this.getTurningPoints()) {
            return 0;
        }
        return Avionics.Utils.computeGreatCircleDistance(
            this.previousLeg.getPathEndPoint(),
            this.getTurningPoints()[0],
        );
    }

    private turningPoints;

    private computeTurningPoints(): [LatLongAlt, LatLongAlt] {
        const { lat, long } = this.previousLeg instanceof CILeg ? this.previousLeg.intercept : this.previousLeg.fix.infos.coordinates;

        const inbound = Avionics.Utils.bearingDistanceToCoordinates(
            mod(this.previousLeg.outboundCourse + 180, 360),
            this.tad,
            lat,
            long,
        );

        const outbound = Avionics.Utils.bearingDistanceToCoordinates(
            this.nextLeg.inboundCourse,
            this.tad,
            lat,
            long,
        );

        this.centre = Avionics.Utils.bearingDistanceToCoordinates(
            Avionics.Utils.clampAngle(this.previousLeg.outboundCourse + (this.clockwise ? 90 : -90)),
            this.radius,
            inbound.lat,
            inbound.long,
        );

        return [inbound, outbound];
    }

    getTurningPoints(): [Coordinates, Coordinates] | undefined {
        if (this.revertTo) {
            return this.revertTo.getTurningPoints();
        }

        return this.turningPoints;
    }

    get predictedPath(): PathVector[] {
        if (this.revertTo) {
            return this.revertTo.predictedPath;
        }

        return this.computedPath;
    }

    getDistanceToGo(ppos: Coordinates): NauticalMiles {
        if (this.revertTo) {
            return this.revertTo.getDistanceToGo(ppos);
        }

        const [itp] = this.getTurningPoints();

        return arcDistanceToGo(ppos, itp, this.centre, this.sweepAngle);
    }

    getGuidanceParameters(ppos: LatLongAlt, trueTrack: number, tas: Knots): GuidanceParameters | null {
        if (this.revertTo) {
            return this.revertTo.getGuidanceParameters(ppos, trueTrack, tas);
        }

        const [itp] = this.getTurningPoints();

        return arcGuidance(ppos, trueTrack, itp, this.centre, this.sweepAngle);
    }

    getNominalRollAngle(gs: Knots): Degrees {
        if (this.revertTo) {
            return this.revertTo.getNominalRollAngle(gs);
        }

        return (this.clockwise ? 1 : -1) * Math.atan(((gs * 463 / 900) ** 2) / (this.radius * 1852 * Constants.G)) * (180 / Math.PI);
    }

    get repr(): string {
        return `TYPE1(${this.previousLeg.repr} TO ${this.nextLeg.repr})`;
    }
}
