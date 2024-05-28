var Boeing;
(function (Boeing) {
    class FMA extends TemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
            this.allAnnunciations = new Array();
            this._aircraft = Aircraft.B747_8;
        }
        get templateID() { return "BoeingFMATemplate"; }
        get aircraft() {
            return this._aircraft;
        }
        set aircraft(_val) {
            if (this._aircraft != _val) {
                this._aircraft = _val;
            }
        }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
            if (this.allAnnunciations != null) {
                this.allAnnunciations.push(new Boeing_FMA.Column1Top(this, this.querySelector("#COL1_TOP"), this.querySelector("#COL1_TOP_HIGHLIGHT")));
                this.allAnnunciations.push(new Boeing_FMA.Column2Top(this, this.querySelector("#COL2_TOP"), this.querySelector("#COL2_TOP_HIGHLIGHT")));
                this.allAnnunciations.push(new Boeing_FMA.Column2Middle(this, this.querySelector("#COL2_MIDDLE"), null));
                this.allAnnunciations.push(new Boeing_FMA.Column2Bottom(this, this.querySelector("#COL2_BOTTOM"), this.querySelector("#COL2_BOTTOM_HIGHLIGHT"), this.querySelector("#COL2_BOTTOM_ARROWS")));
                this.allAnnunciations.push(new Boeing_FMA.Column3Top(this, this.querySelector("#COL3_TOP"), this.querySelector("#COL3_TOP_HIGHLIGHT")));
                this.allAnnunciations.push(new Boeing_FMA.Column3Middle(this, this.querySelector("#COL3_MIDDLE"), null));
            }
            this.isInitialised = true;
        }
        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }
            Boeing_FMA.ApproachStatus.update(_deltaTime);
            if (this.allAnnunciations != null) {
                for (var i = 0; i < this.allAnnunciations.length; ++i) {
                    if (this.allAnnunciations[i] != null) {
                        this.allAnnunciations[i].update(_deltaTime);
                    }
                }
            }
        }
    }
    Boeing.FMA = FMA;
})(Boeing || (Boeing = {}));
var Boeing_FMA;
(function (Boeing_FMA) {
    class ApproachStatus {  //note
        static get isFlareArmed() {
            return (this.flareState == 1);
        }
        static get isFlareActive() {
            return (this.flareState == 2);
        }
        static get isRolloutArmed() {
            return (this.rolloutState == 1);
        }
        static get isRolloutActive() {
            return (this.rolloutState == 2);
        }
        static update(_deltaTime) {
            this.flareState = 0;
            this.rolloutState = 0;
            var alt = Simplane.getAltitudeAboveGround();

            if (Simplane.getCurrentFlightPhase() == FlightPhase.FLIGHT_PHASE_APPROACH) {

                if (alt <= 1500) {
                    if (alt < 1.5) {
                        this.rolloutDelay += _deltaTime;
                        this.rolloutState = (this.rolloutDelay >= 1000) ? 2 : 1;
                    }
                    else {
                        this.rolloutDelay = 0;
                        this.rolloutState = 1;
                    }
                    if (!this.isRolloutActive && Simplane.getAutoPilotActive()) {
                        this.flareState = (alt <= 60) ? 2 : 1;
                    }
                    if (!this.isRolloutActive && Simplane.getIsGrounded()) {
                        this.rolloutState = 2;
                    }
                }
            }
            if (alt <= 1500 && this.flareState == 1 && this.rolloutState == 1) {
                SimVar.SetSimVarValue("L:FLARE_STATUS", "number", 1);
            }
            //GA after touch down, DELTE IF BUG
            if (SimVar.GetSimVarValue("A:GENERAL ENG THROTTLE LEVER POSITION:1", "percent") > 70 &&  this.rolloutState === 2) {
                SimVar.SetSimVarValue("L:FORCE_TOGA", "bool", "true");
            }
        }
    }
    ApproachStatus.flareState = 0;
    ApproachStatus.rolloutState = 0;
    ApproachStatus.rolloutDelay = 0;
    Boeing_FMA.ApproachStatus = ApproachStatus;

    class Annunciation {
        constructor(_fma, _divElement, _highlightElement) {
            this.divElement = null;
            this.currentMode = -1;
            this.highlightElement = null;
            this.highlightTimer = 0;
            this.fma = _fma;
            this.divElement = _divElement;
            this.highlightElement = _highlightElement;
            this.approachActive = "";
            this.lateralMode = "";
            this.lateralArmed = "";
            this.verticalMode = "";
            this.altitudeArmed = "";
            this.vnavArmed = "";
            this.approachVerticalArmed = "";
            this.approachType = "";
        }
        update(_deltaTime) {
            const fmaValues = localStorage.getItem("CJ4_fmaValues");
            if (fmaValues) {
                const parsedFmaValues = JSON.parse(fmaValues);
                this.approachActive = parsedFmaValues.approachActive;
                this.lateralMode = parsedFmaValues.lateralMode;
                this.lateralArmed = parsedFmaValues.lateralArmed;
                this.verticalMode = parsedFmaValues.verticalMode;
                this.altitudeArmed = parsedFmaValues.altitudeArmed;
                this.vnavArmed = parsedFmaValues.vnavArmed;  
                this.approachVerticalArmed = parsedFmaValues.approachVerticalArmed;
                this.approachType = parsedFmaValues.approachType;
            }

            var mode = this.getActiveMode();
            if (mode != this.currentMode) {
                this.changeMode(mode);
            }
            this.updateHighlight(_deltaTime);
        }
        updateHighlight(_deltaTime) {
            if (this.highlightTimer > 0) {
                this.highlightTimer -= _deltaTime;
                if (this.highlightTimer <= 0) {
                    this.setHighlightVisibility(false);
                }
            }
        }
        changeMode(_mode) {
            this.currentMode = _mode;
            if (this.divElement != null)
                this.divElement.innerHTML = "<span>" + this.getCurrentModeText() + "</span>";
            this.setHighlightVisibility(this.currentMode >= 0);
        }
        setHighlightVisibility(_show) {
            if (this.highlightElement != null) {
                this.highlightElement.style.display = _show ? "block" : "none";
                if (_show) {
                    this.highlightTimer = Annunciation.HIGHLIGHT_LENGTH;
                }
            }
        }
    }
    Annunciation.HIGHLIGHT_LENGTH = 10 * 1000;
    Boeing_FMA.Annunciation = Annunciation;
    //Active Lateral Mode (first column)
    class Column1Top extends Annunciation {
        constructor() {
            super(...arguments);
            this.leftThrottleArmed = false;
            this.rightThrottleArmed = false;
            this.flagTOGA = false;
        }
        update(_deltaTime) {
            const fmaValues = localStorage.getItem("CJ4_fmaValues");
            if (fmaValues) {
                const parsedFmaValues = JSON.parse(fmaValues);
                this.autoThrottleStatus = parsedFmaValues.autoThrottle;
                this.approachType = parsedFmaValues.approachType;
            }
            var left = Simplane.getAutoPilotThrottleArmed(1);
            var right = Simplane.getAutoPilotThrottleArmed(2);
            var mode = this.getActiveMode();
            if ((mode != this.currentMode) || (left != this.leftThrottleArmed) || (right != this.rightThrottleArmed)) {
                this.leftThrottleArmed = left;
                this.rightThrottleArmed = right;
                this.changeMode(mode);
            }
            this.updateHighlight(_deltaTime);
        }
        getActiveMode() {
            if (!Simplane.getAutoPilotThrottleArmed()) {
                return -1;
            }
            if (this.autoThrottleStatus == "SPD") {
                return 2;
            }
            else if (this.autoThrottleStatus == "THR" ) {
                return 3;
            }
            else if (this.autoThrottleStatus == "THRREF") {
                return 4;
            }
            else if (this.autoThrottleStatus == "HOLD") {
                return 0;
            }
            else if (this.autoThrottleStatus == "IDLE") {
                return 1;
            }
            return -1;
        }

        getCurrentModeText() {
            /*
            this commented out block of code does nothing (empty if-else)
            var modeText = "";
            if (this.leftThrottleArmed && !this.rightThrottleArmed) {
            }
            else if (!this.leftThrottleArmed && this.rightThrottleArmed) {
            }
            */

            if (typeof this.currentMode !== "number" || this.currentMode < 0 || this.currentMode > 4)
                return "";

            const modeEnumToText = {
                0: "HOLD",
                1: "IDLE",
                2: "SPD",
                3: "THR",
                4: "THR REF"
            };

            return modeEnumToText[this.currentMode];
        }
    }
    Boeing_FMA.Column1Top = Column1Top;
    //Lateral current state (column 2)
    class Column2Top extends Annunciation {
        getActiveMode() {         
            if(!Simplane.getAutoPilotActive(0) && !Simplane.getAutoPilotFlightDirectorActive(1)){
                return -1;
            }
            else if (this.lateralMode == "TO" || this.lateralMode == "GA" || this.lateralMode == "ROLL") {  //roll here is take off roll
                return 8;
            }
            else if (ApproachStatus.isRolloutActive) {
                SimVar.SetSimVarValue("L:ROLLOUT_ACTIVE", "bool", true); 
                SimVar.SetSimVarValue("AUTOPILOT THROTTLE ARM", "bool", false);
                return 7;
            }
            else if (this.lateralMode == "HDGHOLD") {
                return 2;
            }
            else if (this.lateralMode == "HDG") {
                return 3;
            }
            else if (this.lateralMode == "LNV1") {
                return 5;
            }
            else if (this.lateralMode == "APPR LNV1") {
                return 1;
            }
            else if (this.lateralMode == "APPR LOC1") {
                return 6;
            }   
            return -1;
        }
        getCurrentModeText() {
            switch (this.currentMode) {
                case 0: return "B/CRS";
                case 1: return "FAC";
                case 2: return "HDG HOLD";
                case 3: return "HDG SEL";
                case 4: return "HUD TO/GA";
                case 5: return "LNAV";
                case 6: return "LOC";
                case 7: return "ROLLOUT";
                case 8: return "TO/GA";
                case 9: return "TRK HOLD";
                case 10: return "TRK SEL";
                case 11: return "ATT";
                default: return "";
            }
        }
    }
    Boeing_FMA.Column2Top = Column2Top;
    //Armed Lateral mode (second column)
    class Column2Middle extends Annunciation {
        getActiveMode() {
            if(!Simplane.getAutoPilotActive(0) && !Simplane.getAutoPilotFlightDirectorActive(1)){
                return -1;
            }
            else if (this.lateralArmed === "FORCE TOGA") {
                return -1;
            }
            else if (ApproachStatus.isRolloutArmed) {
                return 4;
            }
            else if (this.lateralArmed === "APPR LNV1") {
                return 1;
            }
            else if (this.lateralArmed === "APPR LOC1") {
                return 3;
            }
            else if (this.lateralArmed === "LNV1") {
                return 2;
            }
            return -1;
        }
        getCurrentModeText() {
            switch (this.currentMode) {
                case 0: return "B/CRS";
                case 1: return "FAC";
                case 2: return "LNAV";
                case 3: return "LOC";
                case 4: return "ROLLOUT";
                default: return "";
            }
        }
    }
    Boeing_FMA.Column2Middle = Column2Middle;

    //-1: not initialized/visual; 0: NO AUTOLAND; 1: RNAV; 2: LAND2; 3: LAND3
    class Column2Bottom extends Annunciation {
        constructor(_parent, _divElement, _highlightElement, _arrowsElement) {
            super(_parent, _divElement, _highlightElement);
            this.arrowsElement = null;
            this.arrowsElement = _arrowsElement;
        }
        
        changeMode(_mode) {
            super.changeMode(_mode);
            if (this.divElement != null) {
                var className = "bottom";
                if (_mode == 4) {
                    className += " warning";
                }
                this.divElement.className = className;
            }
            if (this.arrowsElement != null) {
                this.arrowsElement.style.display = (_mode == 3) ? "block" : "none";
            }
        }
        getActiveMode() {
            //3 - land3
            //2 - land2
            //1 RNAV/VISUAL
            //0 - not initialized
            //4 - no autoland (implemented later)
            if (SimVar.GetSimVarValue("L:TEEVEE_AUTOLAND_CAT", "number") ==  3 && Simplane.getAutoPilotActive()) {
                return 2;
            }
            else if (SimVar.GetSimVarValue("L:TEEVEE_AUTOLAND_CAT", "number") ==  2 && Simplane.getAutoPilotActive()) {
                return 3;
            }
            else if (SimVar.GetSimVarValue("L:TEEVEE_AUTOLAND_CAT", "number") ==  4 && Simplane.getAutoPilotActive()) {
                return 4;
            }
            else if (Simplane.getAutoPilotActive()) {
                return 0;
            }
            else if (Simplane.getAutoPilotFlightDirectorActive(1)) {
                return 1;
            }
            return -1;
        }
        getCurrentModeText() {
            switch (this.currentMode) {
                case 0: return "A/P";
                case 1: return "FLT DIR";
                case 2: return "LAND 3";
                case 3: return "LAND 2";
                case 4: return "NO AUTOLAND";
                default: return "";
            }
        }
    }
    Boeing_FMA.Column2Bottom = Column2Bottom;
    //Active Vertical mode (third column)
    class Column3Top extends Annunciation {
        getActiveMode() {
            let roundedAlt = Math.round(Simplane.getAltitude() / 100) * 100;
            let targetAlt = SimVar.GetSimVarValue("AUTOPILOT ALTITUDE LOCK VAR:3", "feet");
            let crzAlt = SimVar.GetSimVarValue("L:AIRLINER_CRUISE_ALTITUDE", "number");
            if(!Simplane.getAutoPilotActive(0) && !Simplane.getAutoPilotFlightDirectorActive(1)){
                return -1;
            }
            if (this.verticalMode === "ALTS CAP" && (targetAlt === crzAlt)|| this.verticalMode === "ALTS" && (targetAlt === crzAlt)|| this.verticalMode === "ALT" && (roundedAlt === crzAlt)) {
                return 0;
            }
            else if (this.verticalMode === "VPATH" || this.verticalMode === "VALTV CAP" || this.verticalMode === "VALTV" ) 
                //|| this.verticalMode === "VALTS" && (targetAlt === crzAlt)
                //|| this.verticalMode === "VALTS CAP" && (targetAlt === crzAlt)
                //|| this.verticalMode === "VALT" && (roundedAlt === crzAlt)) 
            {
                return 7;
            }
            else if (this.verticalMode === "VALTS" || this.verticalMode === "VALTS CAP" || this.verticalMode === "VALT") {  //here
                return 9;
            }
            else if (this.verticalMode === "VFLC") {
                return 8;
            }
            
            else if (this.verticalMode === "FLC") {
                return 2;
            }
            else if (this.verticalMode === "VS") {
                return 10;
            }
            else if (this.verticalMode === "TO" || this.verticalMode === "GA") {
                return 6;
            }
            else if (ApproachStatus.isFlareActive) {
                SimVar.SetSimVarValue("L:FLARE_STATUS", "number", 2);
                return 1;
            }
            else if (this.verticalMode === "GP") {
                return 5;
            }
            else if (this.verticalMode === "GS" && !Simplane.getIsGrounded()) {
                return 4;
            }
            return -1;
        }
        getCurrentModeText() {
            switch (this.currentMode) {
                case 0: return "ALT";
                case 1: return "FLARE";
                case 2: return "FLCH SPD";
                case 3: return "FPA";
                case 4: return "G/S";
                case 5: return "G/P";
                case 6: return "TO/GA";
                case 7: return "VNAV PTH";
                case 8: return "VNAV SPD";
                case 9: return "VNAV ALT";
                case 10: return "V/S";
                default: return "";
            }
        }
    }
    Boeing_FMA.Column3Top = Column3Top;
    //Armed third column (veritcal state)
    class Column3Middle extends Annunciation {
        getActiveMode() {
            if(!Simplane.getAutoPilotActive(0) && !Simplane.getAutoPilotFlightDirectorActive(1)){
                return -1;
            }
            else if (SimVar.GetSimVarValue("L:AP_APP_ARMED", "bool") === 1) {
                if (this.approachType === "rnav" && this.verticalMode !== "GP") {
                    return 1;
                }
                else if (ApproachStatus.isFlareArmed){
                    return 0;
                }
                else if (this.verticalMode !== "GS" && this.verticalMode !== "GP" && !Simplane.getIsGrounded()) {
                    return 2;
                }
            }
            else if (SimVar.GetSimVarValue("L:AP_VNAV_ARMED", "number") === 1 && SimVar.GetSimVarValue("L:WT_CJ4_VNAV_ON", "number") === 0) {
                return 3;
            }
            return -1;
        }
        getCurrentModeText() {
            switch (this.currentMode) {
                case 0: return "FLARE";
                case 1: return "G/P";
                case 2: return "G/S";
                case 3: return "VNAV";
                default: return "";
            }
        }
    }
    Boeing_FMA.Column3Middle = Column3Middle;
})(Boeing_FMA || (Boeing_FMA = {}));
customElements.define("boeing-fma", Boeing.FMA);
//# sourceMappingURL=Boeing_FMA.js.map