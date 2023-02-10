class B77HS_MessageQueue {
    constructor(aims) {
        this._aims = aims;
        this._queue = [];
    }

    /**
     * aims messages enter the queue via this void
     * @param message {TypeIIMessage}
     */
    addMessage(message) {
        if (message.isResolved(this._aims)) {
            this.updateDisplayedMessage();
            return;
        }

        this._addToQueueOrUpdateQueuePosition(message);
        this.updateDisplayedMessage();
    }

    removeMessage(value) {
        for (let i = 0; i < this._queue.length; i++) {
            const message = this._queue[i];
            if (message.text === value) {
                message.onClear(this._aims);
                this._queue.splice(i, 1);
                if (i === 0) {
                    this._aims.removeScratchpadMessage(value);
                    this.updateDisplayedMessage();
                }
                break;
            }
        }
    }

    resetQueue() {
        this._queue = [];
    }

    updateDisplayedMessage() {
        if (this._queue.length > 0) {
            const message = this._queue[0];
            if (message.isResolved(this._aims)) {
                this._queue.splice(0, 1);
                return this.updateDisplayedMessage();
            }

            this._aims.setScratchpadMessage(message);
        }
    }

    _addToQueueOrUpdateQueuePosition(message) {
        for (let i = 0; i < this._queue.length; i++) {
            if (this._queue[i].text === message.text) {
                if (i !== 0) {
                    this._queue.unshift(this._queue[i]);
                    this._queue.splice(i + 1, 1);
                }
                return;
            }
        }

        for (let i = 0; i < this._queue.length; i++) {
            if (this._queue[i].isResolved(this._aims)) {
                this._queue.splice(i, 1);
            }
        }

        this._queue.unshift(message);

        if (this._queue.length > 5) {
            this._queue.splice(5, 1);
        }
    }
}
