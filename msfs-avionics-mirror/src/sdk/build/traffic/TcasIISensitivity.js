import { MathUtils } from '../math/MathUtils';
import { UnitType } from '../math/NumberUnit';
/**
 * Standard TCAS-II sensitivity parameters.
 */
export class TcasIISensitivityParameters {
    /**
     * Selects a sensitivity level for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns The sensitivity level for the specified environment.
     */
    selectLevel(altitude, radarAltitude) {
        const altFeet = altitude.asUnit(UnitType.FOOT);
        const radarAltFeet = radarAltitude.asUnit(UnitType.FOOT);
        let level;
        if (radarAltFeet > 2350) {
            if (altFeet > 42000) {
                level = 6;
            }
            else if (altFeet > 20000) {
                level = 5;
            }
            else if (altFeet > 10000) {
                level = 4;
            }
            else if (altFeet > 5000) {
                level = 3;
            }
            else {
                level = 2;
            }
        }
        else if (radarAltFeet > 1000) {
            level = 1;
        }
        else {
            level = 0;
        }
        return level;
    }
    /**
     * Selects Proximity Advisory sensitivity parameters.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns Proximity Advisory sensitivity parameters.
     */
    selectPA(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    altitude, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    radarAltitude) {
        return TcasIISensitivityParameters.PA;
    }
    /**
     * Selects Traffic Advisory sensitivity parameters for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns Traffic Advisory sensitivity parameters for the specified environment.
     */
    selectTA(altitude, radarAltitude) {
        return TcasIISensitivityParameters.TA_LEVELS[this.selectLevel(altitude, radarAltitude)];
    }
    /**
     * Selects Resolution Advisory sensitivity parameters for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns Resolution Advisory sensitivity parameters for the specified environment.
     */
    selectRA(altitude, radarAltitude) {
        return TcasIISensitivityParameters.RA_LEVELS[this.selectLevel(altitude, radarAltitude)];
    }
    /**
     * Selects a Resolution Advisory ALIM for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns A Resolution Advisory ALIM for the specified environment.
     */
    selectRAAlim(altitude, radarAltitude) {
        return TcasIISensitivityParameters.RA_LEVELS[this.selectLevel(altitude, radarAltitude)].alim;
    }
    /**
     * Gets Proximity Advisory sensitivity parameters for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns Proximity Advisory sensitivity parameters for the given sensitivity level.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPA(level) {
        return TcasIISensitivityParameters.PA;
    }
    /**
     * Gets Traffic Advisory sensitivity parameters for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns Traffic Advisory sensitivity parameters for the given sensitivity level.
     */
    getTA(level) {
        return TcasIISensitivityParameters.TA_LEVELS[MathUtils.clamp(level, 0, TcasIISensitivityParameters.TA_LEVELS.length - 1)];
    }
    /**
     * Gets Resolution Advisory sensitivity parameters for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns Resolution Advisory sensitivity parameters for the given sensitivity level.
     */
    getRA(level) {
        return TcasIISensitivityParameters.RA_LEVELS[MathUtils.clamp(level, 0, TcasIISensitivityParameters.RA_LEVELS.length - 1)];
    }
    /**
     * Gets a Resolution Advisory ALIM for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns A Resolution Advisory ALIM for the given sensitivity level.
     */
    getRAAlim(level) {
        return TcasIISensitivityParameters.RA_LEVELS[MathUtils.clamp(level, 0, TcasIISensitivityParameters.RA_LEVELS.length - 1)].alim;
    }
}
TcasIISensitivityParameters.PA = {
    protectedRadius: UnitType.NMILE.createNumber(6),
    protectedHeight: UnitType.FOOT.createNumber(1200)
};
TcasIISensitivityParameters.TA_LEVELS = [
    {
        lookaheadTime: UnitType.SECOND.createNumber(20),
        protectedRadius: UnitType.NMILE.createNumber(0.3),
        protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(25),
        protectedRadius: UnitType.NMILE.createNumber(0.33),
        protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(30),
        protectedRadius: UnitType.NMILE.createNumber(0.48),
        protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(40),
        protectedRadius: UnitType.NMILE.createNumber(0.75),
        protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(45),
        protectedRadius: UnitType.NMILE.createNumber(1),
        protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(48),
        protectedRadius: UnitType.NMILE.createNumber(1.3),
        protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(48),
        protectedRadius: UnitType.NMILE.createNumber(1.3),
        protectedHeight: UnitType.FOOT.createNumber(1200)
    }
];
TcasIISensitivityParameters.RA_LEVELS = [
    {
        lookaheadTime: UnitType.SECOND.createNumber(15),
        protectedRadius: UnitType.NMILE.createNumber(0.2),
        protectedHeight: UnitType.FOOT.createNumber(600),
        alim: UnitType.FOOT.createNumber(300)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(15),
        protectedRadius: UnitType.NMILE.createNumber(0.2),
        protectedHeight: UnitType.FOOT.createNumber(600),
        alim: UnitType.FOOT.createNumber(300)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(20),
        protectedRadius: UnitType.NMILE.createNumber(0.35),
        protectedHeight: UnitType.FOOT.createNumber(600),
        alim: UnitType.FOOT.createNumber(300)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(25),
        protectedRadius: UnitType.NMILE.createNumber(0.55),
        protectedHeight: UnitType.FOOT.createNumber(600),
        alim: UnitType.FOOT.createNumber(350)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(30),
        protectedRadius: UnitType.NMILE.createNumber(0.8),
        protectedHeight: UnitType.FOOT.createNumber(600),
        alim: UnitType.FOOT.createNumber(400)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(35),
        protectedRadius: UnitType.NMILE.createNumber(1.1),
        protectedHeight: UnitType.FOOT.createNumber(700),
        alim: UnitType.FOOT.createNumber(600)
    },
    {
        lookaheadTime: UnitType.SECOND.createNumber(35),
        protectedRadius: UnitType.NMILE.createNumber(1.1),
        protectedHeight: UnitType.FOOT.createNumber(800),
        alim: UnitType.FOOT.createNumber(700)
    }
];
/**
 * An implementation of {@link TCASSensitivity} which provides sensitivity parameters as defined in the official
 * TCAS II specification.
 */
export class TcasIISensitivity {
    constructor() {
        this.sensitivity = new TcasIISensitivityParameters();
        this.level = 0;
        this.params = {
            parametersPA: this.sensitivity.getPA(0),
            parametersTA: this.sensitivity.getTA(0),
            parametersRA: this.sensitivity.getRA(0)
        };
    }
    /** @inheritdoc */
    selectParameters() {
        return this.params;
    }
    /** @inheritdoc */
    selectRAAlim() {
        return this.sensitivity.getRAAlim(this.level);
    }
    /**
     * Updates sensitivity level based on the current environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     */
    updateLevel(altitude, radarAltitude) {
        this.level = this.sensitivity.selectLevel(altitude, radarAltitude);
        this.params.parametersPA = this.sensitivity.getPA(this.level);
        this.params.parametersTA = this.sensitivity.getTA(this.level);
        this.params.parametersRA = this.sensitivity.getRA(this.level);
    }
}
