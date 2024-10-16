import { EventBus } from '../../data';
import { SimVarPublisher } from '../../instruments';
/**
 * LNAV transition modes.
 */
export declare enum LNavTransitionMode {
    /** LNAV is attempting to track a non-transition vector. */
    None = 0,
    /** LNAV is attempting to track an ingress vector. */
    Ingress = 1,
    /** LNAV is attempting to track an egress vector. */
    Egress = 2
}
/**
 * Sim var names for LNAV data.
 */
export declare enum LNavVars {
    /** The current desired track, in degrees true. */
    DTK = "L:WTAP_LNav_DTK",
    /**
     * The current crosstrack error. Negative values indicate deviation to the left, as viewed when facing in the
     * direction of the track. Positive values indicate deviation to the right.
     */
    XTK = "L:WTAP_LNav_XTK",
    /** Whether LNAV is tracking a path. */
    IsTracking = "L:WTAP_LNav_Is_Tracking",
    /** The global leg index of the flight plan leg LNAV is currently tracking. */
    TrackedLegIndex = "L:WTAP_LNav_Tracked_Leg_Index",
    /** The currently active LNAV transition mode. */
    TransitionMode = "L:WTAP_LNav_Transition_Mode",
    /** The index of the vector LNAV is currently tracking. */
    TrackedVectorIndex = "L:WTAP_LNav_Tracked_Vector_Index",
    /** The current course LNAV is attempting to steer, in degrees true. */
    CourseToSteer = "L:WTAP_LNav_Course_To_Steer",
    /** Whether LNAV sequencing is suspended. */
    IsSuspended = "L:WTAP_LNav_Is_Suspended",
    /**
     * The along-track distance from the start of the currently tracked leg to the plane's present position. A negative
     * distance indicates the plane is before the start of the leg.
     */
    LegDistanceAlong = "L:WTAP_LNav_Leg_Distance_Along",
    /**
     * The along-track distance remaining in the currently tracked leg. A negative distance indicates the plane is past
     * the end of the leg.
     */
    LegDistanceRemaining = "L:WTAP_LNav_Leg_Distance_Remaining",
    /**
     * The along-track distance from the start of the currently tracked vector to the plane's present position. A
     * negative distance indicates the plane is before the start of the vector.
     */
    VectorDistanceAlong = "L:WTAP_LNav_Vector_Distance_Along",
    /**
     * The along-track distance remaining in the currently tracked vector. A negative distance indicates the plane is
     * past the end of the vector.
     */
    VectorDistanceRemaining = "L:WTAP_LNav_Vector_Distance_Remaining",
    /**
     * The along-track distance from the current vector end where LNAV will sequence to the next vector.
     * A positive value means the vector will be sequenced this distance prior to the vector end.
     */
    VectorAnticipationDistance = "L:WTAP_LNav_Vector_Anticipation_Distance"
}
/**
 * Events derived from LNAV sim vars.
 */
interface LNavSimVarEvents {
    /** The current desired track, in degrees true. */
    lnav_dtk: number;
    /**
     * The current crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed when
     * facing in the direction of the track. Positive values indicate deviation to the right.
     */
    lnav_xtk: number;
    /** Whether LNAV is tracking a path. */
    lnav_is_tracking: boolean;
    /** The global leg index of the flight plan leg LNAV is currently tracking. */
    lnav_tracked_leg_index: number;
    /** The currently active LNAV transition mode. */
    lnav_transition_mode: LNavTransitionMode;
    /** The index of the vector LNAV is currently tracking. */
    lnav_tracked_vector_index: number;
    /** The current course LNAV is attempting to steer, in degrees true. */
    lnav_course_to_steer: number;
    /** Whether LNAV sequencing is suspended. */
    lnav_is_suspended: boolean;
    /**
     * The along-track distance from the start of the currently tracked leg to the plane's present position, in nautical
     * miles. A negative distance indicates the plane is before the start of the leg.
     */
    lnav_leg_distance_along: number;
    /**
     * The along-track distance remaining in the currently tracked leg, in nautical miles. A negative distance indicates
     * the plane is past the end of the leg.
     */
    lnav_leg_distance_remaining: number;
    /**
     * The along-track distance from the start of the currently tracked vector to the plane's present position, in
     * nautical miles. A negative distance indicates the plane is before the start of the vector.
     */
    lnav_vector_distance_along: number;
    /**
     * The along-track distance remaining in the currently tracked vector, in nautical miles. A negative distance
     * indicates the plane is past the end of the vector.
     */
    lnav_vector_distance_remaining: number;
    /**
     * The along-track distance from the current vector end where LNAV will sequence to the next vector in nautical miles.
     * A positive value means the vector will be sequenced this distance prior to the vector end.
     */
    lnav_vector_anticipation_distance: number;
}
/**
 * Events published by LNAV.
 */
export declare type LNavEvents = LNavSimVarEvents;
/**
 * A publisher for LNAV sim var events.
 */
export declare class LNavSimVarPublisher extends SimVarPublisher<LNavSimVarEvents> {
    private static simvars;
    /**
     * Constructor.
     * @param bus The event bus to which to publish.
     */
    constructor(bus: EventBus);
}
export {};
//# sourceMappingURL=LNavEvents.d.ts.map