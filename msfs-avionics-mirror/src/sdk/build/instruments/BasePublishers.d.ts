import { EventBus, MockEventTypes } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarDefinition } from '../data/SimVars';
/**
 * A basic event-bus publisher.
 */
export declare class BasePublisher<E> {
    private bus;
    private publisher;
    private publishActive;
    private pacer;
    /**
     * Creates an instance of BasePublisher.
     * @param bus The common event bus.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(bus: EventBus, pacer?: PublishPacer<E> | undefined);
    /**
     * Start publishing.
     */
    startPublish(): void;
    /**
     * Stop publishing.
     */
    stopPublish(): void;
    /**
     * Tells whether or not the publisher is currently active.
     * @returns True if the publisher is active, false otherwise.
     */
    isPublishing(): boolean;
    /**
     * A callback called when the publisher receives an update cycle.
     */
    onUpdate(): void;
    /**
     * Publish a message if publishing is acpive
     * @param topic The topic key to publish to.
     * @param data The data type for chosen topic.
     * @param sync Whether or not the event should be synced to other instruments. Defaults to `false`.
     * @param isCached Whether or not the event should be cached. Defaults to `true`.
     */
    protected publish<K extends keyof E>(topic: K, data: E[K], sync?: boolean, isCached?: boolean): void;
}
/**
 * A publisher that sends a constant stream of random numbers.
 */
export declare class RandomNumberPublisher extends BasePublisher<MockEventTypes> {
    /**
     * Start publishing random numbers.
     */
    startPublish(): void;
    /**
     * Async thread that publishes random numbers
     * @param ms - Milliseconds to sleep between publishes
     */
    private publishRandomNumbers;
}
/**
 * An entry for a sim var publisher topic.
 */
export declare type SimVarPublisherEntry<T> = SimVarDefinition & {
    /**
     * A function which maps the raw simvar value to the value to be published to the event bus. If not defined, the
     * raw simvar value will be published to the bus as-is.
     */
    map?: (value: any) => T;
};
/**
 * A base class for publishers that need to handle simvars with built-in
 * support for pacing callbacks.
 */
export declare class SimVarPublisher<E> extends BasePublisher<E> {
    protected readonly simvars: Map<keyof E & string, SimVarPublisherEntry<any>>;
    protected readonly subscribed: Set<keyof E & string>;
    /**
     * Create a SimVarPublisher
     * @param simVarMap A map of simvar event type keys to a SimVarDefinition.
     * @param bus The EventBus to use for publishing.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(simVarMap: Map<keyof E & string, SimVarDefinition>, bus: EventBus, pacer?: PublishPacer<E>);
    /**
     * Responds to when one of this publisher's topics is subscribed to for the first time.
     * @param topic The topic that was subscribed to.
     */
    protected onTopicSubscribed(topic: keyof E & string): void;
    /**
     * NOOP - For backwards compatibility.
     * @deprecated
     * @param data Key of the event type in the simVarMap
     */
    subscribe(data: keyof E): void;
    /**
     * NOOP - For backwards compatibility.
     * @deprecated
     * @param data Key of the event type in the simVarMap
     */
    unsubscribe(data: keyof E): void;
    /**
     * Publish all subscribed data points to the bus.
     */
    onUpdate(): void;
    /**
     * Publishes data to the event bus for a topic.
     * @param topic The topic to publish.
     */
    protected publishTopic(topic: keyof E & string): void;
    /**
     * Gets the current value for a topic.
     * @param topic A topic.
     * @returns The current value for the specified topic.
     */
    protected getValue<K extends keyof E & string>(topic: K): E[K] | undefined;
    /**
     * Gets the value of the SimVar
     * @param entry The SimVar definition entry
     * @returns The value of the SimVar
     */
    private getSimVarValue;
}
//# sourceMappingURL=BasePublishers.d.ts.map