var B777_LowerEICAS_Stat;
(function (B777_LowerEICAS_Stat) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
        }
        get templateID() { return "B777LowerEICASStatTemplate"; }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            this.currentAPUCoolndex = 0;
            this.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                        
            
            this.apuEGTCool = []; //will be added later
            this.date = document.querySelector("#date");
            this.utcTime = document.querySelector("#utctime");
            this.elapsedTime = document.querySelector("#elapsedtime");
            this.apuRPM = document.querySelector('#RPM');
            this.apuEGT = document.querySelector('#EGT');
            this.apuPress = document.querySelector('#apuOilPress');
            this.apuTemp = document.querySelector('#apuOilTemp');
            this.apuQty = document.querySelector('#apuOilQty');
            this.apuEGTUnit = document.querySelector("#egt-unit");
            this.apuOilPressUnit = document.querySelector("#press-unit");
            this.apuOilTempUnit = document.querySelector("#oilTemp-unit");
            this.hydraulicL = document.querySelector('#pressL');
            this.hydraulicC = document.querySelector('#pressC');
            this.hydraulicR = document.querySelector('#pressR');
            this.hydQtyL = document.querySelector("#hydQtyL");
            this.hydQtyC = document.querySelector("#hydQtyC");
            this.hydQtyR = document.querySelector("#hydQtyR");

            this.apuEGT.textContent = "";
            this.apuEGTUnit.textContent = "";
            this.apuOilTempUnit.textContent = "";
            this.apuOilPressUnit.textContent = "";
            this.apuPress.textContent = "";
            this.apuTemp.textContent = "";
            this.apuQty.textContent = "";
            this.isInitialised = true;
        }

        update(_deltaTime) {
            this.updateHydraulic();
            this.updateAPUData();
            this.updateClock(_deltaTime);
        }

        updateHydraulic() {
            this.hydraulicL.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:1", "psi")).toFixed(0);
            this.hydraulicC.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:3", "psi")).toFixed(0);
            this.hydraulicR.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:2", "psi")).toFixed(0);

            this.hydQtyL.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:1", "percent"))/100).toFixed(2);
            this.hydQtyC.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:3", "percent"))/100).toFixed(2);
            this.hydQtyR.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:2", "percent"))/100).toFixed(2);
        }

        updateClock(_deltaTime) {
            var utc = new Date();
            var utcHours = utc.getUTCHours() <= 9 ? "0" + utc.getUTCHours() : utc.getUTCHours();
            var utcMinutes = utc.getUTCMinutes() <= 9 ? "0" + utc.getUTCMinutes() : utc.getUTCMinutes();
            var utcSeconds = utc.getUTCSeconds() <= 9 ? "0" + utc.getUTCSeconds() : utc.getUTCSeconds();
            var combinedUTC = utcHours + ":" + utcMinutes + ":" + utcSeconds;
            var combinedDate = utc.getUTCDate() + " " + this.months[utc.getUTCMonth()] + " " + (utc.getUTCFullYear()%1000);
            this.utcTime.textContent = combinedUTC;
            this.date.textContent = combinedDate;

            
            const elapsedSeconds = SimVar.GetSimVarValue("L:ELAPSED_TIME_ENGINE", "seconds");
            this.elapsedTime.textContent = this.getFormattedTime(elapsedSeconds);

        }

        getFormattedTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }        

        updateAPUData() {
            if ((SimVar.GetSimVarValue("APU PCT RPM", "percent")) > 3)
                {
                    this.apuEGTUnit.textContent = "C";
                    this.apuEGT.textContent = SimVar.GetSimVarValue("L:APU_EGT", "number");
                    this.apuRPM.textContent = SimVar.GetSimVarValue("L:APU_RPM", "number").toFixed(1);
                    this.apuPress.textContent = SimVar.GetSimVarValue("L:APU_OIL_PRESS", "number");
                    this.apuTemp.textContent = SimVar.GetSimVarValue("L:APU_OIL_TEMP", "number");
                    this.apuQty.textContent = SimVar.GetSimVarValue("L:APU_OIL_QTY", "number").toFixed(1);
                }
            else
            {
                this.apuEGTUnit.textContent = "";
                this.apuEGT.textContent = "";
                this.apuRPM.textContent = "";
                this.apuOilTempUnit.textContent = "";
                this.apuOilPressUnit.textContent = "";
                this.apuPress.textContent = "";
                this.apuTemp.textContent = "";
                this.apuQty.textContent = "";
            }
        }
    }

    B777_LowerEICAS_Stat.Display = Display;
})(B777_LowerEICAS_Stat || (B777_LowerEICAS_Stat = {}));
customElements.define("b777-lower-eicas-stat", B777_LowerEICAS_Stat.Display);