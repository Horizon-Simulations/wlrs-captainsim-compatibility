import { ArraySubject, Subject } from '../../../sub';
import { BingComponent } from '../../bing';
/**
 * A map data module that controls the terrain color reference point.
 */
export class MapTerrainColorsModule {
    constructor() {
        /** The terrain colors reference point. */
        this.reference = Subject.create(EBingReference.SEA);
        /** Whether or not to show the map terrain isolines. */
        this.showIsoLines = Subject.create(false);
        /** The terrain colors array. */
        this.colors = ArraySubject.create(BingComponent.createEarthColorsArray('#0000FF', [
            {
                elev: 0,
                color: '#000000'
            },
            {
                elev: 60000,
                color: '#000000'
            }
        ]));
    }
}
