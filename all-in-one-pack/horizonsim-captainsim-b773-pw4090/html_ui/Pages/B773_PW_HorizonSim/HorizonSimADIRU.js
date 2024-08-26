class HorizonSimADIRU {
    //https://www.youtube.com/watch?v=1JyzVI5DX5E
    constructor() {
    }
    init() {
        this.resetInitalTimer = 30;       //reset duration
        this.adiruTimer = 7 * 60;     //implement a better ADIRU logic later
        this.currentPhase = SimVar.GetSimVarValue("SIM ON GROUND", "Bool");
        this.hasTO = false;
        this.hasLanded = false;

    }
    update() {
        if (!electricityIsAvail) {
            this.adiruTimer = 7 * 60;
            this.resetInitalTimer = 30;
        }
    }
    update(electricityIsAvail) {
        // Calculate deltatime
        var timeNow = Date.now();
        SimVar.SetSimVarValue("L:B777_Plane_Landed", "Bool", this.hasLanded);
        SimVar.SetSimVarValue("L:B777_Plane_TookOff", "Bool", this.hasTO);

        if (this.lastTime == null) this.lastTime = timeNow;
        var deltaTime = timeNow - this.lastTime;
        this.lastTime = timeNow;

        //ADIRU handler logic
        const onGround = SimVar.GetSimVarValue("SIM ON GROUND", "Bool");
        const adiruButtonState = SimVar.GetSimVarValue("L:B777_ADIRU_BUTTON_STATE", "Bool");
        const adiruState = SimVar.GetSimVarValue("L:B777_ADIRU_STATE", "Enum");
        const enginesRunning = SimVar.GetSimVarValue("ENG COMBUSTION:1", "Bool") || SimVar.GetSimVarValue("ENG COMBUSTION:2", "Bool");

        if (onGround && !adiruButtonState) {
            if (this.hasLanded && !enginesRunning) {
                SimVar.SetSimVarValue("L:B777_ADIRU_STATE", "Enum", 0);
                this.resetInitalTimer = 30;
            }
            else if (!this.hasTO && !this.hasLanded) {
                SimVar.SetSimVarValue("L:B777_ADIRU_STATE", "Enum", 0);
                this.resetInitalTimer = 30;
            }
        } else if (!onGround && !adiruButtonState && adiruState == 2) {
            SimVar.SetSimVarValue("L:B777_ADIRU_STATE", "Enum", 2);
        } else if (adiruButtonState && adiruState != 2) {
            //initial/reset
            if (this.resetInitalTimer > 0) {
                this.resetInitalTimer -= deltaTime / 1000;
            }
            else {
                SimVar.SetSimVarValue("L:B777_ADIRU_STATE", "Enum", 1);
            }
        }
        
        //phase change logic for ADIRU handler
        if (onGround == true && this.currentPhase == false) {
            this.hasLanded = true;
            this.hasTO = false;
            this.currentPhase = onGround;
        }
        if (onGround == false && this.currentPhase == true) {
            this.hasTO = true;
            this.hasLanded = false;
            this.currentPhase = onGround;
        }
        
        //align ADIRU
        if (!electricityIsAvail) return;

        if (adiruState == 0) {
            this.adiruTimer = 7 * 60;
        }

        if (adiruState == 1) {
            if (this.adiruTimer > 0) {
                this.adiruTimer -= deltaTime / 1000;
                if (this.adiruTimer <= 0) {
                    this.adiruTimer = -1;
                    SimVar.SetSimVarValue("L:B777_ADIRU_STATE", "Enum", 2);
                }
            }
        }

        //fail state
        if (adiruState == -1) {
            
        }

        SimVar.SetSimVarValue("L:B777_ADIRU_TIME_LEFT", "Enum", this.adiruTimer);
    }
}
