class B777_HDG extends Boeing_FCU.HDG {
    get templateID() { return "B777_HDG"; } 
}
registerInstrument("b777-hdg-element", B777_HDG);