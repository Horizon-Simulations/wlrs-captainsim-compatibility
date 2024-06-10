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
            this.currentAPUIndex = 0;
            this.currentAPUCoolndex = 0;
            this.ambientTemp = (SimVar.GetSimVarValue("A:AMBIENT TEMPERATURE", "Celcius")).toFixed(0);
            this.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            
            //format: RPM - EGT - OILPRESS - OIL TEMP - OIL QTY, all will be doubled occurs for consistancy
            this.apuStart = [
                [0,this.ambientTemp,0,54,5.9], [0, this.ambientTemp,0,54,5.9],
                [0,this.ambientTemp,0,54,5.9], [0, this.ambientTemp,0,54,5.9],
                [0,this.ambientTemp,0,54,5.9], [0, this.ambientTemp,0,54,5.9],
                [0,this.ambientTemp,0,54,5.9], [0, this.ambientTemp,0,54,5.9],
                [0,80],0,54,5.9, [0,80,0,54,5.9], [0,90,0,54,5.9], [0, 90,0,54,5.9],
                [0,102,0,54,5.9], [0,102,0,54,5.9], [0,98,0,54,5.9], [0,98,0,54,5.9],
                [0,90,0,54,5.9], [0,90,0,54,5.9], [0,90,0,54,5.9], [0, 90,0,54,5.9],
                [0,89,0,54,5.9], [0,89,0,54,5.9], [0,90,0,54,5.9], [0, 90,0,54,5.9],
                [3.4,89,0,54,5.9], [3.4,89,0,54,5.9], [6.5,90,0,54,5.9], [6.5,90,0,54,5.9],
                [7.4,90,0,54,5.9], [7.4,90,0,54,5.9], [8.1,101,0,54,5.9], [8.1,101,0,54,5.9],
                [8.8,103,0,54,5.9], [8.8,103,0,54,5.9], [9.4,105,1,54,5.9], [9.4,105,1,54,5.9],
                [9.9,107,1,54,5.9], [9.9,107,1,54,5.9], [10.5,115,2,54,5.9], [10.5,115,2,54,5.9],
                [11.1,133,2,54,5.9], [11.1,133,2,54,5.9], [11.6,156,3,54,5.9], [11.6,156,3,54,5.9],
                [12.3,181,4,54,5.9], [12.8,206,5,53,5.9], [13.3,227,6,53,5.9], [13.3,227,0,53,5.9],
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
            ]
            
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
            this.hydQtyL = document.querySelector("#hydQtyL");
            this.hydQtyC = document.querySelector("#hydQtyC");
            this.hydQtyR = document.querySelector("#hydQtyR");
            // Call updateClock every second
            setInterval(this.updateClock.bind(this), 1000);
            // Call updateAPUData every 0.2 seconds
            //let updateFreq = (((80000-14000))/this.apuEGTStart.length*2); //81s s the apu start time; takes 7 s to start showing values 
            setInterval(this.updateAPUData.bind(this), 200);
            this.isInitialised = true;
        }

        update(_deltaTime) {
            this. updateHydraulic();
        }

        updateHydraulic() {
            this.hydraulicL.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:1", "psi")).toFixed(0);
            this.hydraulicC.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:3", "psi")).toFixed(0);
            this.hydraulicR.textContent = (SimVar.GetSimVarValue("HYDRAULIC PRESSURE:2", "psi")).toFixed(0);

            this.hydQtyL.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:1", "percent"))/100).toFixed(2);
            this.hydQtyC.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:3", "percent"))/100).toFixed(2);
            this.hydQtyR.textContent = ((SimVar.GetSimVarValue("HYDRAULIC RESERVOIR PERCENT:2", "percent"))/100).toFixed(2);
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
            if ((SimVar.GetSimVarValue("APU PCT RPM", "percent")) > 7)
                {
                    //this.apuRPM.textContent
                    this.apuEGTUnit.textContent = "C";
                    let apuStarted = SimVar.GetSimVarValue("APU SWITCH", "Bool");
                    if (apuStarted) {
                        let egt = this.apuStart[this.currentIndex][1];
                        this.apuEGT.textContent = egt; //Math.round((Math.floor(Math.random() * 1) + 1)*egt + this.ambientTemp*1.8);       //heat factor = 1.8; random upper limit = 1.1
                        this.currentIndex++;
                        if (this.currentIndex >= this.apuEGTStart.length) {
                            this.currentIndex = this.apuEGTStart.length - 1;
                        }
                    } else {
                       
                    }
                }
            else
            {
                this.apuEGT.textContent = "";
                this.apuEGTUnit.textContent = "";
            }
        }
    }

    B777_LowerEICAS_Stat.Display = Display;
})(B777_LowerEICAS_Stat || (B777_LowerEICAS_Stat = {}));
customElements.define("b777-lower-eicas-stat", B777_LowerEICAS_Stat.Display);
//# sourceMappingURL=B747_8_LowerEICAS_Stat.js.map
