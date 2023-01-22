/// <reference types="msfstypes/JS/simvar" />
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher } from './BasePublishers';
/**
 * A publisher for air data computer information.
 */
export class AdcPublisher extends SimVarPublisher {
    /**
     * Creates an AdcPublisher.
     * @param bus The event bus to which to publish.
     * @param airspeedIndicatorCount The number of airspeed indicators.
     * @param altimeterCount The number of altimeters.
     * @param pacer An optional pacer to use to control the rate of publishing.
     */
    constructor(bus, airspeedIndicatorCount, altimeterCount, pacer) {
        var _a;
        const nonIndexedSimVars = [
            ['radio_alt', { name: 'RADIO HEIGHT', type: SimVarValueType.Feet }],
            ['pressure_alt', { name: 'PRESSURE ALTITUDE', type: SimVarValueType.Feet }],
            ['radio_alt', { name: 'RADIO HEIGHT', type: SimVarValueType.Feet }],
            ['vertical_speed', { name: 'VERTICAL SPEED', type: SimVarValueType.FPM }],
            ['ambient_temp_c', { name: 'AMBIENT TEMPERATURE', type: SimVarValueType.Celsius }],
            ['ambient_pressure_inhg', { name: 'AMBIENT PRESSURE', type: SimVarValueType.InHG }],
            ['isa_temp_c', { name: 'STANDARD ATM TEMPERATURE', type: SimVarValueType.Celsius }],
            ['ram_air_temp_c', { name: 'TOTAL AIR TEMPERATURE', type: SimVarValueType.Celsius }],
            ['ambient_wind_velocity', { name: 'AMBIENT WIND VELOCITY', type: SimVarValueType.Knots }],
            ['ambient_wind_direction', { name: 'AMBIENT WIND DIRECTION', type: SimVarValueType.Degree }],
            ['on_ground', { name: 'SIM ON GROUND', type: SimVarValueType.Bool }],
            ['aoa', { name: 'INCIDENCE ALPHA', type: SimVarValueType.Degree }],
            ['stall_aoa', { name: 'STALL ALPHA', type: SimVarValueType.Degree }],
            ['mach_number', { name: 'AIRSPEED MACH', type: SimVarValueType.Mach }],
        ];
        const airspeedIndexedSimVars = [
            ['ias', { name: 'AIRSPEED INDICATED', type: SimVarValueType.Knots }],
            ['tas', { name: 'AIRSPEED TRUE', type: SimVarValueType.Knots }],
            [
                'mach_to_kias_factor',
                {
                    name: 'AIRSPEED INDICATED',
                    type: SimVarValueType.Knots,
                    map: (kias) => kias < 1 ? Simplane.getMachToKias(kias) : kias / this.mach
                }
            ],
        ];
        const altimeterIndexedSimVars = [
            ['indicated_alt', { name: 'INDICATED ALTITUDE', type: SimVarValueType.Feet }],
            ['altimeter_baro_setting_inhg', { name: 'KOHLSMAN SETTING HG', type: SimVarValueType.InHG }],
            ['altimeter_baro_setting_mb', { name: 'KOHLSMAN SETTING MB', type: SimVarValueType.MB }],
        ];
        const altimeterStdIndexedLVars = [
            ['altimeter_baro_preselect_inhg', { name: 'L:XMLVAR_Baro#ID#_SavedPressure', type: SimVarValueType.MB }],
            ['altimeter_baro_is_std', { name: 'L:XMLVAR_Baro#ID#_ForcedToSTD', type: SimVarValueType.Bool }]
        ];
        const simvars = new Map(nonIndexedSimVars);
        // set un-indexed simvar topics to pull from index 1
        for (const [topic, simvar] of [...airspeedIndexedSimVars, ...altimeterIndexedSimVars]) {
            simvars.set(`${topic}`, {
                name: `${simvar.name}:1`,
                type: simvar.type,
                map: simvar.map
            });
        }
        // add airspeed indicator indexed simvar topics
        airspeedIndicatorCount = Math.max(airspeedIndicatorCount, 1);
        for (let i = 1; i <= airspeedIndicatorCount; i++) {
            for (const [topic, simvar] of airspeedIndexedSimVars) {
                simvars.set(`${topic}_${i}`, {
                    name: `${simvar.name}:${i}`,
                    type: simvar.type,
                    map: simvar.map
                });
            }
        }
        // add altimeter indexed simvar topics
        altimeterCount = Math.max(altimeterCount, 1);
        for (let i = 1; i <= altimeterCount; i++) {
            for (const [topic, simvar] of altimeterIndexedSimVars) {
                simvars.set(`${topic}_${i}`, {
                    name: `${simvar.name}:${i}`,
                    type: simvar.type,
                    map: simvar.map
                });
            }
        }
        // baro STD LVars are indexed by baro id in the variable name
        // HINT: Most airliners and jets modelbehaviors work like that
        for (let i = 1; i <= altimeterCount; i++) {
            for (const [topic, simvar] of altimeterStdIndexedLVars) {
                simvars.set(`${topic}_${i}`, {
                    name: `${simvar.name.replace('#ID#', i.toString())}`,
                    type: simvar.type,
                    map: simvar.map
                });
            }
        }
        super(simvars, bus, pacer);
        this.mach = 0;
        (_a = this.needUpdateMach) !== null && _a !== void 0 ? _a : (this.needUpdateMach = false);
    }
    /** @inheritdoc */
    onTopicSubscribed(topic) {
        super.onTopicSubscribed(topic);
        if (topic.startsWith('mach_to_kias_factor')) {
            this.needUpdateMach = true;
        }
    }
    /** @inheritdoc */
    onUpdate() {
        const isSlewing = SimVar.GetSimVarValue('IS SLEW ACTIVE', 'bool');
        if (!isSlewing) {
            if (this.needUpdateMach) {
                this.mach = SimVar.GetSimVarValue('AIRSPEED MACH', SimVarValueType.Number);
            }
            super.onUpdate();
        }
    }
}
