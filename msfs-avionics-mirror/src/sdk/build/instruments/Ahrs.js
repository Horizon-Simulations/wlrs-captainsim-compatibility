import { SimVarValueType } from '../data/SimVars';
import { MagVar } from '../geo';
import { SimVarPublisher } from './BasePublishers';
/**
 * A publisher for AHRS information.
 */
export class AhrsPublisher extends SimVarPublisher {
    /**
     * Creates an AhrsPublisher.
     * @param bus The event bus to which to publish.
     * @param attitudeIndicatorCount The number of attitude indicators.
     * @param directionIndicatorCount The number of direction indicators.
     * @param pacer An optional pacer to use to control the rate of publishing.
     */
    constructor(bus, attitudeIndicatorCount, directionIndicatorCount, pacer) {
        var _a;
        const nonIndexedSimVars = [
            ['turn_coordinator_ball', { name: 'TURN COORDINATOR BALL', type: SimVarValueType.Number }],
        ];
        const attitudeIndexedSimVars = [
            ['pitch_deg', { name: 'ATTITUDE INDICATOR PITCH DEGREES', type: SimVarValueType.Degree }],
            ['roll_deg', { name: 'ATTITUDE INDICATOR BANK DEGREES', type: SimVarValueType.Degree }],
        ];
        const directionIndexedSimVars = [
            ['hdg_deg', { name: 'HEADING INDICATOR', type: SimVarValueType.Degree }],
            ['hdg_deg_true', { name: 'HEADING INDICATOR', type: SimVarValueType.Degree, map: (heading) => MagVar.magneticToTrue(heading, this.magVar) }],
            ['delta_heading_rate', { name: 'DELTA HEADING RATE', type: SimVarValueType.Degree }],
        ];
        const simvars = new Map(nonIndexedSimVars);
        // set un-indexed topics to pull from index 1
        for (const [topic, simvar] of [...attitudeIndexedSimVars, ...directionIndexedSimVars]) {
            simvars.set(`${topic}`, {
                name: `${simvar.name}:1`,
                type: simvar.type,
                map: simvar.map
            });
        }
        // add attitude indicator indexed topics
        attitudeIndicatorCount = Math.max(attitudeIndicatorCount, 1);
        for (let i = 1; i <= attitudeIndicatorCount; i++) {
            for (const [topic, simvar] of attitudeIndexedSimVars) {
                simvars.set(`${topic}_${i}`, {
                    name: `${simvar.name}:${i}`,
                    type: simvar.type,
                    map: simvar.map
                });
            }
        }
        // add direction indicator indexed topics
        directionIndicatorCount = Math.max(directionIndicatorCount, 1);
        for (let i = 1; i <= directionIndicatorCount; i++) {
            for (const [topic, simvar] of directionIndexedSimVars) {
                simvars.set(`${topic}_${i}`, {
                    name: `${simvar.name}:${i}`,
                    type: simvar.type,
                    map: simvar.map
                });
            }
        }
        super(simvars, bus, pacer);
        this.magVar = 0;
        (_a = this.needUpdateMagVar) !== null && _a !== void 0 ? _a : (this.needUpdateMagVar = false);
    }
    /** @inheritdoc */
    onTopicSubscribed(topic) {
        super.onTopicSubscribed(topic);
        if (topic.startsWith('hdg_deg_true')) {
            this.needUpdateMagVar = true;
        }
    }
    /** @inheritdoc */
    onUpdate() {
        if (this.needUpdateMagVar) {
            this.magVar = SimVar.GetSimVarValue('MAGVAR', SimVarValueType.Degree);
        }
        super.onUpdate();
    }
}
