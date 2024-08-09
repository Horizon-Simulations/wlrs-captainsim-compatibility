var B777_LowerEICAS_ELEC;
(function(B777_LowerEICAS_ELEC) {
	class Display extends Airliners.EICASTemplateElement {
		constructor() {
			super();
			this.isInitialised = false;
		}
		get templateID() {
			return "B777LowerEICASELECTemplate"
		}
		connectedCallback() {
			super.connectedCallback();
			TemplateElement.call(this, this.init.bind(this));
		}
		init() {
			this.isInitialised = true;

			

		}
		update(_deltaTime) {
			if (!this.isInitialised) {
				return;
			}

			this.updateBattInfo();
			this.updateGen();
			this.updateDrive();

		}

		updateBattInfo() {
			const maxMainBattCapacity = 28; //modify with system.cfg
			const maxAPUBattCapacity = 24; //modify with system.cfg
			this.querySelector("#mainBattVolts").textContent = SimVar.GetSimVarValue("ELECTRICAL BATTERY VOLTAGE:1", "Volts").toFixed(0);
			let mainBattAmps = SimVar.GetSimVarValue("ELECTRICAL BATTERY ESTIMATED CAPACITY PCT:1", "Percent over 100")*maxMainBattCapacity;
			this.querySelector("#mainBattAmps").textContent = Math.abs(mainBattAmps).toFixed(0);
			let mainBattCharge = (SimVar.GetSimVarValue("ELECTRICAL BATTERY LOAD:1", "Amperes") <= 0) ? "CHG" : "DISCH";
			this.querySelector("#mainBattCharge").textContent = mainBattCharge;

			this.querySelector("#apuBattVolts").textContent = SimVar.GetSimVarValue("ELECTRICAL BATTERY VOLTAGE:2", "Volts").toFixed(0);
			let apuBattAmps = SimVar.GetSimVarValue("ELECTRICAL BATTERY ESTIMATED CAPACITY PCT:2", "Percent over 100")*maxAPUBattCapacity;
			this.querySelector("#apuBattAmps").textContent = Math.abs(apuBattAmps).toFixed(0);
			let apuBattCharge = (SimVar.GetSimVarValue("ELECTRICAL BATTERY LOAD:2", "Amperes") <= 0) ? "CHG" : "DISCH";
			this.querySelector("#apuBattCharge").textContent = apuBattCharge;
		}

		updateGen() {
			if (SimVar.GetSimVarValue("APU PCT RPM", "Percent") > 90) {
				this.querySelector("#apuGen").style.stroke = "lime";
			}
			else {
				this.querySelector("#apuGen").style.stroke = "white";
			}

			if (SimVar.GetSimVarValue("GENERAL ENG MASTER ALTERNATOR:1", "Bool")) {
				this.querySelector("#leftGen").style.stroke = "lime";
			}
			else {
				this.querySelector("#leftGen").style.stroke = "white";
			}

			if (SimVar.GetSimVarValue("GENERAL ENG MASTER ALTERNATOR:2", "Bool")) {
				this.querySelector("#rightGen").style.stroke = "lime";
			}
			else {
				this.querySelector("#rightGen").style.stroke = "white";
			}
		}

		updateDrive() {
			//Drive btn is inop, so just watch the engine RPM to determine. Follows the panel.cfg
			if (SimVar.GetSimVarValue("TURB ENG N2:1", "Percent") < 70) {
				this.querySelector("#leftDriveFault").style.visibility = "visible";
				this.querySelector("#leftDrive").style.stroke = "white";
			}
			else {
				this.querySelector("#leftDriveFault").style.visibility = "hidden";
				this.querySelector("#leftDrive").style.stroke = "lime";
			}

			if (SimVar.GetSimVarValue("TURB ENG N2:2", "Percent") < 70) {
				this.querySelector("#rightDriveFault").style.visibility = "visible";
				this.querySelector("#rightDrive").style.stroke = "white";
			}
			else {
				this.querySelector("#rightDriveFault").style.visibility = "hidden";
				this.querySelector("#rightDrive").style.stroke = "lime";
			}
		}
	}
	B777_LowerEICAS_ELEC.Display = Display;
})
(B777_LowerEICAS_ELEC || (B777_LowerEICAS_ELEC = {}));
customElements.define("b777-lower-eicas-elec", B777_LowerEICAS_ELEC.Display);