import { HandlerSubscription } from './HandlerSubscription';
import { SubscribablePipe } from './SubscribablePipe';
/**
 * An abstract implementation of a subscribable which allows adding, removing, and notifying subscribers.
 */
export class AbstractSubscribable {
    constructor() {
        this.isSubscribable = true;
        this.subs = [];
        this.notifyDepth = 0;
        /** A function which sends initial notifications to subscriptions. */
        this.initialNotifyFunc = this.notifySubscription.bind(this);
        /** A function which responds to when a subscription to this subscribable is destroyed. */
        this.onSubDestroyedFunc = this.onSubDestroyed.bind(this);
    }
    /** @inheritdoc */
    sub(handler, initialNotify = false, paused = false) {
        const sub = new HandlerSubscription(handler, this.initialNotifyFunc, this.onSubDestroyedFunc);
        this.subs.push(sub);
        if (paused) {
            sub.pause();
        }
        else if (initialNotify) {
            sub.initialNotify();
        }
        return sub;
    }
    /** @inheritdoc */
    unsub(handler) {
        const toDestroy = this.subs.find(sub => sub.handler === handler);
        toDestroy === null || toDestroy === void 0 ? void 0 : toDestroy.destroy();
    }
    /**
     * Notifies subscriptions that this subscribable's value has changed.
     */
    notify() {
        let needCleanUpSubs = false;
        this.notifyDepth++;
        const subLen = this.subs.length;
        for (let i = 0; i < subLen; i++) {
            try {
                const sub = this.subs[i];
                if (sub.isAlive && !sub.isPaused) {
                    this.notifySubscription(sub);
                }
                needCleanUpSubs || (needCleanUpSubs = !sub.isAlive);
            }
            catch (error) {
                console.error(`AbstractSubscribable: error in handler: ${error}`);
                if (error instanceof Error) {
                    console.error(error.stack);
                }
            }
        }
        this.notifyDepth--;
        if (needCleanUpSubs && this.notifyDepth === 0) {
            this.subs = this.subs.filter(sub => sub.isAlive);
        }
    }
    /**
     * Notifies a subscription of this subscribable's current state.
     * @param sub The subscription to notify.
     */
    notifySubscription(sub) {
        sub.handler(this.get());
    }
    /**
     * Responds to when a subscription to this subscribable is destroyed.
     * @param sub The destroyed subscription.
     */
    onSubDestroyed(sub) {
        // If we are not in the middle of a notify operation, remove the subscription.
        // Otherwise, do nothing and let the post-notify clean-up code handle it.
        if (this.notifyDepth === 0) {
            this.subs.splice(this.subs.indexOf(sub), 1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    map(fn, equalityFunc, mutateFunc, initialVal) {
        return new MappedSubscribableClass(this, fn, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : AbstractSubscribable.DEFAULT_EQUALITY_FUNC, mutateFunc, initialVal);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    pipe(to, arg2, arg3) {
        let sub;
        let paused;
        if (typeof arg2 === 'function') {
            sub = new SubscribablePipe(this, to, arg2, this.onSubDestroyedFunc);
            paused = arg3 !== null && arg3 !== void 0 ? arg3 : false;
        }
        else {
            sub = new SubscribablePipe(this, to, this.onSubDestroyedFunc);
            paused = arg2 !== null && arg2 !== void 0 ? arg2 : false;
        }
        this.subs.push(sub);
        if (paused) {
            sub.pause();
        }
        else {
            sub.initialNotify();
        }
        return sub;
    }
}
/**
 * Checks if two values are equal using the strict equality operator.
 * @param a The first value.
 * @param b The second value.
 * @returns whether a and b are equal.
 */
AbstractSubscribable.DEFAULT_EQUALITY_FUNC = (a, b) => a === b;
/**
 * An implementation of {@link MappedSubscribable}.
 */
class MappedSubscribableClass extends AbstractSubscribable {
    /**
     * Constructor.
     * @param input This subscribable's input.
     * @param mapFunc The function which maps this subject's inputs to a value.
     * @param equalityFunc The function which this subject uses to check for equality between values.
     * @param mutateFunc The function which this subject uses to change its value.
     * @param initialVal The initial value of this subject.
     */
    constructor(input, mapFunc, equalityFunc, mutateFunc, initialVal) {
        super();
        this.input = input;
        this.mapFunc = mapFunc;
        this.equalityFunc = equalityFunc;
        this.isSubscribable = true;
        this._isAlive = true;
        this._isPaused = false;
        if (initialVal && mutateFunc) {
            this.value = initialVal;
            mutateFunc(this.value, this.mapFunc(this.input.get()));
            this.mutateFunc = (newVal) => { mutateFunc(this.value, newVal); };
        }
        else {
            this.value = this.mapFunc(this.input.get());
            this.mutateFunc = (newVal) => { this.value = newVal; };
        }
        this.inputSub = this.input.sub(inputValue => {
            this.updateValue(inputValue);
        }, true);
    }
    /** @inheritdoc */
    get isAlive() {
        return this._isAlive;
    }
    /** @inheritdoc */
    get isPaused() {
        return this._isPaused;
    }
    /**
     * Re-maps this subject's value from its input, and notifies subscribers if this results in a change to the mapped
     * value according to this subject's equality function.
     * @param inputValue The input value.
     */
    updateValue(inputValue) {
        const value = this.mapFunc(inputValue, this.value);
        if (!this.equalityFunc(this.value, value)) {
            this.mutateFunc(value);
            this.notify();
        }
    }
    /** @inheritdoc */
    get() {
        return this.value;
    }
    /** @inheritdoc */
    pause() {
        if (!this._isAlive) {
            throw new Error('MappedSubscribable: cannot pause a dead subscribable');
        }
        if (this._isPaused) {
            return;
        }
        this.inputSub.pause();
        this._isPaused = true;
    }
    /** @inheritdoc */
    resume() {
        if (!this._isAlive) {
            throw new Error('MappedSubscribable: cannot resume a dead subscribable');
        }
        if (!this._isPaused) {
            return;
        }
        this._isPaused = false;
        this.inputSub.resume(true);
    }
    /** @inheritdoc */
    destroy() {
        this._isAlive = false;
        this.inputSub.destroy();
    }
}
