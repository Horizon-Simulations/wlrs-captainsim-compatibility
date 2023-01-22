import { GeoPoint } from '../../../geo/GeoPoint';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
/**
 * Controls the target position of a map to follow the player airplane.
 */
export class MapFollowAirplaneController extends MapSystemController {
    constructor() {
        super(...arguments);
        this.ownAirplanePropsModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps);
        this.isFollowingAirplane = this.context.model.getModule(MapSystemKeys.FollowAirplane).isFollowing;
        this.mapProjectionParams = {
            target: new GeoPoint(0, 0)
        };
        this.targetControl = this.context[MapSystemKeys.TargetControl];
        this.targetControlConsumer = {
            priority: 0,
            onAcquired: () => {
                this.isFollowingAirplane.set(true);
            },
            onCeded: () => {
                this.isFollowingAirplane.set(false);
            }
        };
    }
    /** @inheritdoc */
    onAfterMapRender() {
        this.targetControl.claim(this.targetControlConsumer);
    }
    /** @inheritdoc */
    onBeforeUpdated() {
        if (this.isFollowingAirplane.get()) {
            this.mapProjectionParams.target.set(this.ownAirplanePropsModule.position.get());
            this.context.projection.setQueued(this.mapProjectionParams);
        }
    }
    /** @inheritdoc */
    onMapDestroyed() {
        this.destroy();
    }
    /** @inheritdoc */
    destroy() {
        super.destroy();
        this.targetControl.forfeit(this.targetControlConsumer);
    }
}
