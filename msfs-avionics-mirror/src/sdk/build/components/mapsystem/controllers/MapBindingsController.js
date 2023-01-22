import { MapSystemController } from '../MapSystemController';
/**
 * A controller which maintains an arbitrary number of bindings.
 */
export class MapBindingsController extends MapSystemController {
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param bindings This controller's bindings.
     */
    constructor(context, bindings) {
        super(context);
        this.bindings = bindings;
    }
    /** @inheritdoc */
    onAfterMapRender() {
        const bindings = Array.from(this.bindings);
        if (bindings.length === 0) {
            this.destroy();
        }
        this.pipes = bindings.map(binding => {
            if ('map' in binding) {
                return binding.source.pipe(binding.target, binding.map);
            }
            else {
                return binding.source.pipe(binding.target);
            }
        });
    }
    /** @inheritdoc */
    onMapDestroyed() {
        this.destroy();
    }
    /** @inheritdoc */
    onWake() {
        var _a;
        (_a = this.pipes) === null || _a === void 0 ? void 0 : _a.forEach(pipe => { pipe.resume(true); });
    }
    /** @inheritdoc */
    onSleep() {
        var _a;
        (_a = this.pipes) === null || _a === void 0 ? void 0 : _a.forEach(pipe => { pipe.pause(); });
    }
    /** @inheritdoc */
    destroy() {
        var _a;
        super.destroy();
        (_a = this.pipes) === null || _a === void 0 ? void 0 : _a.forEach(pipe => { pipe.destroy(); });
    }
}
