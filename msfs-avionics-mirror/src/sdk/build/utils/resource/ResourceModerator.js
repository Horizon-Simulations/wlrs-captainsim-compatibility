import { SortedArray } from '../datastructures/SortedArray';
/**
 * Moderates access to a resource.
 */
export class ResourceModerator {
    /**
     * Constructor.
     * @param resource This resource controlled by this moderator.
     */
    constructor(resource) {
        this.resource = resource;
        this.pendingConsumer = null;
        this.assignedConsumer = null;
        this.queuedConsumers = new SortedArray((a, b) => a.priority - b.priority);
    }
    /**
     * Makes a claim to this moderator's resource. If the resource is not currently owned, or the claiming consumer has
     * a higher priority than the current owner, access will attempt to pass to the claiming consumer. Otherwise, the
     * claiming consumer will enter a queue. After entering the queue, a consumer will gain access to the claimed
     * resource when all other consumers with a higher priority forfeit their claims to the resource.
     * @param consumer The consumer claiming the resource.
     */
    claim(consumer) {
        var _a;
        const consumerToDisplace = (_a = this.pendingConsumer) !== null && _a !== void 0 ? _a : this.assignedConsumer;
        if (consumerToDisplace === consumer) {
            return;
        }
        if (this.queuedConsumers.has(consumer)) {
            return;
        }
        if (consumerToDisplace === null || consumerToDisplace.priority < consumer.priority) {
            if (consumerToDisplace === null || consumerToDisplace === this.pendingConsumer) {
                if (consumerToDisplace) {
                    this.queuedConsumers.insert(consumerToDisplace);
                    this.pendingConsumer = null;
                }
                this.assignedConsumer = consumer;
                this.assignedConsumer.onAcquired(this.resource);
                return;
            }
            this.assignedConsumer = null;
            this.pendingConsumer = consumer;
            this.queuedConsumers.insert(consumerToDisplace);
            consumerToDisplace.onCeded(this.resource);
            if (this.pendingConsumer === consumer) {
                this.pendingConsumer = null;
                this.assignedConsumer = consumer;
                this.assignedConsumer.onAcquired(this.resource);
                return;
            }
            else {
                // Something has displaced the new pending consumer. Either something pre-empted it, in which case it is
                // now in the queue, or it forfeited its claim. In either case, there is nothing to do.
                return;
            }
        }
        this.queuedConsumers.insert(consumer);
    }
    /**
     * Forfeits a claim to this moderator's resource. If the consumer forfeiting its claim is the current owner of the
     * resource, it will immediately lose access to the resource, and access will attempt to pass to the next-highest
     * priority consumer with a claim to the resource. Otherwise, the forfeiting consumer will be removed from the queue
     * to gain access to the resource.
     * @param consumer The consumer that is forfeiting its claim.
     */
    forfeit(consumer) {
        var _a;
        if (this.pendingConsumer === consumer) {
            this.pendingConsumer = null;
            return;
        }
        if (this.assignedConsumer === null || this.assignedConsumer !== consumer) {
            this.queuedConsumers.remove(consumer);
            return;
        }
        const next = (_a = this.queuedConsumers.pop()) !== null && _a !== void 0 ? _a : null;
        this.pendingConsumer = next;
        this.assignedConsumer = null;
        consumer.onCeded(this.resource);
        if (next !== null && this.pendingConsumer === next) {
            this.pendingConsumer = null;
            this.assignedConsumer = next;
            this.assignedConsumer.onAcquired(this.resource);
        }
    }
}
