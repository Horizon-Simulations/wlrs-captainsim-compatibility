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

import { HoldData, HoldType } from '@aims/flightplanning/data/flightplan';
import { firstSmallCircleIntersection } from 'msfs-geo';
import { AltitudeDescriptor, FixTypeFlags, LegType } from '../types/fstypes/FSEnums';
import { FixNamingScheme } from './FixNamingScheme';
import { GeoMath } from './GeoMath';
import { RawDataMapper } from './RawDataMapper';

/**
 * Creates a collection of waypoints from a legs procedure.
 */
export class LegsProcedure {
  /** The current index in the procedure. */
  private _currentIndex = 0;

  /** Whether or not there is a discontinuity pending to be mapped. */
  private _isDiscontinuityPending = false;

  /** A collection of the loaded facilities needed for this procedure. */
  private _facilities = new Map<string, any>();

  /** Whether or not the facilities have completed loading. */
  private _facilitiesLoaded = false;

  /** The collection of facility promises to await on first load. */
  private _facilitiesToLoad = new Map();

  /** Whether or not a non initial-fix procedure start has been added to the procedure. */
  private _addedProcedureStart = false;

  /** A normalization factor for calculating distances from triangular ratios. */
  public static distanceNormalFactorNM = (21639 / 2) * Math.PI;

  /** A collection of filtering rules for filtering ICAO data to pre-load for the procedure. */
  private legFilteringRules: ((icao: string) => boolean)[] = [
      (icao) => icao.trim() !== '', // Icao is not empty
      (icao) => icao[0] !== 'R', // Icao is not runway icao, which is not searchable
      (icao) => icao[0] !== 'A', // Icao is not airport icao, which can be skipped
      (icao) => !this._facilitiesToLoad.has(icao), // Icao is not already being loaded
  ];

  /**
   * Creates an instance of a LegsProcedure.
   * @param legs The legs that are part of the procedure.
   * @param startingPoint The starting point for the procedure.
   * @param instrument The instrument that is attached to the flight plan.
   * @param approachType The approach type if this is an approach procedure
   */
  constructor(
      private _legs: RawProcedureLeg[],
      private _previousFix: WayPoint,
      private _instrument: BaseInstrument,
      private airportMagVar: number,
      private approachType?: ApproachType,
      private legAnnotations?: string[],
  ) {
      for (const leg of this._legs) {
          if (this.isIcaoValid(leg.fixIcao)) {
              this._facilitiesToLoad.set(leg.fixIcao, this._instrument.facilityLoader.getFacilityRaw(leg.fixIcao, 2000, true));
          }

          if (this.isIcaoValid(leg.originIcao)) {
              this._facilitiesToLoad.set(leg.originIcao, this._instrument.facilityLoader.getFacilityRaw(leg.originIcao, 2000, true));
          }

          if (this.isIcaoValid(leg.arcCenterFixIcao)) {
              this._facilitiesToLoad.set(leg.arcCenterFixIcao, this._instrument.facilityLoader.getFacilityRaw(leg.arcCenterFixIcao, 2000, true));
          }
      }
  }

  /**
   * Checks whether or not there are any legs remaining in the procedure.
   * @returns True if there is a next leg, false otherwise.
   */
  public hasNext(): boolean {
      return this._currentIndex < this._legs.length || this._isDiscontinuityPending;
  }

  private async ensureFacilitiesLoaded(): Promise<void> {
      if (!this._facilitiesLoaded) {
          const facilityResults = await Promise.all(this._facilitiesToLoad.values());
          for (const facility of facilityResults.filter((f) => f !== undefined)) {
              this._facilities.set(facility.icao, facility);
          }

          this._facilitiesLoaded = true;
      }
  }

  /**
   * Gets the next mapped leg from the procedure.
   * @returns The mapped waypoint from the leg of the procedure.
   */
  public async getNext(): Promise<WayPoint> {
      let isLegMappable = false;
      let mappedLeg: WayPoint;

      await this.ensureFacilitiesLoaded();

      while (!isLegMappable && this._currentIndex < this._legs.length) {
          const currentLeg = this._legs[this._currentIndex];
          const currentAnnotation = this.legAnnotations[this._currentIndex];
          isLegMappable = true;

          // Some procedures don't start with 15 (initial fix) but instead start with a heading and distance from
          // a fix: the procedure then starts with the fix exactly
          if (this._currentIndex === 0 && currentLeg.type === 10 && !this._addedProcedureStart) {
              mappedLeg = this.mapExactFix(currentLeg);
              this._addedProcedureStart = true;
          } else {
              try {
                  switch (currentLeg.type) {
                  case LegType.AF:
                  case LegType.PI:
                      mappedLeg = this.mapExactFix(currentLeg);
                      break;
                  case LegType.CD:
                  case LegType.VD:
                      mappedLeg = this.mapHeadingUntilDistanceFromOrigin(currentLeg, this._previousFix);
                      break;
                  case LegType.CF:
                      // Only map if the fix is itself not a runway fix to avoid double
                      // adding runway fixes
                      if (currentLeg.fixIcao === '' || currentLeg.fixIcao[0] !== 'R') {
                          mappedLeg = this.mapOriginRadialForDistance(currentLeg, this._previousFix);
                      } else {
                          isLegMappable = false;
                      }
                      break;
                  case LegType.CI:
                  case LegType.VI:
                      mappedLeg = this.mapHeadingToInterceptNextLeg(currentLeg, this._previousFix, this._legs[this._currentIndex + 1]);
                      break;
                  case LegType.CR:
                  case LegType.VR:
                      mappedLeg = this.mapHeadingUntilRadialCrossing(currentLeg, this._previousFix);
                      break;
                  case LegType.FC:
                  case LegType.FD:
                      mappedLeg = this.mapBearingAndDistanceFromOrigin(currentLeg);
                      break;
                  case LegType.FM:
                  case LegType.VM:
                      mappedLeg = this.mapVectors(currentLeg, this._previousFix);
                      break;
                  case LegType.IF:
                      if (currentLeg.fixIcao[0] !== 'A') {
                          const leg = this.mapExactFix(currentLeg);
                          const prevLeg = this._previousFix;

                          // If a type 15 (initial fix) comes up in the middle of a plan
                          if (leg.icao === prevLeg.icao && leg.infos.coordinates.lat === prevLeg.infos.coordinates.lat
                                && leg.infos.coordinates.long === prevLeg.infos.coordinates.long) {
                              isLegMappable = false;
                          } else {
                              mappedLeg = leg;
                          }
                      } else {
                          // If type 15 is an airport itself, we don't need to map it (and the data is generally wrong)
                          isLegMappable = false;
                      }
                      break;
                  case LegType.DF:
                  case LegType.TF:
                      // Only map if the fix is itself not a runway fix to avoid double
                      // adding runway fixes
                      if (currentLeg.fixIcao === '' || currentLeg.fixIcao[0] !== 'R') {
                          mappedLeg = this.mapExactFix(currentLeg);
                      } else {
                          isLegMappable = false;
                      }
                      break;
                  case LegType.RF:
                      mappedLeg = this.mapRadiusToFix(currentLeg);
                      break;
                  case LegType.CA:
                  case LegType.VA:
                      mappedLeg = this.mapHeadingUntilAltitude(currentLeg, this._previousFix);
                      break;
                  case LegType.HA:
                  case LegType.HF:
                  case LegType.HM:
                      mappedLeg = this.mapHold(currentLeg);
                      break;
                  default:
                      isLegMappable = false;
                      break;
                  }
              } catch (err) {
                  console.log(`LegsProcedure: Unexpected unmappable leg: ${err}`);
              }

              if (mappedLeg !== undefined) {
                  const magCorrection = this.getMagCorrection(currentLeg);

                  if (this.approachType === ApproachType.APPROACH_TYPE_ILS && (currentLeg.fixTypeFlags & FixTypeFlags.FAF) > 0) {
                      if (currentLeg.altDesc === AltitudeDescriptor.At) {
                          mappedLeg.legAltitudeDescription = AltitudeDescriptor.G;
                      } else {
                          mappedLeg.legAltitudeDescription = AltitudeDescriptor.H;
                      }
                  } else {
                      mappedLeg.legAltitudeDescription = currentLeg.altDesc;
                  }
                  mappedLeg.legAltitude1 = currentLeg.altitude1 * 3.28084;
                  mappedLeg.legAltitude2 = currentLeg.altitude2 * 3.28084;
                  mappedLeg.speedConstraint = currentLeg.speedRestriction;
                  mappedLeg.turnDirection = currentLeg.turnDirection;

                  const recNavaid: RawVor | RawNdb | undefined = this._facilities.get(currentLeg.originIcao) as RawVor | RawNdb | undefined;

                  mappedLeg.additionalData.legType = currentLeg.type;
                  mappedLeg.additionalData.overfly = currentLeg.flyOver;
                  mappedLeg.additionalData.fixTypeFlags = currentLeg.fixTypeFlags;
                  mappedLeg.additionalData.distance = currentLeg.distanceMinutes ? undefined : currentLeg.distance / 1852;
                  mappedLeg.additionalData.distanceInMinutes = currentLeg.distanceMinutes ? currentLeg.distance : undefined;
                  mappedLeg.additionalData.course = currentLeg.trueDegrees ? currentLeg.course : B77HS_Util.magneticToTrue(currentLeg.course, magCorrection);
                  mappedLeg.additionalData.recommendedIcao = currentLeg.originIcao.trim().length > 0 ? currentLeg.originIcao : undefined;
                  mappedLeg.additionalData.recommendedFrequency = recNavaid ? recNavaid.freqMHz : undefined;
                  mappedLeg.additionalData.recommendedLocation = recNavaid ? { lat: recNavaid.lat, long: recNavaid.lon } : undefined;
                  mappedLeg.additionalData.rho = currentLeg.rho / 1852;
                  mappedLeg.additionalData.theta = currentLeg.theta;
                  mappedLeg.additionalData.thetaTrue = B77HS_Util.magneticToTrue(currentLeg.theta, magCorrection);
                  mappedLeg.additionalData.annotation = currentAnnotation;
                  mappedLeg.additionalData.verticalAngle = currentLeg.verticalAngle ? currentLeg.verticalAngle - 360 : undefined;
              }

              this._currentIndex++;
          }
      }

      if (mappedLeg !== undefined) {
          this._previousFix = mappedLeg;
          return mappedLeg;
      }

      return undefined;
  }

  private getMagCorrection(currentLeg: RawProcedureLeg): number {
      // we try to interpret PANS OPs as accurately as possible within the limits of available data

      // magnetic tracks to/from a VOR always use VOR station declination
      if (currentLeg.fixIcao.charAt(0) === 'V') {
          const vor: RawVor = this.getLoadedFacility(currentLeg.fixIcao) as RawVor;
          if (!vor || vor.magneticVariation === undefined) {
              console.warn('Leg coded incorrectly (missing vor fix or station declination)', currentLeg, vor);
              return this.airportMagVar;
          }
          return 360 - vor.magneticVariation;
      }

      // we use station declination for VOR/DME approaches
      if (this.approachType === ApproachType.APPROACH_TYPE_VORDME) {
      // find a leg with the reference navaid for the procedure
          for (let i = this._legs.length - 1; i >= 0; i--) {
              if (this._legs[i].originIcao.trim().length > 0) {
                  const recNavaid: RawVor = this.getLoadedFacility(this._legs[i].originIcao) as RawVor;
                  if (recNavaid && recNavaid.magneticVariation !== undefined) {
                      return 360 - recNavaid.magneticVariation;
                  }
              }
          }
          console.warn('VOR/DME approach coded incorrectly (missing recommended navaid or station declination)', currentLeg);
          return this.airportMagVar;
      }

      // for RNAV procedures use recommended navaid station declination for these leg types
      let useStationDeclination = (currentLeg.type === LegType.CF || currentLeg.type === LegType.FA || currentLeg.type === LegType.FM);

      // for localiser bearings (i.e. at or beyond FACF), always use airport value
      if (this.approachType === ApproachType.APPROACH_TYPE_ILS || this.approachType === ApproachType.APPROACH_TYPE_LOCALIZER) {
          useStationDeclination = useStationDeclination && this._legs.indexOf(currentLeg) < this.getFacfIndex();
      }

      if (useStationDeclination) {
          const recNavaid: RawVor = this.getLoadedFacility(currentLeg.originIcao) as RawVor;
          if (!recNavaid || recNavaid.magneticVariation === undefined) {
              console.warn('Leg coded incorrectly (missing recommended navaid or station declination)', currentLeg, recNavaid);
              return this.airportMagVar;
          }
          return 360 - recNavaid.magneticVariation;
      }

      // for all other terminal procedure legs we use airport magnetic variation
      return this.airportMagVar;
  }

  private getLoadedFacility(icao: string): RawFacility {
      const facility = this._facilities.get(icao);
      if (!facility) {
          throw new Error(`Failed to load facility: ${icao}`);
      }
      return facility;
  }

  private getFacfIndex(): number {
      if (this.approachType !== undefined) {
          for (let i = this._legs.length - 1; i >= 0; i--) {
              if (this._legs[i].fixTypeFlags & FixTypeFlags.IF) {
                  return i;
              }
          }
      }

      return undefined;
  }

  /**
   * Maps a heading until distance from origin leg.
   * @param leg The procedure leg to map.
   * @param prevLeg The previously mapped waypoint in the procedure.
   * @returns The mapped leg.
   */
  public mapHeadingUntilDistanceFromOrigin(leg: RawProcedureLeg, prevLeg: WayPoint): WayPoint {
      const origin = this.getLoadedFacility(leg.originIcao);
      const originIdent = origin.icao.substring(7, 12).trim();

      const bearingToOrigin = Avionics.Utils.computeGreatCircleHeading(prevLeg.infos.coordinates, new LatLongAlt(origin.lat, origin.lon));
      const distanceToOrigin = Avionics.Utils.computeGreatCircleDistance(prevLeg.infos.coordinates, new LatLongAlt(origin.lat, origin.lon)) / LegsProcedure.distanceNormalFactorNM;

      const deltaAngle = this.deltaAngleRadians(bearingToOrigin, leg.course);
      const targetDistance = (leg.distance / 1852) / LegsProcedure.distanceNormalFactorNM;

      const distanceAngle = Math.asin((Math.sin(distanceToOrigin) * Math.sin(deltaAngle)) / Math.sin(targetDistance));
      const inverseDistanceAngle = Math.PI - distanceAngle;

      const legDistance1 = 2 * Math.atan(Math.tan(0.5 * (targetDistance - distanceToOrigin)) * (Math.sin(0.5 * (deltaAngle + distanceAngle))
      / Math.sin(0.5 * (deltaAngle - distanceAngle))));

      const legDistance2 = 2 * Math.atan(Math.tan(0.5 * (targetDistance - distanceToOrigin)) * (Math.sin(0.5 * (deltaAngle + inverseDistanceAngle))
      / Math.sin(0.5 * (deltaAngle - inverseDistanceAngle))));

      const legDistance = targetDistance > distanceToOrigin ? legDistance1 : Math.min(legDistance1, legDistance2);
      const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
      const coordinates = Avionics.Utils.bearingDistanceToCoordinates(
          course,
          legDistance * LegsProcedure.distanceNormalFactorNM, prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long,
      );

      const waypoint = this.buildWaypoint(`${originIdent.substring(0, 3)}/${Math.round(leg.distance / 1852).toString().padStart(2, '0')}`, coordinates);

      return waypoint;
  }

  /**
   * Maps an FC or FD leg in the procedure.
   * @note FC and FD legs are mapped to CF legs in the real FMS
   * @todo move the code into the CF leg (maybe static functions fromFc and fromFd to construct the leg)
   * @todo FD should overfly the termination... needs a messy refactor to do that
   * @param leg The procedure leg to map.
   * @returns The mapped leg.
   */
  public mapBearingAndDistanceFromOrigin(leg: RawProcedureLeg): WayPoint {
      const origin = this.getLoadedFacility(leg.fixIcao);
      const originIdent = origin.icao.substring(7, 12).trim();
      const course = leg.trueDegrees ? leg.course : B77HS_Util.magneticToTrue(leg.course, Facilities.getMagVar(origin.lat, origin.lon));
      // this is the leg length for FC, and the DME distance for FD
      const refDistance = leg.distance / 1852;

      let termPoint;
      let legLength;
      if (leg.type === LegType.FD) {
          const recNavaid = this.getLoadedFacility(leg.originIcao);
          termPoint = firstSmallCircleIntersection(
              { lat: recNavaid.lat, long: recNavaid.lon },
              refDistance,
              { lat: origin.lat, long: origin.lon },
              course,
          );
          legLength = Avionics.Utils.computeGreatCircleDistance(
              { lat: origin.lat, long: origin.lon },
              termPoint,
          );
      } else { // FC
          termPoint = Avionics.Utils.bearingDistanceToCoordinates(
              course,
              refDistance,
              origin.lat,
              origin.lon,
          );
          legLength = refDistance;
      }

      return this.buildWaypoint(`${originIdent.substring(0, 3)}/${Math.round(legLength).toString().padStart(2, '0')}`, termPoint);
  }

  /**
   * Maps a radial on the origin for a specified distance leg in the procedure.
   * @param leg The procedure leg to map.
   * @param prevLeg The previously mapped leg.
   * @returns The mapped leg.
   */
  public mapOriginRadialForDistance(leg: RawProcedureLeg, prevLeg: WayPoint): WayPoint {
      if (leg.fixIcao.trim() !== '') {
          return this.mapExactFix(leg);
      }

      const origin = this.getLoadedFacility(leg.originIcao);
      const originIdent = origin.icao.substring(7, 12).trim();

      const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
      const coordinates = Avionics.Utils.bearingDistanceToCoordinates(course, leg.distance / 1852, prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);

      const distanceFromOrigin = Avionics.Utils.computeGreatCircleDistance(new LatLongAlt(origin.lat, origin.lon), coordinates);
      return this.buildWaypoint(`${originIdent}${Math.trunc(distanceFromOrigin / 1852)}`, coordinates);
  }

  /**
   * Maps a heading turn to intercept the next leg in the procedure.
   * @param leg The procedure leg to map.
   * @param prevLeg The previously mapped leg.
   * @param nextLeg The next leg in the procedure to intercept.
   * @returns The mapped leg.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public mapHeadingToInterceptNextLeg(leg: RawProcedureLeg, prevLeg: WayPoint, nextLeg: RawProcedureLeg): WayPoint | null {
      const magVar = Facilities.getMagVar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
      const course = leg.trueDegrees ? leg.course : B77HS_Util.magneticToTrue(leg.course, magVar);

      const coordinates = GeoMath.relativeBearingDistanceToCoords(course, 1, prevLeg.infos.coordinates);
      const waypoint = this.buildWaypoint(FixNamingScheme.courseToIntercept(course), coordinates, prevLeg.infos.magneticVariation);

      return waypoint;
  }

  /**
   * Maps flying a heading until crossing a radial of a reference fix.
   * @param leg The procedure leg to map.
   * @param prevLeg The previously mapped leg.
   * @returns The mapped leg.
   */
  public mapHeadingUntilRadialCrossing(leg: RawProcedureLeg, prevLeg: WayPoint) {
      const origin = this.getLoadedFacility(leg.originIcao);
      const originCoordinates = new LatLongAlt(origin.lat, origin.lon);

      const originToCoordinates = Avionics.Utils.computeGreatCircleHeading(originCoordinates, prevLeg.infos.coordinates);
      const coordinatesToOrigin = Avionics.Utils.computeGreatCircleHeading(prevLeg.infos.coordinates, new LatLongAlt(origin.lat, origin.lon));
      const distanceToOrigin = Avionics.Utils.computeGreatCircleDistance(prevLeg.infos.coordinates, originCoordinates) / LegsProcedure.distanceNormalFactorNM;

      const alpha = this.deltaAngleRadians(coordinatesToOrigin, leg.course);
      const beta = this.deltaAngleRadians(originToCoordinates, leg.theta);

      const gamma = Math.acos(Math.sin(alpha) * Math.sin(beta) * Math.cos(distanceToOrigin) - Math.cos(alpha) * Math.cos(beta));
      const legDistance = Math.acos((Math.cos(beta) + Math.cos(alpha) * Math.cos(gamma)) / (Math.sin(alpha) * Math.sin(gamma)));

      const magVar = Facilities.getMagVar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
      const course = leg.trueDegrees ? leg.course : B77HS_Util.magneticToTrue(leg.course, magVar);

      const coordinates = Avionics.Utils.bearingDistanceToCoordinates(
          course,
          legDistance * LegsProcedure.distanceNormalFactorNM, prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long,
      );

      const waypoint = this.buildWaypoint(`${this.getIdent(origin.icao)}${leg.theta}`, coordinates);

      return waypoint;
  }

  /**
   * Maps flying a heading until a proscribed altitude.
   * @param leg The procedure leg to map.
   * @param prevLeg The previous leg in the procedure.
   * @returns The mapped leg.
   */
  public mapHeadingUntilAltitude(leg: RawProcedureLeg, prevLeg: WayPoint) {
      const magVar = Facilities.getMagVar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
      const course = leg.trueDegrees ? leg.course : B77HS_Util.magneticToTrue(leg.course, magVar);
      // const heading = leg.trueDegrees ? B77HS_Util.trueToMagnetic(leg.course, magVar) : leg.course;
      const altitudeFeet = (leg.altitude1 * 3.2808399);
      const distanceInNM = altitudeFeet / 500.0;

      const coordinates = GeoMath.relativeBearingDistanceToCoords(course, distanceInNM, prevLeg.infos.coordinates);
      const waypoint = this.buildWaypoint(FixNamingScheme.headingUntilAltitude(altitudeFeet), coordinates, prevLeg.infos.magneticVariation);

      waypoint.additionalData.vectorsAltitude = altitudeFeet;

      return waypoint;
  }

  /**
   * Maps a vectors instruction.
   * @param leg The procedure leg to map.
   * @param prevLeg The previous leg in the procedure.
   * @returns The mapped leg.
   */
  public mapVectors(leg: RawProcedureLeg, prevLeg: WayPoint) {
      const magVar = Facilities.getMagVar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
      const course = leg.trueDegrees ? leg.course : B77HS_Util.magneticToTrue(leg.course, magVar);
      // const heading = leg.trueDegrees ? B77HS_Util.trueToMagnetic(leg.course, magVar) : leg.course;
      const coordinates = GeoMath.relativeBearingDistanceToCoords(course, 1, prevLeg.infos.coordinates);

      const waypoint = this.buildWaypoint(FixNamingScheme.vector(), coordinates);
      waypoint.isVectors = true;
      waypoint.endsInDiscontinuity = true;
      waypoint.discontinuityCanBeCleared = false;

      return waypoint;
  }

  /**
   * Maps an exact fix leg in the procedure.
   * @param leg The procedure leg to map.
   * @returns The mapped leg.
   */
  public mapExactFix(leg: RawProcedureLeg): WayPoint {
      const facility = this.getLoadedFacility(leg.fixIcao);
      return RawDataMapper.toWaypoint(facility, this._instrument);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public mapArcToFix(leg: RawProcedureLeg, prevLeg: WayPoint): WayPoint {
      const toFix = this.getLoadedFacility(leg.fixIcao);
      const waypoint = RawDataMapper.toWaypoint(toFix, this._instrument);
      return waypoint;
  }

  public mapRadiusToFix(leg: RawProcedureLeg): WayPoint {
      const arcCentreFix = this.getLoadedFacility(leg.arcCenterFixIcao);
      const arcCenterCoordinates = new LatLongAlt(arcCentreFix.lat, arcCentreFix.lon, 0);

      const toFix = this.getLoadedFacility(leg.fixIcao);
      const toCoordinates = new LatLongAlt(toFix.lat, toFix.lon, 0);

      const radius = Avionics.Utils.computeGreatCircleDistance(arcCenterCoordinates, toCoordinates);
      const waypoint = RawDataMapper.toWaypoint(toFix, this._instrument);

      waypoint.additionalData.radius = radius;
      waypoint.additionalData.center = arcCenterCoordinates;

      return waypoint;
  }

  public mapHold(leg: RawProcedureLeg): WayPoint {
      const facility = this.getLoadedFacility(leg.fixIcao);
      const waypoint = RawDataMapper.toWaypoint(facility, this._instrument);

      const magVar = Facilities.getMagVar(facility.lat, facility.lon);

      (waypoint.additionalData.defaultHold as HoldData) = {
          inboundMagneticCourse: leg.trueDegrees ? B77HS_Util.trueToMagnetic(leg.course, magVar) : leg.course,
          turnDirection: leg.turnDirection,
          distance: leg.distanceMinutes ? undefined : leg.distance / 1852,
          time: leg.distanceMinutes ? leg.distance : undefined,
          type: HoldType.Database,
      };
      waypoint.additionalData.modifiedHold = {};

      return waypoint;
  }

  /**
   * Gets the difference between two headings in zero north normalized radians.
   * @param a The degrees of heading a.
   * @param b The degrees of heading b.
   * @returns The difference between the two headings in zero north normalized radians.
   */
  private deltaAngleRadians(a: number, b: number): number {
      return Math.abs((Avionics.Utils.fmod((a - b) + 180, 360) - 180) * Avionics.Utils.DEG2RAD);
  }

  /**
   * Gets an ident from an ICAO.
   * @param icao The icao to pull the ident from.
   * @returns The parsed ident.
   */
  private getIdent(icao: string): string {
      return icao.substring(7, 12).trim();
  }

  /**
   * Checks if an ICAO is valid to load.
   * @param icao The icao to check.
   * @returns Whether or not the ICAO is valid.
   */
  private isIcaoValid(icao: string): boolean {
      for (const rule of this.legFilteringRules) {
          if (!rule(icao)) {
              return false;
          }
      }

      return true;
  }

  /**
   * Builds a WayPoint from basic data.
   * @param ident The ident of the waypoint.
   * @param coordinates The coordinates of the waypoint.
   * @param magneticVariation The magnetic variation of the waypoint, if any.
   * @returns The built waypoint.
   */
  public buildWaypoint(ident: string, coordinates: LatLongAlt, magneticVariation?: number): WayPoint {
      const waypoint = new WayPoint(this._instrument);
      waypoint.type = 'W';

      waypoint.infos = new IntersectionInfo(this._instrument);
      waypoint.infos.coordinates = coordinates;
      waypoint.infos.magneticVariation = magneticVariation;

      waypoint.ident = ident;
      waypoint.infos.ident = ident;

      waypoint.additionalData = {};

      return waypoint;
  }
}
