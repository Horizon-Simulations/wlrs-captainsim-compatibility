import { TheoreticalDescentPathCharacteristics } from '@aims/guidance/vnav/descent/TheoreticalDescentPath';
import { Geometry } from '@aims/guidance/Geometry';
import { DecelPathCharacteristics } from '@aims/guidance/vnav/descent/DecelPathBuilder';

export class DescentBuilder {
    static computeDescentPath(
        geometry: Geometry,
        decelPath?: DecelPathCharacteristics,
    ): TheoreticalDescentPathCharacteristics {
        const cruiseAlt = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number');
        const verticalDistance = cruiseAlt - decelPath?.top ?? 0;
        const fpa = 3;

        if (DEBUG) {
            console.log(cruiseAlt);
            console.log(verticalDistance);
        }

        const tod = decelPath?.decel ?? 0 + (verticalDistance / Math.tan((fpa * Math.PI) / 180)) * 0.000164579;

        if (DEBUG) {
            console.log(`[FMS/VNAV] T/D: ${tod.toFixed(1)}nm`);
        }

        return { tod };

        //     const decelPointDistance = DecelPathBuilder.computeDecelPath(geometry);
        //
        //     const lastLegIndex = geometry.legs.size - 1;
        //
        //     // Find descent legs before decel point
        //     let accumulatedDistance = 0;
        //     let currentLegIdx;
        //     let currentLeg;
        //     for (currentLegIdx = lastLegIndex; accumulatedDistance < decelPointDistance; currentLegIdx--) {
        //         currentLeg = geometry.legs.get(currentLegIdx);
        //
        //         accumulatedDistance += currentLeg.distance;
        //     }
        //     currentLegIdx--;
        //
        //     const geometricPath = GeomtricPathBuilder.buildGeometricPath(geometry, currentLegIdx);
        //
        //     console.log(geometricPath);
        //
        //     return { geometricPath };
        // }
    }
}
