import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { MutableSubscribable } from '../sub/Subscribable';
import { ReadonlyFloat64Array } from './VecMath';
/**
 * A Subject which allows a 2D vector to be observed.
 */
export declare class Vec2Subject extends AbstractSubscribable<ReadonlyFloat64Array> implements MutableSubscribable<ReadonlyFloat64Array, Readonly<ArrayLike<number>>> {
    private readonly value;
    /** @inheritdoc */
    readonly isMutableSubscribable = true;
    /**
     * Constructor.
     * @param value The value of this subject.
     */
    private constructor();
    /**
     * Creates a Vec2Subject.
     * @param initialVal The initial value.
     * @returns A Vec2Subject.
     */
    static create(initialVal: Float64Array): Vec2Subject;
    /**
     * Creates a Vec2Subject.
     * @param initialVal The initial value.
     * @returns A Vec2Subject.
     * @deprecated Use `Vec2Subject.create()` instead.
     */
    static createFromVector(initialVal: Float64Array): Vec2Subject;
    /** @inheritdoc */
    get(): ReadonlyFloat64Array;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param value The new value.
     */
    set(value: Readonly<ArrayLike<number>>): void;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param x The x component of the new value.
     * @param y The y component of the new value.
     */
    set(x: number, y: number): void;
}
/**
 * A Subject which allows a 3D vector to be observed.
 */
export declare class Vec3Subject extends AbstractSubscribable<ReadonlyFloat64Array> implements MutableSubscribable<ReadonlyFloat64Array, Readonly<ArrayLike<number>>> {
    private readonly value;
    /** @inheritdoc */
    readonly isMutableSubscribable = true;
    /**
     * Constructor.
     * @param value The value of this subject.
     */
    private constructor();
    /**
     * Creates a Vec3Subject.
     * @param initialVal The initial value.
     * @returns A Vec3Subject.
     */
    static create(initialVal: Float64Array): Vec3Subject;
    /**
     * Creates a Vec3Subject.
     * @param initialVal The initial value.
     * @returns A Vec3Subject.
     * @deprecated Use `Vec3Subject.create()` instead.
     */
    static createFromVector(initialVal: Float64Array): Vec3Subject;
    /** @inheritdoc */
    get(): ReadonlyFloat64Array;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param value The new value.
     */
    set(value: Readonly<ArrayLike<number>>): void;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param x The x component of the new value.
     * @param y The y component of the new value.
     */
    set(x: number, y: number, z: number): void;
}
/**
 * A Subject which allows a N-D vector to be observed.
 */
export declare class VecNSubject extends AbstractSubscribable<ReadonlyFloat64Array> implements MutableSubscribable<ReadonlyFloat64Array, Readonly<ArrayLike<number>>> {
    private readonly value;
    /** @inheritdoc */
    readonly isMutableSubscribable = true;
    /**
     * Constructor.
     * @param value The value of this subject.
     */
    private constructor();
    /**
     * Creates a VecNSubject.
     * @param initialVal The initial value.
     * @returns A VecNSubject.
     */
    static create(initialVal: Float64Array): VecNSubject;
    /**
     * Creates a VecNSubject.
     * @param initialVal The initial value.
     * @returns A VecNSubject.
     * @deprecated Use `VecNSubject.create()` instead.
     */
    static createFromVector(initialVal: Float64Array): VecNSubject;
    /** @inheritdoc */
    get(): ReadonlyFloat64Array;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param value The new value.
     * @throws Error if the length of `value` is greater than the length of this subject's value.
     */
    set(value: Readonly<ArrayLike<number>>): void;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param args The individual components of the new value.
     * @throws Error if the number of components of the new value is greater than the length of this subject's value.
     */
    set(...args: number[]): void;
}
//# sourceMappingURL=VectorSubject.d.ts.map