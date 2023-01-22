import { Subscription } from '../sub/Subscription';
import { Consumer } from './Consumer';
import { Handler } from './EventBus';
/**
 * A basic implementation of {@link Consumer}.
 */
export declare class BasicConsumer<T> implements Consumer<T> {
    private readonly subscribe;
    private state;
    private readonly currentHandler?;
    /** @inheritdoc */
    readonly isConsumer = true;
    private readonly activeSubs;
    /**
     * Creates an instance of a Consumer.
     * @param subscribe A function which subscribes a handler to the source of this consumer's events.
     * @param state The state for the consumer to track.
     * @param currentHandler The current build filter handler stack, if any.
     */
    constructor(subscribe: (handler: Handler<T>, paused: boolean) => Subscription, state?: any, currentHandler?: ((data: T, state: any, next: Handler<T>) => void) | undefined);
    /** @inheritdoc */
    handle(handler: Handler<T>, paused?: boolean): Subscription;
    /** @inheritdoc */
    off(handler: Handler<T>): void;
    /** @inheritdoc */
    atFrequency(frequency: number, immediateFirstPublish?: boolean): Consumer<T>;
    /**
     * Gets a handler function for a 'atFrequency' filter.
     * @param frequency The frequency, in Hz, to cap to.
     * @returns A handler function for a 'atFrequency' filter.
     */
    private getAtFrequencyHandler;
    /** @inheritdoc */
    withPrecision(precision: number): Consumer<T>;
    /**
     * Gets a handler function for a 'withPrecision' filter.
     * @param precision The decimal precision to snap to.
     * @returns A handler function for a 'withPrecision' filter.
     */
    private getWithPrecisionHandler;
    /** @inheritdoc */
    whenChangedBy(amount: number): Consumer<T>;
    /**
     * Gets a handler function for a 'whenChangedBy' filter.
     * @param amount The minimum amount threshold below which the consumer will not consume.
     * @returns A handler function for a 'whenChangedBy' filter.
     */
    private getWhenChangedByHandler;
    /** @inheritdoc */
    whenChanged(): Consumer<T>;
    /**
     * Gets a handler function for a 'whenChanged' filter.
     * @returns A handler function for a 'whenChanged' filter.
     */
    private getWhenChangedHandler;
    /** @inheritdoc */
    onlyAfter(deltaTime: number): Consumer<T>;
    /**
     * Gets a handler function for an 'onlyAfter' filter.
     * @param deltaTime The minimum delta time between events.
     * @returns A handler function for an 'onlyAfter' filter.
     */
    private getOnlyAfterHandler;
    /**
     * Builds a handler stack from the current handler.
     * @param data The data to send in to the handler.
     * @param handler The handler to use for processing.
     */
    private with;
}
//# sourceMappingURL=BasicConsumer.d.ts.map