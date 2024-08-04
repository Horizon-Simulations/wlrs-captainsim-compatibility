var B777_LowerEICAS_Fuel;
(function (B777_LowerEICAS_Fuel) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.allTextValueComponents = new Array();
            this.allFuelComponents = new Array();
            this.gallonToMegagrams = 0;
            this.gallonToMegapounds = 0;
            this.units;
            this.isInitialised = false;
        }
        get templateID() { return "B777LowerEICASFuelTemplate"; }
        connectedCallback() {
            super.connectedCallback();
        }
        init(_eicas) {
            this.eicas = _eicas;
            this.unitTextSVG = this.querySelector("#TotalFuelUnits");
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#TotalFuelValue"), this.getTotalFuelInMegagrams.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#CenterValue"), this.getMainTankFuelInMegagrams.bind(this, 1), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#Main1Value"), this.getMainTankFuelInMegagrams.bind(this, 2), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#Main2Value"), this.getMainTankFuelInMegagrams.bind(this, 3), 1));
            var engine1 = this.querySelector("#Engine1");
            if (engine1 != null) {
                var enginePathD = engine1.getAttribute("d");
                this.applyPathDString("#Engine2", enginePathD);
            }
            for (var engine = 1; engine <= 2; ++engine) {
                this.allFuelComponents.push(new Boeing.FuelEngineState(this.querySelector("#Engine" + engine), engine));
            }
            var smallPumpTemplate = this.querySelector("#SmallPumpTemplate");
            var largePumpTemplate = this.querySelector("#LargePumpTemplate");
            this.createPumps(this.querySelector("#MainPumps"), smallPumpTemplate);
            if (smallPumpTemplate != null) {
                smallPumpTemplate.remove();
            }
            if (largePumpTemplate != null) {
                largePumpTemplate.remove();
            }
            var valvesGroup = this.querySelector("#Valves");
            if (valvesGroup != null) {
                var valveTemplate = this.querySelector("#ValveTemplate");
                if (valveTemplate != null) {
                    var allValves = valvesGroup.querySelectorAll("g");
                    if (allValves != null) {
                        for (var i = 0; i < allValves.length; ++i) {
                            var clonedValve = valveTemplate.cloneNode(true);
                            clonedValve.removeAttribute("id");
                            allValves[i].appendChild(clonedValve);
                            var id = parseInt(allValves[i].id.replace("Valve", ""));
                            if ((id != NaN) && (id > 0)) {
                                this.allFuelComponents.push(new Boeing.FuelValve(allValves[i], id));
                            }
                        }
                    }
                    valveTemplate.remove();
                }
            }
            var smallPumpFlowLineTemplate = this.querySelector("#SmallPumpFlowLineTemplate");
            var largePumpFlowLineTemplate = this.querySelector("#LargePumpFlowLineTemplate");
            this.createFlowLines(this.querySelector("#MainPumpFlowLines"), smallPumpFlowLineTemplate);
            this.createFlowLines(this.querySelector("#MainFlowLines"));
            if (smallPumpFlowLineTemplate != null) {
                smallPumpFlowLineTemplate.remove();
            }
            if (largePumpFlowLineTemplate != null) {
                largePumpFlowLineTemplate.remove();
            }
            if (this.allFuelComponents != null) {
                for (var i = 0; i < this.allFuelComponents.length; ++i) {
                    if (this.allFuelComponents[i] != null) {
                        this.allFuelComponents[i].init();
                    }
                }
            }
            this.gallonToMegagrams = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram") * 0.001;
            this.gallonToMegapounds = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "lbs") * 0.001;
            this.isInitialised = true;
        }
        createPumps(_pumpsGroup, _pumpTemplate) {
            if ((_pumpsGroup != null) && (_pumpTemplate != null) && (this.allFuelComponents != null)) {
                var allPumps = _pumpsGroup.querySelectorAll("g");
                if (allPumps != null) {
                    for (var i = 0; i < allPumps.length; ++i) {
                        var lineIndex = parseInt(allPumps[i].textContent.replace("FuelLine", ""));
                        allPumps[i].textContent = "";
                        var clonedPump = _pumpTemplate.cloneNode(true);
                        clonedPump.removeAttribute("id");
                        allPumps[i].appendChild(clonedPump);
                        var id = parseInt(allPumps[i].id.replace("Pump", ""));
                        if ((id != NaN) && (id > 0)) {
                            if ((lineIndex != NaN) && (lineIndex > 0)) {
                                //this.allFuelComponents.push(new StabOvrdFuelPump(allPumps[i], id, lineIndex));
                            }
                            else {
                                this.allFuelComponents.push(new Boeing.FuelPump(allPumps[i], id));
                            }
                        }
                    }
                }
            }
        }
        createFlowLines(_linesGroup, _lineTemplate = null) {
            if ((_linesGroup != null) && (this.allFuelComponents != null)) {
                var allLines = _linesGroup.querySelectorAll("g, line");
                if (allLines != null) {
                    for (var i = 0; i < allLines.length; ++i) {
                        if (_lineTemplate != null) {
                            var clonedLine = _lineTemplate.cloneNode(true);
                            clonedLine.removeAttribute("id");
                            allLines[i].appendChild(clonedLine);
                        }
                        var id = parseInt(allLines[i].id.replace("FlowLine", ""));
                        if ((id != NaN) && (id > 0)) {
                            this.allFuelComponents.push(new Boeing.FuelLine(allLines[i], id));
                        }
                    }
                }
            }
        }
        applyPathDString(_selector, _d) {
            var pathElement = this.querySelector(_selector);
            if (pathElement != null) {
                pathElement.setAttribute("d", _d);
            }
        }
        update(_deltaTime) {
            this.querySelector('#FuelTemp').textContent = SimVar.GetSimVarValue("L:FUEL_TEMP", "Celcius").toFixed(0);
            const storedUnits = WTDataStore.get("OPTIONS_UNITS", "KG");
            switch (storedUnits) {
                case "KG":
                    this.units = true;
                    break;
                case "LBS":
                    this.units = false;
                    break;
                default:
                    this.units = true;
            }
            if (!this.isInitialised) {
                return;
            }
            if (this.allTextValueComponents != null) {
                for (var i = 0; i < this.allTextValueComponents.length; ++i) {
                    if (this.allTextValueComponents[i] != null) {
                        this.allTextValueComponents[i].refresh();
                    }
                }
            }
            if (this.allFuelComponents != null) {
                for (var i = 0; i < this.allFuelComponents.length; ++i) {
                    if (this.allFuelComponents[i] != null) {
                        this.allFuelComponents[i].update(_deltaTime);
                    }
                }
            }
            if (this.unitTextSVG) {
                if (this.units) {
                    this.unitTextSVG.textContent = "KGS X 1000";
                }
                else {
                    this.unitTextSVG.textContent = "LBS X 1000";
                }
            }

            if (Math.abs(SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "gallon") - Math.abs(SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "gallon"))) > 274) {
                this.querySelector("#FuelBalanceStatus").textContent = "FUEL IMBALANCE";
            }
            else {
                this.querySelector("#FuelBalanceStatus").textContent = "FUEL BALANCED";
            }

            if ( SimVar.GetSimVarValue("L:B777_FUEL_JETTISON_ACTIVE_L", "Enum") > 0 || SimVar.GetSimVarValue("L:B777_FUEL_JETTISON_ACTIVE_R", "Enum") > 0 ) {
                this.querySelector("#JettisonLines").setAttribute("style", "opacity: 100;");
                this.querySelector("#JettisonFlowLines").setAttribute("style", "opacity: 100;");

                if (SimVar.GetSimVarValue("L:B777_FUEL_JETTISON_ACTIVE_L", "Enum") > 0)
                    this.querySelector('#JettNozzleL').setAttribute("style", "opacity: 100;");
                else
                    this.querySelector('#JettNozzleL').setAttribute("style", "opacity: 0;");

                    this.querySelector('#JettTime').setAttribute("style", "opacity: 100;");

                    this.querySelector('#JettTimeValue').textContent = Math.ceil(SimVar.GetSimVarValue("L:SALTY_JETTISON_MIN_REMAINING", "TYPE_FLOAT64")).toFixed(0) + " MIN";
                    this.querySelector('#JettTimeValue').setAttribute("style", "opacity: 100;");

                if (SimVar.GetSimVarValue("L:B777_FUEL_JETTISON_ACTIVE_R", "Enum") > 0)
                    this.querySelector('#JettNozzleR').setAttribute("style", "opacity: 100;");
                else
                    this.querySelector('#JettNozzleR').setAttribute("style", "opacity: 0;");

            } else {
                this.querySelector("#JettisonLines").setAttribute("style", "opacity: 0;");
                this.querySelector("#JettisonFlowLines").setAttribute("style", "opacity: 0;");
                this.querySelector('#JettNozzleL').setAttribute("style", "opacity: 0;");
                this.querySelector('#JettNozzleR').setAttribute("style", "opacity: 0;");
                this.querySelector('#JettTime').setAttribute("style", "opacity: 0;");
                this.querySelector('#JettTimeValue').setAttribute("style", "opacity: 0;");
            }
            this.fuelPreselected();

            if (SimVar.GetSimVarValue("EXTERNAL POWER ON", "bool")) {
                this.querySelector('#ExtLBox').setAttribute("style", "stroke: lime;");
            } else {
                this.querySelector('#ExtLBox').setAttribute("style", "var(--eicasWhite);");
            }
        }
        getTotalFuelInMegagrams() {
            let factor = this.gallonToMegapounds;
            if (this.units) {
                factor = this.gallonToMegagrams;
            }
            return (SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * factor);
        }
        getMainTankFuelInMegagrams(_index) {
            let factor = this.gallonToMegapounds;
            if (this.units) {
                factor = this.gallonToMegagrams;
            }
            return (SimVar.GetSimVarValue("FUELSYSTEM TANK QUANTITY:" + _index, "gallons") * factor);
        }
        fuelPreselected(){
            let isRefueling = SimVar.GetSimVarValue("L:777_FUELING_STARTED_BY_USR", "Bool");
            let preselectedFuelQty = SimVar.GetSimVarValue("L:777_FUEL_DESIRED", "Number");
            this.querySelector("#FuelPreselectValue").textContent = (preselectedFuelQty / 1000).toFixed(1);
            if (isRefueling == 1) {
                this.querySelector("#FuelPreselect").setAttribute("style", "opacity: 100;");
                this.querySelector("#FuelPreselectValue").setAttribute("style", "opacity: 100;");
            } else {
                this.querySelector("#FuelPreselect").setAttribute("style", "opacity: 0;");
                this.querySelector("#FuelPreselectValue").setAttribute("style", "opacity: 0;");
            }
        }
    }
    B777_LowerEICAS_Fuel.Display = Display;
})(B777_LowerEICAS_Fuel || (B777_LowerEICAS_Fuel = {}));
customElements.define("b777-lower-eicas-fuel", B777_LowerEICAS_Fuel.Display);