/**
 * A consumer of a resource.
 */
export declare type ResourceConsumer<T = void> = {
    /**
     * This consumer's priority for its desired resource. Consumers with higher priority will gain access to the resource
     * over consumers with lower priority.
     */
    readonly priority: number;
    /**
     * A callback function which is called when this consumer gains access to its desired resource.
     */
    onAcquired: (resource: T) => void;
    /**
     * A callback function which is called when this consumer loses access to its desired resource.
     */
    onCeded: (resource: T) => void;
};
/**
 * Moderates access to a resource.
 */
export declare class ResourceModerator<T = void> {
    private readonly resource;
    private pendingConsumer;
    private assignedConsumer;
    private readonly queuedConsumers;
    /**
     * Constructor.
     * @param resource This resource controlled by this moderator.
     */
    constructor(resource: T);
    /**
     * Makes a claim to this moderator's resource. If the resource is not currently owned, or the claiming consumer has
     * a higher priority than the current owner, access will attempt to pass to the claiming consumer. Otherwise, the
     * claiming consumer will enter a queue. After entering the queue, a consumer will gain access to the claimed
     * resource when all other consumers with a higher priority forfeit their claims to the resource.
     * @param consumer The consumer claiming the resource.
     */
    claim(consumer: ResourceConsumer<T>): void;
    /**
     * Forfeits a claim to this moderator's resource. If the consumer forfeiting its claim is the current owner of the
     * resource, it will immediately lose access to the resource, and access will attempt to pass to the next-highest
     * priority consumer with a claim to the resource. Otherwise, the forfeiting consumer will be removed from the queue
     * to gain access to the resource.
     * @param consumer The consumer that is forfeiting its claim.
     */
    forfeit(consumer: ResourceConsumer<T>): void;
}
//# sourceMappingURL=ResourceModerator.d.ts.map