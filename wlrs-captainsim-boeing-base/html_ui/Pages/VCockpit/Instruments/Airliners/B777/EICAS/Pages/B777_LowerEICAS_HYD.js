var B777_LowerEICAS_HYD;
(function (B777_LowerEICAS_HYD) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;

            this.lineL_ENG = new Array();
            this.lineL_ELEC = new Array();

        }
        get templateID() { return "B777LowerEICASHydTemplate"; }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            this.pressL = document.querySelector("#pressLvalue");
            this.pressC = document.querySelector("#pressCvalue");
            this.pressR = document.querySelector("#pressRvalue");
            this.qtyL = document.querySelector("#qtyLvalue");
            this.qtyC = document.querySelector("#qtyCvalue");
            this.qtyR = document.querySelector("#qtyRvalue");

            this.demandLeft = false;

            //document.querySelector("#L_ELEC_PUMP")

            //add elements
            this.lineL_ENG.push(document.querySelector("#L_ENG_ACTIVE1"));
            this.lineL_ENG.push(document.querySelector("#L_ENG_ACTIVE2"));
            this.lineL_ELEC.push(document.querySelector("#L_ELEC_ACTIVE1"));
            this.lineL_ELEC.push(document.querySelector("#L_ELEC_ACTIVE2"));
            

            //initial hide
            for(var i = 0; i < this.lineL_ENG.length; i++) {
                this.lineL_ENG[i].setAttribute("visibility", "hidden");
            }
            for(var i = 0; i < this.lineL_ENG.length; i++) {
                this.lineL_ELEC[i].setAttribute("visibility", "hidden");
            }
            document.querySelector("#L_SHARE1").setAttribute("visibility", "hidden");
            document.querySelector("#L_SHARE2").setAttribute("visibility", "hidden");
            document.querySelector("#L_ENG_PUMP").setAttribute("visibility", "hidden");
            document.querySelector("#L_ELEC_PUMP").setAttribute("visibility", "hidden");

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
                for(var i = 0; i < this.lineL_ENG.length; i++) {
                    this.lineL_ENG[i].setAttribute("visibility", "hidden");
                    document.querySelector("#L_ENG_PUMP").setAttribute("visibility", "hidden");
                }
            }


        }

        updateLogicKnobs() {
            //handles ON position
            if (SimVar.GetSimVarValue("L:XMLVAR_HYDRAULICS_DEMAND_LEFT", "Number") == 2) {
                for(var i = 0; i < this.lineL_ELEC.length; i++) {
                    this.demandLeft = true;
                    this.lineL_ELEC[i].setAttribute("visibility", "visible");
                    document.querySelector("#L_ELEC_PUMP").setAttribute("visibility", "visible");
                    SimVar.GetSimVarValue("K:HYDRAULIC_SWITCH_TOGGLE", "Number", 1);
                }
            }

            //handles OFF position
            if (SimVar.GetSimVarValue("L:XMLVAR_HYDRAULICS_DEMAND_LEFT", "Number") == 0) {
                for(var i = 0; i < this.lineL_ELEC.length; i++) {
                    this.demandLeft = false;
                    this.lineL_ELEC[i].setAttribute("visibility", "hidden");
                    document.querySelector("#L_ELEC_PUMP").setAttribute("visibility", "hidden");
                }
            }


            //handle share elements
            if (this.demandLeft || (SimVar.GetSimVarValue("A:HYDRAULIC PRESSURE:1", "psi") > 2200))
            {
                document.querySelector("#L_SHARE1").setAttribute("visibility", "visible");
                document.querySelector("#L_SHARE2").setAttribute("visibility", "visible");
            }
            else {
                document.querySelector("#L_SHARE1").setAttribute("visibility", "hidden");
                document.querySelector("#L_SHARE2").setAttribute("visibility", "hidden");
            }
        }

    }

    B777_LowerEICAS_HYD.Display = Display;
})(B777_LowerEICAS_HYD || (B777_LowerEICAS_HYD = {}));
customElements.define("b777-lower-eicas-hyd", B777_LowerEICAS_HYD.Display);
//# sourceMappingURL=B747_8_LowerEICAS_HYD.js.map
