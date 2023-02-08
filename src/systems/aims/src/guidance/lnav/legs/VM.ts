// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { ControlLaw, GuidanceParameters } from '@aims/guidance/ControlLaws';
import { SegmentType } from '@aims/wtsdk';
import { Coordinates } from '@aims/flightplanning/data/geo';
import { Leg } from '@aims/guidance/lnav/legs/Leg';
import { PathVector, PathVectorType } from '@aims/guidance/lnav/PathVector';
import { LegMetadata } from '@aims/guidance/lnav/legs/index';

/**
 * Temporary - better solution is just to have an `InfiniteLine` vector...
 */
const VM_LEG_SIZE = 321;

// TODO needs updated with wind prediction, and maybe local magvar if following for longer distances
export class VMLeg extends Leg {
    predictedPath: PathVector[] = [];

    constructor(
        public heading: DegreesTrue,
        public readonly metadata: Readonly<LegMetadata>,
        segment: SegmentType,
    ) {
        super();
        this.segment = segment;
    }

    get terminationWaypoint(): WayPoint {
        return undefined;
    }

    get ident(): string {
        return 'MANUAL';
    }

    displayedOnMap = false;

    getPathStartPoint(): Coordinates | undefined {
        return this.inboundGuidable?.getPathEndPoint();
    }

    getPathEndPoint(): Coordinates | undefined {
        return Avionics.Utils.bearingDistanceToCoordinates(
            this.heading,
            VM_LEG_SIZE,
            this.getPathStartPoint().lat,
            this.getPathStartPoint().long,
        );
    }

    recomputeWithParameters(_isActive: boolean, _tas: Knots, _gs: Knots, _ppos: Coordinates, _trueTrack: DegreesTrue) {
        // FIXME course based on predicted wind

        this.predictedPath.length = 0;
        this.predictedPath.push(
            {
                type: PathVectorType.Line,
                startPoint: this.getPathStartPoint(),
                endPoint: this.getPathEndPoint(),
            },
        );

        this.isComputed = true;
    }

    get inboundCourse(): Degrees {
        // FIXME this is a bit naughty...
        return this.heading;
    }

    get outboundCourse(): Degrees {
        // FIXME this is a bit naughty...
        return this.heading;
    }

    get distance(): NauticalMiles {
        return 0;
    }

    get distanceToTermination(): NauticalMiles {
        return 1;
    }

    // Can't get pseudo-waypoint location without a finite terminator
    getPseudoWaypointLocation(_distanceBeforeTerminator: NauticalMiles): undefined {
        return undefined;
    }

    getGuidanceParameters(_ppos: LatLongData, _trueTrack: Track): GuidanceParameters {
        return {
            law: ControlLaw.HEADING,
            heading: this.heading,
        };
    }

    getNominalRollAngle(_gs: Knots): Degrees {
        return 0;
    }

    getDistanceToGo(_ppos: LatLongData): NauticalMiles {
        return undefined;
    }

    isAbeam(_ppos: LatLongAlt): boolean {
        return true;
    }

    get disableAutomaticSequencing(): boolean {
        return true;
    }

    get repr(): string {
        return `VM(${this.heading.toFixed(1)}T)`;
    }
}
