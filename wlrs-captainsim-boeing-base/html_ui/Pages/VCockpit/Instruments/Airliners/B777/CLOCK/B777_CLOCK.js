class B777_CLOCK {
    constructor() {
        super();
        this.currentValue = 0;
        this.valueToArrowXPos = 0;
    }
    get templateID() { return "B777_CLOCK"; }
    onUpdate(_deltaTime) {
    }
    onEvent(_event) {
    }
}

registerInstrument("b777-clock", B777_CLOCK);
//# sourceMappingURL=B747_8_RUDDER.js.map