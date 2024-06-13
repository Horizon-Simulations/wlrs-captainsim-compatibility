var B777_LowerEICAS_GEAR;
(function (B777_LowerEICAS_GEAR) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
        }
        get templateID() { return "B777LowerEICASGEARTemplate" }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            this.isInitialised = true;
            this.gearDoorOpenLines = document.querySelector("#open-labels");
            this.gearDoorClosedText = document.querySelector("#closed-labels");
            this.noseLeft = document.querySelector("#brakeTemp1");
            this.noseRight = document.querySelector("#brakeTemp2");
            this.mainLeft1 = document.querySelector("#brakeTemp3");
            this.mainLeft2 = document.querySelector("#brakeTemp4");
            this.mainLeft3 = document.querySelector("#brakeTemp5");
            this.mainLeft4 = document.querySelector("#brakeTemp6");
            this.mainLeft5 = document.querySelector("#brakeTemp7");
            this.mainLeft6 = document.querySelector("#brakeTemp8");
            this.mainRight1 = document.querySelector("#brakeTemp9"); 
            //wait a sec this is not right, I'll check later
        }

        //FROM WT:
        /* BRAKE TEMPERATURE SIMULATION */

        /**
         * Initializes brake temperatures to equal the outside temperature
         * @private
         */

        /*
        setInitialBrakeTemps() {
            const oat = SimVar.GetSimVarValue("A:AMBIENT TEMPERATURE", "Celcius").toFixed(0);
            this.noseLeft.textContent = oat;

            const left = this.leftBrakeTemps.map(sys => {
                this.initializeBrakeSystem(sys, oat);
                return this.mapTemperatureToDisplayNumber(oat);
            });
            const right = this.rightBrakeTemps.map(sys => {
                this.initializeBrakeSystem(sys, oat);
                return this.mapTemperatureToDisplayNumber(oat);
            });
            this.previousValues = [left, right];
            this.gearPub.pub('left_main_gear_brake_temps', left, true);
            this.gearPub.pub('right_main_gear_brake_temps', right, true);
        }
        */

        /**
         * Updates brake temperatures and publishes them to the
         * @param timestamp the current timestamp
         * @private
         */
        
        /*
        updateBrakes(timestamp) {
            if (this.previousTimestamp === -1) {
                this.previousTimestamp = timestamp;
            }
            const deltaTime = MathUtils.clamp(timestamp - this.previousTimestamp, 0, 10000);
            const oat = this.oat.get();
            const leftWheelRpm = this.leftWheelRpm.get();
            const rightWheelRpm = this.rightWheelRpm.get();
            const left = this.leftBrakeTemps.map(sys => {
                this.updateBrakeTemperature(sys, oat, leftWheelRpm, this.leftBrakePressure.get(), deltaTime);
                return this.mapTemperatureToDisplayNumber(sys.value.get());
            });
            if (this.previousValues[0].some((v, i) => left[i] !== v)) {
                this.gearPub.pub('left_main_gear_brake_temps', left, true);
                this.previousValues[0] = left;
            }
            const right = this.rightBrakeTemps.map(sys => {
                this.updateBrakeTemperature(sys, oat, rightWheelRpm, this.rightBrakePressure.get(), deltaTime);
                return this.mapTemperatureToDisplayNumber(sys.value.get());
            });
            if (this.previousValues[1].some((v, i) => right[i] !== v)) {
                this.gearPub.pub('right_main_gear_brake_temps', right, true);
                this.previousValues[1] = right;
            }
            this.previousTimestamp = timestamp;
        }
        */

        /**
         * Updates brake temperature in the TemperatureSystem
         * @param system a TemperatureSystem
         * @param oat the outside air temperature
         * @param rpm wheel rpm
         * @param pressure brake pressure in psi
         * @param deltaTime elapsed time
         * @private
         */

        /*
        updateBrakeTemperature(system, oat, rpm, pressure, deltaTime) {
            system.setSourceTemp(0, oat);
            system.setSourceTemp(1, this.getPadTemp(rpm, pressure, oat, system));
            system.setSourceConductivity(0, MathUtils.clamp(Math.max(rpm, 1) / 80 + (Math.random() * 5 - 2.5), 2, 40));
            system.setSourceConductivity(1, MathUtils.clamp(Math.max(rpm, 1) / 40 + (Math.random() * 10 - 5), 2, 60));
            system.update(deltaTime);
        }
        */

        /**
         * Initializes brake temperature system with the given temperature
         * @param system the TemperatureSystem
         * @param temp a temperature
         * @private
         */

        /*
        initializeBrakeSystem(system, temp) {
            system.addSource({ temperature: temp, conductivity: 200 });
            system.addSource({ temperature: temp, conductivity: 200 });
            system.set(temp);
        }
         */

        /**
         * Utility function to calculate display value
         * @param temp new temperature
         * @returns number to display in system synoptics (MFD SYS)
         * @private
         */

        /*
        mapTemperatureToDisplayNumber(temp) {
            return MathUtils.clamp(temp < 40 ? 0 : ((temp - 40) / (MAXIMUM_BRAKE_TEMPERATURE - 40)) * 10, 0, 10);
        }
        */

        /**
         * Gets the brake pad temp given a wheelspeed and brake pressure.
         * @param rpm The wheel speed.
         * @param pressure The brake pressure in psi.
         * @param oat The outside air temperature.
         * @param tempSystem The temperature system to which this pad temp is being applied.
         * @returns A brake pad temp.
         */

        /*
        getPadTemp(rpm, pressure, oat, tempSystem) {
            let spread = 1000 - oat;
            if (pressure > 1500) {
                spread = 1250 - oat;
            }
            else if (pressure > 4000) {
                spread = 1350 - oat;
            }
            let rpmCoefficient = 0;
            if (rpm >= 1) {
                rpmCoefficient = MathUtils.clamp(rpm / 1000, 0.3, 1);
            }
            const addTemp = spread * MathUtils.clamp(pressure / 5000, 0, 1) * rpmCoefficient;
            return rpm < 1 ? oat : Math.max(oat + addTemp, tempSystem.value.get());
        }
        */

        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }
            var GearDoorsOpen = SimVar.GetSimVarValue("GEAR POSITION", "enum");
            var GearAnimClosed = SimVar.GetSimVarValue("GEAR ANIMATION POSITION", "percent");
        		
            if ((GearDoorsOpen == 1) || (GearAnimClosed == 0)) {
            	this.gearDoorOpenLines.style.visibility = "hidden";
            	this.gearDoorClosedText.style.visibility = "visible";
            } else {
            	this.gearDoorOpenLines.style.visibility = "visible";   
            	this.gearDoorClosedText.style.visibility = "hidden";
            }
        }
    }
    B777_LowerEICAS_GEAR.Display = Display;
})(B777_LowerEICAS_GEAR || (B777_LowerEICAS_GEAR = {}));
customElements.define("b777-lower-eicas-gear", B777_LowerEICAS_GEAR.Display);
//# sourceMappingURL=B747_8_LowerEICAS_GEAR.js.map