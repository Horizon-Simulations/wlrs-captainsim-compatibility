import { AbstractSubscribable } from './AbstractSubscribable';
import { CombinedSubject } from './CombinedSubject';
/**
 * A subscribable subject that is a mapped stream from one or more input subscribables.
 */
export class MappedSubject {
    /**
     * Creates a new MappedSubject.
     * @param mapFunc The function which maps this subject's inputs to a value.
     * @param equalityFunc The function which this subject uses to check for equality between values.
     * @param mutateFunc The function which this subject uses to change its value.
     * @param initialVal The initial value of this subject.
     * @param inputs The subscribables which provide the inputs to this subject.
     */
    constructor(mapFunc, equalityFunc, mutateFunc, initialVal, ...inputs) {
        this.isSubscribable = true;
        this.input = CombinedSubject.create(...inputs);
        if (initialVal !== undefined && mutateFunc !== undefined) {
            this.mapped = this.input.map(mapFunc, equalityFunc, mutateFunc, initialVal);
        }
        else {
            this.mapped = this.input.map(mapFunc, equalityFunc);
        }
    }
    /** @inheritdoc */
    get isAlive() {
        return this.input.isAlive;
    }
    /** @inheritdoc */
    get isPaused() {
        return this.input.isPaused;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static create(mapFunc, ...args) {
        let equalityFunc, mutateFunc, initialVal;
        if (typeof args[0] === 'function') {
            equalityFunc = args.shift();
        }
        else {
            equalityFunc = AbstractSubscribable.DEFAULT_EQUALITY_FUNC;
        }
        if (typeof args[0] === 'function') {
            mutateFunc = args.shift();
            initialVal = args.shift();
        }
        return new MappedSubject(mapFunc, equalityFunc, mutateFunc, initialVal, ...args);
    }
    /** @inheritdoc */
    get() {
        return this.mapped.get();
    }
    /** @inheritdoc */
    sub(handler, initialNotify = false, paused = false) {
        return this.mapped.sub(handler, initialNotify, paused);
    }
    /** @inheritdoc */
    unsub(handler) {
        this.mapped.unsub(handler);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    map(fn, equalityFunc, mutateFunc, initialVal) {
        if (initialVal !== undefined && mutateFunc !== undefined && equalityFunc !== undefined) {
            return this.mapped.map(fn, equalityFunc, mutateFunc, initialVal);
        }
        else {
            return this.mapped.map(fn, equalityFunc);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    pipe(to, arg2, arg3) {
        if (typeof arg2 === 'function') {
            return this.mapped.pipe(to, arg2, arg3);
        }
        else {
            return this.mapped.pipe(to, arg2);
        }
    }
    /** @inheritdoc */
    pause() {
        this.input.pause();
    }
    /** @inheritdoc */
    resume() {
        this.input.resume();
    }
    /** @inheritdoc */
    destroy() {
        this.input.destroy();
    }
}
