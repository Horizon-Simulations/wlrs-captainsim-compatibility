import { EventBus } from '../data/EventBus';
import { LegDefinition } from '../flightplan';
import { GeoPointInterface } from '../geo';
import { Subscribable } from '../sub/Subscribable';
import { Facility } from './Facilities';
/**
 * A collection of unique string waypoint type keys.
 */
export declare enum WaypointTypes {
    Custom = "Custom",
    Airport = "Airport",
    NDB = "NDB",
    VOR = "VOR",
    Intersection = "Intersection",
    Runway = "Runway",
    User = "User",
    Visual = "Visual",
    FlightPlan = "FlightPlan",
    VNAV = "VNAV"
}
/**
 * A navigational waypoint.
 */
export interface Waypoint {
    /** The geographic location of the waypoint. */
    readonly location: Subscribable<GeoPointInterface>;
    /** A unique string ID assigned to this waypoint. */
    readonly uid: string;
    /**
     * Checks whether this waypoint and another are equal.
     * @param other The other waypoint.
     * @returns whether this waypoint and the other are equal.
     */
    equals(other: Waypoint): boolean;
    /** The unique string type of this waypoint. */
    readonly type: string;
}
/**
 * An abstract implementation of Waypoint.
 */
export declare abstract class AbstractWaypoint implements Waypoint {
    abstract get location(): Subscribable<GeoPointInterface>;
    abstract get uid(): string;
    abstract get type(): string;
    equals(other: Waypoint): boolean;
}
/**
 * A waypoint with custom defined lat/lon coordinates.
 */
export declare class CustomWaypoint extends AbstractWaypoint {
    private readonly _location;
    private readonly _uid;
    /**
     * Constructor.
     * @param lat The latitude of this waypoint.
     * @param lon The longitude of this waypoint.
     * @param uidPrefix The prefix of this waypoint's UID.
     */
    constructor(lat: number, lon: number, uidPrefix: string);
    /**
     * Constructor.
     * @param location A subscribable which provides the location of this waypoint.
     * @param uid This waypoint's UID.
     */
    constructor(location: Subscribable<GeoPointInterface>, uid: string);
    /** @inheritdoc */
    get location(): Subscribable<GeoPointInterface>;
    /** @inheritdoc */
    get uid(): string;
    /** @inheritdoc */
    get type(): string;
}
/**
 * A waypoint associated with a facility.
 */
export declare class FacilityWaypoint<T extends Facility = Facility> extends AbstractWaypoint {
    private readonly bus;
    private _facility;
    private readonly _location;
    private readonly _type;
    private facChangeSub?;
    /**
     * Constructor.
     * @param facility The facility associated with this waypoint.
     * @param bus The event bus.
     */
    constructor(facility: T, bus: EventBus);
    /** @inheritdoc */
    get location(): Subscribable<GeoPointInterface>;
    /** @inheritdoc */
    get uid(): string;
    /** @inheritdoc */
    get type(): string;
    /**
     * The facility associated with this waypoint.
     */
    get facility(): Subscribable<T>;
    /**
     * Gets a waypoint type from a facility.
     * @param facility A facility.
     * @returns The waypoint type corresponding to the facility.
     */
    private static getType;
}
/**
 * A flight path waypoint.
 */
export declare class FlightPathWaypoint extends CustomWaypoint {
    static readonly UID_PREFIX = "FLPTH";
    /** The ident string of this waypoint. */
    readonly ident: string;
    /** @inheritdoc */
    get type(): string;
    /**
     * Constructor.
     * @param lat The latitude of this waypoint.
     * @param lon The longitude of this waypoint.
     * @param ident The ident string of this waypoint.
     */
    constructor(lat: number, lon: number, ident: string);
    /**
     * Constructor.
     * @param location A subscribable which provides the location of this waypoint.
     * @param uid This waypoint's UID.
     * @param ident The ident string of this waypoint.
     */
    constructor(location: Subscribable<GeoPointInterface>, uid: string, ident: string);
}
/**
 * A VNAV TOD/BOD waypoint.
 */
export declare class VNavWaypoint extends AbstractWaypoint {
    private static readonly uidMap;
    private static readonly vec3Cache;
    private static readonly geoPointCache;
    private static readonly geoCircleCache;
    private readonly _location;
    private readonly _uid;
    /** @inheritdoc */
    get type(): string;
    /**
     * Constructor.
     * @param leg The leg that the VNAV waypoint is contained in.
     * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
     * in meters.
     * @param type The type of VNAV leg.
     */
    constructor(leg: LegDefinition, distanceFromEnd: number, type: 'tod' | 'bod');
    /**
     * Gets the waypoint's location in space.
     * @param leg The leg that the waypoint resides in.
     * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
     * in meters.
     * @returns The waypoint's location.
     */
    private getWaypointLocation;
    /** @inheritdoc */
    get location(): Subscribable<GeoPointInterface>;
    /** @inheritdoc */
    get uid(): string;
}
//# sourceMappingURL=Waypoint.d.ts.map