class teeveeAnimHanlder {
    constructor() {
    }

    init() {
        /*
        this.pilotWindowLeft = SimVar.GetSimVarValue("L:cs777_pilot_wnd_l", "bool");
        this.pilotWindowRight = SimVar.GetSimVarValue("L:cs777_pilot_wnd_r", "bool");
        this.fwdAccessDoor = SimVar.GetSimVarValue("L:cs777_anim_ctrl_fwd_acc_door", "bool");
        this.pitotPlugs = SimVar.GetSimVarValue("L:cs777_anim_ctrl_plugs", "bool");
        this.fwdOutflowValve = SimVar.GetSimVarValue("L:cs777_anim_ctrl_fwd_outf_val", "bool");
        this.entryDoorL1 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_l_door_1", "bool");
        this.entryDoorL2 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_l_door_2", "bool");
        this.entryDoorLEmer = SimVar.GetSimVarValue("L:cs777_anim_ctrl_l_emer_door", "bool");
        this.entryDoorL3 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_l_door_3", "bool");
        this.entryDoorL4 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_l_door_4", "bool");
        this.entryDoorR1 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_r_door_1", "bool");
        this.entryDoorR2 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_r_door_2", "bool");
        this.entryDoorREmer = SimVar.GetSimVarValue("L:cs777_anim_ctrl_r_emer_door", "bool");
        this.entryDoorR3 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_r_door_3", "bool");
        this.entryDoorR4 = SimVar.GetSimVarValue("L:cs777_anim_ctrl_r_door_4", "bool");
        this.greaDoors = SimVar.GetSimVarValue("L:cs777_anim_ctrl_fwd_acc_door", "bool");

        
        this.epHatch = SimVar.GetSimVarValue("L:L:cs777_anim_ctrl_ep_hatch", "bool");
        */
    }
    update() { 
        //update without electricity
        
        //Engine Anims
        const showEngineBlur =  WTDataStore.get("SHOW_ENGINE_BLUR", 0);
        if (showEngineBlur) {
            SimVar.SetSimVarValue("L:MIN_RPM_FOR_SLOW", "number", 4800);
            SimVar.SetSimVarValue("L:MIN_RPM_FOR_BLUR", "number", 9600);
        }
        else {
            SimVar.SetSimVarValue("L:MIN_RPM_FOR_SLOW", "number", 19000);
            SimVar.SetSimVarValue("L:MIN_RPM_FOR_BLUR", "number", 19000);
        }

        //Reverser anim
        const reverserPercent1 = SimVar.GetSimVarValue("TURB ENG REVERSE NOZZLE PERCENT:1", "Percent");
        const reverserPercent2 = SimVar.GetSimVarValue("TURB ENG REVERSE NOZZLE PERCENT:2", "Percent");
        if (reverserPercent1 > 50) {
            let position1 = (reverserPercent1 - 50) * 2;
            SimVar.SetSimVarValue("L:B777_ENGINE_REVERSER:1", "Enum", position1);
        }
        else {
            SimVar.SetSimVarValue("L:B777_ENGINE_REVERSER:1", "Enum", 0);
        }
        if (reverserPercent2 > 50) {
            let position2 = (reverserPercent2 - 50) * 2;
            SimVar.SetSimVarValue("L:B777_ENGINE_REVERSER:2", "Enum", position2);
        }
        else {
            SimVar.SetSimVarValue("L:B777_ENGINE_REVERSER:2", "Enum", 0);
        }

        //spoiler control (auto spoiler)
        if ((reverserPercent1 > 50 || reverserPercent2 > 50) && SimVar.GetSimVarValue("AUTO BRAKE SWITCH CB", "Enum") != 1) {
            SimVar.SetSimVarValue("A:SPOILERS HANDLE POSITION", "percent over 100", 1);
        }
        if (SimVar.GetSimVarValue("GENERAL ENG THROTTLE LEVER POSITION:1", "percent") > 65 || SimVar.GetSimVarValue("GENERAL ENG THROTTLE LEVER POSITION:2", "percent") > 65) {
            SimVar.SetSimVarValue("A:SPOILERS HANDLE POSITION", "percent over 100", 0);
            SimVar.SetSimVarValue("A:SPOILERS ARMED", "Bool", false);
        }

        //APU Inlet
        if (SimVar.GetSimVarValue("L:XMLVAR_APU_StarterKnob_Pos", "Number") === 1 || SimVar.GetSimVarValue("APU PCT STARTER", "percent") > 1) {
            SimVar.SetSimVarValue("L:cs777_anim_ctrl_apu_intake", "Bool", true);
        }
        else {
            SimVar.SetSimVarValue("L:cs777_anim_ctrl_apu_intake", "Bool", false);
        }

        //Antennas visiblity, CS don't have a satcom exterior
        if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 0) { 
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", false);
        }
        else if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 1){ //KU
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", true);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", false);
        }
        else if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 2) {    //2KU
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", true);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", false);
        }
        else if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 3) {    //KU + SATCOM
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", true);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", true);
        }
        else if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 4) {    //2KU + SATCOM
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", true);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", true);
        }
        else if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 5) {    //SATCOM
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", true);
        }
        else if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 6) {    //KU MID + SATCOM
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", true);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", true);
        }
        else if (WTDataStore.get("WIFI SATCOM ATN MODE", -1) == 7) {    //KU MID
            SimVar.SetSimVarValue("L:KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:KU_MID_DISP", "Bool", true);
            SimVar.SetSimVarValue("L:2KU_DISP", "Bool", false);
            SimVar.SetSimVarValue("L:SATCOM_DISP", "Bool", false);
        }

        if (WTDataStore.get("TELEPHONE MODE", false)) {
            SimVar.SetSimVarValue("L:TELEPHONE_DISP", "Bool", true);
        }
        else {
            SimVar.SetSimVarValue("L:TELEPHONE_DISP", "Bool", false);
        }

        if (WTDataStore.get("DME ANTENNA MODE", false)) {
            SimVar.SetSimVarValue("L:DME_ANT_DISP", "Bool", true);
        }
        else {
            SimVar.SetSimVarValue("L:DME_ANT_DISP", "Bool", false);
        }

        //lighting controls
        //SimVar.SetSimVarValue("LIGHT GLARESHIELD POWER SETTING:2", "");
        
        //update with electricity
        let electricityIsAvail = SimVar.GetSimVarValue("CIRCUIT GENERAL PANEL ON", "Bool");
        if (!electricityIsAvail) {
            return;
        }
    }
}

//references: https://hsi.arc.nasa.gov/flightcognition/download/appendix/B777/10_B777%20AirDataSystemFailure%20.pdf

/*
some note: 
- if Pitot plugs are still on, EICAS display: NAV AIR DATA SYS (added). Add ADIRU state = -1 to fail
- RAM air control anims are there, but AC control are ...:) auto would be wild to code, but okay cool
- removed the exterior control in m773 xml file
*/