import { FlightPathUtils } from '../flightplan';
import { GeoCircle, GeoPoint, GeoPointSubject } from '../geo';
import { UnitType } from '../math';
import { Subject } from '../sub/Subject';
import { FacilityType, ICAO } from './Facilities';
/**
 * A collection of unique string waypoint type keys.
 */
export var WaypointTypes;
(function (WaypointTypes) {
    WaypointTypes["Custom"] = "Custom";
    WaypointTypes["Airport"] = "Airport";
    WaypointTypes["NDB"] = "NDB";
    WaypointTypes["VOR"] = "VOR";
    WaypointTypes["Intersection"] = "Intersection";
    WaypointTypes["Runway"] = "Runway";
    WaypointTypes["User"] = "User";
    WaypointTypes["Visual"] = "Visual";
    WaypointTypes["FlightPlan"] = "FlightPlan";
    WaypointTypes["VNAV"] = "VNAV";
})(WaypointTypes || (WaypointTypes = {}));
/**
 * An abstract implementation of Waypoint.
 */
export class AbstractWaypoint {
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(other) {
        return this.uid === other.uid;
    }
}
/**
 * A waypoint with custom defined lat/lon coordinates.
 */
export class CustomWaypoint extends AbstractWaypoint {
    // eslint-disable-next-line jsdoc/require-jsdoc
    constructor(arg1, arg2, arg3) {
        super();
        let location;
        let uid;
        if (typeof arg1 === 'number') {
            location = GeoPointSubject.createFromGeoPoint(new GeoPoint(arg1, arg2));
            uid = `${arg3}[${location.get().lat},${location.get().lon}]`;
        }
        else {
            location = arg1;
            uid = arg2;
        }
        this._location = location;
        this._uid = uid;
    }
    /** @inheritdoc */
    get location() {
        return this._location;
    }
    /** @inheritdoc */
    get uid() {
        return this._uid;
    }
    /** @inheritdoc */
    get type() {
        return WaypointTypes.Custom;
    }
}
/**
 * A waypoint associated with a facility.
 */
export class FacilityWaypoint extends AbstractWaypoint {
    /**
     * Constructor.
     * @param facility The facility associated with this waypoint.
     * @param bus The event bus.
     */
    constructor(facility, bus) {
        super();
        this.bus = bus;
        this._facility = Subject.create(facility);
        this._location = GeoPointSubject.createFromGeoPoint(new GeoPoint(facility.lat, facility.lon));
        this._type = FacilityWaypoint.getType(facility);
        const facType = ICAO.getFacilityType(facility.icao);
        if (facType === FacilityType.VIS || facType === FacilityType.USR) {
            // These types of facilities can be mutated. So we need to listen to the event bus for change events and respond
            // accordingly.
            this.facChangeSub = this.bus.getSubscriber()
                .on(`facility_changed_${facility.icao}`)
                .handle(newFacility => {
                this._facility.set(newFacility);
                this._location.set(newFacility.lat, newFacility.lon);
            });
        }
    }
    /** @inheritdoc */
    get location() {
        return this._location;
    }
    /** @inheritdoc */
    get uid() {
        return this.facility.get().icao;
    }
    /** @inheritdoc */
    get type() {
        return this._type;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The facility associated with this waypoint.
     */
    get facility() {
        return this._facility;
    }
    /**
     * Gets a waypoint type from a facility.
     * @param facility A facility.
     * @returns The waypoint type corresponding to the facility.
     */
    static getType(facility) {
        switch (ICAO.getFacilityType(facility.icao)) {
            case FacilityType.Airport:
                return WaypointTypes.Airport;
            case FacilityType.Intersection:
                return WaypointTypes.Intersection;
            case FacilityType.NDB:
                return WaypointTypes.NDB;
            case FacilityType.RWY:
                return WaypointTypes.Runway;
            case FacilityType.USR:
                return WaypointTypes.User;
            case FacilityType.VIS:
                return WaypointTypes.Visual;
            case FacilityType.VOR:
                return WaypointTypes.VOR;
            default:
                return WaypointTypes.User;
        }
    }
}
/**
 * A flight path waypoint.
 */
export class FlightPathWaypoint extends CustomWaypoint {
    // eslint-disable-next-line jsdoc/require-jsdoc
    constructor(arg1, arg2, ident) {
        if (typeof arg1 === 'number') {
            super(arg1, arg2, `${FlightPathWaypoint.UID_PREFIX}_${ident}`);
        }
        else {
            super(arg1, arg2);
        }
        this.ident = ident;
    }
    /** @inheritdoc */
    get type() { return WaypointTypes.FlightPlan; }
}
FlightPathWaypoint.UID_PREFIX = 'FLPTH';
/**
 * A VNAV TOD/BOD waypoint.
 */
export class VNavWaypoint extends AbstractWaypoint {
    /**
     * Constructor.
     * @param leg The leg that the VNAV waypoint is contained in.
     * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
     * in meters.
     * @param type The type of VNAV leg.
     */
    constructor(leg, distanceFromEnd, type) {
        super();
        this._uid = VNavWaypoint.uidMap[type];
        this._location = GeoPointSubject.createFromGeoPoint(this.getWaypointLocation(leg, distanceFromEnd));
    }
    /** @inheritdoc */
    get type() { return WaypointTypes.VNAV; }
    /**
     * Gets the waypoint's location in space.
     * @param leg The leg that the waypoint resides in.
     * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
     * in meters.
     * @returns The waypoint's location.
     */
    getWaypointLocation(leg, distanceFromEnd) {
        const out = new GeoPoint(0, 0);
        if (leg.calculated !== undefined) {
            const vectors = [...leg.calculated.ingress, ...leg.calculated.ingressToEgress, ...leg.calculated.egress];
            let vectorIndex = vectors.length - 1;
            while (vectorIndex >= 0) {
                const vector = vectors[vectorIndex];
                const start = VNavWaypoint.vec3Cache[0];
                const end = VNavWaypoint.vec3Cache[1];
                GeoPoint.sphericalToCartesian(vector.endLat, vector.endLon, end);
                GeoPoint.sphericalToCartesian(vector.startLat, vector.startLon, start);
                const circle = FlightPathUtils.setGeoCircleFromVector(vector, VNavWaypoint.geoCircleCache[0]);
                const vectorDistance = UnitType.GA_RADIAN.convertTo(circle.distanceAlong(start, end), UnitType.METER);
                if (vectorDistance >= distanceFromEnd) {
                    return circle.offsetDistanceAlong(end, UnitType.METER.convertTo(-distanceFromEnd, UnitType.GA_RADIAN), out);
                }
                else {
                    distanceFromEnd -= vectorDistance;
                }
                vectorIndex--;
            }
            if (vectors.length > 0) {
                out.set(vectors[0].startLat, vectors[0].startLon);
            }
        }
        return out;
    }
    /** @inheritdoc */
    get location() {
        return this._location;
    }
    /** @inheritdoc */
    get uid() {
        return this._uid;
    }
}
VNavWaypoint.uidMap = { 'tod': 'vnav-tod', 'bod': 'vnav-bod' };
VNavWaypoint.vec3Cache = [new Float64Array(3), new Float64Array(3)];
VNavWaypoint.geoPointCache = [new GeoPoint(0, 0)];
VNavWaypoint.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
