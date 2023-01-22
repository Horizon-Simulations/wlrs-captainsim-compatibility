import { AbstractSubscribable } from '../sub/AbstractSubscribable';
/**
 * A Subject which provides a {@link NumberUnitInterface} value.
 */
export class NumberUnitSubject extends AbstractSubscribable {
    /**
     * Constructor.
     * @param value The value of this subject.
     */
    constructor(value) {
        super();
        this.value = value;
        /** @inheritdoc */
        this.isMutableSubscribable = true;
    }
    /**
     * Creates a NumberUnitSubject.
     * @param initialVal The initial value.
     * @returns A NumberUnitSubject.
     */
    static create(initialVal) {
        return new NumberUnitSubject(initialVal);
    }
    /**
     * Creates a NumberUnitSubject.
     * @param initialVal The initial value.
     * @returns A NumberUnitSubject.
     * @deprecated Use `NumberUnitSubject.create()` instead.
     */
    static createFromNumberUnit(initialVal) {
        return new NumberUnitSubject(initialVal);
    }
    /** @inheritdoc */
    get() {
        return this.value.readonly;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2) {
        const isArg1Number = typeof arg1 === 'number';
        const equals = isArg1Number ? this.value.equals(arg1, arg2) : this.value.equals(arg1);
        if (!equals) {
            isArg1Number ? this.value.set(arg1, arg2) : this.value.set(arg1);
            this.notify();
        }
    }
}
