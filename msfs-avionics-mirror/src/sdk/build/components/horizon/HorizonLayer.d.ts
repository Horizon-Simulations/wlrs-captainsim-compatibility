import { Subscribable } from '../../sub/Subscribable';
import { ComponentProps, DisplayComponent } from '../FSComponent';
import { HorizonProjection } from './HorizonProjection';
/**
 * Component props for HorizonLayer.
 */
export interface HorizonLayerProps extends ComponentProps {
    /** The layer's horizon projection. */
    projection: HorizonProjection;
    /**
     * A subscribable which provides the maximum update frequency of the layer, in hertz. Note that the actual update
     * frequency will not exceed the update frequency of the layer's parent map. If not defined, the frequency will
     * default to that of the layer's parent map.
     */
    updateFreq?: Subscribable<number>;
}
/**
 * A base component for horizon layers.
 */
export declare abstract class HorizonLayer<P extends HorizonLayerProps = HorizonLayerProps> extends DisplayComponent<P> {
    private _isAttached;
    private _isVisible;
    /**
     * Checks whether this layer is attached to a horizon component.
     * @returns Whether this layer is attached to a horizon component.
     */
    protected isAttached(): boolean;
    /**
     * Checks whether this layer is visible.
     * @returns whether this layer is visible.
     */
    isVisible(): boolean;
    /**
     * Sets this layer's visibility.
     * @param val Whether this layer should be visible.
     */
    setVisible(val: boolean): void;
    /**
     * This method is called when this layer's visibility changes.
     * @param isVisible Whether the layer is now visible.
     */
    protected onVisibilityChanged(isVisible: boolean): void;
    /**
     * This method is called when this layer is attached to its parent horizon component.
     */
    onAttached(): void;
    /**
     * This method is called when this layer's parent horizon component is awakened.
     */
    onWake(): void;
    /**
     * This method is called when this layer's parent horizon component is put to sleep.
     */
    onSleep(): void;
    /**
     * This method is called when this layer's horizon projection changes.
     * @param projection This layer's horizon projection.
     * @param changeFlags The types of changes made to the projection.
     */
    onProjectionChanged(projection: HorizonProjection, changeFlags: number): void;
    /**
     * This method is called once every update cycle.
     * @param time The current time as a UNIX timestamp.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    onUpdated(time: number, elapsed: number): void;
    /**
     * This method is called when this layer is detached from its parent horizon component.
     */
    onDetached(): void;
}
//# sourceMappingURL=HorizonLayer.d.ts.map