# Welcome
 
 Welcome to the compatibility mod repository by WorldlinerRS. Thank you for your interest in contributing to the project. Full details and guidelines on how to ensure this project is managed well are described below.

 ## Required Software

 [git](https://git-scm.com/downloads)
 
 [Node.js](https://nodejs.org/en/)

[msfs-avionics-mirror](https://microsoft.github.io/msfs-avionics-mirror/docs/framework/)

### For WASM development

[MSFS SDK](https://docs.flightsimulator.com/html/Introduction/Introduction.htm)

Visual Studio 2019

## Optional

Visual Studio Code or editor of your choice

## Cloning and setup

```
git clone https://github.com/WorldlinerRS/wlrs-captainsim-compatibility.git
cd wlrs-captainsim-compatibility
npm install --save-dev
```

It is highly recommend for Gauges development using `msfs-avionics-mirror` with ReactJS to compile the code inside a Linux WSL instance

## Building

```
npm run package
```

