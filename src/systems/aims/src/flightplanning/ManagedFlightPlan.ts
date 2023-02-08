/* eslint-disable no-underscore-dangle */
/*
 * MIT License
 *
 * Copyright (c) 2020-2021 Working Title, FlyByWire Simulations
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { HoldData, WaypointStats } from '@aims/flightplanning/data/flightplan';
import { WaypointConstraintType } from '@aims/flightplanning/FlightPlanManager';
import { AltitudeDescriptor, FixTypeFlags, LegType } from '../types/fstypes/FSEnums';
import { FlightPlanSegment, SegmentType } from './FlightPlanSegment';
import { LegsProcedure } from './LegsProcedure';
import { RawDataMapper } from './RawDataMapper';
import { GPS } from './GPS';
import { ProcedureDetails } from './ProcedureDetails';
import { DirectTo } from './DirectTo';
import { GeoMath } from './GeoMath';
import { WaypointBuilder } from './WaypointBuilder';

/**
 * A flight plan managed by the FlightPlanManager.
 */
export class ManagedFlightPlan {
    /** Whether or not the flight plan has an origin airfield. */
    public originAirfield?: WayPoint;

    // This is the same as originAirfield, but is not cleared when a direct-to occurs
    public persistentOriginAirfield?: WayPoint;

    /** Transition altitude for the originAirfield from the nav database */
    public originTransitionAltitudeDb?: number;

    /** Transition altitude for the originAirfield from the pilot */
    public originTransitionAltitudePilot?: number;

    /** Whether or not the flight plan has a destination airfield. */
    public destinationAirfield?: WayPoint;

    /** Transition level for the destinationAirfield from the nav database */
    public destinationTransitionLevelDb?: number;

    /** Transition level for the destinationAirfield from the pilot */
    public destinationTransitionLevelPilot?: number;

    /** The cruise altitude for this flight plan. */
    public cruiseAltitude = 0;

    /** The index of the currently active waypoint. */
    public activeWaypointIndex = 0;

    /** The details for selected procedures on this flight plan. */
    public procedureDetails: ProcedureDetails = new ProcedureDetails();

    /** The details of any direct-to procedures on this flight plan. */
    public directTo: DirectTo = new DirectTo();

    private turningPointIndex = 0;

    /** The departure segment of the flight plan. */
    public get departure(): FlightPlanSegment {
        return this.getSegment(SegmentType.Departure);
    }

    /** The enroute segment of the flight plan. */
    public get enroute(): FlightPlanSegment {
        return this.getSegment(SegmentType.Enroute);
    }

    /** The arrival segment of the flight plan. */
    public get arrival(): FlightPlanSegment {
        return this.getSegment(SegmentType.Arrival);
    }

    /** The approach segment of the flight plan. */
    public get approach(): FlightPlanSegment {
        return this.getSegment(SegmentType.Approach);
    }

    /** The approach segment of the flight plan. */
    public get missed(): FlightPlanSegment {
        return this.getSegment(SegmentType.Missed);
    }

    /** Whether the flight plan has an origin airfield. */
    public get hasOrigin() {
        return this.originAirfield;
    }

    /** Whether the flight plan has a persistent origin airfield. */
    public get hasPersistentOrigin() {
        return this.persistentOriginAirfield;
    }

    /** Whether the flight plan has a destination airfield. */
    public get hasDestination() {
        return this.destinationAirfield;
    }

    /** The currently active waypoint. */
    public get activeWaypoint(): WayPoint {
        return this.waypoints[this.activeWaypointIndex];
    }

    /**
     * Returns a list of {@link WaypointStats} for the waypoints in the flight plan
     *
     * @return {WaypointStats[]} array of statistics for the waypoints in the flight plan, with matching indices to
     *                           flight plan waypoints
     */
    public computeWaypointStatistics(ppos: LatLongData): Map<number, WaypointStats> {
        // TODO this should be moved into its own dedicated module

        const stats = new Map<number, WaypointStats>();

        const firstData = this.computeActiveWaypointStatistics(ppos);

        stats.set(this.activeWaypointIndex, firstData);

        this.waypoints.slice(0).forEach((waypoint, index) => {
            // TODO redo when we have a better solution for vector legs
            const firstDistFromPpos = firstData?.distanceFromPpos ?? 0;
            const activeWpCumulativeDist = this.activeWaypoint?.cumulativeDistanceInFP ?? 0;
            const distPpos = (waypoint.isVectors) ? 1 : waypoint.cumulativeDistanceInFP - activeWpCumulativeDist + firstDistFromPpos;
            const data = {
                ident: waypoint.ident,
                bearingInFp: waypoint.bearingInFP,
                distanceInFP: waypoint.distanceInFP,
                distanceFromPpos: distPpos,
                timeFromPpos: this.computeWaypointTime(waypoint.cumulativeDistanceInFP - activeWpCumulativeDist + firstDistFromPpos),
                etaFromPpos: this.computeWaypointEta(waypoint.cumulativeDistanceInFP - activeWpCumulativeDist + firstDistFromPpos),
            };
            stats.set(index, data);
        });

        return stats;
    }

    /**
     * Returns info for the currently active waypoint, to be displayed by the Navigation Display
     */
    public computeActiveWaypointStatistics(ppos: LatLongData): WaypointStats {
        // TODO this should be moved into its own dedicated module

        if (!this.activeWaypoint) {
            return undefined;
        }

        const bearingInFp = Avionics.Utils.computeGreatCircleHeading(ppos, this.activeWaypoint.infos.coordinates);

        let distanceFromPpos;
        if (Number.isNaN(ppos.lat) || Number.isNaN(ppos.long)) {
            distanceFromPpos = this.activeWaypoint.distanceInFP;
        } else if (this.activeWaypoint.isVectors) {
            // TODO redo when we have a better solution for vector legs
            distanceFromPpos = 1;
        } else {
            distanceFromPpos = Avionics.Utils.computeGreatCircleDistance(ppos, this.activeWaypoint.infos.coordinates);
        }
        const timeFromPpos = this.computeWaypointTime(distanceFromPpos);
        const etaFromPpos = this.computeWaypointEta(distanceFromPpos, timeFromPpos);

        return {
            ident: this.activeWaypoint.ident,
            bearingInFp,
            distanceInFP: this.activeWaypoint.distanceInFP,
            distanceFromPpos,
            timeFromPpos,
            etaFromPpos,
            magneticVariation: GeoMath.getMagvar(this.activeWaypoint.infos.coordinates.lat, this.activeWaypoint.infos.coordinates.long),
        };
    }

    // TODO is this accurate? Logic is same like in the old FPM
    private computeWaypointTime(distance: number) {
        const groundSpeed = Simplane.getGroundSpeed();

        if (groundSpeed < 100) {
            return (distance / 400) * 3600;
        }

        return (distance / groundSpeed) * 3600;
    }

    private computeWaypointEta(distance: number, preComputedTime? :number) {
        const eta = preComputedTime ?? this.computeWaypointTime(distance);
        const utcTime = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
        return eta + utcTime;
    }

    /** The parent instrument this flight plan is attached to locally. */
    private _parentInstrument?: BaseInstrument;

    /** The current active segments of the flight plan. */
    private _segments: FlightPlanSegment[] = [new FlightPlanSegment(SegmentType.Enroute, 0, [])];

    /** The waypoints of the flight plan. */
    public get waypoints(): WayPoint[] {
        const waypoints: WayPoint[] = [];
        if (this.originAirfield) {
            waypoints.push(this.originAirfield);
        }

        for (const segment of this._segments) {
            waypoints.push(...segment.waypoints);
        }

        if (this.destinationAirfield) {
            waypoints.push(this.destinationAirfield);
        }

        return waypoints;
    }

    /**
     * Gets all the waypoints that are currently visible and part of the routing.
     *
     * This is used to obtain the list of waypoints to display after a DIRECT TO.
     */
    public get visibleWaypoints(): WayPoint[] {
        const allWaypoints = this.waypoints;

        if (this.directTo.isActive) {
            const directToWaypointIndex = this.directTo.planWaypointIndex;

            return allWaypoints.slice(Math.max(this.activeWaypointIndex - 1, directToWaypointIndex), allWaypoints.length - 1);
        }

        return allWaypoints.slice(this.activeWaypointIndex - 1, allWaypoints.length);
    }

    public get activeVisibleWaypointIndex(): number {
        if (this.directTo.isActive) {
            const directToWaypointIndex = this.directTo.planWaypointIndex;
            return (this.activeWaypointIndex - 1) > directToWaypointIndex ? 1 : 0;
        }
        return 1;
    }

    public get segments(): FlightPlanSegment[] {
        return this._segments;
    }

    /** The length of the flight plan. */
    public get length(): number {
        const lastSeg = this._segments[this._segments.length - 1];
        return lastSeg.offset + lastSeg.waypoints.length + (this.hasDestination ? 1 : 0);
    }

    public get checksum():number {
        let checksum = 0;
        const { waypoints } = this;
        for (let i = 0; i < waypoints.length; i++) checksum += waypoints[i].infos.coordinates.lat;
        return checksum;
    }

    /** The non-approach waypoints of the flight plan. */
    public get nonApproachWaypoints(): WayPoint[] {
        const waypoints = [];
        if (this.originAirfield) {
            waypoints.push(this.originAirfield);
        }

        for (const segment of this._segments.filter((s) => s.type < SegmentType.Approach)) {
            waypoints.push(...segment.waypoints);
        }

        if (this.destinationAirfield) {
            waypoints.push(this.destinationAirfield);
        }

        return waypoints;
    }

    /**
     * Sets the parent instrument that the flight plan is attached to locally.
     * @param instrument The instrument that the flight plan is attached to.
     */
    public setParentInstrument(instrument: BaseInstrument): void {
        this._parentInstrument = instrument;
    }

    /**
     * Clears the flight plan.
     */
    public async clearPlan(): Promise<void> {
        this.originAirfield = undefined;
        this.originTransitionAltitudeDb = undefined;
        this.originTransitionAltitudePilot = undefined;
        this.persistentOriginAirfield = undefined;
        this.destinationAirfield = undefined;
        this.destinationTransitionLevelDb = undefined;
        this.destinationTransitionLevelPilot = undefined;

        this.cruiseAltitude = 0;
        this.activeWaypointIndex = 0;

        this.procedureDetails = new ProcedureDetails();
        this.directTo = new DirectTo();

        await GPS.clearPlan().catch(console.error);
        this._segments = [new FlightPlanSegment(SegmentType.Enroute, 0, [])];
    }

    /**
     * Syncs the flight plan to FS9GPS.
     */
    public async syncToGPS(): Promise<void> {
        await GPS.clearPlan().catch(console.error);
        for (let i = 0; i < this.waypoints.length; i++) {
            const waypoint = this.waypoints[i];

            if (waypoint.icao && waypoint.icao.trim() !== '') {
                GPS.addIcaoWaypoint(waypoint.icao, i).catch(console.error);
            } else {
                GPS.addUserWaypoint(waypoint.infos.coordinates.lat, waypoint.infos.coordinates.long, i, waypoint.ident).catch(console.error);
            }

            if (waypoint.endsInDiscontinuity) {
                break;
            }
        }

        await GPS.setActiveWaypoint(this.activeWaypointIndex).catch(console.error);
        await GPS.logCurrentPlan().catch(console.error);
    }

    /**
     * Adds a waypoint to the flight plan.
     *
     * @param waypoint    The waypoint to add
     *
     * @param index       The index to add the waypoint at. If omitted the waypoint will
     *                    be appended to the end of the flight plan.
     *
     * @param segmentType The type of segment to add the waypoint to
     * @returns The index the waypoint was actually inserted at
     */
    public addWaypoint(
        waypoint: WayPoint | any,
        index?: number | undefined,
        segmentType?: SegmentType,
    ): number {
        console.log(`addWaypoint ${waypoint.icao}, ${index}, ${SegmentType[segmentType]}`, waypoint);

        const mappedWaypoint: WayPoint = (waypoint instanceof WayPoint) ? waypoint : RawDataMapper.toWaypoint(waypoint, this._parentInstrument);

        if (mappedWaypoint.type === 'A' && index === 0) {
            mappedWaypoint.endsInDiscontinuity = true;
            mappedWaypoint.discontinuityCanBeCleared = true;
            this.originAirfield = mappedWaypoint;
            this.persistentOriginAirfield = mappedWaypoint;

            this.procedureDetails.departureIndex = -1;
            this.procedureDetails.departureRunwayIndex = -1;
            this.procedureDetails.departureTransitionIndex = -1;
            this.procedureDetails.originRunwayIndex = -1;

            this.reflowSegments();
            this.reflowDistances();
        } else if (mappedWaypoint.type === 'A' && index === undefined) {
            this.destinationAirfield = mappedWaypoint;
            this.procedureDetails.arrivalIndex = -1;
            this.procedureDetails.arrivalRunwayIndex = -1;
            this.procedureDetails.arrivalTransitionIndex = -1;
            this.procedureDetails.approachIndex = -1;
            this.procedureDetails.approachTransitionIndex = -1;

            const previousWp = this.waypoints[this.waypoints.length - 2];
            if (previousWp) {
                previousWp.endsInDiscontinuity = true;
                previousWp.discontinuityCanBeCleared = true;
            }

            this.reflowSegments();
            this.reflowDistances();
        } else {
            let segment;

            if (segmentType !== undefined) {
                segment = this.getSegment(segmentType);
                if (segment === FlightPlanSegment.Empty) {
                    segment = this.addSegment(segmentType);
                }
            } else {
                segment = this.findSegmentByWaypointIndex(index);
                if (segment === FlightPlanSegment.Empty) {
                    throw new Error('ManagedFlightPlan::addWaypoint: no segment found!');
                }
            }

            // hitting first waypoint in segment > enroute
            if (segment.type > SegmentType.Enroute && index === segment.offset) {
                const segIdx = this._segments.findIndex((seg) => seg.type === segment.type);
                // is prev segment enroute?
                const prevSeg = this._segments[segIdx - 1];
                if (prevSeg.type === SegmentType.Enroute) {
                    segment = prevSeg;
                }
            }

            if (segment) {
                if (index > this.length) {
                    index = undefined;
                }

                if (mappedWaypoint.additionalData.legType === undefined) {
                    if (segment.waypoints.length < 1) {
                        mappedWaypoint.additionalData.legType = LegType.IF;
                    } else {
                        mappedWaypoint.additionalData.legType = LegType.TF;
                    }
                }

                if (index !== undefined) {
                    const segmentIndex = index - segment.offset;
                    if (segmentIndex < segment.waypoints.length) {
                        segment.waypoints.splice(segmentIndex, 0, mappedWaypoint);
                    } else {
                        segment.waypoints.push(mappedWaypoint);
                    }
                } else {
                    segment.waypoints.push(mappedWaypoint);
                }

                this.reflowSegments();
                this.reflowDistances();

                const finalIndex = this.waypoints.indexOf(mappedWaypoint);
                const previousWp = finalIndex > 0 ? this.waypoints[finalIndex - 1] : undefined;

                // Transfer discontinuity forwards if previous waypoint has one and it can be cleared,
                // AND the new waypoint isn't the T-P of a direct to
                if (previousWp && previousWp.endsInDiscontinuity && !mappedWaypoint.isTurningPoint) {
                    if (previousWp.discontinuityCanBeCleared === undefined || previousWp.discontinuityCanBeCleared) {
                        previousWp.endsInDiscontinuity = false;
                        previousWp.discontinuityCanBeCleared = undefined;

                        // Don't mark the mapped waypoint's discontinuity as clearable if this is a MANUAL
                        // TODO maybe extract this logic since we also use it when building a LegsProcedure
                        mappedWaypoint.endsInDiscontinuity = true;
                        if (!mappedWaypoint.isVectors) {
                            mappedWaypoint.discontinuityCanBeCleared = true;
                        }
                    }
                }

                if (this.activeWaypointIndex === 0 && this.length > 1) {
                    this.activeWaypointIndex = 1;
                } else if (this.activeWaypointIndex === 1 && waypoint.isRunway && segment.type === SegmentType.Departure) {
                    this.activeWaypointIndex = 2;
                }

                return finalIndex;
            }
        }

        return -1;
    }

    /**
     * Removes a waypoint from the flight plan.
     * @param index The index of the waypoint to remove.
     */
    public removeWaypoint(index: number, noDiscontinuity: boolean = false): void {
        if (this.originAirfield && index === 0) {
            this.originAirfield = undefined;
            this.reflowSegments();
            this.reflowDistances();
        } else if (this.destinationAirfield && index === this.length - 1) {
            this.destinationAirfield = undefined;
        } else {
            const segment = this.findSegmentByWaypointIndex(index);
            if (segment) {
                const spliced = segment.waypoints.splice(index - segment.offset, 1);
                console.log(`removing waypoint ${spliced[0].icao} from segment ${segment.type}`);
                if (segment.waypoints.length === 0 && segment.type !== SegmentType.Enroute) {
                    console.log(`removing segment ${segment.type} as length is 0`);
                    this.removeSegment(segment.type);
                }
                this.reflowSegments();
                this.reflowDistances();
            }
        }

        // transfer a potential discontinuity backward
        const beforeRemoved = this.waypoints[index - 1];
        if (!noDiscontinuity && beforeRemoved && !beforeRemoved.endsInDiscontinuity) {
            beforeRemoved.endsInDiscontinuity = true;
            beforeRemoved.discontinuityCanBeCleared = true;
        }

        if (index < this.activeWaypointIndex || this.activeWaypointIndex === this.waypoints.length) {
            this.activeWaypointIndex--;
        }
    }

    /**
     * Gets a waypoint by index from the flight plan.
     * @param index The index of the waypoint to get.
     */
    public getWaypoint(index: number): WayPoint | null {
        if (this.originAirfield && index === 0) {
            return this.originAirfield;
        }

        if (this.destinationAirfield && index === this.length - 1) {
            return this.destinationAirfield;
        }

        const segment = this.findSegmentByWaypointIndex(index);

        if (segment) {
            return segment.waypoints[index - segment.offset];
        }

        return null;
    }

    public setWaypointOverfly(index: number, value: boolean): void {
        // FIXME origin airfield isn't necessarily index 0
        if (this.originAirfield && index === 0) {
            return;
        }

        // FIXME origin airfield isn't necessarily last index (never will be with missed approach)
        if (this.destinationAirfield && index === this.length - 1) {
            return;
        }

        const segment = this.findSegmentByWaypointIndex(index);

        if (segment) {
            segment.waypoints[index - segment.offset].additionalData.overfly = value;
        }
    }

    public addOrEditManualHold(
        index: number,
        desiredHold: HoldData,
        modifiedHold: HoldData,
        defaultHold: HoldData,
    ): number {
        const atWaypoint = this.getWaypoint(index);

        if (!atWaypoint) {
            return 0;
        }

        const magVar = Facilities.getMagVar(atWaypoint.infos.coordinates.lat, atWaypoint.infos.coordinates.long);
        const trueCourse = B77HS_Util.magneticToTrue(desiredHold.inboundMagneticCourse, magVar);

        if (atWaypoint.additionalData.legType === LegType.HA || atWaypoint.additionalData.legType === LegType.HF || atWaypoint.additionalData.legType === LegType.HM) {
            atWaypoint.additionalData.legType = LegType.HM;
            atWaypoint.turnDirection = desiredHold.turnDirection;
            atWaypoint.additionalData.course = trueCourse;
            atWaypoint.additionalData.distance = desiredHold.distance;
            atWaypoint.additionalData.distanceInMinutes = desiredHold.time;

            atWaypoint.additionalData.modifiedHold = modifiedHold;
            if (atWaypoint.additionalData.defaultHold === undefined) {
                atWaypoint.additionalData.defaultHold = defaultHold;
            }
            return index;
        }
        const manualHoldWaypoint = WaypointBuilder.fromWaypointManualHold(atWaypoint, desiredHold.turnDirection, trueCourse, desiredHold.distance, desiredHold.time, this._parentInstrument);
        manualHoldWaypoint.additionalData.modifiedHold = modifiedHold;
        manualHoldWaypoint.additionalData.defaultHold = defaultHold;

        this.addWaypoint(manualHoldWaypoint, index + 1);
        return index + 1;
    }

    /**
     * Adds a plan segment to the flight plan.
     * @param type The type of the segment to add.
     */
    public addSegment(type: SegmentType): FlightPlanSegment {
        const segment = new FlightPlanSegment(type, 0, []);
        this._segments.push(segment);

        this._segments.sort((a, b) => a.type - b.type);
        this.reflowSegments();

        return segment;
    }

    /**
     * Removes a plan segment from the flight plan.
     * @param type The type of plan segment to remove.
     */
    public removeSegment(type: SegmentType): void {
        const segmentIndex = this._segments.findIndex((s) => s.type === type);
        if (segmentIndex > -1) {
            this._segments.splice(segmentIndex, 1);
        }
    }

    /**
     * Reflows waypoint index offsets accross plans segments.
     */
    public reflowSegments(): void {
        let index = 0;
        if (this.originAirfield) {
            index = 1;
        }

        for (const segment of this._segments) {
            segment.offset = index;
            index += segment.waypoints.length;
        }
    }

    /**
     * Gets a flight plan segment of the specified type.
     * @param type The type of flight plan segment to get.
     * @returns The found segment, or FlightPlanSegment.Empty if not found.
     */
    public getSegment(type: number): FlightPlanSegment {
        const segment = this._segments.find((s) => s.type === type);
        return segment !== undefined ? segment : FlightPlanSegment.Empty;
    }

    /**
     * Finds a flight plan segment by waypoint index.
     * @param index The index of the waypoint to find the segment for.
     * @returns The located segment, if any.
     */
    public findSegmentByWaypointIndex(index: number): FlightPlanSegment {
        for (let i = 0; i < this._segments.length; i++) {
            const segMaxIdx = this._segments[i].offset + this._segments[i].waypoints.length;
            if (segMaxIdx > index) {
                return this._segments[i];
            }
        }

        return this._segments[this._segments.length - 1];
    }

    public isLastWaypointInSegment(fpIndex: number): boolean {
        const segment = this.findSegmentByWaypointIndex(fpIndex);
        if (fpIndex >= this.waypoints.length) {
            return false;
        }
        if (fpIndex === (segment.offset + segment.waypoints.length - 1)) {
            return true;
        }
        return false;
    }

    /**
     * Recalculates all waypoint bearings and distances in the flight plan.
     */
    public reflowDistances(): void {
        let cumulativeDistance = 0;
        const { waypoints } = this;

        for (let i = 0; i < waypoints.length; i++) {
            if (i > 0) {
                // If there's an approach selected and this is the last approach waypoint, use the destination waypoint for coordinates
                // Runway waypoints do not have coordinates
                const referenceWaypoint = waypoints[i];
                const prevWaypoint = waypoints[i - 1];

                const trueCourseToWaypoint = Avionics.Utils.computeGreatCircleHeading(prevWaypoint.infos.coordinates, referenceWaypoint.infos.coordinates);
                referenceWaypoint.bearingInFP = trueCourseToWaypoint - GeoMath.getMagvar(prevWaypoint.infos.coordinates.lat, prevWaypoint.infos.coordinates.long);
                referenceWaypoint.bearingInFP = referenceWaypoint.bearingInFP < 0 ? 360 + referenceWaypoint.bearingInFP : referenceWaypoint.bearingInFP;
                if (prevWaypoint.endsInDiscontinuity && !prevWaypoint.discontinuityCanBeCleared) {
                    referenceWaypoint.distanceInFP = 0;
                } else if (referenceWaypoint.additionalData) {
                    switch (referenceWaypoint.additionalData.legType) {
                    case 11:
                    case 22:
                        referenceWaypoint.distanceInFP = 1;
                        break;
                    default:
                        referenceWaypoint.distanceInFP = Avionics.Utils.computeGreatCircleDistance(prevWaypoint.infos.coordinates, referenceWaypoint.infos.coordinates);
                        break;
                    }
                } else {
                    referenceWaypoint.distanceInFP = Avionics.Utils.computeGreatCircleDistance(prevWaypoint.infos.coordinates, referenceWaypoint.infos.coordinates);
                }
                cumulativeDistance += referenceWaypoint.distanceInFP;
                referenceWaypoint.cumulativeDistanceInFP = cumulativeDistance;
            }
        }
    }

    /**
     * Copies a sanitized version of the flight plan for shared data storage.
     * @returns The sanitized flight plan.
     */
    public serialize(): any {
        const planCopy = new ManagedFlightPlan();
        const copyWaypoint = (waypoint: WayPoint) => ({
            icao: waypoint.icao,
            ident: waypoint.ident,
            type: waypoint.type,
            legAltitudeDescription: waypoint.legAltitudeDescription,
            legAltitude1: waypoint.legAltitude1,
            legAltitude2: waypoint.legAltitude2,
            speedConstraint: waypoint.speedConstraint,
            turnDirection: waypoint.turnDirection,
            isVectors: waypoint.isVectors,
            endsInDiscontinuity: waypoint.endsInDiscontinuity,
            discontinuityCanBeCleared: waypoint.discontinuityCanBeCleared,
            distanceInFP: waypoint.distanceInFP,
            cumulativeDistanceInFP: waypoint.cumulativeDistanceInFP,
            isRunway: waypoint.isRunway,
            additionalData: waypoint.additionalData,
            infos: {
                icao: waypoint.infos.icao,
                ident: waypoint.infos.ident,
                airwayIn: waypoint.infos.airwayIn,
                airwayOut: waypoint.infos.airwayOut,
                routes: waypoint.infos.routes,
                coordinates: {
                    lat: waypoint.infos.coordinates.lat,
                    long: waypoint.infos.coordinates.long,
                    alt: waypoint.infos.coordinates.alt,
                },
            },
        });

        const copyAirfield = (airfield: WayPoint): WayPoint => {
            const copy = Object.assign(new WayPoint(undefined), airfield);
            copy.infos = Object.assign(new AirportInfo(undefined), copy.infos);

            delete copy.instrument;
            delete copy.infos.instrument;
            delete copy._svgElements;
            delete copy.infos._svgElements;

            return copy;
        };

        planCopy.activeWaypointIndex = this.activeWaypointIndex;
        planCopy.destinationAirfield = this.destinationAirfield && copyAirfield(this.destinationAirfield);
        planCopy.originAirfield = this.originAirfield && copyAirfield(this.originAirfield);
        planCopy.persistentOriginAirfield = this.persistentOriginAirfield && copyAirfield(this.persistentOriginAirfield);

        planCopy.procedureDetails = { ...this.procedureDetails };
        planCopy.directTo = { ...this.directTo };
        planCopy.directTo.interceptPoints = planCopy.directTo.interceptPoints?.map((w) => copyWaypoint(w) as WayPoint);

        const copySegments = [];
        for (const segment of this._segments) {
            const copySegment = new FlightPlanSegment(segment.type, segment.offset, []);
            for (const waypoint of segment.waypoints) {
                copySegment.waypoints.push(copyWaypoint(waypoint) as WayPoint);
            }

            copySegments.push(copySegment);
        }

        planCopy._segments = copySegments;
        return planCopy;
    }

    /**
     * Copies the flight plan.
     * @returns The copied flight plan.
     */
    public copy(): ManagedFlightPlan {
        const newFlightPlan = Object.assign(new ManagedFlightPlan(), this);
        newFlightPlan.setParentInstrument(this._parentInstrument);

        newFlightPlan._segments = [];
        for (let i = 0; i < this._segments.length; i++) {
            const seg = this._segments[i];
            newFlightPlan._segments[i] = Object.assign(new FlightPlanSegment(seg.type, seg.offset, []), seg);
            newFlightPlan._segments[i].waypoints = [...seg.waypoints.map((wp) => {
                const clone = new (wp as any).constructor();
                Object.assign(clone, wp);
                clone.additionalData = { ...wp.additionalData };
                return clone;
            })];
        }

        newFlightPlan.procedureDetails = Object.assign(new ProcedureDetails(), this.procedureDetails);
        newFlightPlan.directTo = Object.assign(new DirectTo(), this.directTo);
        newFlightPlan.directTo.interceptPoints = this.directTo.interceptPoints !== undefined ? [...this.directTo.interceptPoints] : undefined;

        return newFlightPlan;
    }

    /**
     * Reverses the flight plan.
     */
    public reverse(): void {
        // TODO: Fix flight plan indexes after reversal
        // this._waypoints.reverse();
    }

    /**
     * Goes direct to the specified waypoint index in the flight plan.
     *
     * @param waypoint The waypoint to go direct to
     */
    public async addDirectTo(waypoint: WayPoint): Promise<void> {
        // TODO Replace with aims pos
        const lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
        const long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');
        const trueTrack = SimVar.GetSimVarValue('GPS GROUND TRUE TRACK', 'degree');

        const oldToWp = this.waypoints[this.activeWaypointIndex];

        const turningPoint = WaypointBuilder.fromCoordinates(
            'T-P',
            new LatLongAlt(lat, long),
            this._parentInstrument, { legType: LegType.CF, course: trueTrack, dynamicPpos: true },
            this.getTurningPointIcao(),
        );
        turningPoint.isTurningPoint = true;

        const waypointIndex = this.waypoints.findIndex((w, idx) => idx >= this.activeWaypointIndex && w.icao === waypoint.icao);
        if (waypointIndex === -1) {
            // in this case the waypoint is not already in the flight plan
            // we string it to the start of the flight plan, add a discontinuity after, and then the existing flight plan
            waypoint.endsInDiscontinuity = true;
            waypoint.discontinuityCanBeCleared = true;
            waypoint.additionalData.legType = LegType.DF;
            this.addWaypoint(waypoint, this.activeWaypointIndex);
            this.activeWaypointIndex = this.addWaypoint(turningPoint, this.activeWaypointIndex) + 1;

            // fix up the old leg that's now after the discont
            if (ManagedFlightPlan.isXfLeg(oldToWp)) {
                oldToWp.additionalData.legType = LegType.IF;
            }
        } else {
            // in this case the waypoint is already in the flight plan...
            // we can skip all the legs before it, and add our dir to
            const toWp = this.waypoints[waypointIndex];
            toWp.additionalData.legType = LegType.DF;
            toWp.turnDirection = 0;
            this.addWaypoint(turningPoint, waypointIndex);
            this.activeWaypointIndex = waypointIndex + 1;
        }
    }

    /**
     *
     * @param force force updating a turning point even if it's not marked dynamic
     */
    public updateTurningPoint(force = false): boolean {
        const wp = this.getWaypoint(this.activeWaypointIndex - 1);
        if (wp?.additionalData?.dynamicPpos || (force && wp?.isTurningPoint)) {
            wp.infos.coordinates.lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
            wp.infos.coordinates.long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');
            wp.additionalData.course = SimVar.GetSimVarValue('GPS GROUND TRUE TRACK', 'degree');
            wp.icao = this.getTurningPointIcao();
            wp.infos.icao = wp.icao;
            console.log('updated T-P:', force, wp.additionalData, wp.infos.coordinates);
            return true;
        }
        return false;
    }

    private getTurningPointIcao(): string {
        this.turningPointIndex = (this.turningPointIndex + 1) % 1000;
        return `WXX    TP${this.turningPointIndex.toFixed(0).padStart(3, '0')}`;
    }

    /**
     * Builds a departure into the flight plan from indexes in the departure airport information.
     */
    public async buildDeparture(): Promise<void> {
        const legs = [];
        const legAnnotations = [];
        const origin = this.originAirfield;

        const { departureIndex } = this.procedureDetails;
        const runwayIndex = this.procedureDetails.departureRunwayIndex;
        const transitionIndex = this.procedureDetails.departureTransitionIndex;

        const selectedOriginRunwayIndex = this.procedureDetails.originRunwayIndex;

        const airportInfo = origin.infos as AirportInfo;
        const airportMagVar = Facilities.getMagVar(airportInfo.coordinates.lat, airportInfo.coordinates.long);

        // Make origin fix an IF leg
        if (origin) {
            origin.additionalData.legType = LegType.IF;
            origin.endsInDiscontinuity = true;
            origin.discontinuityCanBeCleared = true;
            const departure: RawDeparture = airportInfo.departures[departureIndex];
            if (departure) {
                origin.additionalData.annotation = departure.name;
            } else {
                origin.additionalData.annotation = '';
            }
        }

        // Set origin fix coordinates to runway beginning coordinates
        if (origin && selectedOriginRunwayIndex >= 0) {
            origin.infos.coordinates = airportInfo.oneWayRunways[selectedOriginRunwayIndex].beginningCoordinates;
            origin.additionalData.runwayElevation = airportInfo.oneWayRunways[selectedOriginRunwayIndex].elevation * 3.2808399;
            origin.additionalData.runwayLength = airportInfo.oneWayRunways[selectedOriginRunwayIndex].length;
        }

        if (departureIndex >= 0 && runwayIndex >= 0) {
            const runwayTransition: RawRunwayTransition = airportInfo.departures[departureIndex].runwayTransitions[runwayIndex];
            const departure: RawDeparture = airportInfo.departures[departureIndex];
            if (runwayTransition) {
                legs.push(...runwayTransition.legs);
                legAnnotations.push(...runwayTransition.legs.map((_) => departure.name));
                origin.endsInDiscontinuity = false;
                origin.discontinuityCanBeCleared = undefined;
            }
        }

        if (departureIndex >= 0) {
            const departure: RawDeparture = airportInfo.departures[departureIndex];
            legs.push(...departure.commonLegs);
            legAnnotations.push(...departure.commonLegs.map((_) => departure.name));
        }

        if (transitionIndex >= 0 && departureIndex >= 0) {
            if (airportInfo.departures[departureIndex].enRouteTransitions.length > 0) {
                const transition: RawEnRouteTransition = airportInfo.departures[departureIndex].enRouteTransitions[transitionIndex];
                legs.push(...transition.legs);
                legAnnotations.push(...transition.legs.map((_) => transition.name));
            }
        }

        let segment = this.departure;
        if (segment !== FlightPlanSegment.Empty) {
            for (let i = 0; i < segment.waypoints.length; i++) {
                this.removeWaypoint(segment.offset);
            }

            this.removeSegment(segment.type);
        }

        if (legs.length > 0 || selectedOriginRunwayIndex >= 0 || (departureIndex >= 0 && runwayIndex >= 0)) {
            segment = this.addSegment(SegmentType.Departure);
            const procedure = new LegsProcedure(legs, origin, this._parentInstrument, airportMagVar, undefined, legAnnotations);

            const runway: OneWayRunway | null = this.getOriginRunway();

            if (runway) {
                // console.error('bruh');
                // Reference : AMM - 22-71-00 PB001, Page 4
                if (departureIndex < 0 && transitionIndex < 0) {
                    const TEMPORARY_VERTICAL_SPEED = 2000.0; // ft/min
                    const TEMPORARY_GROUND_SPEED = 160; // knots

                    const altitudeFeet = (runway.elevation * 3.2808399) + 1500;
                    const distanceInNM = altitudeFeet / TEMPORARY_VERTICAL_SPEED * (TEMPORARY_GROUND_SPEED / 60);

                    const coordinates = GeoMath.relativeBearingDistanceToCoords(runway.direction, distanceInNM, runway.endCoordinates);

                    const faLeg = procedure.buildWaypoint(`${Math.round(altitudeFeet)}`, coordinates);
                    // TODO should this check for unclr discont? (probs not)
                    faLeg.endsInDiscontinuity = true;
                    faLeg.discontinuityCanBeCleared = true;

                    this.addWaypoint(faLeg, undefined, segment.type);
                }
            }

            let waypointIndex = segment.offset;
            while (procedure.hasNext()) {
                // eslint-disable-next-line no-await-in-loop
                const waypoint = await procedure.getNext();

                if (waypoint !== undefined) {
                    waypoint.additionalData.constraintType = WaypointConstraintType.CLB;

                    this.addWaypointAvoidingDuplicates(waypoint, ++waypointIndex, segment);
                }
            }
        }

        this.restringSegmentBoundaries(SegmentType.Departure, SegmentType.Enroute);
    }

    /**
     * Rebuilds the arrival and approach segment after a change of procedure
     */
    public async rebuildArrivalApproach(): Promise<void> {
        // remove all legs from these segments to prevent weird stuff
        this.truncateSegment(SegmentType.Arrival);
        this.truncateSegment(SegmentType.Approach);
        this.truncateSegment(SegmentType.Missed);

        await this.buildArrival().catch(console.error);
        await this.buildApproach().catch(console.error);
    }

    /**
     * Builds an arrival into the flight plan from indexes in the arrival airport information.
     */
    public async buildArrival(): Promise<void> {
        const legs = [];
        const legAnnotations = [];
        const destination = this.destinationAirfield;

        const { arrivalIndex } = this.procedureDetails;
        // const { approachTransitionIndex } = this.procedureDetails;
        const { arrivalRunwayIndex } = this.procedureDetails;
        const { arrivalTransitionIndex } = this.procedureDetails;

        const destinationInfo = destination.infos as AirportInfo;
        const airportMagVar = Facilities.getMagVar(destinationInfo.coordinates.lat, destinationInfo.coordinates.long);

        if (arrivalIndex >= 0 && arrivalTransitionIndex >= 0) {
            const transition: RawEnRouteTransition = destinationInfo.arrivals[arrivalIndex].enRouteTransitions[arrivalTransitionIndex];
            if (transition !== undefined) {
                legs.push(...transition.legs);
                legAnnotations.push(...transition.legs.map((_) => transition.name));
                // console.log('MFP: buildArrival - pushing transition legs ->', legs);
            }
        }

        if (arrivalIndex >= 0) {
            // string the common legs in the middle of the STAR
            const arrival: RawArrival = destinationInfo.arrivals[arrivalIndex];
            legs.push(...arrival.commonLegs);
            legAnnotations.push(...arrival.commonLegs.map((_) => arrival.name));
            // console.log('MFP: buildArrival - pushing STAR legs ->', legs);

            // if no runway is selected at all (non-runway-specific approach)
            // and the selected STAR only has runway transition legs... string them
            // TODO research IRL behaviour
            const starHasOneRunwayTrans = arrival.commonLegs.length === 0 && arrival.runwayTransitions.length === 1;
            const approachIsRunwaySpecific = this.procedureDetails.destinationRunwayIndex >= 0;
            const runwayTransIndex = arrivalRunwayIndex < 0 && starHasOneRunwayTrans && !approachIsRunwaySpecific ? 0 : arrivalRunwayIndex;

            const runwayTransition = arrival.runwayTransitions[runwayTransIndex];
            if (runwayTransition) {
                legs.push(...runwayTransition.legs);
                legAnnotations.push(...runwayTransition.legs.map((_) => arrival.name));
            }
        }

        let { _startIndex, segment } = this.truncateSegment(SegmentType.Arrival);

        if (legs.length > 0) {
            if (segment === FlightPlanSegment.Empty) {
                segment = this.addSegment(SegmentType.Arrival);
                _startIndex = segment.offset;
            }

            const procedure = new LegsProcedure(legs, this.getWaypoint(segment.offset - 1), this._parentInstrument, airportMagVar, undefined, legAnnotations);

            let waypointIndex = segment.offset;
            // console.log('MFP: buildArrival - ADDING WAYPOINTS ------------------------');
            while (procedure.hasNext()) {
                // eslint-disable-next-line no-await-in-loop
                const waypoint = await procedure.getNext();

                if (waypoint) {
                    waypoint.additionalData.constraintType = WaypointConstraintType.DES;

                    // console.log('  ---- MFP: buildArrival: added waypoint ', waypoint.ident, ' to segment ', segment);
                    this.addWaypointAvoidingDuplicates(waypoint, ++waypointIndex, segment);
                }
            }
        }

        this.restringSegmentBoundaries(SegmentType.Enroute, SegmentType.Arrival);
        this.restringSegmentBoundaries(SegmentType.Arrival, SegmentType.Approach);
    }

    /**
     * Builds an approach into the flight plan from indexes in the arrival airport information.
     */
    public async buildApproach(): Promise<void> {
        const legs = [];
        const legAnnotations = [];
        const missedLegs = [];
        const destination = this.destinationAirfield;
        this.procedureDetails.approachType = undefined;

        const { approachIndex } = this.procedureDetails;
        const { approachTransitionIndex } = this.procedureDetails;
        const { destinationRunwayIndex } = this.procedureDetails;

        const destinationInfo = destination.infos as AirportInfo;
        const airportMagVar = Facilities.getMagVar(destinationInfo.coordinates.lat, destinationInfo.coordinates.long);

        const approach: RawApproach = destinationInfo.approaches[approachIndex];
        const approachName = approach && approach.approachType !== ApproachType.APPROACH_TYPE_UNKNOWN ? approach.name : '';

        if (approachIndex >= 0 && approachTransitionIndex >= 0) {
            const transition: RawApproachTransition = destinationInfo.approaches[approachIndex].transitions[approachTransitionIndex];
            legs.push(...transition.legs);
            legAnnotations.push(...transition.legs.map((_) => transition.name));
            // console.log('MFP: buildApproach - pushing approachTransition legs ->', legs);
        }

        if (approachIndex >= 0) {
            const finalLegs = [...approach.finalLegs];
            // PI legs can only occur in approach vias
            // if the via ends in one, we must omit the IF leg at the start of the approach
            const viaLastLegType = legs[legs.length - 1]?.type;
            if (viaLastLegType === LegType.PI && finalLegs[0]?.type === LegType.IF) {
                finalLegs.splice(0, 1);
                // @ts-expect-error (ts compiler doesn't see that splice mutates finalLegs)
                if (finalLegs[0]?.type !== LegType.CF) {
                    console.error('PI must be followed by CF!');
                }
            }

            this.procedureDetails.approachType = approach.approachType;
            legs.push(...finalLegs);
            legAnnotations.push(...finalLegs.map((_) => approachName));
            missedLegs.push(...approach.missedLegs);
        }

        let { _startIndex, segment } = this.truncateSegment(SegmentType.Approach);

        if (legs.length > 0 || approachIndex >= 0 || destinationRunwayIndex >= 0) {
            if (segment === FlightPlanSegment.Empty) {
                segment = this.addSegment(SegmentType.Approach);
                _startIndex = segment.offset;

                const prevWaypointIndex = segment.offset - 1;
                if (prevWaypointIndex > 0) {
                    const prevWaypoint = this.getWaypoint(segment.offset - 1);
                    if (!prevWaypoint.endsInDiscontinuity) {
                        prevWaypoint.endsInDiscontinuity = true;
                        prevWaypoint.discontinuityCanBeCleared = true;
                    }
                }
            }

            const runway: OneWayRunway | null = this.getDestinationRunway();

            const procedure = new LegsProcedure(legs, this.getWaypoint(_startIndex - 1), this._parentInstrument, airportMagVar, this.procedureDetails.approachType, legAnnotations);

            let waypointIndex = _startIndex;
            // console.log('MFP: buildApproach - ADDING WAYPOINTS ------------------------');
            while (procedure.hasNext()) {
                // eslint-disable-next-line no-await-in-loop
                const waypoint = await procedure.getNext();

                if (waypoint !== undefined) {
                    waypoint.additionalData.constraintType = WaypointConstraintType.DES;

                    // console.log('  ---- MFP: buildApproach: added waypoint', waypoint.ident, ' to segment ', segment);
                    this.addWaypointAvoidingDuplicates(waypoint, ++waypointIndex, segment);
                }
            }

            if (runway) {
                // const selectedRunwayMod = runway.designation.slice(-1);
                // let selectedRunwayOutput;
                // if (selectedRunwayMod === 'L' || selectedRunwayMod === 'C' || selectedRunwayMod === 'R') {
                //     if (runway.designation.length === 2) {
                //         selectedRunwayOutput = `0${runway.designation}`;
                //     } else {
                //         selectedRunwayOutput = runway.designation;
                //     }
                // } else if (runway.designation.length === 2) {
                //     selectedRunwayOutput = runway.designation;
                // } else {
                //     selectedRunwayOutput = `0${runway.designation}`;
                // }

                // When adding approach, edit destination waypoint
                this.destinationAirfield.infos.coordinates = runway.beginningCoordinates;
                this.destinationAirfield.legAltitudeDescription = 1;
                this.destinationAirfield.legAltitude1 = Math.round((runway.elevation * 3.28084 + 50) / 10) * 10;
                this.destinationAirfield.isRunway = true;
                if (approachIndex >= 0) {
                    const lastLeg = approach.finalLegs[approach.finalLegs.length - 1];
                    if (lastLeg.type === LegType.CF) {
                        const magCourse = lastLeg.trueDegrees
                            ? B77HS_Util.trueToMagnetic(lastLeg.course, Facilities.getMagVar(runway.beginningCoordinates.lat, runway.beginningCoordinates.long))
                            : lastLeg.course;
                        this.destinationAirfield.additionalData.annotation = `C${magCourse.toFixed(0).padStart(3, '0')}°`;
                    } else {
                        this.destinationAirfield.additionalData.annotation = approachName;
                    }
                }

                // Clear discontinuity before destination, if any
                const wpBeforeDestIdx = this.waypoints.indexOf(this.destinationAirfield) - 1;
                if (wpBeforeDestIdx >= 0) {
                    const wpBeforeDest = this.getWaypoint(wpBeforeDestIdx);
                    if (wpBeforeDest.endsInDiscontinuity && wpBeforeDest.discontinuityCanBeCleared) {
                        wpBeforeDest.endsInDiscontinuity = false;
                    }
                }
            }
        }

        this.restringSegmentBoundaries(SegmentType.Arrival, SegmentType.Approach);

        /* if (missedLegs.length > 0) {
            let { _startIndex, segment } = this.truncateSegment(SegmentType.Missed);

            if (segment === FlightPlanSegment.Empty) {
                segment = this.addSegment(SegmentType.Missed);
                _startIndex = segment.offset;
            }

            let waypointIndex = _startIndex;

            const missedProcedure = new LegsProcedure(missedLegs, this.getWaypoint(_startIndex - 1), this._parentInstrument, airportMagVar);
            while (missedProcedure.hasNext()) {
                // eslint-disable-next-line no-await-in-loop
                const waypoint = await missedProcedure.getNext().catch(console.error);

                if (waypoint !== undefined) {
                    // console.log('  ---- MFP: buildApproach: added waypoint', waypoint.ident, ' to segment ', segment);
                    this.addWaypoint(waypoint, ++waypointIndex, segment.type);
                }
            }
        } */
    }

    private static isXfLeg(leg: WayPoint): boolean {
        switch (leg?.additionalData?.legType) {
        case LegType.CF:
        case LegType.DF:
        case LegType.IF:
        case LegType.RF:
        case LegType.TF:
            return true;
        default:
            return false;
        }
    }

    private static isFxLeg(leg: WayPoint): boolean {
        switch (leg?.additionalData?.legType) {
        case LegType.FA:
        case LegType.FC:
        case LegType.FD:
        case LegType.FM:
            return true;
        default:
            return false;
        }
    }

    private static legsStartOrEndAtSameFix(legA: WayPoint, legB: WayPoint): boolean {
        return legA.icao === legB.icao && ((ManagedFlightPlan.isXfLeg(legA) && ManagedFlightPlan.isXfLeg(legB)) || (ManagedFlightPlan.isFxLeg(legA) && ManagedFlightPlan.isFxLeg(legB)));
    }

    private static climbConstraint(leg: WayPoint): number {
        switch (leg.legAltitudeDescription) {
        case AltitudeDescriptor.At:
        case AltitudeDescriptor.AtOrBelow:
            return leg.legAltitude1;
        case AltitudeDescriptor.Between:
            return leg.legAltitude2;
        default:
            break;
        }
        return Infinity;
    }

    private static descentConstraint(leg: WayPoint): number {
        switch (leg.legAltitudeDescription) {
        case AltitudeDescriptor.At:
        case AltitudeDescriptor.AtOrAbove:
        case AltitudeDescriptor.Between:
            return leg.legAltitude1;
        default:
            break;
        }
        return -Infinity;
    }

    private static mergeConstraints(legA: WayPoint, legB: WayPoint): { legAltitudeDescription: AltitudeDescriptor, legAltitude1: number, legAltitude2: number, speedConstraint: number } {
        let legAltitudeDescription = AltitudeDescriptor.Empty;
        let legAltitude1 = 0;
        let legAltitude2 = 0;
        if (legA.legAltitudeDescription === AltitudeDescriptor.At) {
            legAltitudeDescription = AltitudeDescriptor.At;
            if (legB.legAltitudeDescription === AltitudeDescriptor.At) {
                legAltitude1 = Math.min(legA.legAltitude1, legB.legAltitude1);
            } else {
                legAltitude1 = legA.legAltitude1;
            }
        } else if (legB.legAltitudeDescription === AltitudeDescriptor.At) {
            legAltitudeDescription = AltitudeDescriptor.At;
            legAltitude1 = legB.legAltitude1;
        } else if (legA.legAltitudeDescription > 0 || legB.legAltitudeDescription > 0) {
            const maxAlt = Math.min(ManagedFlightPlan.climbConstraint(legA), ManagedFlightPlan.climbConstraint(legB));
            const minAlt = Math.max(ManagedFlightPlan.descentConstraint(legA), ManagedFlightPlan.descentConstraint(legB));

            if (Number.isFinite(maxAlt)) {
                if (Number.isFinite(minAlt)) {
                    if (Math.abs(minAlt - maxAlt) < 1) {
                        legAltitudeDescription = AltitudeDescriptor.At;
                        legAltitude1 = minAlt;
                    } else {
                        legAltitudeDescription = AltitudeDescriptor.Between;
                        legAltitude1 = minAlt;
                        legAltitude2 = maxAlt;
                    }
                } else {
                    legAltitudeDescription = AltitudeDescriptor.AtOrBelow;
                    legAltitude1 = maxAlt;
                }
            } else if (Number.isFinite(minAlt)) {
                legAltitudeDescription = AltitudeDescriptor.AtOrAbove;
                legAltitude1 = minAlt;
            }
        }

        const speed = Math.min((legA.speedConstraint > 0) ? legA.speedConstraint : Infinity, (legB.speedConstraint > 0) ? legB.speedConstraint : Infinity);

        return {
            legAltitudeDescription,
            legAltitude1,
            legAltitude2,
            speedConstraint: Number.isFinite(speed) ? speed : 0,
        };
    }

    /**
     * Check for common waypoints at the boundaries of segments, and merge them if found
     * segmentA must be before segmentB in the plan!
     */
    private restringSegmentBoundaries(segmentTypeA: SegmentType, segmentTypeB: SegmentType) {
        if (segmentTypeB < segmentTypeA) {
            throw new Error('restringSegmentBoundaries: segmentTypeA must be before segmentTypeB');
        }

        const segmentA = this.getSegment(segmentTypeA);
        const segmentB = this.getSegment(segmentTypeB);

        if (segmentA?.waypoints.length < 1 || segmentB?.waypoints.length < 1) {
            return;
        }

        const lastLegIndexA = segmentA.offset + segmentA.waypoints.length - 1;
        const lastLegA = segmentA.waypoints[segmentA.waypoints.length - 1];
        const firstLegIndexB = segmentB.offset;
        const firstLegB = segmentB.waypoints[0];

        if (ManagedFlightPlan.legsStartOrEndAtSameFix(lastLegA, firstLegB)) {
            const constraints = ManagedFlightPlan.mergeConstraints(lastLegA, firstLegB);
            if (segmentA.type === SegmentType.Departure) {
                this.removeWaypoint(firstLegIndexB, true);
                Object.assign(lastLegA, constraints);
                lastLegA.endsInDiscontinuity = false;
                lastLegA.discontinuityCanBeCleared = undefined;
            } else {
                this.removeWaypoint(lastLegIndexA, true);
                Object.assign(firstLegB, constraints);
                firstLegB.endsInDiscontinuity = false;
                firstLegB.discontinuityCanBeCleared = undefined;
            }
        } else if (segmentTypeA === SegmentType.Arrival && segmentTypeB === SegmentType.Approach) {
            let toDeleteFromB = 0;
            for (let i = 0; i < segmentB.waypoints.length; i++) {
                if (ManagedFlightPlan.legsStartOrEndAtSameFix(lastLegA, segmentB.waypoints[i])) {
                    const constraints = ManagedFlightPlan.mergeConstraints(lastLegA, firstLegB);
                    Object.assign(lastLegA, constraints);
                    toDeleteFromB = i + 1;
                    break;
                }
            }
            for (let i = 0; i < toDeleteFromB; i++) {
                this.removeWaypoint(segmentB.offset, true);
            }
            if (toDeleteFromB === 0 && firstLegB.additionalData.legType === LegType.IF) {
                lastLegA.endsInDiscontinuity = true;
                lastLegA.discontinuityCanBeCleared = true;
            }
        }
    }

    /**
     * Truncates a flight plan segment. If the active waypoint index is current in the segment,
     * a discontinuity will be added at the end of the active waypoint and the startIndex will
     * point to the next waypoint in the segment after the active.
     * @param type The type of segment to truncate.
     * @returns A segment to add to and a starting waypoint index.
     */
    public truncateSegment(type: SegmentType): { _startIndex: number, segment: FlightPlanSegment } {
        let segment = this.getSegment(type);
        // const startIndex = this.findSegmentByWaypointIndex(this.activeWaypointIndex) === segment
        //     ? this.activeWaypointIndex + 1
        //     : segment.offset;
        const startIndex = segment.offset;

        if (segment !== FlightPlanSegment.Empty) {
            const finalIndex = segment.offset + segment.waypoints.length;
            if (startIndex < finalIndex) {
                for (let i = startIndex; i < finalIndex; i++) {
                    // console.log(' MFP ---> truncateSegment: removing waypoint ', this.getWaypoint(startIndex).ident);
                    this.removeWaypoint(startIndex);
                }
            }
        }

        if (segment.waypoints.length === 0) {
            this.removeSegment(segment.type);
            segment = FlightPlanSegment.Empty;
        } else {
            const waypoint = segment.waypoints[Math.max((startIndex - 1) - segment.offset, 0)];
            waypoint.endsInDiscontinuity = true;
            waypoint.discontinuityCanBeCleared = true;
        }

        return { _startIndex: startIndex, segment };
    }

    /**
     * Converts a plain object into a ManagedFlightPlan.
     * @param flightPlanObject The object to convert.
     * @param parentInstrument The parent instrument attached to this flight plan.
     * @returns The converted ManagedFlightPlan.
     */
    public static fromObject(flightPlanObject: any, parentInstrument: BaseInstrument): ManagedFlightPlan {
        const plan = Object.assign(new ManagedFlightPlan(), flightPlanObject);
        plan.setParentInstrument(parentInstrument);

        plan.directTo = Object.assign(new DirectTo(), plan.directTo);

        const mapObject = (obj: any, parentType?: string): any => {
            if (obj && obj.infos) {
                obj = Object.assign(new WayPoint(parentInstrument), obj);
            }

            if (obj && obj.coordinates) {
                switch (parentType) {
                case 'A':
                    obj = Object.assign(new AirportInfo(parentInstrument), obj);
                    break;
                case 'W':
                    obj = Object.assign(new IntersectionInfo(parentInstrument), obj);
                    break;
                case 'V':
                    obj = Object.assign(new VORInfo(parentInstrument), obj);
                    break;
                case 'N':
                    obj = Object.assign(new NDBInfo(parentInstrument), obj);
                    break;
                default:
                    obj = Object.assign(new WayPointInfo(parentInstrument), obj);
                }

                obj.coordinates = Object.assign(new LatLongAlt(), obj.coordinates);
            }

            return obj;
        };

        const visitObject = (obj: any): any => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] && obj[key].scroll === undefined) {
                    if (Array.isArray(obj[key])) {
                        visitArray(obj[key]);
                    } else {
                        visitObject(obj[key]);
                    }

                    obj[key] = mapObject(obj[key], obj.type);
                }
            }
        };

        const visitArray = (array) => {
            array.forEach((item, index) => {
                if (Array.isArray(item)) {
                    visitArray(item);
                } else if (typeof item === 'object') {
                    visitObject(item);
                }

                array[index] = mapObject(item);
            });
        };

        visitObject(plan);
        return plan;
    }

    private legDataMatches(a: WayPoint, b: WayPoint, fields: string[]) {
        return fields.every((field) => a.additionalData[field] === b.additionalData[field]);
    }

    private isLegDuplicate(a: WayPoint, b: WayPoint): boolean {
        if (a.additionalData.legType === b.additionalData.legType) {
            switch (a.additionalData.legType) {
            case LegType.AF:
            case LegType.CR:
            case LegType.VR:
                return this.legDataMatches(a, b, ['course', 'theta', 'recommendedIcao']);
            case LegType.CA:
            case LegType.VA:
                return this.legDataMatches(a, b, ['course']) && a.legAltitude1 === b.legAltitude1;
            case LegType.CD:
            case LegType.VD:
                return this.legDataMatches(a, b, ['course', 'distance', 'recommendedIcao']);
            case LegType.CF:
                return this.legDataMatches(a, b, ['course']) && a.icao === b.icao;
            case LegType.CI:
            case LegType.VI:
            case LegType.VM:
                return this.legDataMatches(a, b, ['course']);
            case LegType.DF:
            case LegType.IF:
            case LegType.TF:
                return a.icao === b.icao;
            case LegType.FA:
                return a.icao === b.icao && a.legAltitude1 === b.legAltitude1;
            case LegType.FC:
                return this.legDataMatches(a, b, ['course', 'distance']) && a.icao === b.icao;
            case LegType.FD:
                return this.legDataMatches(a, b, ['course', 'distance', 'recommendedIcao']) && a.icao === b.icao;
            case LegType.FM:
                return this.legDataMatches(a, b, ['course']) && a.icao === b.icao;
            case LegType.HA:
                return this.legDataMatches(a, b, ['course', 'distance', 'distanceInMinutes']) && a.icao === b.icao && a.legAltitude1 === b.legAltitude1;
            case LegType.HF:
            case LegType.HM:
            case LegType.PI:
                return this.legDataMatches(a, b, ['course', 'distance', 'distanceInMinutes']) && a.icao === b.icao;
            case LegType.RF:
                return this.legDataMatches(a, b, ['center', 'radius']) && a.icao === b.icao;
            default:
            }
        } else if (ManagedFlightPlan.isXfLeg(a) && ManagedFlightPlan.isXfLeg(b)
            || ManagedFlightPlan.isFxLeg(a) && ManagedFlightPlan.isFxLeg(b)) {
            return a.icao === b.icao;
        }

        return false;
    }

    private addWaypointAvoidingDuplicates(waypoint: WayPoint, waypointIndex: number, segment: FlightPlanSegment): void {
        const index = this.waypoints.findIndex((wp) => this.isLegDuplicate(waypoint, wp));

        // FIXME this should collapse any legs between the old position and the newly inserted position
        const wptDist = Math.abs(index - waypointIndex);

        if (index !== -1 && wptDist <= 2) {
            // console.log('  -------> MFP: addWaypointAvoidingDuplicates: removing duplicate waypoint ', this.getWaypoint(index).ident);
            const removedWp = this.getWaypoint(index);
            if (waypoint.legAltitudeDescription === AltitudeDescriptor.Empty && removedWp.legAltitudeDescription !== AltitudeDescriptor.Empty) {
                waypoint.legAltitudeDescription = removedWp.legAltitudeDescription;
                waypoint.legAltitude1 = removedWp.legAltitude1;
                waypoint.legAltitude2 = removedWp.legAltitude2;
            }
            if (waypoint.speedConstraint <= 0 && removedWp.speedConstraint > 0) {
                waypoint.speedConstraint = removedWp.speedConstraint;
            }
            this.removeWaypoint(index);
        }
        this.addWaypoint(waypoint, waypointIndex, segment.type);
    }

    public getOriginRunway(): OneWayRunway | null {
        if (this.originAirfield) {
            if (this.procedureDetails.originRunwayIndex >= 0) {
                return this.originAirfield.infos.oneWayRunways[this.procedureDetails.originRunwayIndex];
            }
        }
        return null;
    }

    public getDestinationRunway(): OneWayRunway | null {
        if (this.destinationAirfield) {
            if (this.procedureDetails.destinationRunwayIndex >= 0) {
                return this.destinationAirfield.infos.oneWayRunways[this.procedureDetails.destinationRunwayIndex];
            }
        }
        return null;
    }

    get manualHoldActive(): boolean {
        return this.waypoints[this.activeWaypointIndex]?.additionalData?.legType === LegType.HM;
    }

    get glideslopeIntercept(): number | undefined {
        const appr = this.getSegment(SegmentType.Approach);
        for (const wp of appr.waypoints) {
            if (wp.additionalData.fixTypeFlags & FixTypeFlags.FAF && (wp.legAltitudeDescription === AltitudeDescriptor.G || wp.legAltitudeDescription === AltitudeDescriptor.H)) {
                return wp.legAltitude1;
            }
        }
        return undefined;
    }

    get destinationIndex(): number {
        const appr = this.getSegment(SegmentType.Approach);
        const index = appr.offset + appr.waypoints.length;
        if (this.destinationAirfield) {
            return index + 1;
        }
        return -1;
    }

    get finalApproachActive(): boolean {
        const appr = this.getSegment(SegmentType.Approach);
        if (appr === FlightPlanSegment.Empty) {
            return false;
        }

        const offset = this.activeWaypointIndex - appr.offset;
        if (offset >= 0 && offset < appr.waypoints.length) {
            for (const [index, wp] of appr.waypoints.entries()) {
                if (wp.additionalData.fixTypeFlags & FixTypeFlags.FAF) {
                    return offset >= index;
                }
            }
        }

        return false;
    }
}
