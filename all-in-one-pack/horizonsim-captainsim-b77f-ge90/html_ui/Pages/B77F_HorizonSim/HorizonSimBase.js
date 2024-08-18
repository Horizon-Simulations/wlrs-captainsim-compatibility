class HorizonSimBase {
    constructor() {
        this.irs = new HorizonSimIRS();
        this.jettison = new HorizonSimJettison();   //mostly inop until CS add knob anim
        this.HorizonSimBoarding = new HorizonSimBoarding();
        this.HorizonSimFueling = new HorizonSimFueling();
        this.animHandler = new teeveeAnimHanlder();
    }
    init() {
        this.irs.init();
        this.jettison.init();
        this.HorizonSimBoarding.init();
        this.HorizonSimFueling.init();
        SimVar.SetSimVarValue("L:ELAPSED_TIME_ENGINE", "number", 0);
    }
    update(_deltaTime) {
        // alternatively may be able to use this.isElectricityAvailable() SimVar.GetSimVarValue("CIRCUIT GENERAL PANEL ON", "Bool") to get electricity status
        this.irs.update(SimVar.GetSimVarValue("2 A:CIRCUIT CONNECTION ON:9", "Bool"));
        this.jettison.update();
        this.HorizonSimFueling.update(_deltaTime);
        this.HorizonSimBoarding.update(_deltaTime);
        this.animHandler.update();
    }
}