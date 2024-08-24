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
            this.mainCargoRect = document.querySelector("#maincargo-rect");
        }
        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }

            // SimVars for checking if door is open, in percentage opened
            var entry1LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:0", "percent");
            var fwdCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:2", "percent");
            var mainCargoROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:1", "percent");

            if (entry1LOpen >= 10) {
                this.entry1LRect.style.visibility = "visible";
                document.querySelector("#entry1L-auto-rect").style.visibility = "hidden";
                document.querySelector("#entry1L-auto").style.visibility = "hidden";
            } else {
                this.entry1LRect.style.visibility = "hidden";
                document.querySelector("#entry1L-auto-rect").style.visibility = "visible";
                document.querySelector("#entry1L-auto").style.visibility = "visible";
            }
            if (fwdCargoOpen >= 40) {
                this.fwdCargoRect.style.visibility = "visible";
            } else {
                this.fwdCargoRect.style.visibility = "hidden";
            }
            if (mainCargoROpen >= 40) {
                this.mainCargoRect.style.visibility = "visible";
            } else {
                this.mainCargoRect.style.visibility = "hidden";
            }
        }
    }
    B777_LowerEICAS_DRS.Display = Display;
})(B777_LowerEICAS_DRS || (B777_LowerEICAS_DRS = {}));
customElements.define("b777-lower-eicas-drs", B777_LowerEICAS_DRS.Display);