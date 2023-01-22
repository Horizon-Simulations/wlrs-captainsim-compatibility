import { CombinedSubscribableInputs } from './CombinedSubject';
import { MappedSubscribable, MutableSubscribable } from './Subscribable';
import { Subscription } from './Subscription';
/**
 * A subscribable subject that is a mapped stream from one or more input subscribables.
 */
export declare class MappedSubject<I extends any[], T> implements MappedSubscribable<T> {
    readonly isSubscribable = true;
    private readonly input;
    private readonly mapped;
    /** @inheritdoc */
    get isAlive(): boolean;
    /** @inheritdoc */
    get isPaused(): boolean;
    /**
     * Creates a new MappedSubject.
     * @param mapFunc The function which maps this subject's inputs to a value.
     * @param equalityFunc The function which this subject uses to check for equality between values.
     * @param mutateFunc The function which this subject uses to change its value.
     * @param initialVal The initial value of this subject.
     * @param inputs The subscribables which provide the inputs to this subject.
     */
    private constructor();
    /**
     * Creates a new mapped subject. Values are compared for equality using the strict equality comparison (`===`).
     * @param mapFunc The function to use to map inputs to the new subject value.
     * @param inputs The subscribables which provide the inputs to the new subject.
     */
    static create<I extends any[], T>(mapFunc: (inputs: Readonly<I>, previousVal?: T) => T, ...inputs: CombinedSubscribableInputs<I>): MappedSubject<I, T>;
    /**
     * Creates a new mapped subject. Values are compared for equality using a custom function.
     * @param mapFunc The function to use to map inputs to the new subject value.
     * @param equalityFunc The function which the new subject uses to check for equality between values.
     * @param inputs The subscribables which provide the inputs to the new subject.
     */
    static create<I extends any[], T>(mapFunc: (inputs: Readonly<I>, previousVal?: T) => T, equalityFunc: (a: T, b: T) => boolean, ...inputs: CombinedSubscribableInputs<I>): MappedSubject<I, T>;
    /**
     * Creates a new mapped subject with a persistent, cached value which is mutated when it changes. Values are
     * compared for equality using a custom function.
     * @param mapFunc The function to use to map inputs to the new subject value.
     * @param equalityFunc The function which the new subject uses to check for equality between values.
     * @param mutateFunc The function to use to change the value of the new subject.
     * @param initialVal The initial value of the new subject.
     * @param inputs The subscribables which provide the inputs to the new subject.
     */
    static create<I extends any[], T>(mapFunc: (inputs: Readonly<I>, previousVal?: T) => T, equalityFunc: (a: T, b: T) => boolean, mutateFunc: (oldVal: T, newVal: T) => void, initialVal: T, ...inputs: CombinedSubscribableInputs<I>): MappedSubject<I, T>;
    /** @inheritdoc */
    get(): T;
    /** @inheritdoc */
    sub(handler: (v: T) => void, initialNotify?: boolean, paused?: boolean): Subscription;
    /** @inheritdoc */
    unsub(handler: (v: T) => void): void;
    /**
     * Maps this subscribable to a new subscribable.
     * @param fn The function to use to map to the new subscribable.
     * @param equalityFunc The function to use to check for equality between mapped values. Defaults to the strict
     * equality comparison (`===`).
     * @returns The mapped subscribable.
     */
    map<M>(fn: (input: T, previousVal?: M) => M, equalityFunc?: ((a: M, b: M) => boolean)): MappedSubscribable<M>;
    /**
     * Maps this subscribable to a new subscribable with a persistent, cached value which is mutated when it changes.
     * @param fn The function to use to map to the new subscribable.
     * @param equalityFunc The function to use to check for equality between mapped values.
     * @param mutateFunc The function to use to change the value of the mapped subscribable.
     * @param initialVal The initial value of the mapped subscribable.
     * @returns The mapped subscribable.
     */
    map<M>(fn: (input: T, previousVal?: M) => M, equalityFunc: ((a: M, b: M) => boolean), mutateFunc: ((oldVal: M, newVal: M) => void), initialVal: M): MappedSubscribable<M>;
    /**
     * Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this
     * subscribable's state is received through the subscription, it will be used as an input to change the other
     * subscribable's state.
     * @param to The mutable subscribable to which to pipe this subscribable's state.
     * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
     * @returns The new subscription.
     */
    pipe(to: MutableSubscribable<any, T>, paused?: boolean): Subscription;
    /**
     * Subscribes to this subscribable's state and pipes a mapped version to a mutable subscribable. Whenever an update
     * of this subscribable's state is received through the subscription, it will be transformed by the specified mapping
     * function, and the transformed state will be used as an input to change the other subscribable's state.
     * @param to The mutable subscribable to which to pipe this subscribable's mapped state.
     * @param map The function to use to transform inputs.
     * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
     * @returns The new subscription.
     */
    pipe<M>(to: MutableSubscribable<any, M>, map: (input: T) => M, paused?: boolean): Subscription;
    /** @inheritdoc */
    pause(): void;
    /** @inheritdoc */
    resume(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MappedSubject.d.ts.map