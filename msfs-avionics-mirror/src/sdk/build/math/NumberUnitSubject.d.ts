import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { MutableSubscribable } from '../sub/Subscribable';
import { NumberUnit, NumberUnitInterface, Unit } from './NumberUnit';
/**
 * A Subject which provides a {@link NumberUnitInterface} value.
 */
export declare class NumberUnitSubject<F extends string, U extends Unit<F> = Unit<F>> extends AbstractSubscribable<NumberUnitInterface<F, U>> implements MutableSubscribable<NumberUnitInterface<F, U>>, MutableSubscribable<NumberUnitInterface<F, U>, number> {
    private readonly value;
    /** @inheritdoc */
    readonly isMutableSubscribable = true;
    /**
     * Constructor.
     * @param value The value of this subject.
     */
    private constructor();
    /**
     * Creates a NumberUnitSubject.
     * @param initialVal The initial value.
     * @returns A NumberUnitSubject.
     */
    static create<F extends string, U extends Unit<F>>(initialVal: NumberUnit<F, U>): NumberUnitSubject<F, U>;
    /**
     * Creates a NumberUnitSubject.
     * @param initialVal The initial value.
     * @returns A NumberUnitSubject.
     * @deprecated Use `NumberUnitSubject.create()` instead.
     */
    static createFromNumberUnit<F extends string, U extends Unit<F>>(initialVal: NumberUnit<F, U>): NumberUnitSubject<F, U>;
    /** @inheritdoc */
    get(): NumberUnitInterface<F, U>;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param value The new value.
     */
    set(value: NumberUnitInterface<F>): void;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param value The numeric part of the new value.
     * @param unit The unit type of the new value. Defaults to the unit type of the NumberUnit used to create this
     * subject.
     */
    set(value: number, unit?: Unit<F>): void;
}
//# sourceMappingURL=NumberUnitSubject.d.ts.map