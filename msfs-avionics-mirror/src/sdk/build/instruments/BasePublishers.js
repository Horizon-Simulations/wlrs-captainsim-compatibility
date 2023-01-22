import { SimVarValueType } from '../data/SimVars';
/**
 * A basic event-bus publisher.
 */
export class BasePublisher {
    /**
     * Creates an instance of BasePublisher.
     * @param bus The common event bus.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(bus, pacer = undefined) {
        this.bus = bus;
        this.publisher = this.bus.getPublisher();
        this.publishActive = false;
        this.pacer = pacer;
    }
    /**
     * Start publishing.
     */
    startPublish() {
        this.publishActive = true;
    }
    /**
     * Stop publishing.
     */
    stopPublish() {
        this.publishActive = false;
    }
    /**
     * Tells whether or not the publisher is currently active.
     * @returns True if the publisher is active, false otherwise.
     */
    isPublishing() {
        return this.publishActive;
    }
    /**
     * A callback called when the publisher receives an update cycle.
     */
    onUpdate() {
        return;
    }
    /**
     * Publish a message if publishing is acpive
     * @param topic The topic key to publish to.
     * @param data The data type for chosen topic.
     * @param sync Whether or not the event should be synced to other instruments. Defaults to `false`.
     * @param isCached Whether or not the event should be cached. Defaults to `true`.
     */
    publish(topic, data, sync = false, isCached = true) {
        if (this.publishActive && (!this.pacer || this.pacer.canPublish(topic, data))) {
            this.publisher.pub(topic, data, sync, isCached);
        }
    }
}
/**
 * A publisher that sends a constant stream of random numbers.
 */
export class RandomNumberPublisher extends BasePublisher {
    /**
     * Start publishing random numbers.
     */
    startPublish() {
        super.startPublish();
        this.publishRandomNumbers();
    }
    /**
     * Async thread that publishes random numbers
     * @param ms - Milliseconds to sleep between publishes
     */
    async publishRandomNumbers(ms = 1000) {
        while (this.isPublishing()) {
            const newVal = Math.floor(Math.random() * ms);
            this.publish('randomNumber', newVal, true);
            await new Promise(r => setTimeout(r, ms));
        }
    }
}
/**
 * A base class for publishers that need to handle simvars with built-in
 * support for pacing callbacks.
 */
export class SimVarPublisher extends BasePublisher {
    /**
     * Create a SimVarPublisher
     * @param simVarMap A map of simvar event type keys to a SimVarDefinition.
     * @param bus The EventBus to use for publishing.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(simVarMap, bus, pacer) {
        super(bus, pacer);
        this.simvars = simVarMap;
        this.subscribed = new Set();
        // Start polling all simvars for which there are existing subscriptions.
        for (const topic of this.simvars.keys()) {
            if (bus.getTopicSubscriberCount(topic) > 0) {
                this.onTopicSubscribed(topic);
            }
        }
        bus.getSubscriber().on('event_bus_topic_first_sub').handle((topic) => {
            if (this.simvars.has(topic)) {
                this.onTopicSubscribed(topic);
            }
        });
    }
    /**
     * Responds to when one of this publisher's topics is subscribed to for the first time.
     * @param topic The topic that was subscribed to.
     */
    onTopicSubscribed(topic) {
        this.subscribed.add(topic);
    }
    /**
     * NOOP - For backwards compatibility.
     * @deprecated
     * @param data Key of the event type in the simVarMap
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    subscribe(data) {
        return;
    }
    /**
     * NOOP - For backwards compatibility.
     * @deprecated
     * @param data Key of the event type in the simVarMap
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unsubscribe(data) {
        return;
    }
    /**
     * Publish all subscribed data points to the bus.
     */
    onUpdate() {
        for (const topic of this.subscribed.values()) {
            this.publishTopic(topic);
        }
    }
    /**
     * Publishes data to the event bus for a topic.
     * @param topic The topic to publish.
     */
    publishTopic(topic) {
        const value = this.getValue(topic);
        if (value !== undefined) {
            this.publish(topic, value);
        }
    }
    /**
     * Gets the current value for a topic.
     * @param topic A topic.
     * @returns The current value for the specified topic.
     */
    getValue(topic) {
        const entry = this.simvars.get(topic);
        if (entry === undefined) {
            return undefined;
        }
        return entry.map === undefined
            ? this.getSimVarValue(entry)
            : entry.map(this.getSimVarValue(entry));
    }
    /**
     * Gets the value of the SimVar
     * @param entry The SimVar definition entry
     * @returns The value of the SimVar
     */
    getSimVarValue(entry) {
        const svValue = SimVar.GetSimVarValue(entry.name, entry.type);
        if (entry.type === SimVarValueType.Bool) {
            return svValue === 1;
        }
        return svValue;
    }
}
