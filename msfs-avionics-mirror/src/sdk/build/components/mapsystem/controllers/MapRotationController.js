/// <reference types="msfstypes/JS/Avionics" />
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapRotation } from '../modules/MapRotationModule';
/**
 * Controls the rotation of a map based on the behavior defined in {@link MapRotationModule}.
 */
export class MapRotationController extends MapSystemController {
    constructor() {
        super(...arguments);
        this.rotationModule = this.context.model.getModule(MapSystemKeys.Rotation);
        this.ownAirplanePropsModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps);
        this.rotationParam = {
            rotation: 0
        };
        this.hasRotationControl = false;
        this.rotationControl = this.context[MapSystemKeys.RotationControl];
        this.rotationControlConsumer = {
            priority: 0,
            onAcquired: () => {
                this.hasRotationControl = true;
            },
            onCeded: () => {
                this.hasRotationControl = false;
            }
        };
        this.rotationFuncs = {
            [MapRotation.NorthUp]: () => 0,
            [MapRotation.HeadingUp]: this.ownAirplanePropsModule === undefined
                ? () => 0
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                : () => -this.ownAirplanePropsModule.hdgTrue.get() * Avionics.Utils.DEG2RAD,
            [MapRotation.TrackUp]: this.ownAirplanePropsModule === undefined
                ? () => 0
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                : () => -this.ownAirplanePropsModule.trackTrue.get() * Avionics.Utils.DEG2RAD,
            [MapRotation.DtkUp]: () => 0 // TODO
        };
        this.rotationFunc = this.rotationFuncs[MapRotation.HeadingUp];
    }
    /** @inheritdoc */
    onAfterMapRender() {
        this.rotationSub = this.rotationModule.rotationType.sub(type => {
            this.rotationFunc = this.rotationFuncs[type];
        }, true);
        this.rotationControl.claim(this.rotationControlConsumer);
    }
    /** @inheritdoc */
    onBeforeUpdated() {
        if (this.hasRotationControl) {
            this.rotationParam.rotation = this.rotationFunc();
            this.context.projection.setQueued(this.rotationParam);
        }
    }
    /** @inheritdoc */
    onMapDestroyed() {
        super.onMapDestroyed();
        this.destroy();
    }
    /** @inheritdoc */
    destroy() {
        var _a;
        super.destroy();
        (_a = this.rotationSub) === null || _a === void 0 ? void 0 : _a.destroy();
        this.rotationControl.forfeit(this.rotationControlConsumer);
    }
}
