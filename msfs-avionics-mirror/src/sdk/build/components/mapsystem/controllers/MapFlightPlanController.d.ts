import { FlightPlanner } from '../../../flightplan/FlightPlanner';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapFlightPlanModule } from '../modules/MapFlightPlanModule';
/**
 * Modules required for MapFlightPlanController.
 */
export interface MapFlightPlanControllerModules {
    /** Flight plan module. */
    [MapSystemKeys.FlightPlan]: MapFlightPlanModule;
}
/**
 * Context values required for MapFlightPlanController.
 */
export interface MapFlightPlanControllerContext {
    /** The flight planner. */
    [MapSystemKeys.FlightPlanner]: FlightPlanner;
}
/**
 * Controls the map system's flight plan module.
 */
export declare class MapFlightPlanController extends MapSystemController<MapFlightPlanControllerModules, any, any, MapFlightPlanControllerContext> {
    private readonly flightPlanModule;
    private planCopiedHandler;
    private planCreatedHandler;
    private planDeletedHandler;
    private planChangeHandler;
    private planCalculatedHandler;
    private activeLegChangedHandler;
    private fplCopiedSub?;
    private fplCreatedSub?;
    private fplDeletedSub?;
    private fplDirectToDataChangedSub?;
    private fplLoadedSub?;
    private fplOriginDestChangedSub?;
    private fplProcDetailsChangedSub?;
    private fplSegmentChangeSub?;
    private fplUserDataDeleteSub?;
    private fplUserDataSetSub?;
    private fplActiveLegChangeSub?;
    private fplCalculatedSub?;
    /** @inheritdoc */
    onAfterMapRender(): void;
    /** @inheritdoc */
    onMapDestroyed(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MapFlightPlanController.d.ts.map