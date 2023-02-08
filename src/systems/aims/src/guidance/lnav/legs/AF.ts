// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { XFLeg } from '@aims/guidance/lnav/legs/XF';
import { SegmentType } from '@aims/flightplanning/FlightPlanSegment';
import { arcDistanceToGo, arcGuidance } from '@aims/guidance/lnav/CommonGeometry';
import { Coordinates } from '@aims/flightplanning/data/geo';
import { GuidanceParameters } from '@aims/guidance/ControlLaws';
import { DmeArcTransition } from '@aims/guidance/lnav/transitions/DmeArcTransition';
import { MathUtils } from '@shared/MathUtils';
import { TurnDirection } from '@aims/types/fstypes/FSEnums';
import { LnavConfig } from '@aims/guidance/LnavConfig';
import { bearingTo, distanceTo, placeBearingDistance } from 'msfs-geo';
import { PathCaptureTransition } from '@aims/guidance/lnav/transitions/PathCaptureTransition';
import { LegMetadata } from '@aims/guidance/lnav/legs/index';
import { PathVector, PathVectorType } from '../PathVector';

export class AFLeg extends XFLeg {
    predictedPath: PathVector[] = [];

    constructor(
        fix: WayPoint,
        private navaid: Coordinates,
        private rho: NauticalMiles,
        private theta: NauticalMiles,
        public boundaryRadial: NauticalMiles,
        public readonly metadata: Readonly<LegMetadata>,
        segment: SegmentType,
    ) {
        super(fix);

        this.segment = segment;

        this.centre = navaid;
        this.radius = distanceTo(navaid, this.fix.infos.coordinates);
        this.terminationRadial = this.theta;
        this.bearing = Avionics.Utils.clampAngle(bearingTo(this.centre, this.fix.infos.coordinates) + 90 * this.turnDirectionSign);
        this.arcStartPoint = placeBearingDistance(this.centre, this.boundaryRadial, this.radius);
        this.arcEndPoint = placeBearingDistance(this.centre, this.terminationRadial, this.radius);

        this.inboundCourse = this.boundaryRadial + 90 * this.turnDirectionSign;
        this.outboundCourse = this.terminationRadial + 90 * this.turnDirectionSign;
    }

    readonly centre: Coordinates | undefined

    private readonly terminationRadial: DegreesTrue | undefined;

    private readonly bearing: DegreesTrue | undefined

    readonly arcStartPoint: Coordinates | undefined

    readonly arcEndPoint: Coordinates | undefined

    readonly radius: NauticalMiles | undefined

    private sweepAngle: Degrees | undefined

    private clockwise: boolean | undefined

    inboundCourse: DegreesTrue | undefined

    outboundCourse: DegreesTrue | undefined

    getPathStartPoint(): Coordinates | undefined {
        return this.inboundGuidable instanceof DmeArcTransition ? this.inboundGuidable.getPathEndPoint() : this.arcStartPoint;
    }

    getPathEndPoint(): Coordinates | undefined {
        if (this.outboundGuidable instanceof DmeArcTransition && this.outboundGuidable.isComputed) {
            return this.outboundGuidable.getPathStartPoint();
        }

        return this.arcEndPoint;
    }

    recomputeWithParameters(
        _isActive: boolean,
        _tas: Knots,
        _gs: Knots,
        _ppos: Coordinates,
        _trueTrack: DegreesTrue,
    ) {
        this.sweepAngle = MathUtils.diffAngle(bearingTo(this.centre, this.getPathStartPoint()), bearingTo(this.centre, this.getPathEndPoint()));
        this.clockwise = this.sweepAngle > 0;

        // We do not consider the path capture end point in this class' getPathEndPoint since that causes a race condition with the path capture
        // finding its intercept point onto this leg
        const startPoint = this.inboundGuidable instanceof PathCaptureTransition ? this.inboundGuidable.getPathEndPoint() : this.getPathStartPoint();

        this.predictedPath.length = 0;
        this.predictedPath.push({
            type: PathVectorType.Arc,
            startPoint,
            centrePoint: this.centre,
            endPoint: this.getPathEndPoint(),
            sweepAngle: this.sweepAngle,
        });

        if (LnavConfig.DEBUG_PREDICTED_PATH) {
            this.predictedPath.push(
                {
                    type: PathVectorType.DebugPoint,
                    startPoint: this.getPathStartPoint(),
                    annotation: 'AF ITP',
                },
                {
                    type: PathVectorType.DebugPoint,
                    startPoint: this.getPathEndPoint(),
                    annotation: 'AF FTP',
                },
            );
        }
    }

    public get turnDirectionSign(): 1 | -1 {
        if (this.fix.turnDirection !== TurnDirection.Right && this.fix.turnDirection !== TurnDirection.Left) {
            throw new Error('AFLeg found without specific turnDirection');
        }

        return this.fix.turnDirection === TurnDirection.Left ? -1 : 1;
    }

    get startsInCircularArc(): boolean {
        return true;
    }

    get endsInCircularArc(): boolean {
        return true;
    }

    getNominalRollAngle(gs: MetresPerSecond): Degrees | undefined {
        const gsMs = gs * (463 / 900);
        return (this.clockwise ? 1 : -1) * Math.atan((gsMs ** 2) / (this.radius * 1852 * 9.81)) * (180 / Math.PI);
    }

    getGuidanceParameters(ppos: Coordinates, trueTrack: Degrees): GuidanceParameters | undefined {
        return arcGuidance(ppos, trueTrack, this.getPathStartPoint(), this.centre, this.sweepAngle);
    }

    getDistanceToGo(ppos: Coordinates): NauticalMiles | undefined {
        return arcDistanceToGo(ppos, this.getPathStartPoint(), this.centre, this.sweepAngle);
    }

    isAbeam(ppos: Coordinates): boolean {
        const bearingPpos = Avionics.Utils.computeGreatCircleHeading(
            this.centre,
            ppos,
        );

        const bearingFrom = Avionics.Utils.computeGreatCircleHeading(
            this.centre,
            this.getPathStartPoint(),
        );

        const trackAngleError = this.clockwise ? Avionics.Utils.diffAngle(bearingFrom, bearingPpos) : Avionics.Utils.diffAngle(bearingPpos, bearingFrom);

        return trackAngleError >= 0;
    }

    get repr(): string {
        return `AF(${this.radius.toFixed(1)}NM) TO ${this.fix.ident}`;
    }
}
