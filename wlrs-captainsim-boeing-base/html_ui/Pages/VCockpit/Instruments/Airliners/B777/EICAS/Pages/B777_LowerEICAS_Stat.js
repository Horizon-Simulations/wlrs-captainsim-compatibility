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
            this.isInitialised = true;
            this.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            this.date = document.querySelector("#date");
            this.utcTime = document.querySelector("#utctime");
            this.elapsedTime = document.querySelector("#time");

            // Call updateClock every second
            setInterval(this.updateClock.bind(this), 1000);
        }
        update(_deltaTime) {
            //var apuRPM = SimVar.GetSimVarValue("APU PCT RPM", "percent over 100");
        }
        updateClock() {
            var utc = new Date();
            var utcHours = utc.getUTCHours() <= 9 ? "0" + utc.getUTCHours() : utc.getUTCHours();
            var utcMinutes = utc.getUTCMinutes() <= 9 ? "0" + utc.getUTCMinutes() : utc.getUTCMinutes();
            var utcSeconds = utc.getUTCSeconds() <= 9 ? "0" + utc.getUTCSeconds() : utc.getUTCSeconds();
            var combinedUTC = utcHours + ":" + utcMinutes + ":" + utcSeconds;
            var combinedDate = utc.getUTCDate() + " " + this.months[utc.getUTCMonth()] + " " + (utc.getUTCFullYear()%1000);
            this.utcTime.textContent = combinedUTC;
            this.date.textContent = combinedDate;
        }
    }
        
    B777_LowerEICAS_Stat.Display = Display;
})(B777_LowerEICAS_Stat || (B777_LowerEICAS_Stat = {}));
customElements.define("b777-lower-eicas-stat", B777_LowerEICAS_Stat.Display);
//# sourceMappingURL=B747_8_LowerEICAS_Stat.js.map
