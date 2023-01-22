import { ResourceModerator } from '../../../utils/resource';
import { MapOwnAirplanePropsModule } from '../../map/modules/MapOwnAirplanePropsModule';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapFollowAirplaneModule } from '../modules/MapFollowAirplaneModule';
/**
 * Modules required for MapFollowAirplaneController.
 */
export interface MapFollowAirplaneControllerModules {
    /** Own airplane properties module. */
    [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;
    /** Follow airplane module. */
    [MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule;
}
/**
 * Context properties required for MapFollowAirplaneController.
 */
export interface MapFollowAirplaneControllerContext {
    /** Resource moderator for control of the map's projection target. */
    [MapSystemKeys.TargetControl]: ResourceModerator;
}
/**
 * Controls the target position of a map to follow the player airplane.
 */
export declare class MapFollowAirplaneController extends MapSystemController<MapFollowAirplaneControllerModules, any, any, MapFollowAirplaneControllerContext> {
    private readonly ownAirplanePropsModule;
    private readonly isFollowingAirplane;
    private readonly mapProjectionParams;
    private readonly targetControl;
    private readonly targetControlConsumer;
    /** @inheritdoc */
    onAfterMapRender(): void;
    /** @inheritdoc */
    onBeforeUpdated(): void;
    /** @inheritdoc */
    onMapDestroyed(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MapFollowAirplaneController.d.ts.map