import { ResourceModerator } from '../../../utils/resource';
import { MapOwnAirplanePropsModule } from '../../map/modules/MapOwnAirplanePropsModule';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapRotationModule } from '../modules/MapRotationModule';
/**
 * Modules required for MapRotationController.
 */
export interface MapRotationControllerModules {
    /** Rotation module. */
    [MapSystemKeys.Rotation]: MapRotationModule;
    /** Own airplane properties module. */
    [MapSystemKeys.OwnAirplaneProps]?: MapOwnAirplanePropsModule;
}
/**
 * Required context properties for MapRotationController.
 */
export interface MapRotationControllerContext {
    /** Resource moderator for control of the map's rotation. */
    [MapSystemKeys.RotationControl]: ResourceModerator;
}
/**
 * Controls the rotation of a map based on the behavior defined in {@link MapRotationModule}.
 */
export declare class MapRotationController extends MapSystemController<MapRotationControllerModules, any, any, MapRotationControllerContext> {
    private readonly rotationModule;
    private readonly ownAirplanePropsModule;
    private readonly rotationParam;
    private hasRotationControl;
    private readonly rotationControl;
    private readonly rotationControlConsumer;
    private readonly rotationFuncs;
    private rotationFunc;
    private rotationSub?;
    /** @inheritdoc */
    onAfterMapRender(): void;
    /** @inheritdoc */
    onBeforeUpdated(): void;
    /** @inheritdoc */
    onMapDestroyed(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MapRotationController.d.ts.map