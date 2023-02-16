const ENABLE_TOTAL_UPDATE_TIME_TRACING = false;

class B77HS_Core {
    constructor() {
        this.modules = [
            {
                name: 'ADIRS',
                module: new B77HS_ADIRS(),
                updateInterval: 100,
            },
            {
                name: 'APU',
                module: new B77HS_APU(),
                updateInterval: 100,
            },
            {
                name: 'BaroSelector',
                module: new B77HS_BaroSelector(),
                updateInterval: 300,
            },
            {
                name: 'BrakeTemp',
                module: new B77HS_BrakeTemp(),
                updateInterval: 150,
            },
            {
                name: 'Refuel',
                module: new B77HS_Refuel(),
                updateInterval: 150,
            },
            {
                name: 'Boarding',
                module: new B77HS_Boarding(),
                updateInterval: 150,
            },
            {
                name: 'LocalVars',
                module: new B77HS_LocalVarUpdater(),
                updateInterval: 50,
            },
            {
                name: 'FADEC #1',
                module: new B77HS_FADEC(1),
                updateInterval: 100,
            },
            {
                name: 'FADEC #2',
                module: new B77HS_FADEC(2),
                updateInterval: 100,
            },
            {
                name: 'FWC',
                module: new B77HS_FWC(2),
                updateInterval: 50,
            },
            {
                name: 'GPWS',
                module: new B77HS_GPWS(this),
                updateInterval: 75,
            },
            {
                name: 'Speeds',
                module: new B77HS_Speeds(),
                updateInterval: 500,
            }
        ];
        this.moduleThrottlers = {};
        for (const moduleDefinition of this.modules) {
            this.moduleThrottlers[moduleDefinition.name] = new UpdateThrottler(moduleDefinition.updateInterval);
        }

        this.soundManager = new B77HS_SoundManager();
        this.tipsManager = new B77HS_TipsManager();
    }

    init(startTime) {
        this.getDeltaTime = B77HS_Util.createDeltaTimeCalculator(startTime);
        this.modules.forEach(moduleDefinition => {
            if (typeof moduleDefinition.module.init === "function") {
                moduleDefinition.module.init();
            }
        });
        this.isInit = true;
    }

    update() {
        if (!this.isInit) {
            return;
        }

        const startTime = ENABLE_TOTAL_UPDATE_TIME_TRACING ? Date.now() : 0;

        const deltaTime = this.getDeltaTime();

        this.soundManager.update(deltaTime);
        this.tipsManager.update(deltaTime);

        let updatedModules = 0;
        this.modules.forEach(moduleDefinition => {
            const moduleDeltaTime = this.moduleThrottlers[moduleDefinition.name].canUpdate(deltaTime);

            if (moduleDeltaTime !== -1) {
                moduleDefinition.module.update(moduleDeltaTime, this);
                updatedModules++;
            }
        });

        if (ENABLE_TOTAL_UPDATE_TIME_TRACING) {
            const endTime = Date.now();

            const updateTime = endTime - startTime;

            console.warn(`NXCore update took: ${updateTime.toFixed(2)}ms (${updatedModules} modules updated)`);
        }
    }
}
