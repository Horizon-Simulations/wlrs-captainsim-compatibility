// Copyright (c) 2021-2022 FlyByWire Simulations
// Copyright (c) 2021-2022 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { computeDestinationPoint as geolibDestPoint } from 'geolib';
import { Coordinates } from '@aims/flightplanning/data/geo';
import { MathUtils } from '@shared/MathUtils';
import { Leg } from '@aims/guidance/lnav/legs/Leg';
import {
    bearingTo,
    distanceTo,
    placeBearingDistance,
    smallCircleGreatCircleIntersection,
    placeBearingIntersection,
} from 'msfs-geo';
import { AFLeg } from '@aims/guidance/lnav/legs/AF';
import { TFLeg } from '@aims/guidance/lnav/legs/TF';

const sin = (input: Degrees) => Math.sin(input * (Math.PI / 180));

const asin = (input: Degrees) => Math.asin(input) * (180 / Math.PI);

export class Geo {
    static computeDestinationPoint(start: Coordinates, distance: NauticalMiles, bearing: DegreesTrue, radius: Metres = 6371000): Coordinates {
        // FIXME rm -f geolib ?
        const a = geolibDestPoint({ ...start, lon: start.long }, distance * 1852, bearing, radius);
        return {
            lat: a.latitude,
            long: a.longitude,
        };
    }

    static distanceToLeg(from: Coordinates, leg: Leg): NauticalMiles {
        const intersections1 = placeBearingIntersection(
            from,
            Avionics.Utils.clampAngle(leg.outboundCourse - 90),
            leg.initialLegTermPoint,
            Avionics.Utils.clampAngle(leg.outboundCourse - 180),
        );

        const d1 = Avionics.Utils.computeGreatCircleDistance(from, intersections1[0]);
        const d2 = Avionics.Utils.computeGreatCircleDistance(from, intersections1[1]);

        let legStartReference;

        if (leg instanceof TFLeg) {
            legStartReference = leg.from.infos.coordinates;
        } else {
            legStartReference = leg.getPathStartPoint();
        }

        // We might call this on legs that do not have a defined start point yet, as it depends on their inbound transition, which is what is passing
        // them in to this function.
        // In that case, do not consider the second intersection set.
        if (!legStartReference) {
            return Math.min(d1, d2);
        }

        const intersections2 = placeBearingIntersection(
            from,
            Avionics.Utils.clampAngle(leg.outboundCourse - 90),
            legStartReference,
            Avionics.Utils.clampAngle(leg.outboundCourse - 180),
        );

        const d3 = Avionics.Utils.computeGreatCircleDistance(from, intersections2[0]);
        const d4 = Avionics.Utils.computeGreatCircleDistance(from, intersections2[1]);

        return Math.min(d1, d2, d3, d4);
    }

    static legIntercept(from: Coordinates, bearing: DegreesTrue, leg: Leg): Coordinates {
        if (leg instanceof AFLeg) {
            const intersections = smallCircleGreatCircleIntersection(
                leg.centre,
                leg.radius,
                from,
                bearing,
            );

            const d1 = Avionics.Utils.computeGreatCircleDistance(from, intersections[0]);
            const d2 = Avionics.Utils.computeGreatCircleDistance(from, intersections[1]);

            return d1 > d2 ? intersections[1] : intersections[0];
        }

        if (leg.getPathEndPoint() === undefined || leg.outboundCourse === undefined) {
            throw new Error('[FMS/LNAV] Cannot compute leg intercept if leg end point or outbound course are undefined');
        }

        const intersections1 = placeBearingIntersection(
            from,
            Avionics.Utils.clampAngle(bearing),
            'fix' in leg ? leg.fix.infos.coordinates : leg.getPathEndPoint(),
            Avionics.Utils.clampAngle(leg.outboundCourse - 180),
        );

        const d1 = distanceTo(from, intersections1[0]);
        const d2 = distanceTo(from, intersections1[1]);

        // We might call this on legs that do not have a defined start point yet, as it depends on their inbound transition, which is what is passing
        // them in to this function.
        // In that case, do not consider the second intersection set.
        if (!leg.getPathStartPoint()) {
            return d1 > d2 ? intersections1[1] : intersections1[0];
        }

        const intersections2 = placeBearingIntersection(
            from,
            Avionics.Utils.clampAngle(bearing),
            leg.getPathStartPoint(),
            Avionics.Utils.clampAngle(leg.outboundCourse - 180),
        );

        const d3 = Avionics.Utils.computeGreatCircleDistance(from, intersections2[0]);
        const d4 = Avionics.Utils.computeGreatCircleDistance(from, intersections2[1]);

        const smallest = Math.min(d1, d2, d3, d4);

        if (smallest === d1) {
            return intersections1[0];
        }

        if (smallest === d2) {
            return intersections1[1];
        }

        if (smallest === d3) {
            return intersections2[0];
        }

        return intersections2[1];
    }

    static placeBearingPlaceDistanceIntercept(bearingPoint: Coordinates, distancePoint: Coordinates, bearing: DegreesTrue, distance: NauticalMiles): Coordinates {
        const relativeBearing = bearingTo(bearingPoint, distancePoint);
        const distanceBetween = distanceTo(bearingPoint, distancePoint);
        const angleA = Math.abs(MathUtils.diffAngle(relativeBearing, bearing));
        const angleC = angleA > 90 ? asin(distanceBetween * (sin(angleA) / distance)) : 180 - asin(distanceBetween * (sin(angleA) / distance));
        const angleB = 180 - angleA - angleC;
        return placeBearingDistance(bearingPoint, bearing, Math.abs(sin(angleB) * (distance / sin(angleA))));
    }

    static doublePlaceBearingIntercept(pointA: Coordinates, pointB: Coordinates, bearingA: DegreesTrue, bearingB: DegreesTrue): Coordinates {
        return B77HS_Util.greatCircleIntersection(pointA, bearingA, pointB, bearingB);
    }
}