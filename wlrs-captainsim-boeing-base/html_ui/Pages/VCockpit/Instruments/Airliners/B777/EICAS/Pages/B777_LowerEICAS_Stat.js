var B777_LowerEICAS_Stat;
(function (B777_LowerEICAS_Stat) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
            this.currentEGTIndex = 0; // Add this property to track the current index in the apuEGT array
        }
        get templateID() { return "B777LowerEICASStatTemplate"; }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            this.isInitialised = true;
            this.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            this.apuEGTStart = [80, 97, 99, 101, 103, 105, 107, 115, 133, 156, 181, 206, 227, 246, 264, 279, 293, 306, 319, 330, 340, 350, 359, 367, 375, 382, 389, 395, 400, 405, 409, 413, 417, 421, 424, 427, 430, 432, 434, 436,
                438, 443, 446, 449, 452, 456, 460, 464, 468, 472, 476, 480, 484, 489, 493, 498, 503, 507, 512, 516, 521, 526, 530, 534, 539, 543, 548, 552, 556, 560, 564, 568, 572, 575, 579, 582, 585, 587, 590, 592, 594,
                596, 598, 600, 603, 607, 609, 611, 613, 614, 616, 617, 618, 619, 620, 621, 622, 623, 623, 624, 624, 625, 624, 625, 624, 624, 624, 624, 623, 622, 621, 621, 620, 619, 618, 617, 616, 615, 615, 616, 617, 617,
                618, 619, 619, 619, 618, 618, 618, 618, 618, 619, 620, 621, 621, 621, 621, 620, 619, 618, 617, 616, 614, 613, 611, 609, 608, 607, 606, 605, 604, 603, 602, 602, 601, 600, 599, 597, 595, 593, 591, 589, 587,
                584, 581, 579, 576, 573, 570, 568, 565, 562, 559, 556, 553, 550, 547, 544, 541, 538, 535, 532, 528, 524, 521, 517, 513, 509, 504, 499, 493, 487, 481, 473, 465, 457, 449, 442, 435, 430, 426, 422, 418, 414,
                408, 404, 400, 396, 393, 390, 387, 385, 383, 382, 381, 379, 378, 377, 376, 375, 374, 375, 376, 377, 379, 381, 383, 385, 387, 389, 391, 393, 395, 397, 398, 399, 400, 400, 400, 400, 399, 400, 401, 400, 400
                                                        //383 is 100%
            ];
            this.date = document.querySelector("#date");
            this.utcTime = document.querySelector("#utctime");
            this.elapsedTime = document.querySelector("#time");
            this.apuRPM = document.querySelector('#RPM');
            this.apuEGT = document.querySelector('#EGT');
            this.apuPress = document.querySelector('#apuPress;');
            //this.apuQty = document.querySelector('#qty;');
            this.hydraulicL = document.querySelector('#pressL');
            this.hydraulicC = document.querySelector('#pressC');
            this.hydraulicR = document.querySelector('#pressR');
            // Call updateClock every second
            setInterval(this.updateClock.bind(this), 1000);
            // Call updateAPUData every 0.2 seconds
            setInterval(this.updateAPUData.bind(this), 400);
        }

        update(_deltaTime) {
            this.hydraulicL.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:1", "psi")).toFixed(0);
            this.hydraulicC.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:3", "psi")).toFixed(0);
            this.hydraulicR.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:2", "psi")).toFixed(0);
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

        updateAPUData() {
            let apuStart = SimVar.GetSimVarValue("APU SWITCH", "Bool");
            let egt = this.apuEGTStart[this.currentEGTIndex];
        
            if (apuStart) {
                this.apuEGT.textContent = egt;
                this.currentEGTIndex++;
                if (this.currentEGTIndex >= this.apuEGTStart.length) {
                    this.currentEGTIndex = this.apuEGTStart.length - 1;
                }
            } else {
                this.apuEGT.textContent = egt;
                this.currentEGTIndex--;
                if (this.currentEGTIndex < 0) {
                    this.currentEGTIndex = 0;
                }
            }
        
            this.apuRPM.textContent = (SimVar.GetSimVarValue("APU PCT RPM", "percent")).toFixed(1);
        }        
    }

    B777_LowerEICAS_Stat.Display = Display;
})(B777_LowerEICAS_Stat || (B777_LowerEICAS_Stat = {}));
customElements.define("b777-lower-eicas-stat", B777_LowerEICAS_Stat.Display);
//# sourceMappingURL=B747_8_LowerEICAS_Stat.js.map
