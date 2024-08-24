var B777_UpperEICAS;
(function (B777_UpperEICAS) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
            this.tmaDisplay = null;
            this.allValueComponents = new Array();
            this.allEngineInfos = new Array();
            this.gearDisplay = null;
            this.flapsDisplay = null;
            this.stabDisplay = null;
            this.allAntiIceStatus = new Array();
            this.gallonToMegagrams = 0;
            this.gallonToMegapounds = 0;

            this.fuelTankDisplay = null;
            this.fuelTankLeft = 0.0;
            this.fuelTankCenter = 0.0;
            this.fuelTankRight = 0.0;

            this.units;
        }
        get templateID() { return "B777UpperEICASTemplate"; }
        connectedCallback() {
            super.connectedCallback();
        }
        init(_eicas) {
            this.eicas = _eicas;
            this.refThrust = [];
            this.refThrustDecimal = [];
            this.engThrStatus = [];
            this.engRevStatus = [];
            this.refThrust[1] = this.querySelector("#THROTTLE1_Value");
            this.refThrust[2] = this.querySelector("#THROTTLE2_Value");
            this.refThrustDecimal[1] = this.querySelector("#THROTTLE1_Decimal");
            this.refThrustDecimal[2] = this.querySelector("#THROTTLE2_Decimal");
            this.unitTextSVG = this.querySelector("#TOTAL_FUEL_Units");
            this.tmaDisplay = new Boeing.ThrustModeDisplay(this.querySelector("#TMA_Value"));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#TAT_Value"), Simplane.getTotalAirTemperature, 0, Airliners.DynamicValueComponent.formatValueToPosNegTemperature));

            this.querySelector("#FUEL_TEMP_Value").textContent = SimVar.GetSimVarValue("L:FUEL_TEMP", "number");
            this.querySelector("#RIGHT_DUCT_Value").textContent = "-";
            this.querySelector("#LEFT_DUCT_Value").textContent = "-";

            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#THROTTLE1_Value"), Simplane.getEngineThrottleMaxThrust.bind(this, 0), 1, Airliners.DynamicValueComponent.formatValueToThrottleDisplay));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#THROTTLE2_Value"), Simplane.getEngineThrottleMaxThrust.bind(this, 1), 1, Airliners.DynamicValueComponent.formatValueToThrottleDisplay));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#TOTAL_FUEL_Value"), this.getTotalFuelInMegagrams.bind(this), 1));
            var gaugeTemplate = this.querySelector("#GaugeTemplate1");
            if (gaugeTemplate != null) {
                this.allEngineInfos.push(new B777_EICAS_Gauge_N1(1, this.querySelector("#N1_1_GAUGE"), gaugeTemplate, true));
                this.allEngineInfos.push(new B777_EICAS_Gauge_N1(2, this.querySelector("#N1_2_GAUGE"), gaugeTemplate, true));
                
                gaugeTemplate.remove();
            }        
            gaugeTemplate = this.querySelector("#GaugeTemplate2");
            if (gaugeTemplate != null) {
                this.allEngineInfos.push(new B777_EICAS_Gauge_EGT(1, this.querySelector("#EGT_1_GAUGE"), gaugeTemplate, true));
                this.allEngineInfos.push(new B777_EICAS_Gauge_EGT(2, this.querySelector("#EGT_2_GAUGE"), gaugeTemplate, true));
                
                gaugeTemplate.remove();
            }
            
            this.infoPanel = new Boeing.InfoPanel(this, "InfoPanel");
            this.infoPanel.init();
            this.infoPanelsManager = new Boeing.InfoPanelsManager();
            this.infoPanelsManager.init(this.infoPanel);
            this.gearDisplay = new Boeing.GearDisplay(this.querySelector("#GearInfo"));
            this.flapsDisplay = new Boeing.FlapsDisplay(this.querySelector("#FlapsInfo"), this.querySelector("#FlapsLine"), this.querySelector("#FlapsValue"), this.querySelector("#FlapsBar"), this.querySelector("#FlapsGauge"), this.querySelector("#FlapsLoadRelief"));
            this.pressureInfo = this.querySelector("#PressureInfo");
            //this.stabDisplay = new Boeing.StabDisplay(this.querySelector("#StabInfo"), 15, 1);
            this.allAntiIceStatus.push(new WingAntiIceStatus(this.querySelector("#WAI_LEFT"), 1));
            this.allAntiIceStatus.push(new WingAntiIceStatus(this.querySelector("#WAI_RIGHT"), 2));
            this.allAntiIceStatus.push(new EngineAntiIceStatus(this.querySelector("#EAI_LEFT"), 1));
            this.allAntiIceStatus.push(new EngineAntiIceStatus(this.querySelector("#EAI_RIGHT"), 2));            
            this.gallonToMegagrams = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram") * 0.001;
            this.gallonToMegapounds = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "lbs") * 0.001;
            this.fuelTankDisplay = this.querySelector("#FuelTankInfo");
            this.fuelTankLeft = this.querySelector("#tankL");
            this.fuelTankCenter = this.querySelector("#tankC");
            this.fuelTankRight = this.querySelector("#tankR");

            this.isInitialised = true;
        }
        update(_deltaTime) {
            //debug section
            //this.querySelector("#RIGHT_DUCT_Value").textContent = SimVar.GetSimVarValue("A:AUTOPILOT TAKEOFF POWER ACTIVE", "Bool");

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
            this.updateReferenceThrust();
            this.updatePressurisationValues();
            if (this.tmaDisplay) {
                this.tmaDisplay.update();
            }
            if (this.allValueComponents != null) {
                for (var i = 0; i < this.allValueComponents.length; ++i) {
                    this.allValueComponents[i].refresh();
                }
            }
            if (this.allEngineInfos != null) {
                for (var i = 0; i < this.allEngineInfos.length; ++i) {
                    if (this.allEngineInfos[i] != null){
                        this.allEngineInfos[i].update(_deltaTime);
                    }
                }
            }
            if (this.gearDisplay != null) {
                this.gearDisplay.update(_deltaTime);
            }
            if (this.flapsDisplay != null) {
                this.flapsDisplay.update(_deltaTime);
            }
            //if (this.stabDisplay != null) {
            //    this.stabDisplay.update(_deltaTime);
            //}
            if (this.allAntiIceStatus != null) {
                for (var i = 0; i < this.allAntiIceStatus.length; ++i) {
                    if (this.allAntiIceStatus[i] != null) {
                        this.allAntiIceStatus[i].refresh();
                    }
                }
            }
            if (this.infoPanel) {
                this.infoPanel.update(_deltaTime);
            }
            if (this.unitTextSVG) {
                if (this.units)
                    this.unitTextSVG.textContent = "KGS X";
                else
                    this.unitTextSVG.textContent = "LBS X";
            }

            if (this.units) {
                this.querySelector("#FUEL_TEMP_Value").textContent = SimVar.GetSimVarValue("L:FUEL_TEMP", "Celcius").toFixed(1) + "C";
            }
            else {
                this.querySelector("#FUEL_TEMP_Value").textContent = ((SimVar.GetSimVarValue("L:FUEL_TEMP", "Celcius")*(9/5)) + 32).toFixed(1) + "F";
            }
            
            const centerFuelQty = SimVar.GetSimVarValue("FUEL TANK CENTER QUANTITY", "gallons");
            const leftMainFuelQty = SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "gallons");
            const rightMainFuelQty = SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "gallons");

            const anyXFeedValveActive = (SimVar.GetSimVarValue("FUELSYSTEM VALVE OPEN:1", "Bool") || SimVar.GetSimVarValue("FUELSYSTEM VALVE OPEN:2", "Bool"));
            //fuel indications fault not yet simulated
            const anyFuelPumpActive = (SimVar.GetSimVarValue("FUELSYSTEM PUMP SWITCH:3", "Bool") || SimVar.GetSimVarValue("FUELSYSTEM PUMP SWITCH:4", "Bool")
                                    || SimVar.GetSimVarValue("FUELSYSTEM PUMP SWITCH:5", "Bool") || SimVar.GetSimVarValue("FUELSYSTEM PUMP SWITCH:6", "Bool"));
            const anyCenterPumpActive = (SimVar.GetSimVarValue("FUELSYSTEM PUMP SWITCH:1", "Bool") || SimVar.GetSimVarValue("FUELSYSTEM PUMP SWITCH:2", "Bool"));
            const fuelInCenterEICASWarning = (centerFuelQty > 120 && anyFuelPumpActive && !anyCenterPumpActive);

            const fuelQtyLowEICASWarning = (leftMainFuelQty <= 559 || rightMainFuelQty <= 559);

            const fuelImbalanceEICASWarning = (Math.abs(leftMainFuelQty - rightMainFuelQty) > 274)
            
            const planeOnGroundAndEngineOff = (SimVar.GetSimVarValue("SIM ON GROUND", "bool") && (!SimVar.GetSimVarValue("FUELSYSTEM VALVE SWITCH:3", "Bool") || !SimVar.GetSimVarValue("FUELSYSTEM VALVE SWITCH:4", "Bool")));
            //fuel flow eng not yet simlulated

            //add amber fuel inidcator
            if (anyXFeedValveActive || fuelInCenterEICASWarning || fuelQtyLowEICASWarning || fuelImbalanceEICASWarning || planeOnGroundAndEngineOff) {
                this.fuelTankDisplay.style.visibility = "visible";
                let factor = this.gallonToMegapounds;
                if (this.units)
                    factor = this.gallonToMegagrams;
                this.fuelTankLeft.textContent = (SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "gallons") * factor).toFixed(1);
                this.fuelTankCenter.textContent = (SimVar.GetSimVarValue("FUEL TANK CENTER QUANTITY", "gallons") * factor).toFixed(1);
                this.fuelTankRight.textContent = (SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "gallons") * factor).toFixed(1);
            }
            else {
                this.fuelTankDisplay.style.visibility = "hidden";
            }            
        }

        updateReferenceThrust() {
            const MAX_POSSIBLE_THRUST_DISP = 1150;
            for (var i = 1; i < 3; ++i) {
                this.engThrStatus[i] = SimVar.GetSimVarValue("TURB ENG REVERSE NOZZLE PERCENT:" + i, "Percent");
                this.engRevStatus[i] = SimVar.GetSimVarValue("L:B777_ENGINE_REVERSER:" + i, "Percent");
        
                // Check for reverser deployment or retraction in transition
                if ((this.engThrStatus[i] > 0.5 && this.engThrStatus[i] < 50) || (this.engRevStatus[i] > 1 && this.engRevStatus[i] < 100)) {
                    this.refThrust[i].style.fill = "gold";
                    this.refThrust[i].textContent = "REV";
                    this.refThrustDecimal[i].style.visibility = "hidden";
                } else if (this.engRevStatus[i] > 100 && this.engRevStatus[i] > 1) {
                    this.refThrust[i].style.fill = "lime";
                    this.refThrust[i].textContent = "REV";
                    this.refThrustDecimal[i].style.visibility = "hidden";
                } else {
                    this.refThrust[i].style.fill = "lime";
                    this.refThrust[i].textContent = Math.min((Simplane.getEngineThrottleMaxThrust(i - 1) * 10), MAX_POSSIBLE_THRUST_DISP).toFixed(0);
                    this.refThrustDecimal[i].style.visibility = "visible";
                }
            }
            return;
        }        
        
        updatePressurisationValues() {
            if (SimVar.GetSimVarValue("L:XMLVAR_EICAS_CURRENT_PAGE", "Enum") !== 3) {
                this.pressureInfo.style.visibility = "hidden";
                return;
            }
            else {
                this.pressureInfo.style.visibility = "visible";
            }
            
            this.querySelector("#CAB_ALT_Value").textContent = SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE", "Feet").toFixed(0);
            if (SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE", "Feet") >= 8000) {
                this.querySelector("#CAB_ALT_Value").style.fill = "yellow";
            }
            else if (SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE", "Feet") >= 10000) {
                this.querySelector("#CAB_ALT_Value").style.fill = "red";
            }
            else {
                this.querySelector("#CAB_ALT_Value").style.fill = "white";
            }
            this.querySelector("#RATE_Value").textContent = SimVar.GetSimVarValue("PRESSURIZATION CABIN ALTITUDE RATE", "Feet").toFixed(0);

            let deltaPValue = Math.abs(SimVar.GetSimVarValue("PRESSURIZATION PRESSURE DIFFERENTIAL", "psi"));

            this.querySelector("#DELTAP_Value").textContent = deltaPValue.toFixed(1);
        
            if (deltaPValue > 9.0) {
                this.querySelector("#DELTAP_Value").style.fill = "yellow";
            }
            if (deltaPValue > 9.5){
                this.querySelector("#DELTAP_Value").style.fill = "red";
            }
            else {
                this.querySelector("#DELTAP_Value").style.fill = "white";
            }
            return;
        }
        updateWeights() {
            this.grossWeight.textContent = (this.getGrossWeightInMegagrams() * 10).toFixed(0);
            this.totalFuel.textContent = (this.getTotalFuelInMegagrams() * 10).toFixed(0);
            return;
        }
        getGrossWeightInMegagrams() {
            if (this.units) {
                return SimVar.GetSimVarValue("TOTAL WEIGHT", "kg") * 0.001;
            }
            return SimVar.GetSimVarValue("TOTAL WEIGHT", "lbs") * 0.001;
        }
        getTotalFuelInMegagrams() {
            let factor = this.gallonToMegapounds;
            if (this.units)
                factor = this.gallonToMegagrams;
            return (SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * factor);
        }
        getInfoPanelManager() {
            return this.infoPanelsManager;
        }
    }
    
    B777_UpperEICAS.Display = Display;
    
    class B777_EICAS_Gauge {
    }
    
    class B777_EICAS_CircleGauge extends B777_EICAS_Gauge {
        constructor(_engineIndex, _root, _template, _hideIfN1IsZero) {
            super();
            this.engineIndex = 0;
            this.currentValue = 0;
            this.valueText = null;
            this.valueTextBox = null;
            this.fill = null;
            this.predArc = null;
            this.mainArc = null;
            this.predArcRadius = 0;
            this.fillPathD = "";
            this.fillCenter = new Vec2();
            this.fillRadius = 0;
            this.defaultMarkerTransform = "";
            this.whiteMarker = null;
            this.redMarker = null;
            this.throttleMarker = null;
            this.orangeMarker = null;
            this.greenMarker = null;
            this.hideIfN1IsZero = false;
            this.engineIndex = _engineIndex;
            this.root = _root;
            this.hideIfN1IsZero = _hideIfN1IsZero;
            if ((this.root != null) && (_template != null)) {
                this.root.appendChild(_template.cloneNode(true));
                this.valueText = this.root.querySelector(".valueText");
                this.valueTextBox = this.root.querySelector(".valueTextBox");
                this.fill = this.root.querySelector(".fill");
                this.predArc = this.root.querySelector(".predArc");
                this.mainArc = this.root.querySelector(".mainArc");
                this.whiteMarker = this.root.querySelector(".normalMarker");
                this.throttleMarker = this.root.querySelector(".throttleMarker");
                this.redMarker = this.root.querySelector(".dangerMarker");
                this.orangeMarker = this.root.querySelector(".amberMarker");
                this.greenMarker = this.root.querySelector(".greenMarker");
                if (this.fill != null) {
                    var fillPathDSplit = this.fill.getAttribute("d").split(" ");
                    for (var i = 0; i < fillPathDSplit.length; i++) {
                        if (this.fillRadius > 0) {
                            if (fillPathDSplit[i].charAt(0) == 'L') {
                                this.fillCenter.x = parseInt(fillPathDSplit[i].replace("L", ""));
                                this.fillCenter.y = parseInt(fillPathDSplit[i + 1]);
                            }
                            this.fillPathD += " " + fillPathDSplit[i];
                        }
                        else if (fillPathDSplit[i].charAt(0) == 'A') {
                            this.fillRadius = parseInt(fillPathDSplit[i].replace("A", ""));
                            this.fillPathD = fillPathDSplit[i];
                        }
                    }
                }
                if (this.predArc != null) {
                    var predArcPathDSplit = this.predArc.getAttribute("d").split(" ");
                    for (var i = 0; i < predArcPathDSplit.length; i++) {
                        if (predArcPathDSplit[i].charAt(0) == 'A') {
                            this.predArcRadius = parseInt(predArcPathDSplit[i].replace("A", ""));
                        }
                    }
                }
                if (this.whiteMarker != null) {
                    this.defaultMarkerTransform = this.whiteMarker.getAttribute("transform");
                }
                if (this.redMarker != null) {
                    this.redMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + B777_EICAS_CircleGauge.MAX_ANGLE + ")");
                }
                if (this.orangeMarker != null) {
                    //diffAndSetStyle(this.orangeMarker, StyleProperty.display, 'none');
                }
                // if (this.greenMarker != null) {
                //     diffAndSetStyle(this.greenMarker, StyleProperty.display, 'none');
                // }
            }
            this.refresh(0, true);
        }
        update(_deltaTime) {
            this.refresh(this.getCurrentValue());
        }
        refresh(_value, _force = false) {
            //from FMA
            //const fmaValues = localStorage.getItem("CJ4_fmaValues");
            //const parsedFmaValues = JSON.parse(fmaValues);
            //this.lateralMode = parsedFmaValues.lateralMode;

            if ((_value != this.currentValue) || _force) {
                this.currentValue = _value;
                let hide = false;
                if (this.hideIfN1IsZero && SimVar.GetSimVarValue("ENG N1 RPM:" + this.engineIndex, "percent") < 0.1) {
                    this.currentValue = -1;
                    hide = true;
                }
                if (this.valueText != null) {
                    if (hide) {
                        this.valueText.textContent = "";
                    }
                    else {
                        this.valueText.textContent = this.currentValue.toFixed(this.getCustomToFixed());
                    }
                }
                
                if (this.currentValue >= this.getWarningValue()) {
                    this.valueText.style.fill = "red";
                    this.valueTextBox.style.stroke = "red";
                    diffAndSetStyle(this.throttleMarker, 'stroke', 'red');
                    diffAndSetStyle(this.whiteMarker, 'stroke', 'red');
                    diffAndSetStyle(this.fill, 'fill', 'red');
                    diffAndSetStyle(this.mainArc, 'stroke', 'red');
                    diffAndSetStyle(this.predArc, 'stroke', 'red');
                    
                }
                else if (this.currentValue >= this.getAmberValue() && this.currentValue < this.getWarningValue()) {
                    if (this.getDisableWarningOnTOGA()) {
                        //WILL BE IMPLEMENT LATER
                        //if (condition) {
                        //  return;
                        //}
                    }
                    this.valueText.style.fill = "gold";
                    this.valueTextBox.style.stroke = "gold";
                    diffAndSetStyle(this.throttleMarker, 'stroke', 'gold');
                    diffAndSetStyle(this.whiteMarker, 'stroke', 'gold');
                    diffAndSetStyle(this.fill, 'fill', 'gold');
                    diffAndSetStyle(this.mainArc, 'stroke', 'gold');
                    diffAndSetStyle(this.predArc, 'stroke', 'gold');
                }
                else {
                    this.valueText.style.fill = "white";
                    this.valueTextBox.style.stroke = "white";       //will be implemented to be red until recall is press. recall inop:)
                    diffAndSetStyle(this.throttleMarker, 'stroke', 'white');
                    diffAndSetStyle(this.whiteMarker, 'stroke', 'white');
                    diffAndSetStyle(this.fill, 'fill', '#413d5d');
                    diffAndSetStyle(this.mainArc, 'stroke', 'white');
                    diffAndSetStyle(this.predArc, 'stroke', 'white');
                }


                //REMODEL THIS. SHOULD HAVE 2 STAGE: 0-100, 100+ (basically the max, but before 100 uses the 0.00856, after 100 uses a different scale (0.000145 or smt), only for engine)                
                var angle = Math.max((this.valueToPercentage(this.currentValue) * 0.0085) * B777_EICAS_CircleGauge.MAX_ANGLE, 0.001);
                var angleo = Math.max((this.getLimitValue() * 0.009) * B777_EICAS_CircleGauge.MAX_ANGLE, 0.001);
                var anglet = Math.max((this.getCommandedValue() * 0.00856) * B777_EICAS_CircleGauge.MAX_ANGLE, 0.001);
                
                if (this.whiteMarker != null) {
                    this.whiteMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + angle + ")");
                }
                if (this.greenMarker != null) {
                    this.greenMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + angleo + ")");
                }
                if (this.orangeMarker != null) {
                    this.orangeMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + B777_EICAS_CircleGauge.WARNING_ANGLE + ")");
                }
                if (this.throttleMarker != null) {
                    this.throttleMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + anglet + ")");
                }
                if (this.fill != null) {
                    var rad = angle * B777_EICAS_CircleGauge.DEG_TO_RAD;
                    var x = (Math.cos(rad) * this.fillRadius) + this.fillCenter.x;
                    var y = (Math.sin(rad) * this.fillRadius) + this.fillCenter.y;
                    this.fill.setAttribute("d", "M" + x + " " + y + " " + this.fillPathD.replace("0 0 0", (angle <= 180) ? "0 0 0" : "0 1 0"));
                }
                if (this.predArc != null) {
                    var rad = angle * B777_EICAS_CircleGauge.DEG_TO_RAD;
                    var radt = anglet * B777_EICAS_CircleGauge.DEG_TO_RAD;
                    var x1 = (Math.cos(rad) * this.predArcRadius) + this.fillCenter.x;
                    var y1 = (Math.sin(rad) * this.predArcRadius) + this.fillCenter.y;
                    var x2 = (Math.cos(radt) * this.predArcRadius) + this.fillCenter.x;
                    var y2 = (Math.sin(radt) * this.predArcRadius) + this.fillCenter.y;
                    this.predArc.setAttribute("d", "M" + x1 + " " + y1 + " A" + this.predArcRadius + " " + this.predArcRadius + " " +  ((angle <= anglet) ? "0 0 1" : "0 0 0") + " " + x2 + " " + y2);
                }
            }
        }
    }
    
    B777_EICAS_CircleGauge.MAX_ANGLE = 210;
    B777_EICAS_CircleGauge.WARNING_ANGLE = 180;     //only for EGT
    B777_EICAS_CircleGauge.DEG_TO_RAD = (Math.PI / 180);

    class B777_EICAS_Gauge_TPR extends B777_EICAS_CircleGauge {
        getCurrentValue() {
            return Utils.Clamp(SimVar.GetSimVarValue("ENG PRESSURE RATIO:" + this.engineIndex, "ratio") * (100 / 1.7), 0, 100);
        }
        valueToPercentage(_value) {
            return _value;
        }
    }

    class B777_EICAS_Gauge_N1 extends B777_EICAS_CircleGauge {
        getCurrentValue() {
            return SimVar.GetSimVarValue("ENG N1 RPM:" + this.engineIndex, "percent");
        }
        valueToPercentage(_value) {
            return Utils.Clamp(_value, 0, 120);
        }
        getLimitValue() {
            return Math.abs(Simplane.getEngineThrottleMaxThrust(this.engineIndex - 1));
        }
        getCommandedValue() {
            return Math.abs(Simplane.getEngineThrottleCommandedN1(this.engineIndex - 1));
        }
        getWarningValue() {
            return 105.0;
        }
        getAmberValue() {
            return 999.0;       //basically disabled
        }
        getDisableWarningOnTOGA() {
            return false;
        }
        getCustomToFixed() {
            return 1;
        }
    }
    
    class B777_EICAS_Gauge_EGT extends B777_EICAS_CircleGauge {
        getCurrentValue() {
            return SimVar.GetSimVarValue("ENG EXHAUST GAS TEMPERATURE:" + this.engineIndex, "celsius");
        }
        valueToPercentage(_value) {
            return (Utils.Clamp(_value, 0, 800) * 0.11);
        }
        getLimitValue() {
            return 0;
        }
        getCommandedValue() {
            return 0;
        }
        getWarningValue() {     //temporary disable
            return 999;
            return 650.0;
        }
        getAmberValue() {
            return 800;//607.0;
        }
        getDisableWarningOnTOGA() {
            return true;
        }
        getCustomToFixed() {
            return 0;
        }
    }
    class B777_EICAS_Gauge_N2 extends B777_EICAS_CircleGauge {
        getCurrentValue() {
            return SimVar.GetSimVarValue("ENG N2 RPM:" + this.engineIndex, "percent");
        }
        valueToPercentage(_value) {
            return Utils.Clamp(_value, 0, 120);
        }
    }
    
    class AntiIceStatus {
        constructor(_element, _index) {
            this.element = null;
            this.index = -1;
            this.isActive = false;
            this.element = _element;
            this.index = _index;
            this.setState(false);
        }
        refresh() {
            var active = this.getCurrentActiveState();
            if (active != this.isActive) {
                this.setState(active);
            }
        }
        setState(_active) {
            if (this.element != null) {
                this.element.style.display = _active ? "block" : "none";
            }
            this.isActive = _active;
        }
    }
    class EngineAntiIceStatus extends AntiIceStatus {
        getCurrentActiveState() {
            let totalAirTemp = SimVar.GetSimVarValue("TOTAL AIR TEMPERATURE", "Celcius");
            let strucIcePercent = SimVar.GetSimVarValue("STRUCTURAL ICE PCT", "percent");
            let knobPos = SimVar.GetSimVarValue("L:B777_Engine_AntiIce_Knob_State:" + this.index, "Number");
            
            if (knobPos == 0)
                {
                    return false;
                }
            else {
                if (knobPos == 2) {
                    return true;
                }
                else {
                    if (totalAirTemp <= 10 && strucIcePercent >= 10) {
                        return true
                    }
                }
            }
            return false;
        }
    }
    class WingAntiIceStatus extends AntiIceStatus {
        getCurrentActiveState() {
            let strucIcePercent = SimVar.GetSimVarValue("STRUCTURAL ICE PCT", "percent");
            let knobPos = SimVar.GetSimVarValue("L:B777_Wing_AntiIce_Knob_State", "Number");
            let fuelTemp = SimVar.GetSimVarValue("L:FUEL_TEMP", "Celcius");
            let totalAirTemp = SimVar.GetSimVarValue("TOTAL AIR TEMPERATURE", "Celcius");
            let planeOnGround = SimVar.GetSimVarValue("SIM ON GROUND", "bool");
            let elapsedMinute = SimVar.GetSimVarValue("L:ELAPSED_TIME_ENGINE", "seconds")/60;
            let flightPhase = Simplane.getCurrentFlightPhase();

            if (knobPos == 0)
                {
                    return false;
                }
            else {
                if (knobPos == 2) {
                    if (!planeOnGround && (elapsedMinute > 5) && totalAirTemp < 10) {
                        SimVar.SetSimVarValue("L:WING_ANTI_ICE_ON", "Bool", true);
                        return true;
                    }
                }
                else {  //auto, find a better way to use CLB thrust instead of flightphase
                    if (((totalAirTemp <= 10 && strucIcePercent >= 10) || fuelTemp < 10) && !planeOnGround && (elapsedMinute > 10) && flightPhase > 2) {
                        SimVar.SetSimVarValue("L:WING_ANTI_ICE_ON", "Bool", true);
                        return true
                    }
                }
            }
            SimVar.SetSimVarValue("L:WING_ANTI_ICE_ON", "Bool", false);
            return false;
        }


    }
})(B777_UpperEICAS || (B777_UpperEICAS = {}));
customElements.define("b777-upper-eicas", B777_UpperEICAS.Display);