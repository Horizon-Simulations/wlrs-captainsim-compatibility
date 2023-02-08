// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { SegmentType } from '@aims/flightplanning/FlightPlanSegment';
import { Coordinates } from '@aims/flightplanning/data/geo';
import { Guidable } from '@aims/guidance/Guidable';
import { distanceTo } from 'msfs-geo';
import { TurnDirection } from '@aims/types/fstypes/FSEnums';
import { LegMetadata } from '@aims/guidance/lnav/legs/index';

export abstract class Leg extends Guidable {
    segment: SegmentType;

    abstract metadata: Readonly<LegMetadata>

    constrainedTurnDirection: TurnDirection

    abstract get inboundCourse(): Degrees | undefined;

    abstract get outboundCourse(): Degrees | undefined;

    abstract get terminationWaypoint(): WayPoint | Coordinates | undefined;

    abstract get ident(): string

    isNull = false

    displayedOnMap = true

    predictedTas: Knots

    predictedGs: Knots

    get disableAutomaticSequencing(): boolean {
        return false;
    }

    /** @inheritDoc */
    recomputeWithParameters(
        _isActive: boolean,
        _tas: Knots,
        _gs: Knots,
        _ppos: Coordinates,
        _trueTrack: DegreesTrue,
    ): void {
        // Default impl.
    }

    get distance(): NauticalMiles {
        try {
            return distanceTo(this.getPathStartPoint(), this.getPathEndPoint());
        } catch {
            return 0;
        }
    }

    abstract get distanceToTermination(): NauticalMiles

    get overflyTermFix(): boolean {
        return false;
    }

    get initialLegTermPoint(): Coordinates {
        return this.getPathEndPoint();
    }
}
