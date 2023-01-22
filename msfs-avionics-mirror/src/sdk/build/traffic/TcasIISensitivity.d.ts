import { NumberUnitInterface, UnitFamily } from '../math/NumberUnit';
import { TcasAdvisoryParameters, TcasSensitivity, TcasSensitivityParameters, TcasTcaParameters } from './Tcas';
/**
 * Standard TCAS-II sensitivity parameters.
 */
export declare class TcasIISensitivityParameters {
    private static readonly PA;
    private static readonly TA_LEVELS;
    private static readonly RA_LEVELS;
    /**
     * Selects a sensitivity level for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns The sensitivity level for the specified environment.
     */
    selectLevel(altitude: NumberUnitInterface<UnitFamily.Distance>, radarAltitude: NumberUnitInterface<UnitFamily.Distance>): number;
    /**
     * Selects Proximity Advisory sensitivity parameters.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns Proximity Advisory sensitivity parameters.
     */
    selectPA(altitude: NumberUnitInterface<UnitFamily.Distance>, radarAltitude: NumberUnitInterface<UnitFamily.Distance>): TcasAdvisoryParameters;
    /**
     * Selects Traffic Advisory sensitivity parameters for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns Traffic Advisory sensitivity parameters for the specified environment.
     */
    selectTA(altitude: NumberUnitInterface<UnitFamily.Distance>, radarAltitude: NumberUnitInterface<UnitFamily.Distance>): TcasTcaParameters;
    /**
     * Selects Resolution Advisory sensitivity parameters for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns Resolution Advisory sensitivity parameters for the specified environment.
     */
    selectRA(altitude: NumberUnitInterface<UnitFamily.Distance>, radarAltitude: NumberUnitInterface<UnitFamily.Distance>): TcasTcaParameters;
    /**
     * Selects a Resolution Advisory ALIM for a specified environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     * @returns A Resolution Advisory ALIM for the specified environment.
     */
    selectRAAlim(altitude: NumberUnitInterface<UnitFamily.Distance>, radarAltitude: NumberUnitInterface<UnitFamily.Distance>): NumberUnitInterface<UnitFamily.Distance>;
    /**
     * Gets Proximity Advisory sensitivity parameters for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns Proximity Advisory sensitivity parameters for the given sensitivity level.
     */
    getPA(level: number): TcasAdvisoryParameters;
    /**
     * Gets Traffic Advisory sensitivity parameters for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns Traffic Advisory sensitivity parameters for the given sensitivity level.
     */
    getTA(level: number): TcasTcaParameters;
    /**
     * Gets Resolution Advisory sensitivity parameters for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns Resolution Advisory sensitivity parameters for the given sensitivity level.
     */
    getRA(level: number): TcasTcaParameters;
    /**
     * Gets a Resolution Advisory ALIM for a given sensitivity level.
     * @param level A sensitivity level.
     * @returns A Resolution Advisory ALIM for the given sensitivity level.
     */
    getRAAlim(level: number): NumberUnitInterface<UnitFamily.Distance>;
}
/**
 * An implementation of {@link TCASSensitivity} which provides sensitivity parameters as defined in the official
 * TCAS II specification.
 */
export declare class TcasIISensitivity implements TcasSensitivity {
    private readonly sensitivity;
    private level;
    private readonly params;
    /** @inheritdoc */
    selectParameters(): TcasSensitivityParameters;
    /** @inheritdoc */
    selectRAAlim(): NumberUnitInterface<UnitFamily.Distance>;
    /**
     * Updates sensitivity level based on the current environment.
     * @param altitude The indicated altitude of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     */
    updateLevel(altitude: NumberUnitInterface<UnitFamily.Distance>, radarAltitude: NumberUnitInterface<UnitFamily.Distance>): void;
}
//# sourceMappingURL=TcasIISensitivity.d.ts.map