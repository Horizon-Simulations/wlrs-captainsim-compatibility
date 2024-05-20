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
            this.entry1LRect = document.querySelector("#entry1L-rect");
            this.fwdCargoRect = document.querySelector("#fwdcargo-rect");
            this.entry4RRect = document.querySelector("#entry4R-rect");
        }
        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }

            // SimVars for checking if door is open, in percentage opened
            var entry1LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:0", "percent");
            var entry2LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:1", "percent");
            var entry3LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:4", "percent");
            var entry4LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:3", "percent");
            var entry1ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:4", "percent"); //revise here
            var entry2ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:5", "percent");
            var entry3ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:6", "percent");
            var entry4ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:7", "percent");
            var fwdCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:12", "percent");
            var aftCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:13", "percent");
            var bulkCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:14", "percent");

            if (entry1LOpen >= 10) {
                this.entry1LRect.style.visibility = "visible";
            } else {
                this.entry1LRect.style.visibility = "hidden";
            }
            if (fwdCargoOpen >= 10) {
                this.fwdCargoRect.style.visibility = "visible";
            } else {
                this.fwdCargoRect.style.visibility = "hidden";
            }
            if (entry4ROpen >= 10) {
                this.entry4RRect.style.visibility = "visible";
            } else {
                this.entry4RRect.style.visibility = "hidden";
            }
        }
    }
    B777_LowerEICAS_DRS.Display = Display;
})(B777_LowerEICAS_DRS || (B777_LowerEICAS_DRS = {}));
customElements.define("b777-lower-eicas-drs", B777_LowerEICAS_DRS.Display);
//# sourceMappingURL=B747_8_LowerEICAS_DRS.js.map