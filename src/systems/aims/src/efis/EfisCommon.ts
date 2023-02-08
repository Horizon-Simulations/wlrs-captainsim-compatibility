// Copyright (c) 2021-2022 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { EfisNdMode, EfisNdRangeValue } from '@shared/NavigationDisplay';
import { Coordinates } from '@aims/flightplanning/data/geo';

export function withinEditArea(lla: Coordinates, range: EfisNdRangeValue, mode: EfisNdMode, planCentre: Coordinates, trueHeading: DegreesTrue): boolean {
    const [editAhead, editBehind, editBeside] = calculateEditArea(range, mode);

    const dist = Avionics.Utils.computeGreatCircleDistance(planCentre, lla);

    let bearing = Avionics.Utils.computeGreatCircleHeading(planCentre, lla);
    if (mode !== EfisNdMode.PLAN) {
        bearing = Avionics.Utils.clampAngle(bearing - trueHeading);
    }
    bearing = bearing * Math.PI / 180;

    const dx = dist * Math.sin(bearing);
    const dy = dist * Math.cos(bearing);

    return Math.abs(dx) < editBeside && dy > -editBehind && dy < editAhead;
}

export function calculateEditArea(range: EfisNdRangeValue, mode: EfisNdMode): [number, number, number] {
    switch (mode) {
    case EfisNdMode.MAP:
        if (range <= 10) {
            return [10.5, 3.5, 8.3];
        }
        if (range <= 20) {
            return [20.5, 7, 16.6];
        }
        if (range <= 40) {
            return [40.5, 14, 33.2];
        }
        if (range <= 80) {
            return [80.5, 28, 66.4];
        }
        if (range <= 160) {
            return [160.5, 56, 132.8];
        }
        if (range <= 320) {
            return [320.5, 112, 265.6];
        }
        return [640.5, 224, 531.2];
    case EfisNdMode.VOR:
        if (range <= 10) {
            return [7.6, 7.1, 7.1];
        }
        if (range <= 20) {
            return [14.7, 14.2, 14.2];
        }
        if (range <= 40) {
            return [28.9, 28.4, 28.4];
        }
        if (range <= 80) {
            return [57.3, 56.8, 56.8];
        }
        if (range <= 160) {
            return [114.1, 113.6, 113.6];
        }
        if (range <= 320) {
            return [227.7, 227.2, 227.2];
        }
        return [454.9, 454.4, 454.4];
    case EfisNdMode.APP:
        if (range <= 10) {
            return [7.6, 7.1, 7.1];
        }
        if (range <= 20) {
            return [14.7, 14.2, 14.2];
        }
        if (range <= 40) {
            return [28.9, 28.4, 28.4];
        }
        if (range <= 80) {
            return [57.3, 56.8, 56.8];
        }
        if (range <= 160) {
            return [114.1, 113.6, 113.6];
        }
        if (range <= 320) {
            return [227.7, 227.2, 227.2];
        }
        return [454.9, 454.4, 454.4];
    case EfisNdMode.PLAN:
        if (range <= 10) {
            return [7, 7, 7];
        }
        if (range <= 20) {
            return [14, 14, 14];
        }
        if (range <= 40) {
            return [28, 28, 28];
        }
        if (range <= 80) {
            return [56, 56, 56];
        }
        if (range <= 160) {
            return [112, 112, 112];
        }
        if (range <= 320) {
            return [224, 224, 224];
        }
        return [448, 448, 448];
    default:
        return [0, 0, 0];
    }
}
