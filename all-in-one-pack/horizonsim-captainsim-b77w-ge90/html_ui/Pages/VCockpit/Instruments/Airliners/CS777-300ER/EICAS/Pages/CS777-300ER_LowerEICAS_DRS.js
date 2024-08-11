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
            this.emerLRect = document.querySelector("#emerL-rect");
            this.entry3LRect = document.querySelector("#entry3L-rect");
            this.entry4LRect = document.querySelector("#entry4L-rect");

            this.entry1RRect = document.querySelector("#entry1R-rect");
            this.entry2RRect = document.querySelector("#entry2R-rect");
            this.emerRRect = document.querySelector("#emerR-rect");
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

            // SimVars for checking if door is open, in percentage opened
            var entry1LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:0", "percent");
            var entry2LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:1", "percent");
            var entry3LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:4", "percent");
            var entry4LOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:3", "percent");
            var entry1ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:5", "percent"); //revise here
            var entry2ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:6", "percent");
            var entry3ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:7", "percent");
            var entry4ROpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:8", "percent");
            var fwdCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:12", "percent");
            var aftCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:13", "percent");
            var bulkCargoOpen = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:14", "percent");

            if (entry1LOpen >= 10) {
                this.entry1LRect.style.visibility = "visible";
            } else {
                this.entry1LRect.style.visibility = "hidden";
            }
            //revise
            if (entry2LOpen >= 10) {
                this.entry2LRect.style.visibility = "visible";
            } else {
                this.entry2LRect.style.visibility = "hidden";
            }
            if (entry3LOpen >= 10) {
                this.entry3LRect.style.visibility = "visible";
            } else {
                this.entry3LRect.style.visibility = "hidden";
            }
            if (entry4LOpen >= 10) {
                this.entry4LRect.style.visibility = "visible";
            } else {
                this.entry4LRect.style.visibility = "hidden";
            }
            if (entry1ROpen >= 10) {
                this.entry1RRect.style.visibility = "visible";
            } else {
                this.entry1RRect.style.visibility = "hidden";
            }
            if (entry2ROpen >= 10) {
                this.entry2RRect.style.visibility = "visible";
            } else {
                this.entry2RRect.style.visibility = "hidden";
            }
            if (entry3ROpen >= 10) {
                this.entry3RRect.style.visibility = "visible";
            } else {
                this.entry3RRect.style.visibility = "hidden";
            }
            if (entry4ROpen >= 10) {
                this.entry4RRect.style.visibility = "visible";
            } else {
                this.entry4RRect.style.visibility = "hidden";
            }

            if (fwdCargoOpen >= 10) {
                this.fwdCargoRect.style.visibility = "visible";
            } else {
                this.fwdCargoRect.style.visibility = "hidden";
            }
            if (aftCargoOpen >= 10) {
                this.aftCargoRect.style.visibility = "visible";
            } else {
                this.aftCargoRect.style.visibility = "hidden";
            }
            if (bulkCargoOpen >= 10) {
                this.bulkCargoRect.style.visibility = "visible";
            } else {
                this.bulkCargoRect.style.visibility = "hidden";
            }
        }
    }
    B777_LowerEICAS_DRS.Display = Display;
})(B777_LowerEICAS_DRS || (B777_LowerEICAS_DRS = {}));
customElements.define("b777-lower-eicas-drs", B777_LowerEICAS_DRS.Display);