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
            this.currentAPUIndex = 0;
            this.eicas = _eicas;
            this.refThrust = [];
            this.refThrustDecimal = [];
            this.engRevStatus = [];
            this.refThrust[1] = this.querySelector("#THROTTLE1_Value");
            this.refThrust[2] = this.querySelector("#THROTTLE2_Value");
            this.refThrustDecimal[1] = this.querySelector("#THROTTLE1_Decimal");
            this.refThrustDecimal[2] = this.querySelector("#THROTTLE2_Decimal");
            this.unitTextSVG = this.querySelector("#TOTAL_FUEL_Units");
            this.tmaDisplay = new Boeing.ThrustModeDisplay(this.querySelector("#TMA_Value"));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#TAT_Value"), Simplane.getTotalAirTemperature, 0, Airliners.DynamicValueComponent.formatValueToPosNegTemperature));

            //this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#FUEL_TEMP_Value"), SimVar.GetSimVarValue("L:FUEL_TEMP", "number"), 0, Airliners.DynamicValueComponent.formatValueToPosNegTemperature));
            this.querySelector("#FUEL_TEMP_Value").textContent = SimVar.GetSimVarValue("L:FUEL_TEMP", "number");

            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#THROTTLE1_Value"), Simplane.getEngineThrottleMaxThrust.bind(this, 0), 1, Airliners.DynamicValueComponent.formatValueToThrottleDisplay));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#THROTTLE2_Value"), Simplane.getEngineThrottleMaxThrust.bind(this, 1), 1, Airliners.DynamicValueComponent.formatValueToThrottleDisplay));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#CAB_ALT_Value"), Simplane.getPressurisationCabinAltitude));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#RATE_Value"), Simplane.getPressurisationCabinAltitudeRate));
            this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#DELTAP_Value"), Simplane.getPressurisationDifferential, 1, Airliners.DynamicValueComponent.formatValueToString));
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
            this.flapsDisplay = new Boeing.FlapsDisplay(this.querySelector("#FlapsInfo"), this.querySelector("#FlapsLine"), this.querySelector("#FlapsValue"), this.querySelector("#FlapsBar"), this.querySelector("#FlapsGauge"));
            this.stabDisplay = new Boeing.StabDisplay(this.querySelector("#StabInfo"), 15, 1);
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

            this.apuStart = [
                [0,this.ambientTemp,0,54,5.9], [0,this.ambientTemp,0,54,5.9],
                [0,this.ambientTemp,0,54,5.9], [0,this.ambientTemp,0,54,5.9],
                [0,this.ambientTemp,0,54,5.9], [0,this.ambientTemp,0,54,5.9],
                [0,this.ambientTemp,0,54,5.9], [0,this.ambientTemp,0,54,5.9],
                [0,80,0,54,5.9], [0,80,0,54,5.9], [0,90,0,54,5.9], [0, 90,0,54,5.9],
                [3.4,89,0,54,5.9], [3.4,89,0,54,5.9], [6.5,90,0,54,5.9], [6.5,90,0,54,5.9],
                [7.4,90,0,54,5.9], [7.4,90,0,54,5.9], [8.1,101,0,54,5.9], [8.1,101,0,54,5.9],
                [8.8,103,0,54,5.9], [8.8,103,0,54,5.9], [9.4,105,1,54,5.9], [9.4,105,1,54,5.9],
                [9.9,107,1,54,5.9], [9.9,107,1,54,5.9], [10.5,115,2,54,5.9], [10.5,115,2,54,5.9],
                [11.1,133,2,54,5.9], [11.1,133,2,54,5.9], [11.6,156,3,54,5.9], [11.6,156,3,54,5.9],
                [12.3,181,4,54,5.9], [12.8,206,5,53,5.9], [13.3,227,6,53,5.9], [13.3,227,6,53,5.9],
                [13.8,246,7,53,5.9], [13.8,246,7,53,5.9], [14.3,264,9,52,5.9], [14.3,264,9,52,5.9],
                [14.8,279,10,52,5.9], [14.8,279,10,52,5.9], [14.8,279,10,52,5.9], [14.8,279,10,52,5.9],
                [15.3,293,10,52,5.9], [15.3,293,10,52,5.9], [15.6,306,11,52,5.9], [15.6,306,11,52,5.9],
                [16.0,319,12,52,5.9], [16.0,319,12,52,5.9], [16.4,330,12,52,5.9], [16.4,330,12,52,5.9],
                [16.9,340,13,52,5.9], [16.9,340,13,52,5.9], [17.3,350,13,52,5.9], [17.3,350,13,52,5.9],
                [17.6,359,14,53,5.9], [17.6,359,14,53,5.9], [18.0,367,14,53,5.9], [18.0,367,14,53,5.9],
                [18.4,375,14,53,5.9], [18.4,375,14,53,5.9], [18.6,382,15,53,5.9], [18.6,382,15,53,5.9],
                [19.0,389,16,53,5.9], [19.0,389,16,53,5.9], [19.3,395,16,55,5.9], [19.3,395,16,55,5.9],
                [19.5,400,16,54,5.9], [19.5,400,16,54,5.9], [19.8,405,17,54,5.9], [19.8,405,17,54,5.9],
                [20.1,409,17,55,5.9], [20.1,409,17,55,5.9], [20.4,413,17,55,5.9], [20.4,413,17,55,5.9], 
                [20.6,417,18,55,5.8], [20.6,417,18,55,5.8], [20.9,421,18,55,5.8], [20.9,421,18,55,5.8],
                [21.1,424,18,56,5.8], [21.1,424,18,56,5.8], [21.4,427,18,56,5.8], [21.4,427,18,56,5.8],
                [21.6,430,19,56,5.8], [21.6,430,19,56,5.8], [21.9,432,19,56,5.8], [21.9,432,19,56,5.8],
                [22.0,434,19,57,5.8], [22.0,434,19,57,5.8], [22.3,436,20,57,5.8], [22.3,436,20,57,5.8],
                [22.5,438,20,57,5.8], [22.5,438,20,57,5.8], [22.6,441,20,57,5.8], [22.6,441,20,57,5.8],
                [22.9,443,21,57,5.8], [22.9,443,21,57,5.8], [23.0,446,21,57,5.8], [23.0,446,21,57,5.8],
                [23.3,449,21,57,5.8], [23.3,449,21,57,5.8], [23.4,452,21,57,5.8], [23.4,452,21,57,5.8],
                [23.6,452,21,57,5.8], [23.6,452,21,57,5.8], [23.9,456,21,57,5.8], [23.9,456,21,57,5.8],
                [23.9,460,22,57,5.8], [23.9,460,22,57,5.8], [24.0,464,22,58,5.8], [24.0,464,22,58,5.8],
                [24.3,468,22,58,5.8], [24.3,468,22,58,5.8], [24.5,472,22,58,5.7], [24.5,472,22,58,5.7],
                [24.6,476,23,58,5.7], [24.6,476,23,58,5.7], [24.9,480,23,59,5.7], [24.9,480,23,59,5.7],
                [25.0,480,23,59,5.7], [25.0,480,23,59,5.7], [25.3,489,24,59,5.7], [25.3,489,24,59,5.7],
                [25.5,493,24,59,5.6], [25.5,493,24,59,5.6], [25.9,503,24,59,5.6], [25.3,489,24,59,5.6],
                [26.1,507,25,59,5.7], [26.1,507,25,59,5.7], [26.3,512,25,59,5.6], [26.3,512,25,59,5.6],
                [26.5,516,25,59,5.6], [26.5,516,25,59,5.6], [26.9,526,25,59,5.6], [26.9,526,25,59,5.6],
                [27.1,530,26,59,5.6], [27.1,530,26,59,5.6], [27.3,534,26,59,5.6], [27.3,534,26,59,5.6],
                [27.5,539,27,59,5.6], [27.5,539,27,59,5.6], [27.8,543,27,59,5.5], [27.8,543,27,59,5.5],
                [27.9,548,27,60,5.5], [27.9,548,27,60,5.5], [28.1,552,27,60,5.5], [28.1,552,27,60,5.5],
                [28.4,556,28,60,5.5], [28.4,556,28,60,5.5], [28.5,560,28,60,5.5], [28.5,560,28,60,5.5],
                [28.8,564,28,60,5.5], [28.8,564,28,60,5.5], [29.0,568,29,60,5.5], [29.0,568,29,60,5.5],
                [29.1,572,29,60,5.5], [29.1,572,29,60,5.5], [29.4,575,29,60,5.5], [29.4,575,29,60,5.5],
                [29.6,579,30,60,5.5], [29.6,579,30,60,5.5], [29.8,582,30,60,5.4], [29.8,582,30,60,5.4],
                [30.0,585,30,60,5.4], [30.0,585,30,60,5.4], [30.3,587,30,60,5.4], [30.3,587,30,60,5.4],
                [30.4,590,31,60,5.4], [30.4,590,31,60,5.4], [30.6,592,31,60,5.4], [30.6,592,31,60,5.4],
                [30.9,594,31,60,5.4], [30.9,594,31,60,5.4], [31.0,596,32,60,5.4], [31.0,596,32,60,5.4],
                [31.3,598,32,60,5.4], [31.3,598,32,60,5.4], [31.5,600,32,60,5.4], [31.5,600,32,60,5.4],
                [31.6,603,32,60,5.4], [31.6,603,32,60,5.4], [31.9,605,32,60,5.4], [31.9,605,32,60,5.4],
                [32.0,607,33,60,5.4], [32.0,607,33,60,5.4], [32.3,609,33,60,5.4], [32.3,609,33,60,5.4],
                [32.5,611,34,60,5.3], [32.5,611,34,60,5.3], [32.8,613,34,60,5.3], [32.8,613,34,60,5.3],
                [32.9,614,35,60,5.3], [32.9,614,35,60,5.3], [33.1,616,35,60,5.3], [33.1,616,35,60,5.3],
                [33.4,617,35,60,5.3], [33.4,617,35,60,5.3], [33.6,618,35,60,5.3], [33.6,618,35,60,5.3],
                [33.8,619,35,60,5.3], [33.8,619,35,60,5.3], [34.0,620,36,60,5.3], [34.0,620,36,60,5.3],
                [34.3,621,37,60,5.3], [34.3,621,37,60,5.3], [34.4,622,37,60,5.3], [34.4,622,37,60,5.3],
                [34.6,623,37,60,5.3], [34.6,623,37,60,5.3], [34.9,623,38,60,5.3], [34.9,623,38,60,5.3],
                [35.1,624,38,60,5.3], [35.1,624,38,60,5.3], [35.3,624,38,60,5.3], [35.3,624,38,60,5.3],
                [35.5,624,39,60,5.3], [35.5,624,39,60,5.3], [35.8,625,39,60,5.2], [35.8,625,39,60,5.2],
                [36.0,624,39,60,5.2], [36.0,624,39,60,5.2], [36.1,625,40,60,5.2], [36.1,625,40,60,5.2],
                [36.4,624,40,60,5.2], [36.4,624,40,60,5.2], [36.6,624,40,60,5.2], [36.6,624,40,60,5.2],
                [36.8,624,41,60,5.2], [36.8,624,41,60,5.2], [37.0,623,41,60,5.2], [37.0,623,41,60,5.2],
                [37.3,623,41,60,5.2], [37.3,623,41,60,5.2], [37.5,622,42,60,5.2], [37.5,622,42,60,5.2],
                [37.6,621,42,60,5.2], [37.6,621,42,60,5.2], [37.9,621,42,60,5.2], [37.9,621,42,60,5.2],
                [38.1,620,43,60,5.2], [38.1,620,43,60,5.2], [38.3,619,43,60,5.1], [38.3,619,43,60,5.1],
                [38.3,618,43,60,5.1], [38.3,618,43,60,5.1], [38.6,617,44,60,5.1], [38.6,617,44,60,5.1],
                [38.9,616,44,60,5.1], [38.9,616,44,60,5.1], [39.1,615,44,60,5.1], [39.1,615,44,60,5.1],
                [39.4,615,45,60,5.1], [39.4,615,45,60,5.1], [39.6,616,45,60,5.1], [39.6,616,45,60,5.1],
                [39.9,617,46,60,5.1], [39.9,617,46,60,5.1], [40.1,617,46,60,5.1], [40.1,617,46,60,5.1],
                [40.3,618,47,60,5.1], [40.3,618,47,60,5.1], [40.5,619,47,60,5.1], [40.5,619,47,60,5.1],
                [40.8,619,48,60,5.1], [40.8,619,48,60,5.1], [41.0,620,48,60,5.1], [41.0,620,48,60,5.1],
                [41.3,620,48,60,5.1], [41.3,620,48,60,5.1], [41.5,620,49,60,5.1], [41.5,620,49,60,5.1],
                [41.8,619,49,60,5.1], [41.8,619,49,60,5.1], [42.0,619,50,60,5.1], [42.0,619,50,60,5.1],
                [42.3,619,50,60,5.1], [42.3,619,50,60,5.1], [42.5,618,51,60,5.0], [42.5,618,51,60,5.0],
                [42.9,618,51,60,5.0], [42.5,618,51,60,5.0], [43.1,618,52,60,5.0], [43.1,618,52,60,5.0],
                [43.5,618,52,60,5.0], [43.5,618,52,60,5.0], [43.9,619,53,60,5.0], [43.9,619,53,60,5.0],
                [44.3,620,54,60,5.0], [44.3,620,54,60,5.0], [44.6,621,55,60,5.0], [44.6,621,55,60,5.0],
                [45.0,621,55,60,5.0], [45.0,621,55,60,5.0], [45.4,621,56,60,5.0], [45.4,621,56,60,5.0],
                [45.8,621,56,60,5.0], [45.8,621,56,60,5.0], [46.1,620,57,60,5.0], [46.1,620,57,60,5.0],
                [46.5,619,58,60,5.0], [46.5,619,58,60,5.0], [46.8,618,59,60,5.0], [46.8,618,59,60,5.0],
                [47.1,617,59,60,5.0], [47.1,617,59,60,5.0], [47.5,616,60,60,5.0], [47.5,616,60,60,5.0],
                [47.9,614,60,60,5.0], [47.9,614,60,60,5.0], [48.3,613,61,61,5.0], [48.3,613,61,61,5.0],
                [48.6,611,62,61,5.0], [48.6,611,62,61,5.0], [49.0,609,63,61,5.0], [49.0,609,63,61,5.0],
                [49.4,608,63,61,5.0], [49.4,608,63,61,5.0], [49.6,607,64,61,4.9], [49.6,607,64,61,4.9],
                [50.0,606,64,60,4.9], [50.0,606,64,60,4.9], [50.4,605,64,61,4.9], [50.4,605,64,61,4.9],
                [50.8,604,64,61,4.9], [50.8,604,64,61,4.9], [51.1,603,64,61,4.9], [51.1,603,64,61,4.9],
                [51.5,602,64,61,4.9], [51.5,602,64,61,4.9], [51.9,602,64,61,4.9], [51.9,602,64,61,4.9],
                [52.4,601,64,61,4.9], [52.4,601,64,61,4.9], [52.8,600,64,61,4.9], [52.8,600,64,61,4.9],
                [53.3,599,64,61,4.9], [53.3,599,64,61,4.9], [53.8,597,64,61,4.9], [53.8,597,64,61,4.9],
                [54.1,595,64,61,4.9], [54.1,595,64,61,4.9], [54.6,593,64,61,4.9], [54.6,593,64,61,4.9],
                [55.1,591,65,61,4.9], [55.1,591,65,61,4.9], [55.6,589,65,61,4.8], [55.6,589,65,61,4.8],
                [56.1,587,65,61,4.8], [56.1,587,65,61,4.8], [56.6,584,65,61,4.8], [56.6,584,65,61,4.8],
                [57.1,581,65,61,4.8], [57.1,581,65,61,4.8], [57.6,579,65,61,4.8], [57.6,579,65,61,4.8],
                [58.1,576,65,61,4.8], [58.1,576,65,61,4.8], [58.6,573,65,61,4.8], [58.6,573,65,61,4.8],
                [59.0,570,65,61,4.8], [59.0,570,65,61,4.8], [59.6,568,65,61,4.8], [59.6,568,65,61,4.8],
                [60.1,565,65,61,4.8], [60.1,565,65,61,4.8], [60.6,562,65,61,4.8], [60.6,562,65,61,4.8],
                [61.3,559,65,61,4.8], [61.3,559,65,61,4.8], [61.9,556,65,61,4.8], [61.9,556,65,61,4.8],
                [62.5,553,66,61,4.8], [62.5,553,66,61,4.8], [63.1,550,66,61,4.8], [63.1,550,66,61,4.8],
                [63.8,550,66,61,4.8], [63.8,550,66,61,4.8], [64.5,544,66,61,4.8], [64.5,544,66,61,4.8],
                [65.1,541,66,61,4.8], [65.1,541,66,61,4.8], [65.9,538,66,61,4.8], [65.1,538,66,61,4.8],
                [66.6,535,67,61,4.8], [66.6,535,67,61,4.8], [67.4,532,67,61,4.8], [67.4,532,67,61,4.8],
                [68.2,528,67,61,4.8], [68.2,528,67,61,4.8], [69.0,524,67,61,4.8], [69.0,524,67,61,4.8],
                [69.8,521,67,61,4.8], [69.8,521,67,61,4.8], [70.6,517,68,61,4.8], [70.6,517,68,61,4.8],
                [71.5,513,68,61,4.8], [71.5,513,68,61,4.8], [72.5,509,68,61,4.8], [72.5,509,68,61,4.8],
                [73.5,504,68,61,4.8], [73.5,504,68,61,4.8], [74.5,499,68,61,4.8], [74.5,499,68,61,4.8],
                [75.6,493,68,61,4.7], [75.6,493,68,61,4.7], [76.8,487,68,61,4.7], [76.8,487,68,61,4.7], 
                [77.9,481,69,61,4.7], [77.9,481,69,61,4.7], [79.0,473,69,61,4.7], [79.0,473,69,61,4.7],
                [80.1,465,69,62,4.7], [80.1,465,69,62,4.7], [81.4,457,69,62,4.7], [81.4,457,69,62,4.7],
                [82.5,449,69,62,4.7], [82.5,449,69,62,4.7], [83.8,442,70,62,4.7], [83.8,442,70,62,4.7],
                [85.0,435,70,62,4.7], [85.0,435,70,62,4.7], [86.4,430,70,62,4.7], [86.4,430,70,62,4.7], 
                [87.8,426,70,62,4.7], [87.8,426,70,62,4.7], [89.3,422,70,62,4.7], [89.3,422,70,62,4.7],
                [90.8,418,71,62,4.7], [90.8,418,71,62,4.7], [92.3,414,71,62,4.7], [92.3,414,71,62,4.7],
                [93.8,408,72,62,4.7], [93.8,408,72,62,4.7], [95.3,404,72,62,4.7], [95.3,404,72,62,4.7],
                [96.5,400,72,62,4.7], [96.5,400,72,62,4.7], [97.4,396,72,62,4.7], [97.4,396,72,62,4.7],
                [98.0,393,72,62,4.7], [98.0,393,72,62,4.7], [98.5,390,72,62,4.8], [98.5,390,72,62,4.8],
                [99.0,387,72,62,4.8], [99.0,387,72,62,4.8], [99.5,385,72,62,4.8], [99.5,385,72,62,4.8],
                [100.0,383,72,62,4.8], [100.0,383,72,62,4.8], [100.1,382,72,62,4.8], [100.1,382,72,62,4.8],
                [100.3,381,72,62,4.8], [100.3,381,72,62,4.8], [100.3,379,72,62,4.8], [100.3,379,72,62,4.8],
                [100.3,378,72,63,4.8], [100.3,378,72,63,4.8], [100.3,377,72,63,4.8], [100.3,377,72,63,4.8],
                [100.1,376,72,63,4.9], [100.1,376,72,63,4.9], [100.1,375,72,63,4.9], [100.1,375,72,63,4.9],
                [100.0,374,72,63,5.0], [100.0,374,72,63,5.0]
            ];


            this.isInitialised = true;
        }
        update(_deltaTime) {
            const storedUnits = SaltyDataStore.get("OPTIONS_UNITS", "KG");
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
            if (this.stabDisplay != null) {
                this.stabDisplay.update(_deltaTime);
            }
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
            
            //both fuel master off
            if (SimVar.GetSimVarValue("FUELSYSTEM VALVE SWITCH:3", "Bool") && SimVar.GetSimVarValue("FUELSYSTEM VALVE SWITCH:4", "Bool")) {     // 
                this.fuelTankDisplay.style.display = "none";
            }
            //both fuel master on
            if (!(SimVar.GetSimVarValue("FUELSYSTEM VALVE SWITCH:3", "Bool")) && !(SimVar.GetSimVarValue("FUELSYSTEM VALVE SWITCH:4", "Bool"))) {     //
                let factor = this.gallonToMegapounds;
                if (this.units)
                    factor = this.gallonToMegagrams;
                this.fuelTankDisplay.style.display = "block";
                this.fuelTankLeft.textContent = (SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "gallons") * factor).toFixed(1);
                this.fuelTankCenter.textContent = (SimVar.GetSimVarValue("FUEL TANK CENTER QUANTITY", "gallons") * factor).toFixed(1);
                this.fuelTankRight.textContent = (SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "gallons") * factor).toFixed(1);
            }
            if (this.units) {
                this.querySelector("#FUEL_TEMP_Value").textContent = SimVar.GetSimVarValue("L:FUEL_TEMP", "Celcius").toFixed(1) + "C";
            }
            else {
                this.querySelector("#FUEL_TEMP_Value").textContent = ((SimVar.GetSimVarValue("L:FUEL_TEMP", "Celcius")*(9/5)) + 32).toFixed(1) + "F";
            }
        }
        updateReferenceThrust() {
            const MAX_POSSIBLE_THRUST_DISP = 1060;
            for (var i = 1; i < 3; ++i) {
                this.engRevStatus[i] = SimVar.GetSimVarValue("TURB ENG REVERSE NOZZLE PERCENT:" + i, "percent");
                if (this.engRevStatus[i] > 1) {
                    this.refThrust[i].textContent = "REV";
                    this.refThrustDecimal[i].style.visibility = "hidden";
                }
                else {
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
            this.cabinAlt.textContent = this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#CAB_ALT_Value"), Simplane.getPressurisationCabinAltitude));
            this.cabinRate.textContent = this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#RATE_Value"), Simplane.getPressurisationCabinAltitudeRate));
            let deltaPValue = Math.abs(Simplane.getPressurisationDifferential() * 10);
            if (Math.round(deltaPValue) < 10) {
                this.deltaP.textContent = "0" + deltaPValue.toFixed(0);
            }
            else {
                this.deltaP.textContent = deltaPValue.toFixed(0);
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
            this.fill = null;
            this.predArc = null;
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
                this.fill = this.root.querySelector(".fill");
                this.predArc = this.root.querySelector(".predArc");
                this.whiteMarker = this.root.querySelector(".normalMarker");
                this.throttleMarker = this.root.querySelector(".throttleMarker");
                this.redMarker = this.root.querySelector(".dangerMarker");
                this.orangeMarker = this.root.querySelector(".warningMarker");
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
                // if (this.orangeMarker != null) {
                //     diffAndSetStyle(this.orangeMarker, StyleProperty.display, 'none');
                // }
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
                var angle = Math.max((this.valueToPercentage(this.currentValue) * 0.009) * B777_EICAS_CircleGauge.MAX_ANGLE, 0.001);
                var angleo = Math.max((this.getN1LimitValue() * 0.01) * B777_EICAS_CircleGauge.MAX_ANGLE, 0.001);
                var anglet = Math.max((this.getN1CommandedValue() * 0.009) * B777_EICAS_CircleGauge.MAX_ANGLE, 0.001);
                
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
    B777_EICAS_CircleGauge.WARNING_ANGLE = 202;
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
            return Utils.Clamp(_value, 0, 110);
        }
        getN1LimitValue() {
            return Math.abs(Simplane.getEngineThrottleMaxThrust(this.engineIndex - 1));
        }
        getN1CommandedValue() {
            return Math.abs(Simplane.getEngineThrottleCommandedN1(this.engineIndex - 1));
        }
    }
    class B777_EICAS_Gauge_EGT extends B777_EICAS_CircleGauge {
        getCurrentValue() {
            return SimVar.GetSimVarValue("ENG EXHAUST GAS TEMPERATURE:" + this.engineIndex, "celsius");
        }
        valueToPercentage(_value) {
            return (Utils.Clamp(_value, 0, 1000) * 0.1);
        }
        getN1LimitValue() {
            return 0;
        }
        getN1CommandedValue() {
            return 0;
        }
    }
    class B777_EICAS_Gauge_N2 extends B777_EICAS_CircleGauge {
        getCurrentValue() {
            return SimVar.GetSimVarValue("ENG N2 RPM:" + this.engineIndex, "percent");
        }
        valueToPercentage(_value) {
            return Utils.Clamp(_value, 0, 100);
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
            let ambientTemp = Simplane.getAmbientTemperature();
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
                    if (ambientTemp <= 10 && strucIcePercent >= 10) {
                        return true
                    }
                }
            }
            return false;
        }
    }
    class WingAntiIceStatus extends AntiIceStatus {
        getCurrentActiveState() {
            let ambientTemp = Simplane.getAmbientTemperature();
            let strucIcePercent = SimVar.GetSimVarValue("STRUCTURAL ICE PCT", "percent");
            let knobPos = SimVar.GetSimVarValue("L:B777_Wing_AntiIce_Knob_State", "Number");
            
            if (knobPos == 0)
                {
                    return false;
                }
            else {
                if (knobPos == 2) {
                    return true;
                }
                else {
                    if (ambientTemp <= 10 && strucIcePercent >= 10) {
                        return true
                    }
                }
            }
            return false;
        }
    }
})(B777_UpperEICAS || (B777_UpperEICAS = {}));
customElements.define("b777-upper-eicas", B777_UpperEICAS.Display);
//# sourceMappingURL=B747_8_UpperEICAS.js.map