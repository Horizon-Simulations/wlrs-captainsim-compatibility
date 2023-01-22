import { PublishPacer } from '../data';
import { EventBus, IndexedEventType } from '../data/EventBus';
import { SimVarPublisher } from './BasePublishers';
/**
 * Base events related to attitude and heading of the airplane.
 */
export interface BaseAhrsEvents {
    /** The heading of the airplane, in degrees magnetic. */
    hdg_deg: number;
    /** A heading of the airplane, in degrees true. */
    hdg_deg_true: number;
    /** The pitch of the airplane, in degrees. Positive values indicate downward pitch. */
    pitch_deg: number;
    /** The roll (bank) of the airplane, in degrees. Positive values indicate leftward roll. */
    roll_deg: number;
    /** A turn coordinator ball value. */
    turn_coordinator_ball: number;
    /** The turn rate of the airplane, in degrees per second. */
    delta_heading_rate: number;
}
/**
 * Topics that are indexed by attitude indicator.
 */
declare type AhrsAttitudeIndexedTopics = 'pitch_deg' | 'roll_deg';
/**
 * Topics that are indexed by direction indicator.
 */
declare type AhrsDirectionIndexedTopics = 'hdg_deg' | 'hdg_deg_true' | 'delta_heading_rate';
/**
 * All topics related to attitude and heading of the airplane that are indexed.
 */
declare type AhrsIndexedTopics = AhrsAttitudeIndexedTopics | AhrsDirectionIndexedTopics;
/**
 * Indexed events related to attitude and heading of the airplane.
 */
declare type AhrsIndexedEvents = {
    [P in keyof Pick<BaseAhrsEvents, AhrsIndexedTopics> as IndexedEventType<P>]: BaseAhrsEvents[P];
};
/**
 * Events related to attitude and heading of the airplane.
 */
export interface AhrsEvents extends BaseAhrsEvents, AhrsIndexedEvents {
}
/**
 * A publisher for AHRS information.
 */
export declare class AhrsPublisher extends SimVarPublisher<AhrsEvents> {
    private magVar;
    private needUpdateMagVar;
    /**
     * Creates an AhrsPublisher.
     * @param bus The event bus to which to publish.
     * @param attitudeIndicatorCount The number of attitude indicators.
     * @param directionIndicatorCount The number of direction indicators.
     * @param pacer An optional pacer to use to control the rate of publishing.
     */
    constructor(bus: EventBus, attitudeIndicatorCount: number, directionIndicatorCount: number, pacer?: PublishPacer<AhrsEvents>);
    /** @inheritdoc */
    protected onTopicSubscribed(topic: keyof AhrsEvents): void;
    /** @inheritdoc */
    onUpdate(): void;
}
export {};
//# sourceMappingURL=Ahrs.d.ts.map