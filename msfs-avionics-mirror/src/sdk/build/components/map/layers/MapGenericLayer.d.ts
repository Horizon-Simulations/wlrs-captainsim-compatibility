import { VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapProjection } from '../MapProjection';
/**
 * Component props for MapGenericLayer.
 */
export interface MapGenericLayerProps<M> extends MapLayerProps<M> {
    /** A function to be called when the layer's visibility changes. */
    onVisibilityChanged?: (layer: MapGenericLayer<M>, isVisible: boolean) => void;
    /** A function to be called when the layer is attached to a map. */
    onAttached?: (layer: MapGenericLayer<M>) => void;
    /** A function to be called when the layer is awakened. */
    onWake?: (layer: MapGenericLayer<M>) => void;
    /** A function to be called when the layer is put to sleep. */
    onSleep?: (layer: MapGenericLayer<M>) => void;
    /** A function to be called when the projection of the layer's parent map changes. */
    onMapProjectionChanged?: (layer: MapGenericLayer<M>, mapProjection: MapProjection, changeFlags: number) => void;
    /** A function to be called when the layer updates. */
    onUpdated?: (layer: MapGenericLayer<M>, time: number, elapsed: number) => void;
    /** A function to be called when the layer is detached from a map. */
    onDetached?: (layer: MapGenericLayer<M>) => void;
}
/**
 * A generic map layer which renders its children.
 */
export declare class MapGenericLayer<M = any> extends MapLayer<MapGenericLayerProps<M>> {
    /** @inheritdoc */
    onVisibilityChanged(isVisible: boolean): void;
    /** @inheritdoc */
    onAttached(): void;
    /** @inheritdoc */
    onWake(): void;
    /** @inheritdoc */
    onSleep(): void;
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void;
    /** @inheritdoc */
    onUpdated(time: number, elapsed: number): void;
    /** @inheritdoc */
    onDetached(): void;
    /** @inheritdoc */
    render(): VNode;
}
//# sourceMappingURL=MapGenericLayer.d.ts.map