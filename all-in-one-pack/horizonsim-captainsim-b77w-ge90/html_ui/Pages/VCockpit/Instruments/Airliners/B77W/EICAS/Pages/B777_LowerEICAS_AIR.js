var B777_LowerEICAS_AIR;
(function (B777_LowerEICAS_AIR) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;

        }
        get templateID() { return "B777LowerEICASHydTemplate"; }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            
            

            //initial hide
            for(var i = 0; i < this.lineL_ENG.length; i++) {
                this.lineL_ENG[i].setAttribute("visibility", "hidden");
            }
            for(var i = 0; i < this.lineL_ENG.length; i++) {
                this.lineL_ELEC[i].setAttribute("visibility", "hidden");
            }
            for(var i = 0; i < this.lineR_ENG.length; i++) {
                this.lineR_ENG[i].setAttribute("visibility", "hidden");
            }
            for(var i = 0; i < this.lineR_ENG.length; i++) {
                this.lineR_ELEC[i].setAttribute("visibility", "hidden");
            }
            document.querySelector("#L_SHARE1").setAttribute("visibility", "hidden");
            document.querySelector("#L_SHARE2").setAttribute("visibility", "hidden");
            document.querySelector("#L_ENG_PUMP").setAttribute("visibility", "hidden");
            document.querySelector("#L_ELEC_PUMP").setAttribute("visibility", "hidden");
            document.querySelector("#R_SHARE1").setAttribute("visibility", "hidden");
            document.querySelector("#R_SHARE2").setAttribute("visibility", "hidden");
            document.querySelector("#R_ENG_PUMP").setAttribute("visibility", "hidden");
            document.querySelector("#R_ELEC_PUMP").setAttribute("visibility", "hidden");

            setInterval(this.updateHydraulic.bind(this), 200);
            this.isInitialised = true;
        }

        update(_deltaTime) {
        }

        updateHydraulic() {
            this.pressL.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:1", "psi")).toFixed(0);
            this.pressC.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:3", "psi")).toFixed(0);
            this.pressR.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:2", "psi")).toFixed(0);

            this.qtyL.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:1", "percent"))/100).toFixed(2);
            this.qtyC.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:3", "percent"))/100).toFixed(2);
            this.qtyR.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:2", "percent"))/100).toFixed(2);

            this.updateLogicSwitches();
            this.updateLogicKnobs();
        }

        updateLogicSwitches() {
            //handles ON position for engine driven pumps (only when engine running)
            if (SimVar.GetSimVarValue("A:HYDRAULIC SWITCH:1", "bool") && SimVar.GetSimVarValue("A:TURB ENG N1:1", "percent") > 2) {
                //turn on when circuit on
                document.querySelector("#L_ENG_PUMP").setAttribute("visibility", "visible");
                if (SimVar.GetSimVarValue("A:HYDRAULIC PRESSURE:1", "psi") > 2200) {
                    for(var i = 0; i < this.lineL_ENG.length; i++) {
                        this.lineL_ENG[i].setAttribute("visibility", "visible");   
                    }
                }
            }
            else{
                document.querySelector("#L_ENG_PUMP").setAttribute("visibility", "hidden");
                for(var i = 0; i < this.lineL_ENG.length; i++) {
                    this.lineL_ENG[i].setAttribute("visibility", "hidden");
                }
            }

            if (SimVar.GetSimVarValue("A:HYDRAULIC SWITCH:2", "bool") && SimVar.GetSimVarValue("A:TURB ENG N1:2", "percent") > 2) {
                //turn on when circuit on
                document.querySelector("#R_ENG_PUMP").setAttribute("visibility", "visible");
                if (SimVar.GetSimVarValue("A:HYDRAULIC PRESSURE:2", "psi") > 2200) {
                    for(var i = 0; i < this.lineR_ENG.length; i++) {
                        this.lineR_ENG[i].setAttribute("visibility", "visible");   
                    }
                }
            }
            else{
                document.querySelector("#R_ENG_PUMP").setAttribute("visibility", "hidden");
                for(var i = 0; i < this.lineR_ENG.length; i++) {
                    this.lineR_ENG[i].setAttribute("visibility", "hidden");
                }
            }


        }

        updateLogicKnobs() {
            //handles ON position
            if (SimVar.GetSimVarValue("L:XMLVAR_HYDRAULICS_DEMAND_LEFT", "Number") == 2) {
                document.querySelector("#L_ELEC_PUMP").setAttribute("visibility", "visible");
                //SimVar.SetSimVarValue("K:HYDRAULIC_SWITCH_TOGGLE", "Number", 1); //DO NOT USE, JUST FOR TESTING, LOGIC IN WT TEMPLATE/FMC

                if ((SimVar.GetSimVarValue("A:HYDRAULIC PRESSURE:1", "psi") > 2200)) {
                    for(var i = 0; i < this.lineL_ELEC.length; i++) {
                        this.demandLeft = true;
                        this.lineL_ELEC[i].setAttribute("visibility", "visible");
                    }
                }
                else {
                    //SimVar.SetSimVarValue("K:HYDRAULIC_SWITCH_TOGGLE", "Number", 1);
                    for(var i = 0; i < this.lineL_ELEC.length; i++) {
                        this.demandLeft = true;
                        this.lineL_ELEC[i].setAttribute("visibility", "hidden");
                    }
                }
            }
            if (SimVar.GetSimVarValue("L:XMLVAR_HYDRAULICS_DEMAND_RIGHT", "Number") == 2) {
                document.querySelector("#R_ELEC_PUMP").setAttribute("visibility", "visible");
                //SimVar.SetSimVarValue("K:HYDRAULIC_SWITCH_TOGGLE", "Number", 2);  //DON'T USE :)
                if ((SimVar.GetSimVarValue("A:HYDRAULIC PRESSURE:2", "psi") > 2200)) {
                    for(var i = 0; i < this.lineR_ELEC.length; i++) {
                        this.demandRight = true;
                        this.lineR_ELEC[i].setAttribute("visibility", "visible");
                    }
                }
                else {
                    //SimVar.SetSimVarValue("K:HYDRAULIC_SWITCH_TOGGLE", "Number", 1);
                    for(var i = 0; i < this.lineR_ELEC.length; i++) {
                        this.demandRight = true;
                        this.lineR_ELEC[i].setAttribute("visibility", "hidden");
                    }
                }
            }

            //handles OFF position
            if (SimVar.GetSimVarValue("L:XMLVAR_HYDRAULICS_DEMAND_LEFT", "Number") == 0) {
                document.querySelector("#L_ELEC_PUMP").setAttribute("visibility", "hidden");
                //SimVar.SetSimVarValue("K:HYDRAULIC_SWITCH_TOGGLE", "Number", 1);
                for(var i = 0; i < this.lineL_ELEC.length; i++) {
                    this.demandLeft = true;
                    this.lineL_ELEC[i].setAttribute("visibility", "hidden");
                }
            }
            if (SimVar.GetSimVarValue("L:XMLVAR_HYDRAULICS_DEMAND_RIGHT", "Number") == 0) {
                document.querySelector("#R_ELEC_PUMP").setAttribute("visibility", "hidden");
                 //SimVar.SetSimVarValue("K:HYDRAULIC_SWITCH_TOGGLE", "Number", 1);
                for(var i = 0; i < this.lineR_ELEC.length; i++) {
                    this.demandRight = true;
                    this.lineR_ELEC[i].setAttribute("visibility", "hidden");
                }
            }


            //handle share elements
            if ((SimVar.GetSimVarValue("A:HYDRAULIC PRESSURE:1", "psi") > 2200))
            {
                document.querySelector("#L_SHARE1").setAttribute("visibility", "visible");
                document.querySelector("#L_SHARE2").setAttribute("visibility", "visible");
            }
            else {
                document.querySelector("#L_SHARE1").setAttribute("visibility", "hidden");
                document.querySelector("#L_SHARE2").setAttribute("visibility", "hidden");
            }
            if ((SimVar.GetSimVarValue("A:HYDRAULIC PRESSURE:2", "psi") > 2200))
            {
                document.querySelector("#R_SHARE1").setAttribute("visibility", "visible");
                document.querySelector("#R_SHARE2").setAttribute("visibility", "visible");
            }
            else {
                document.querySelector("#R_SHARE1").setAttribute("visibility", "hidden");
                document.querySelector("#R_SHARE2").setAttribute("visibility", "hidden");
            }
        }

    }

    B777_LowerEICAS_AIR.Display = Display;
})(B777_LowerEICAS_AIR || (B777_LowerEICAS_AIR = {}));
customElements.define("b777-lower-eicas-air", B777_LowerEICAS_AIR.Display);