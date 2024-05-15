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
            this.currentEGTIndex = 0;
            this.currentCoolEGTIndex = 0;
            this.isInitialised = true;
            this.ambientTemp = (SimVar.GetSimVarValue("A:AMBIENT TEMPERATURE", "Celcius")).toFixed(0);
            this.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            this.apuEGTStart = [0, 0, this.ambientTemp, this.ambientTemp, 80, 80, 97, 97, 99, 99, 101, 101, 103, 103, 105, 105, 107, 107, 115, 115, 133, 133, 156, 156, 181, 181, 206, 206, 227, 227, 246, 246, 264, 264, 279, 279, 293, 293, 306, 306, 319, 319, 330, 330, 340, 340, 350, 350,
                359, 359, 367, 367, 375, 375, 382, 382, 389, 389, 395, 395, 400, 400, 405, 405, 409, 409, 413, 413, 417, 417, 421, 421, 424, 424, 427, 427, 430, 430, 432, 432, 434, 434, 436, 436, 438, 438, 443, 443, 446, 446, 449,
                449, 452, 452, 456, 456, 460, 460, 464, 464, 468, 468, 472, 472, 476, 476, 480, 480, 484, 484, 489, 489, 493, 493, 498, 498, 503, 503, 507, 507, 512, 512, 516, 516, 521, 521, 526, 526, 530, 530, 534, 534, 539,
                539, 543, 543, 548, 548, 552, 552, 556, 556, 560, 560, 564, 564, 568, 568, 572, 572, 575, 575, 579, 579, 582, 582, 585, 585, 587, 587, 590, 590, 592, 592, 594, 594, 596, 596, 598, 598, 600, 600, 603, 603, 607,
                607, 609, 609, 611, 611, 613, 613, 614, 614, 616, 616, 617, 617, 618, 618, 619, 619, 620, 620, 621, 621, 622, 622, 623, 623, 623, 623, 624, 624, 624, 624, 625, 625, 624, 624, 625, 625, 624, 624, 624, 624, 624,
                624, 624, 624, 623, 623, 622, 622, 621, 621, 621, 621, 620, 620, 619, 619, 618, 618, 617, 617, 616, 616, 615, 615, 615, 615, 616, 616, 617, 617, 617, 617, 618, 618, 618, 618, 618, 618, 618, 618, 618, 618, 618,
                619, 619, 619, 619, 619, 619, 620, 620, 621, 621, 621, 621, 621, 621, 621, 621, 621, 621, 620, 620, 619, 619, 618, 618, 617, 617, 616, 616, 616, 616, 614, 614, 613, 613, 611, 611, 609, 609, 608, 608, 607, 607,
                606, 606, 605, 605, 604, 604, 603, 603, 602, 602, 602, 602, 601, 601, 600, 600, 599, 599, 597, 597, 595, 595, 593, 593, 591, 591, 589, 589, 587, 587, 584, 584, 581, 581, 579, 579, 576, 576, 573, 573, 570, 570,
                568, 568, 565, 565, 562, 562, 559, 559, 556, 556, 553, 553, 550, 550, 547, 547, 544, 544, 541, 541, 538, 538, 535, 535, 532, 532, 528, 528, 524, 524, 521, 521, 517, 517, 513, 513, 509, 509, 504, 504, 499, 499,
                493, 493, 487, 487, 481, 481, 473, 473, 465, 465, 457, 457, 449, 449, 442, 442, 435, 435, 430, 430, 426, 426, 422, 422, 418, 418, 414, 414, 408, 408, 404, 404, 400, 400, 400, 400, 396, 396, 393, 393, 390, 390,
                387, 387, 385, 385, 383, 383, 382, 382, 382, 382, 381, 381, 381, 381, 379, 379, 378, 378, 377, 377, 376, 376, 375, 375, 375, 375, 376, 376, 377, 377, 379, 379, 381, 381, 383, 383, 385, 385, 387, 387, 389, 389,
                391, 391, 393, 393, 395, 395, 397, 397, 398, 398, 399, 399, 400, 400, 400, 400, 400, 400, 400, 400, 399, 399, 400, 400, 401, 401, 400];
            this.apuEGTCool = []; //will be added later
            this.date = document.querySelector("#date");
            this.utcTime = document.querySelector("#utctime");
            this.elapsedTime = document.querySelector("#time");
            this.apuRPM = document.querySelector('#RPM');
            this.apuEGT = document.querySelector('#EGT');
            this.apuPress = document.querySelector('#apuPress');
            this.apuQty = document.querySelector('#qty');
            this.apuEGTUnit = document.querySelector("#egt-unit");
            this.hydraulicL = document.querySelector('#pressL');
            this.hydraulicC = document.querySelector('#pressC');
            this.hydraulicR = document.querySelector('#pressR');
            // Call updateClock every second
            setInterval(this.updateClock.bind(this), 1000);
            // Call updateAPUData every 0.2 seconds
            setInterval(this.updateAPUData.bind(this), 300);
            let updateFreq = (((80000-14000))/this.apuEGTStart.length*2); //81s s the apu start time; takes 7 s to start showing values 
            setInterval(this.updateAPUegt.bind(this), updateFreq); //0.13s for value
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

        updateAPUegt() {
            if ((SimVar.GetSimVarValue("APU PCT RPM", "percent")) > 7)
                {
                    this.apuEGTUnit.textContent = "C";
                    let apuStart = SimVar.GetSimVarValue("APU SWITCH", "Bool");
                    if (apuStart) {
                        let egt = this.apuEGTStart[this.currentEGTIndex];
                        this.apuEGT.textContent = Math.round((Math.floor(Math.random() * 1) + 1)*egt + this.ambientTemp*1.8);       //heat factor = 1.8; random upper limit = 1.1
                        this.currentEGTIndex++;
                        if (this.currentEGTIndex >= this.apuEGTStart.length) {
                            this.currentEGTIndex = this.apuEGTStart.length - 1;
                        }
                    } else {
                        let egt = this.apuEGTCool[this.currentEGTIndex];
                        this.apuEGT.textContent = egt;
                        this.currentEGTIndex--;
                        if (this.currentEGTIndex < 0) {
                            this.currentEGTIndex = 0;
                        }
                    }
                }
            else
            {this.apuEGT.textContent = "";
            this.apuEGTUnit.textContent = "";
            }
        }   

        updateAPUData() {
            if ((SimVar.GetSimVarValue("APU PCT RPM", "percent")) > 7)
                {
                    this.apuRPM.textContent = (SimVar.GetSimVarValue("APU PCT RPM", "percent")).toFixed(1);
                }
            else
            {this.apuRPM.textContent = "";}
        }
    }

    B777_LowerEICAS_Stat.Display = Display;
})(B777_LowerEICAS_Stat || (B777_LowerEICAS_Stat = {}));
customElements.define("b777-lower-eicas-stat", B777_LowerEICAS_Stat.Display);
//# sourceMappingURL=B747_8_LowerEICAS_Stat.js.map
