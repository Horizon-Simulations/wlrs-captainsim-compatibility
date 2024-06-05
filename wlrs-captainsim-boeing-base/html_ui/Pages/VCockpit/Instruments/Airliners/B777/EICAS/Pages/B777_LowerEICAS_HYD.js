var B777_LowerEICAS_HYD;
(function (B777_LowerEICAS_HYD) {
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
            this.pressL = document.querySelector("#pressLvalue");
            this.pressC = document.querySelector("#pressCvalue");
            this.pressR = document.querySelector("#pressRvalue");
            this.qtyL = document.querySelector("#qtyLvalue");
            this.qtyC = document.querySelector("#qtyCvalue");
            this.qtyR = document.querySelector("#qtyRvalue");
            this.isInitialised = true;
        }

        update(_deltaTime) {
            this.updateHydraulic();
        }

        updateHydraulic() {
            this.pressL.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:1", "psi")).toFixed(0);
            this.pressC.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:2", "psi")).toFixed(0);
            this.pressR.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:3", "psi")).toFixed(0);

            this.qtyL.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:1", "percent"))/100).toFixed(2);
            this.qtyC.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:2", "percent"))/100).toFixed(2);
            this.qtyR.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:3", "percent"))/100).toFixed(2);
        }

    }

    B777_LowerEICAS_HYD.Display = Display;
})(B777_LowerEICAS_HYD || (B777_LowerEICAS_HYD = {}));
customElements.define("b777-lower-eicas-hyd", B777_LowerEICAS_HYD.Display);
//# sourceMappingURL=B747_8_LowerEICAS_HYD.js.map
