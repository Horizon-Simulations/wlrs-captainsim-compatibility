var B777_LowerEICAS_DRS;
(function (B777_LowerEICAS_DRS) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
        }
        get templateID() { return "B777LowerEICASDRSTemplate" }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            this.isInitialised = true;

            // Rectangles that appear when door is open
            this.entry1LRect = document.querySelector("#entry1-rect");
            this.fwdCargoRect = document.querySelector("#fwdcargo-rect");
            this.entry4RRect = document.querySelector("#entry4-rect");
        }
        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }

            // SimVars for checking if door is open, in percentage opened
            var entry1LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:0", "percent");
            var fwdCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:2", "percent");
            var entry4ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:1", "percent");

            if (entry1LOpen >= 40) {
                this.entry1LRect.style.visibility = "visible";
            } else {
                this.entry1LRect.style.visibility = "hidden";
            }
            if (fwdCargoOpen >= 40) {
                this.fwdCargoRect.style.visibility = "visible";
            } else {
                this.fwdCargoRect.style.visibility = "hidden";
            }
            if (entry4ROpen >= 40) {
                this.entry4RRect.style.visibility = "visible";
            } else {
                this.entry4RRect.style.visibility = "hidden";
            }
        }
    }
    B777_LowerEICAS_DRS.Display = Display;
})(B777_LowerEICAS_DRS || (B777_LowerEICAS_DRS = {}));
customElements.define("b777-lower-eicas-drs", B777_LowerEICAS_DRS.Display);