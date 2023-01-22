import { AbstractSubscribable } from './AbstractSubscribable';
import { MappedSubscribable, Subscribable } from './Subscribable';
/**
 * A type which contains the `length` property of a tuple.
 */
declare type TupleLength<T extends readonly any[]> = {
    length: T['length'];
};
/**
 * A type which maps a tuple of input types to a tuple of subscribables that provide the input types.
 */
export declare type CombinedSubscribableInputs<Types extends readonly any[]> = {
    [Index in keyof Types]: Subscribable<Types[Index]>;
} & TupleLength<Types>;
/**
 * A subscribable subject whose state is a combined tuple of an arbitrary number of values.
 */
export declare class CombinedSubject<I extends any[]> extends AbstractSubscribable<Readonly<I>> implements MappedSubscribable<Readonly<I>> {
    private readonly inputs;
    private readonly inputValues;
    private readonly inputSubs;
    private _isAlive;
    /** @inheritdoc */
    get isAlive(): boolean;
    private _isPaused;
    /** @inheritdoc */
    get isPaused(): boolean;
    /**
     * Constructor.
     * @param inputs The subscribables which provide the inputs to this subject.
     */
    private constructor();
    /**
     * Creates a new subject whose state is a combined tuple of an arbitrary number of input values.
     * @param inputs The subscribables which provide the inputs to the new subject.
     * @returns A new subject whose state is a combined tuple of the specified input values.
     */
    static create<I extends any[]>(...inputs: CombinedSubscribableInputs<I>): CombinedSubject<I>;
    /** @inheritdoc */
    get(): Readonly<I>;
    /** @inheritdoc */
    pause(): void;
    /** @inheritdoc */
    resume(): void;
    /** @inheritdoc */
    destroy(): void;
}
export {};
//# sourceMappingURL=CombinedSubject.d.ts.map