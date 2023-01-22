import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { Vec2Math, Vec3Math } from './VecMath';
/**
 * A Subject which allows a 2D vector to be observed.
 */
export class Vec2Subject extends AbstractSubscribable {
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
     * Creates a Vec2Subject.
     * @param initialVal The initial value.
     * @returns A Vec2Subject.
     */
    static create(initialVal) {
        return new Vec2Subject(initialVal);
    }
    /**
     * Creates a Vec2Subject.
     * @param initialVal The initial value.
     * @returns A Vec2Subject.
     * @deprecated Use `Vec2Subject.create()` instead.
     */
    static createFromVector(initialVal) {
        return new Vec2Subject(initialVal);
    }
    /** @inheritdoc */
    get() {
        return this.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2) {
        let x, y;
        if (typeof arg1 === 'number') {
            x = arg1;
            y = arg2;
        }
        else {
            x = arg1[0];
            y = arg1[1];
        }
        const equals = x === this.value[0] && y === this.value[1];
        if (!equals) {
            Vec2Math.set(x, y, this.value);
            this.notify();
        }
    }
}
/**
 * A Subject which allows a 3D vector to be observed.
 */
export class Vec3Subject extends AbstractSubscribable {
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
     * Creates a Vec3Subject.
     * @param initialVal The initial value.
     * @returns A Vec3Subject.
     */
    static create(initialVal) {
        return new Vec3Subject(initialVal);
    }
    /**
     * Creates a Vec3Subject.
     * @param initialVal The initial value.
     * @returns A Vec3Subject.
     * @deprecated Use `Vec3Subject.create()` instead.
     */
    static createFromVector(initialVal) {
        return new Vec3Subject(initialVal);
    }
    /** @inheritdoc */
    get() {
        return this.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2, arg3) {
        let x, y, z;
        if (typeof arg1 === 'number') {
            x = arg1;
            y = arg2;
            z = arg3;
        }
        else {
            x = arg1[0];
            y = arg1[1];
            z = arg1[2];
        }
        const equals = x === this.value[0] && y === this.value[1] && z === this.value[2];
        if (!equals) {
            Vec3Math.set(x, y, z, this.value);
            this.notify();
        }
    }
}
/**
 * A Subject which allows a N-D vector to be observed.
 */
export class VecNSubject extends AbstractSubscribable {
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
     * Creates a VecNSubject.
     * @param initialVal The initial value.
     * @returns A VecNSubject.
     */
    static create(initialVal) {
        return new VecNSubject(initialVal);
    }
    /**
     * Creates a VecNSubject.
     * @param initialVal The initial value.
     * @returns A VecNSubject.
     * @deprecated Use `VecNSubject.create()` instead.
     */
    static createFromVector(initialVal) {
        return new VecNSubject(initialVal);
    }
    /** @inheritdoc */
    get() {
        return this.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, ...args) {
        let array;
        if (typeof arg1 === 'number') {
            array = args;
            args.unshift(arg1);
        }
        else {
            array = arg1;
        }
        if (array.length > this.value.length) {
            throw new RangeError(`VecNSubject: Cannot set ${array.length} components on a vector of length ${this.value.length}`);
        }
        let equals = true;
        const len = array.length;
        for (let i = 0; i < len; i++) {
            if (array[i] !== this.value[i]) {
                equals = false;
                break;
            }
        }
        if (!equals) {
            this.value.set(array);
            this.notify();
        }
    }
}
