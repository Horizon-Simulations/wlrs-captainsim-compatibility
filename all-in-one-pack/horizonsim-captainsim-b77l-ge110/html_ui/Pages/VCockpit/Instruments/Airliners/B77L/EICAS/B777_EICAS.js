class B777_EICAS extends Airliners.BaseEICAS {
    constructor() {
        super(...arguments);
        this.engines = new Array();
    }

    Init() {
        super.Init();
        for (let i = 0; i < Simplane.getEngineCount(); i++) {
            this.engines.push(new B777_Engine());
        }
        this.currentPage = "B777_EICAS_fuel";

        //for fuel simulations
        this.delta_t = 3000;

        this.elapsedTime = 0;

        //format: RPM - EGT - OILPRESS - OIL TEMP - OIL QTY, all will be doubled occurs for consistancy
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
        this.currentAPUIndex = 0;
        SimVar.SetSimVarValue("L:APU_EGT", "number", 0);
        SimVar.SetSimVarValue("L:APU_RPM", "number", 0);
        SimVar.SetSimVarValue("L:APU_OIL_PRESS", "number", 0);
        SimVar.SetSimVarValue("L:APU_OIL_TEMP", "number", 0);
        SimVar.SetSimVarValue("L:APU_OIL_QTY", "number", 0);

        setInterval(this.updateAPUData.bind(this), 152);
        setInterval(this.updateFuelTemperature.bind(this), this.delta_t);
    }

    reboot() {
        super.reboot();
        if (this.warnings)
            this.warnings.reset();
        if (this.annunciations)
            this.annunciations.reset();
    }

    onEvent(_event) {
        var prefix = this.getLowerScreenChangeEventNamePrefix();
        super.onEvent(_event);
        if (this.currentPage !== _event) {
            this.currentPage = _event;
        } 
        else if (_event.substring(0,18) == prefix) {
            this.changePage("BLANK");
            SimVar.SetSimVarValue("L:XMLVAR_EICAS_CURRENT_PAGE", "Enum", -1);
            this.currentPage = "blank";
            return;
        }

        // if the event contains "EICAS_CHANGE_PAGE_{x}", the EICAS will display the page indicated by {x}; e.g. EICAS_CHANGE_PAGE_FUEL shows the fuel page
        if (_event.indexOf(prefix) >= 0) {
            var pageName = _event.replace(prefix, "");
            this.changePage(pageName);
        }
        else {
            // else the event is not a CHANGE_PAGE event, and therefore needs to be passed to the lower screen event handlers
            for (let i = 0; i < this.lowerScreenPages.length; i++) {
                this.lowerScreenPages[i].onEvent(_event);
            }
        }
    }

    get templateID() {
        return "B777_EICAS";
    }

    createUpperScreenPage() {
        this.upperTopScreen = new Airliners.EICASScreen("TopScreen", "TopScreen", "b777-upper-eicas");
        this.annunciations = new Cabin_Annunciations();
        this.upperTopScreen.addIndependentElement(this.annunciations);
        this.warnings = new Cabin_Warnings();
        this.upperTopScreen.addIndependentElement(this.warnings);
        this.addIndependentElementContainer(this.upperTopScreen);
    }

    createLowerScreenPages() {
        this.createLowerScreenPage("FUEL", "BottomScreen", "b777-lower-eicas-fuel");
        this.createLowerScreenPage("ENG", "BottomScreen", "b777-lower-eicas-engine");
        this.createLowerScreenPage("STAT", "BottomScreen", "b777-lower-eicas-stat");
        this.createLowerScreenPage("FCTL", "BottomScreen", "b777-lower-eicas-fctl");
        this.createLowerScreenPage("DRS", "BottomScreen", "b777-lower-eicas-drs");
        this.createLowerScreenPage("ELEC", "BottomScreen", "b777-lower-eicas-elec");
        this.createLowerScreenPage("HYD", "BottomScreen", "b777-lower-eicas-hyd");
        this.createLowerScreenPage("GEAR", "BottomScreen", "b777-lower-eicas-gear");
        this.createLowerScreenPage("CHKL", "BottomScreen", "b777-lower-eicas-ecl");
        this.createLowerScreenPage("INFO", "BottomScreen", "b777-lower-eicas-info");
        this.createLowerScreenPage("BLANK", "BottomScreen", "b777-lower-eicas-blank"); // To blank the bottom eicas when selecting same page again
    }

    getLowerScreenChangeEventNamePrefix() {
        return "EICAS_CHANGE_PAGE_";
    }

    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.updateAnnunciations();
        this.updateEngines(_deltaTime);
        this.updateElapsedTime(_deltaTime);
    }

    updateElapsedTime(_deltaTime) {
        //off ground - start
        //touch ground - pause
        //power off - reset ()
        if (!SimVar.GetSimVarValue("SIM ON GROUND", "bool")) {
            this.elapsedTime += _deltaTime/1000;
        
        }
        SimVar.SetSimVarValue("L:ELAPSED_TIME_ENGINE", "seconds", this.elapsedTime);
    }

    updateFuelTemperature() {
        // idea from chatGPT and https://aviation.stackexchange.com/questions/97174/how-can-i-determine-the-fuel-temperature-in-the-tanks-of-an-airbus-a320-during-c
        const T_initial = SimVar.GetSimVarValue("L:FUEL_TEMP", "Celsius");  // Initial fuel temperature in °C
        const h = 84;  // Convective heat transfer coefficient in W/(m²·K)
        const c_f = 2100;  // Specific heat capacity of kerosene in J/(kg·K)
        const A = 0.7 * 410;  // Effective surface area (70% of wing area) in m²
        const T_engineFuelReturn = 120;  // Temperature in °C, assume a fixed temperature for the returning fuel from the engines (simplification)
        let P_antiIce  = 800000;  // Heating power in watts (W) (unreal)
        let aimedTemp = 15; //change later

        // Get the mass of the fuel in kg
        const m_f_per_gallon = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram");
        const fuel_quantity_gallons = SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons");
        const m_f = m_f_per_gallon * fuel_quantity_gallons;

        // Get the ambient temperature in °C
        const T_ambient = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "Celsius");
    
        // Get the fuel flow rates for both engines in kg/s
        const engine1FuelFlow = SimVar.GetSimVarValue("ENG FUEL FLOW GPH:1", "gallons per hour") * m_f_per_gallon / 3600;
        const engine2FuelFlow = SimVar.GetSimVarValue("ENG FUEL FLOW GPH:2", "gallons per hour") * m_f_per_gallon / 3600;
        const totalFuelFlow = engine1FuelFlow + engine2FuelFlow;

        // Initialize or get the current fuel temperature
        if (typeof this.T_f === 'undefined') {
            this.T_f = T_initial;
        }

        // Calculate b
        const b = (h * A) / (m_f * c_f);
        // Calculate heat exchange with ambient air
        const heatExchangeAmbient = (T_ambient - this.T_f) * Math.exp(-b * (this.delta_t/1000));
        // Calculate heat exchange due to fuel flow
        const heatExchangeFuelFlow = (totalFuelFlow / m_f) * (T_engineFuelReturn - this.T_f) * ((this.delta_t/1000) / 3600);  // Convert delta_t to hours

        // Calculate the effect of the anti-ice heating system
        let heatFromAntiIce = 0;
        if (SimVar.GetSimVarValue("L:WING_ANTI_ICE_ON", "Bool"))
        {
            heatFromAntiIce = (P_antiIce / (m_f * c_f)) * (this.delta_t/1000);  // Heat from the anti-ice system in °C
        }

        // Update fuel temperature
        this.T_f = T_ambient + (this.T_f - T_ambient) * Math.exp(-b * (this.delta_t/1000)) + heatExchangeFuelFlow + heatFromAntiIce;
        if (this.T_f == aimedTemp) {
            P_antiIce = 5000;
        }

        // Set the simulated fuel temperature
        SimVar.SetSimVarValue("L:FUEL_TEMP", "Celsius", this.T_f);
    }
    
    updateAPUData() {
        this.ambientTemp = (SimVar.GetSimVarValue("A:AMBIENT TEMPERATURE", "Celsius")).toFixed(0);
        const apuStarted = SimVar.GetSimVarValue("APU SWITCH", "Bool");
        
        if (SimVar.GetSimVarValue("APU PCT RPM", "percent") > 7) {
            if (apuStarted) {                
                this.currentAPUIndex++;
                if (this.currentAPUIndex >= this.apuStart.length) {
                    this.currentAPUIndex = this.apuStart.length - 1;
                }
            } else {
                this.currentAPUIndex--;
                if (this.currentAPUIndex < 0) {
                    this.currentAPUIndex = 0;
                }
            }

            SimVar.SetSimVarValue("L:APU_EGT", "number", Math.round((Math.floor(Math.random() * 1) + 1) * this.apuStart[this.currentAPUIndex][1] + this.ambientTemp * 1.8));
            SimVar.SetSimVarValue("L:APU_RPM", "number", this.apuStart[this.currentAPUIndex][0]);
            SimVar.SetSimVarValue("L:APU_OIL_PRESS", "number", this.apuStart[this.currentAPUIndex][2]);
            SimVar.SetSimVarValue("L:APU_OIL_TEMP", "number", Math.round((Math.floor(Math.random() * 1) + 1) * this.apuStart[this.currentAPUIndex][3] + this.ambientTemp * 1.2));
            SimVar.SetSimVarValue("L:APU_OIL_QTY", "number", this.apuStart[this.currentAPUIndex][4]);
        }
    }    

    updateAnnunciations() {
        let infoPanelManager = this.upperTopScreen.getInfoPanelManager();
        if (infoPanelManager) {
            
            /* FOR CANCEL/RECALL (FOR NOW)
            if () {
                infoPanelManager.clearScreen(Airliners.EICAS_INFO_PANEL_ID.PRIMARY);
                return;
            }
            */

            let masterWarningActive = false;
            let masterCautionActive = false;

            infoPanelManager.clearScreen(Airliners.EICAS_INFO_PANEL_ID.PRIMARY);
            if (this.warnings) {
                let text = this.warnings.getCurrentWarningText();
                if (text) {
                    let level = this.warnings.getCurrentWarningLevel();
                    switch (level) {
                        case 1:
                            infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.MEMO);
                            break;
                        case 2:
                            infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.ADVISORY);
                            break;
                        case 3:
                            infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION);
                            break;
                        case 4:
                            infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING);
                            break;
                    }
                }
            }
            
            if (this.annunciations) {
                // arrow function declared to DRY this section
                let displayListAnnunc = (_annuncList, _infoMsgStyle) => {
                    for (let i = _annuncList.length - 1; i >= 0; i--) {
                        if (!_annuncList[i].Acknowledged)
                            infoPanelManager.addMessage(
                                Airliners.EICAS_INFO_PANEL_ID.PRIMARY,
                                _annuncList[i].Text,
                                _infoMsgStyle
                            );
                            if (_infoMsgStyle === Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING) {
                                masterWarningActive = true;
                            }
                            if (_infoMsgStyle === Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION) {
                                masterCautionActive = true;
                            } 
                    }
                };
                

                // display WARNING, CAUTION, ADVISORY, and MEMO annunciations
                displayListAnnunc(this.annunciations.displayWarning, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING);
                displayListAnnunc(this.annunciations.displayCaution, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION);
                displayListAnnunc(this.annunciations.displayAdvisory, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.ADVISORY);
                displayListAnnunc(this.annunciations.displayMemo, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.MEMO);

                SimVar.SetSimVarValue("MASTER WARNING ACTIVE", "bool", masterWarningActive);
                SimVar.SetSimVarValue("MASTER CAUTION ACTIVE", "bool", masterCautionActive);

                if (!masterWarningActive) {
                    SimVar.SetSimVarValue("MASTER WARNING ACKNOWLEDGED", "bool", false);
                }
                if (!masterCautionActive) {
                    SimVar.SetSimVarValue("MASTER CAUTION ACKNOWLEDGED", "bool", false);
                }
            }
            

            //will be work on later
            document.addEventListener("B777_MFD_CANCRCL", function(event) {
                let infoPanelsManager = new InfoPanelsManager();
                infoPanelsManager.updateAnnunciations();
            });
        }
    }

    getEngineState(_engineId) {
        let index = _engineId - 1;
        if (index >= 0 && index < this.engines.length) {
            return this.engines[index].currentState;
        }
        return B777_EngineState.IDLE;
    }
    
    getN2IdleValue() {
        return 600;
    }
    getN2Value(_engineId) {
        return SimVar.GetSimVarValue("ENG N2 RPM:" + _engineId, "percent") * 10;
    }
    getFuelValveOpen(_engineId) {
        return SimVar.GetSimVarValue("FUELSYSTEM VALVE OPEN:" + (2 + _engineId), "boolean");
    }
    
    updateEngines(_deltaTime) {
        for (var i = 0; i < this.engines.length; i++) {
            let N2Value = this.getN2Value(i + 1);
            switch (this.engines[i].currentState) {
                
                case B777_EngineState.IDLE:
                    if (this.getFuelValveOpen(i + 1)) {
                        if (N2Value >= this.getN2IdleValue())
                            this.changeState(i, B777_EngineState.RUNNING);
                        else if (N2Value >= 0.05)
                            this.changeState(i, B777_EngineState.AUTOSTART);
                    }
                    break;

                case B777_EngineState.AUTOSTART:
                    if (!this.getFuelValveOpen(i + 1))
                        this.changeState(i, B777_EngineState.DECELERATE);
                    else if (N2Value >= this.getN2IdleValue())
                        this.changeState(i, B777_EngineState.RUNNING);
                    break;

                case B777_EngineState.RUNNING:
                    if (N2Value < this.getN2IdleValue())
                        this.changeState(i, B777_EngineState.DECELERATE);
                    else if (this.engines[i].timeInState > 30)
                        this.changeState(i, B777_EngineState.READY);
                    break;

                case B777_EngineState.READY:
                    if (N2Value < this.getN2IdleValue())
                        this.changeState(i, B777_EngineState.DECELERATE);
                    break;

                case B777_EngineState.DECELERATE:
                    if (N2Value < 0.05)
                        this.changeState(i, B777_EngineState.IDLE);
                    else if (N2Value >= this.getN2IdleValue())
                        this.changeState(i, B777_EngineState.RUNNING);
                    break;
            }
            this.engines[i].timeInState += _deltaTime / 1000;
        }
    }
    changeState(_index, _state) {
        if (this.engines[_index].currentState == _state)
            return;
        this.engines[_index].currentState = _state;
        this.engines[_index].timeInState = 0;
    }
}
var B777_EngineState;
(function (B777_EngineState) {
    B777_EngineState[B777_EngineState["IDLE"] = 0] = "IDLE";
    B777_EngineState[B777_EngineState["AUTOSTART"] = 1] = "AUTOSTART";
    B777_EngineState[B777_EngineState["RUNNING"] = 2] = "RUNNING";
    B777_EngineState[B777_EngineState["READY"] = 3] = "READY";
    B777_EngineState[B777_EngineState["DECELERATE"] = 4] = "DECELERATE";
})(B777_EngineState || (B777_EngineState = {}));
class B777_Engine {
    constructor() {
        this.currentState = B777_EngineState.IDLE;
        this.timeInState = 0;
    }
}
registerInstrument("b777-eicas-element", B777_EICAS);