class B777_ALT extends Boeing_FCU.ALT {
    get templateID() { return "B777_ALT"; }
}
registerInstrument("b777-alt-element", B777_ALT);