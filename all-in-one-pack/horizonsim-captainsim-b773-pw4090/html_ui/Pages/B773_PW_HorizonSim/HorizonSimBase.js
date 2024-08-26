class HorizonSimBase {
    constructor() {
        this.adiru = new HorizonSimADIRU();
        this.jettison = new HorizonSimJettison();   //mostly inop until CS add knob anim
        this.HorizonSimBoarding = new HorizonSimBoarding();
        this.HorizonSimFueling = new HorizonSimFueling();
        this.animHandler = new teeveeAnimHanlder();
    }
    init() {
        this.adiru.init();
        this.jettison.init();
        this.HorizonSimBoarding.init();
        this.HorizonSimFueling.init();
        this.animHandler.init();
        SimVar.SetSimVarValue("L:ELAPSED_TIME_ENGINE", "number", 0);
    }
    update(_deltaTime) {
        // alternatively may be able to use this.isElectricityAvailable() SimVar.GetSimVarValue("CIRCUIT GENERAL PANEL ON", "Bool") to get electricity status
        this.adiru.update(SimVar.GetSimVarValue("2 CIRCUIT CONNECTION ON:9", "Bool"));
        this.jettison.update();
        this.HorizonSimFueling.update(_deltaTime);
        this.HorizonSimBoarding.update(_deltaTime);
        this.animHandler.update();
    }
}