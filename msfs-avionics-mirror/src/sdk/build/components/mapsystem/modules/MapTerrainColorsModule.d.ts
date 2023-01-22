/// <reference types="msfstypes/js/netbingmap" />
import { ArraySubject, Subject } from '../../../sub';
/**
 * A map data module that controls the terrain color reference point.
 */
export declare class MapTerrainColorsModule {
    /** The terrain colors reference point. */
    readonly reference: Subject<EBingReference>;
    /** Whether or not to show the map terrain isolines. */
    readonly showIsoLines: Subject<boolean>;
    /** The terrain colors array. */
    readonly colors: ArraySubject<number>;
}
//# sourceMappingURL=MapTerrainColorsModule.d.ts.map