// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { Coordinates } from '@aims/flightplanning/data/geo';
import { SegmentType } from '@aims/flightplanning/FlightPlanSegment';
import { GuidanceParameters } from '@aims/guidance/ControlLaws';
import { courseToFixDistanceToGo, courseToFixGuidance } from '@aims/guidance/lnav/CommonGeometry';
import { XFLeg } from '@aims/guidance/lnav/legs/XF';
import { LnavConfig } from '@aims/guidance/LnavConfig';
import { Transition } from '@aims/guidance/lnav/Transition';
import { Geo } from '@aims/utils/Geo';
import { FixedRadiusTransition } from '@aims/guidance/lnav/transitions/FixedRadiusTransition';
import { DmeArcTransition } from '@aims/guidance/lnav/transitions/DmeArcTransition';
import { LegMetadata } from '@aims/guidance/lnav/legs/index';
import { IFLeg } from '@aims/guidance/lnav/legs/IF';
import { PathVector, PathVectorType } from '../PathVector';

export class CFLeg extends XFLeg {
    private computedPath: PathVector[] = [];

    constructor(
        fix: WayPoint,
        public readonly course: DegreesTrue,
        public readonly metadata: Readonly<LegMetadata>,
        segment: SegmentType,
    ) {
        super(fix);

        this.segment = segment;
    }

    getPathStartPoint(): Coordinates | undefined {
        if (this.inboundGuidable instanceof IFLeg) {
            return this.inboundGuidable.fix.infos.coordinates;
        }

        if (this.inboundGuidable instanceof Transition && this.inboundGuidable.isComputed) {
            return this.inboundGuidable.getPathEndPoint();
        }

        if (this.outboundGuidable instanceof DmeArcTransition && this.outboundGuidable.isComputed) {
            return this.outboundGuidable.getPathStartPoint();
        }

        // Estimate where we should start the leg
        return this.estimateStartWithoutInboundTransition();
    }

    /**
     * Based on FBW-22-07
     *
     * @private
     */
    private estimateStartWithoutInboundTransition(): Coordinates {
        const inverseCourse = Avionics.Utils.clampAngle(this.course + 180);

        if (this.inboundGuidable && this.inboundGuidable.isComputed) {
            const prevLegTerm = this.inboundGuidable.getPathEndPoint();

            return Geo.doublePlaceBearingIntercept(
                this.getPathEndPoint(),
                prevLegTerm,
                inverseCourse,
                Avionics.Utils.clampAngle(inverseCourse + 90),
            );
        }

        // We start the leg at (tad + 0.1) from the fix if we have a fixed radius transition outbound. This allows showing a better looking path after sequencing.
        let distance = 1;
        if (this.outboundGuidable instanceof FixedRadiusTransition && this.outboundGuidable.isComputed) {
            distance = this.outboundGuidable.tad + 0.1;
        }

        return Avionics.Utils.bearingDistanceToCoordinates(
            inverseCourse,
            distance,
            this.fix.infos.coordinates.lat,
            this.fix.infos.coordinates.long,
        );
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
        // Is start point after the fix ?
        if (this.overshot) {
            this.computedPath = [{
                type: PathVectorType.Line,
                startPoint: this.getPathEndPoint(),
                endPoint: this.getPathEndPoint(),
            }];
        } else {
            this.computedPath = [{
                type: PathVectorType.Line,
                startPoint: this.getPathStartPoint(),
                endPoint: this.getPathEndPoint(),
            }];
        }

        this.isComputed = true;

        if (LnavConfig.DEBUG_PREDICTED_PATH) {
            this.computedPath.push(
                {
                    type: PathVectorType.DebugPoint,
                    startPoint: this.getPathStartPoint(),
                    annotation: 'CF START',
                },
                {
                    type: PathVectorType.DebugPoint,
                    startPoint: this.getPathEndPoint(),
                    annotation: 'CF END',
                },
            );
        }
    }

    get inboundCourse(): Degrees {
        return this.course;
    }

    get outboundCourse(): Degrees {
        return this.course;
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

    isAbeam(ppos: Coordinates): boolean {
        const dtg = courseToFixDistanceToGo(ppos, this.course, this.getPathEndPoint());

        return dtg >= 0 && dtg <= this.distance;
    }

    get repr(): string {
        return `CF(${this.course.toFixed(1)}T) TO ${this.fix.ident}`;
    }
}
