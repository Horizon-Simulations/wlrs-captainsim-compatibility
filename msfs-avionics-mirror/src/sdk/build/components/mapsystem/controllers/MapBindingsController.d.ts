import { MutableSubscribable, Subscribable } from '../../../sub';
import { MapSystemContext } from '../MapSystemContext';
import { MapSystemController } from '../MapSystemController';
/**
 * A binding from a source to a target.
 */
export declare type MapBinding<T> = {
    /** The source of the binding. */
    source: Subscribable<T>;
    /** The target of the binding. */
    target: MutableSubscribable<any, T>;
};
/**
 * A binding from a transformed source to a target.
 */
export declare type MapTransformedBinding<S, T> = {
    /** The source of the binding. */
    source: Subscribable<S>;
    /** The target of the binding. */
    target: MutableSubscribable<any, T>;
    /** A function which transforms source values before they are applied to the target. */
    map: (source: S) => T;
};
/**
 * A controller which maintains an arbitrary number of bindings.
 */
export declare class MapBindingsController extends MapSystemController {
    private readonly bindings;
    private pipes?;
    /**
     * Constructor.
     * @param context This controller's map context.
     * @param bindings This controller's bindings.
     */
    constructor(context: MapSystemContext<any, any, any, any>, bindings: Iterable<MapBinding<any> | MapTransformedBinding<any, any>>);
    /** @inheritdoc */
    onAfterMapRender(): void;
    /** @inheritdoc */
    onMapDestroyed(): void;
    /** @inheritdoc */
    onWake(): void;
    /** @inheritdoc */
    onSleep(): void;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=MapBindingsController.d.ts.map