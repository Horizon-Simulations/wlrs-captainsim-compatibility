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
            this.entry2LRect = document.querySelector("#entry2L-rect");
            this.entry3LRect = document.querySelector("#entry3L-rect");
            this.entry4LRect = document.querySelector("#entry4L-rect");

            this.entry1RRect = document.querySelector("#entry1R-rect");
            this.entry2RRect = document.querySelector("#entry2R-rect");
            this.entry3RRect = document.querySelector("#entry3R-rect");
            this.entry4RRect = document.querySelector("#entry4R-rect");

            this.fwdCargoRect = document.querySelector("#fwdcargo-rect");
            this.aftCargoRect = document.querySelector("#aftcargo-rect");
            this.bulkCargoRect = document.querySelector("#bulkcargo-rect");
        }
        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }
            //I WILL ASSUME THAT THE DOORS ARE ALWAYS IN AUTO MODE
            // SimVars for checking if door is open, in percentage opened
            var entry1LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:0", "percent");
            var fwdCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:2", "percent");
            var entry4ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:1", "percent");

            if (entry1LOpen >= 10) {
                this.entry1LRect.style.visibility = "visible";
                document.querySelector("#entry1L-auto-rect").style.visibility = "hidden";
                document.querySelector("#entry1L-auto").style.visibility = "hidden";
            } else {
                this.entry1LRect.style.visibility = "hidden";
                document.querySelector("#entry1L-auto-rect").style.visibility = "visible";
                document.querySelector("#entry1L-auto").style.visibility = "visible";
            }
            if (fwdCargoOpen >= 10) {
                this.fwdCargoRect.style.visibility = "visible";
            } else {
                this.fwdCargoRect.style.visibility = "hidden";
            }
            if (entry4ROpen >= 10) {
                this.entry4RRect.style.visibility = "visible";
                document.querySelector("#entry4R-auto-rect").style.visibility = "hidden";
                document.querySelector("#entry4R-auto").style.visibility = "hidden";
            } else {
                this.entry4RRect.style.visibility = "hidden";
                document.querySelector("#entry4R-auto-rect").style.visibility = "visible";
                document.querySelector("#entry4R-auto").style.visibility = "visible";
            }
        }
    }
    B777_LowerEICAS_DRS.Display = Display;
})(B777_LowerEICAS_DRS || (B777_LowerEICAS_DRS = {}));
customElements.define("b777-lower-eicas-drs", B777_LowerEICAS_DRS.Display);