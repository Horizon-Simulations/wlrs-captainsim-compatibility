# General

## Chapter 1: Getting started

 Make sure to read README amd Contributing before heading to this section for building your own pack.
 This file will have detail instruction on how to use this project as a base for your own mod pack.

 Instruction written by teevee.

 ### Required and recommended software

[git](https://git-scm.com/downloads)
 
[Microsoft Visual Studio Code](https://code.visualstudio.com)  or any text edtior of your preference

[msfs-avionics-mirror](https://microsoft.github.io/msfs-avionics-mirror/docs/framework/)

### Geting started

The pack have 3 main component:
- Plane base: name as wrls-captainsim-[planeICAO]-[engineName]. This include the plane specific behavior, flight model, part of the plane FMC and EICAS, ...
- Script base: javascript code that control most of airplane system. This includes simbridge connections, FMC, flight control system, plane displays, ...
- Behaviour base: XML templates that control plane cockpit and exterior behavior. This includes engine template, cockpit templates, ...

The pack also uses some default/intergrated code from MSFS. For example built-in templates, built-in map API, MCP and radio system, `base-airliners` and WT system files, ... Some of which come with the pack, some is pulled directly from the game.

### Features

#### &nbsp;&nbsp;&nbsp;&nbsp;   Cockpit

- Interactable and functionable knobs and switches. Feature in hydraulics panel, ADIRU, radio panels, WX control panels.
- Animation controller for CS built in window shade, pilot windows, foldable tabels, chair, handrest, doors, ...
- Keybindable knobs, switches, actions, ...
- Compatiblity fix for CS B777-300ER

#### &nbsp;&nbsp;&nbsp;&nbsp;   Exterior

- Custom taxi, strobe, landing, nav, logo, wings, beacon, runway lighting - credit to Nicottine
- Reworked engine animation nodes. Can be customized in the FMC.
- Exterior animations trigerred with aircraft system, action or function.

#### &nbsp;&nbsp;&nbsp;&nbsp;   Aircraft system

- Custom AP system based on WT systems
- Custom MCP system based on WT systems
- Custom FMC based on Salty system.
- Simbrief and FBW intergrations for flightplan and FMC COMM.



## Chapter 2: Basic build

### Flight Management Computer (FMC)

#### FMC event

FMC event can have multiple approach. In this document, I will list the most basic one. 

FMC event types are: 

**Input**
- FMC side softkey
- FMC text editor, character and number keys
- FMC pages key
- FMC Execute key

**Output**
- [FMC event display](#fmc-event-display)
- [FMC event standalone](#fmc-event-standalone)
- [FMC blank error display](#fmc-blank-error)
  
##### FMC event display

FMC event display something

##### FMC event standalone

FMC event standalone something

##### FMC blank error

FMC blank error


### Payload manager

This is built based on Salty payload manager, which has it's own strength and drawbacks. Consider heavy modifying value and script based on your need.
Data for Simbrief sync can be found in `SaltyConnection` and `B777_FMC_MainDisplay` or `B767_FMC_MainDisplay` 

Payload manager consist of 5 files. 
- Payload constructor : ```Community\wlrs-captainsim-[planeICAO]-[engineName]\html_ui\Pages\VCockpit\Instruments\Airliners\CS[planeICAOType]\FMC\B[planeType]_FMC_PayloadConstructor.js```
- Payload display and manager: ```Community\wlrs-captainsim-boeing-base\html_ui\Pages\VCockpit\Instruments\Airliners\B777\FMC\PAYLOAD\[planeType]\[planeType]_FMC_Payload.js```
- Boarding system: ```Community\wlrs-captainsim-boeing-base\html_ui\Pages\VCockpit\Instruments\Airliners\B777\FMC\PAYLOAD\[planeType]\[planeType]_Boarding.js```

- Fuel display and manager: ```Community\wlrs-captainsim-boeing-base\html_ui\Pages\VCockpit\Instruments\Airliners\B777\FMC\PAYLOAD\[planeType]\[planeType]_FMC_Fuel.js```
- Fueling system: ```Community\wlrs-captainsim-boeing-base\html_ui\Pages\RobSim\SaltyFueling.js```

  Their function can be describe here
  
- Payload constructor: define payload attributes and plane general weight values.
- Boarding display and manager: display FMC page and recieve/return user value input.
- Boarding system: add/remove weight based on FMC requested value.
- Fueling system: add/remove fuel based on FMC requested value
- Fueling display and manager: display FMC page and recieve/return user value input.

To intergrate this into another plane:
- List it in `layout.js` of the base and the plane, call all related payload manager files in the plane FMC HTML config. For example: if you build for B764, call the SaltyFueling, B764Fuel, B764Payload, etc...
- Modify payload constructor to match your flightmodel. Remember to add offsets if your fuselage or your flight model does.
- Modify all other related files to match with your flight model. Make sure only use legit payload station. 
- Call it by events (see [FMC event standalone](#fmc-event-standalone) and [FMC event standalone](#fmc-event-standalone)).
