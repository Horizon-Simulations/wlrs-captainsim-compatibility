import { AbstractSubscribable } from './AbstractSubscribable';
/**
 * A subscribable subject whose state is a combined tuple of an arbitrary number of values.
 */
export class CombinedSubject extends AbstractSubscribable {
    /**
     * Constructor.
     * @param inputs The subscribables which provide the inputs to this subject.
     */
    constructor(...inputs) {
        super();
        this._isAlive = true;
        this._isPaused = false;
        this.inputs = inputs;
        this.inputValues = inputs.map(input => input.get());
        this.inputSubs = this.inputs.map((input, index) => input.sub(inputValue => {
            this.inputValues[index] = inputValue;
            this.notify();
        }));
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
     * Creates a new subject whose state is a combined tuple of an arbitrary number of input values.
     * @param inputs The subscribables which provide the inputs to the new subject.
     * @returns A new subject whose state is a combined tuple of the specified input values.
     */
    static create(...inputs) {
        return new CombinedSubject(...inputs);
    }
    /** @inheritdoc */
    get() {
        return this.inputValues;
    }
    /** @inheritdoc */
    pause() {
        if (!this._isAlive) {
            throw new Error('CombinedSubject: cannot pause a dead subject');
        }
        if (this._isPaused) {
            return;
        }
        for (let i = 0; i < this.inputSubs.length; i++) {
            this.inputSubs[i].pause();
        }
        this._isPaused = true;
    }
    /** @inheritdoc */
    resume() {
        if (!this._isAlive) {
            throw new Error('CombinedSubject: cannot resume a dead subject');
        }
        if (!this._isPaused) {
            return;
        }
        this._isPaused = false;
        for (let i = 0; i < this.inputSubs.length; i++) {
            this.inputValues[i] = this.inputs[i].get();
            this.inputSubs[i].resume();
        }
        this.notify();
    }
    /** @inheritdoc */
    destroy() {
        this._isAlive = false;
        for (let i = 0; i < this.inputSubs.length; i++) {
            this.inputSubs[i].destroy();
        }
    }
}
