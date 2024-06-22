class SaltyIRS {
    constructor() {
        console.log("SaltyIRS loaded");
    }
    init() {
        this.irsTimer = 7 * 60;
    }
    update() {
        if (!electricityIsAvail) {
            this.irsTimer = 7 * 60;
        }
    }
    update(electricityIsAvail) {
        // Calculate deltatime
        var timeNow = Date.now();
        if (this.lastTime == null) this.lastTime = timeNow;
        var deltaTime = timeNow - this.lastTime;
        this.lastTime = timeNow;
        
        if (!electricityIsAvail) return;

        var IRSState = SimVar.GetSimVarValue("L:SALTY_IRS_STATE", "Enum");
        
        if (IRSState == 1) {
            if (this.irsTimer > 0) {
                this.irsTimer -= deltaTime / 1000;
                if (this.irsTimer <= 0) {
                    this.irsTimer = -1;
                    SimVar.SetSimVarValue("L:SALTY_IRS_STATE", "Enum", 2);
                }
            }
        }

        SimVar.SetSimVarValue("L:SALTY_IRS_TIME_LEFT", "Enum", this.irsTimer);

    }
}
