// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { Coordinates } from '@aims/flightplanning/data/geo';
import { SegmentType } from '@aims/flightplanning/FlightPlanSegment';
import { GuidanceParameters } from '@aims/guidance/ControlLaws';
import {
    courseToFixDistanceToGo,
    courseToFixGuidance,
    PointSide,
    sideOfPointOnCourseToFix,
} from '@aims/guidance/lnav/CommonGeometry';
import { Geo } from '@aims/utils/Geo';
import { LnavConfig } from '@aims/guidance/LnavConfig';
import { Leg } from '@aims/guidance/lnav/legs/Leg';
import { distanceTo } from 'msfs-geo';
import { LegMetadata } from '@aims/guidance/lnav/legs/index';
import { PathVector, PathVectorType } from '../PathVector';

export class CRLeg extends Leg {
    private computedPath: PathVector[] = [];

    constructor(
        public readonly course: DegreesTrue,
        public readonly origin: { coordinates: Coordinates, ident: string, theta: DegreesMagnetic },
        public readonly radial: DegreesTrue,
        public readonly metadata: Readonly<LegMetadata>,
        segment: SegmentType,
    ) {
        super();

        this.segment = segment;
    }

    intercept: Coordinates | undefined = undefined;

    get terminationWaypoint(): Coordinates {
        return this.intercept;
    }

    get ident(): string {
        return this.origin.ident.substring(0, 3) + this.origin.theta.toFixed(0);
    }

    getPathStartPoint(): Coordinates | undefined {
        if (this.inboundGuidable && this.inboundGuidable.isComputed) {
            return this.inboundGuidable.getPathEndPoint();
        }

        throw new Error('[CRLeg] No computed inbound guidable.');
    }

    getPathEndPoint(): Coordinates | undefined {
        return this.intercept;
    }

    get predictedPath(): PathVector[] {
        return this.computedPath;
    }

    recomputeWithParameters(
        _isActive: boolean,
        _tas: Knots,
        _gs: Knots,
        _ppos: Coordinates,
        _trueTrack: DegreesTrue,
    ) {
        this.intercept = Geo.doublePlaceBearingIntercept(
            this.getPathStartPoint(),
            this.origin.coordinates,
            this.course,
            this.radial,
        );

        const overshot = distanceTo(this.getPathStartPoint(), this.intercept) >= 5_000;

        if (this.intercept && !overshot) {
            this.computedPath = [{
                type: PathVectorType.Line,
                startPoint: this.getPathStartPoint(),
                endPoint: this.intercept,
            }];

            this.isNull = false;
            this.isComputed = true;

            if (LnavConfig.DEBUG_PREDICTED_PATH) {
                this.computedPath.push(
                    {
                        type: PathVectorType.DebugPoint,
                        startPoint: this.getPathStartPoint(),
                        annotation: 'CR START',
                    },
                    {
                        type: PathVectorType.DebugPoint,
                        startPoint: this.getPathEndPoint(),
                        annotation: 'CR END',
                    },
                );
            }
        } else {
            this.predictedPath.length = 0;

            this.isNull = true;
            this.isComputed = true;
        }
    }

    /**
     * Returns `true` if the inbound transition has overshot the leg
     */
    get overshot(): boolean {
        const side = sideOfPointOnCourseToFix(this.intercept, this.outboundCourse, this.getPathStartPoint());

        return side === PointSide.After;
    }

    get inboundCourse(): Degrees {
        return this.course;
    }

    get outboundCourse(): Degrees {
        return this.course;
    }

    get distanceToTermination(): NauticalMiles {
        const startPoint = this.getPathStartPoint();

        return distanceTo(startPoint, this.intercept);
    }

    getDistanceToGo(ppos: Coordinates): NauticalMiles {
        return courseToFixDistanceToGo(ppos, this.course, this.getPathEndPoint());
    }

    getGuidanceParameters(ppos: Coordinates, trueTrack: Degrees, _tas: Knots): GuidanceParameters | undefined {
        return courseToFixGuidance(ppos, trueTrack, this.course, this.getPathEndPoint());
    }

    getNominalRollAngle(_gs: Knots): Degrees {
        return 0;
    }

    getPseudoWaypointLocation(_distanceBeforeTerminator: NauticalMiles): Coordinates | undefined {
        return undefined;
    }

    isAbeam(ppos: Coordinates): boolean {
        const dtg = courseToFixDistanceToGo(ppos, this.course, this.getPathEndPoint());

        return dtg >= 0 && dtg <= this.distance;
    }

    get repr(): string {
        return `CR ${this.course}T to ${this.origin.ident}${this.origin.theta}`;
    }
}
