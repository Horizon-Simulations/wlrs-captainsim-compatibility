var B777_LowerEICAS_Engine;
(function (B777_LowerEICAS_Engine) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
            this.allEngineInfos = new Array();
            this.N2Infos = new Array();
            this.allGaugeDuals = new Array();
        }
        get templateID() { return "B777LowerEICASEngineTemplate"; }
        connectedCallback() {
            super.connectedCallback();
        }
        init(_eicas) {
            this.eicas = _eicas;
            var stateParent = this.querySelector("#EngineStates");
            var ffParent = this.querySelector("#FFGauges");
            this.allEngineInfos.push(new EngineInfo(this.eicas, 1, stateParent, ffParent));
            this.allEngineInfos.push(new EngineInfo(this.eicas, 2, stateParent, ffParent));
            this.createOilPGauges();
            this.createOilTGauges();
            this.createOilQGauges();
            this.createVIBGauges();
            var gaugeTemplate = this.querySelector("#GaugeTemplate2");
            if (gaugeTemplate != null) {
                this.N2Infos.push(new B777_EICAS_Gauge_N2(1, this.querySelector("#N2_1_GAUGE"), gaugeTemplate, false));
                this.N2Infos.push(new B777_EICAS_Gauge_N2(2, this.querySelector("#N2_2_GAUGE"), gaugeTemplate, false));      
                gaugeTemplate.remove();
            }
            this.isInitialised = true;
        }
        createOilPGauges() {
            var definition = new B777_EICAS_Common.GaugeDualDefinition();
            definition.useDoubleDisplay = true;
            definition.maxValue = 100;  //500
            definition.barTop = 6;
            definition.barHeight = 88;
            var parent = this.querySelector("#OilPGauges");
            definition.getValueLeft = this.allEngineInfos[0].getOilPValue.bind(this.allEngineInfos[0]);
            definition.getValueRight = this.allEngineInfos[1].getOilPValue.bind(this.allEngineInfos[1]);
            this.createGaugeDual(parent, definition);
        }
        createOilTGauges() {
            var definition = new B777_EICAS_Common.GaugeDualDefinition();
            definition.useDoubleDisplay = true;
            definition.maxValue = 200;
            definition.barTop = 6;
            definition.barHeight = 88;
            var parent = this.querySelector("#OilTGauges");
            definition.getValueLeft = this.allEngineInfos[0].getOilTValue.bind(this.allEngineInfos[0]);
            definition.getValueRight = this.allEngineInfos[1].getOilTValue.bind(this.allEngineInfos[1]);
            this.createGaugeDual(parent, definition);
        }
        createOilQGauges() {
            var definition = new B777_EICAS_Common.GaugeDualDefinition();
            definition.useDoubleDisplay = true;
            definition.barHeight = 0;
            var parent = this.querySelector("#OilQGauges");
            definition.getValueLeft = this.allEngineInfos[0].getOilQValue.bind(this.allEngineInfos[0]);
            definition.getValueRight = this.allEngineInfos[1].getOilQValue.bind(this.allEngineInfos[1]);
            this.createGaugeDual(parent, definition);
        }
        createVIBGauges() {
            var definition = new B777_EICAS_Common.GaugeDualDefinition();
            definition.useDoubleDisplay = true;
            definition.valueTextPrecision = 1;
            definition.maxValue = 4;
            definition.barTop = 6;
            definition.barHeight = 88;
            var parent = this.querySelector("#VIBGauges");
            definition.getValueLeft = this.allEngineInfos[0].getVIBValue.bind(this.allEngineInfos[0]);
            definition.getValueRight = this.allEngineInfos[1].getVIBValue.bind(this.allEngineInfos[1]);
            this.createGaugeDual(parent, definition);
        }
        createGaugeDual(_parent, _definition) {
            var gauge = window.document.createElement("b777-eicas-gauge-dual");
            gauge.init(_definition);
            _parent.appendChild(gauge);
            this.allGaugeDuals.push(gauge);
        }
        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }
            if (this.allEngineInfos != null) {
                for (var i = 0; i < this.allEngineInfos.length; ++i) {
                    this.allEngineInfos[i].refresh(_deltaTime);   //FF
                }
            }
            if (this.N2Infos != null) {
                for (var i = 0; i < this.N2Infos.length; ++i) {
                    if (this.N2Infos[i] != null){
                        this.N2Infos[i].update(_deltaTime); //N2
                    }
                }
            }
            if (this.allGaugeDuals != null) {
                for (var i = 0; i < this.allGaugeDuals.length; ++i) {
                    this.allGaugeDuals[i].refresh();        //all except N2 and FF
                }
            }
            
            //for FF
            if (SimVar.GetSimVarValue("L:SALTY_UNIT_IS_METRIC", "bool")) {
                document.querySelector("#FFValue1").textContent = (SimVar.GetSimVarValue("ENG FUEL FLOW GPH:1", "gallons per hour") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram") / 100).toFixed(1);
                document.querySelector("#FFValue2").textContent = (SimVar.GetSimVarValue("ENG FUEL FLOW GPH:2", "gallons per hour") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram") / 100).toFixed(1);
            }
            else {
                document.querySelector("#FFValue1").textContent = (SimVar.GetSimVarValue("ENG FUEL FLOW GPH:1", "gallons per hour") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "pounds") / 100).toFixed(1);
                document.querySelector("#FFValue2").textContent = (SimVar.GetSimVarValue("ENG FUEL FLOW GPH:2", "gallons per hour") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "pounds") / 100).toFixed(1);
            }
        } 
    }
    B777_LowerEICAS_Engine.Display = Display;
    
    class B777_EICAS_Gauge {
    }
    
    class B777_EICAS_CircleGauge extends B777_EICAS_Gauge {
        constructor(_engineIndex, _root, _template, _hideIfN1IsZero) {
            super();
            this.engineIndex = 0;
            this.currentValue = 0;
            this.valueText = null;
            this.fill = null;
            this.fillPathD = "";
            this.fillCenter = new Vec2();
            this.fillRadius = 0;
            this.defaultMarkerTransform = "";
            this.whiteMarker = null;
            this.redMarker = null;
            this.hideIfN1IsZero = false;
            this.engineIndex = _engineIndex;
            this.root = _root;
            this.hideIfN1IsZero = _hideIfN1IsZero;
            
            if ((this.root != null) && (_template != null)) {
                this.root.appendChild(_template.cloneNode(true));
                this.valueText = this.root.querySelector(".valueText");
                this.fill = this.root.querySelector(".fill");
                this.whiteMarker = this.root.querySelector(".normalMarker");
                this.redMarker = this.root.querySelector(".dangerMarker");
                
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
                if (this.whiteMarker != null) {
                    this.defaultMarkerTransform = this.whiteMarker.getAttribute("transform");
                }
                if (this.redMarker != null) {
                    this.redMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + B777_EICAS_CircleGauge.MAX_ANGLE + ")");
                }
            }
            this.refresh(0, true);
        }
        update(_deltaTime) {
            this.refresh(this.getCurrentValue());
        }
        refresh(_value, _force = false) {
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
                        this.valueText.textContent = this.currentValue.toFixed(1);
                    }
                }
                
                var angle = Math.max((this.valueToPercentage(this.currentValue) * 0.008) * B777_EICAS_CircleGauge.MAX_ANGLE, 0.001);                
                if (this.whiteMarker != null) {
                    this.whiteMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + angle + ")");
                }
                if (this.fill != null) {
                    var rad = angle * B777_EICAS_CircleGauge.DEG_TO_RAD;
                    var x = (Math.cos(rad) * this.fillRadius) + this.fillCenter.x;
                    var y = (Math.sin(rad) * this.fillRadius) + this.fillCenter.y;
                    this.fill.setAttribute("d", "M" + x + " " + y + " " + this.fillPathD.replace("0 0 0", (angle <= 180) ? "0 0 0" : "0 1 0"));
                }                
            }  
        }
    }
    
    B777_EICAS_CircleGauge.MAX_ANGLE = 210;
    B777_EICAS_CircleGauge.WARNING_ANGLE = 202;
    B777_EICAS_CircleGauge.DEG_TO_RAD = (Math.PI / 180);
    
    class B777_EICAS_Gauge_N2 extends B777_EICAS_CircleGauge {
        getCurrentValue() {
            return SimVar.GetSimVarValue("ENG N2 RPM:" + this.engineIndex, "percent");
        }
        valueToPercentage(_value) {
            return Utils.Clamp(_value, 0, 130);
        }
    }
    
    class EngineInfo {
        constructor(_eicas, _engineId, _engineStateParent, _ffParent) {
            this.eicas = _eicas;
            this.engineId = _engineId;
            if (_engineStateParent != null) {
                this.stateText = _engineStateParent.querySelector("#Engine" + this.engineId + "_State");
            }
        }
        
        getOilPValue() {
            return SimVar.GetSimVarValue("ENG OIL PRESSURE:" + this.engineId, "psi");
        }
        getOilTValue() {
            return SimVar.GetSimVarValue("ENG OIL TEMPERATURE:" + this.engineId, "celsius");
        }
        getOilQValue() {
            return (SimVar.GetSimVarValue("ENG OIL QUANTITY:" + this.engineId, "percent scaler 16k") * 0.001);
        }
        getVIBValue() {
            return Math.abs(SimVar.GetSimVarValue("ENG VIBRATION:" + this.engineId, "Number"));
        }
        refresh(_deltaTime) {
            let state = this.eicas.getEngineState(this.engineId);
            switch (state) {
                case B777_EngineState.AUTOSTART:
                    this.stateText.textContent = "AUTOSTART";
                    this.stateText.setAttribute("class", "white");
                    break;
                case B777_EngineState.RUNNING:
                    this.stateText.textContent = "RUNNING";
                    this.stateText.setAttribute("class", "");
                    break;
                default:
                    this.stateText.textContent = "";
                    break;
            }
            if (this.ffGauge != null) {
                this.ffGauge.refresh(false);
            }
        }
    }

})(B777_LowerEICAS_Engine || (B777_LowerEICAS_Engine = {}));
customElements.define("b777-lower-eicas-engine", B777_LowerEICAS_Engine.Display);
//# sourceMappingURL=B747_8_LowerEICAS_Engine.js.map