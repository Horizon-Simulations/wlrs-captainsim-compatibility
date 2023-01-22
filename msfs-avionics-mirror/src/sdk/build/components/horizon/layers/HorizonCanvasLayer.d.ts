import { SubscribableSet } from '../../../sub/SubscribableSet';
import { VNode } from '../../FSComponent';
import { HorizonLayer, HorizonLayerProps } from '../HorizonLayer';
/**
 * Properties for a MapCanvasLayer.
 */
export interface HorizonCanvasLayerProps extends HorizonLayerProps {
    /** Whether to include an offscreen buffer. False by default. */
    useBuffer?: boolean;
    /** CSS class(es) to apply to the canvas element. */
    class?: string | SubscribableSet<string>;
}
/**
 * An instance of a canvas within a MapCanvasLayer.
 */
export interface HorizonCanvasLayerCanvasInstance {
    /** This instance's canvas element. */
    readonly canvas: HTMLCanvasElement;
    /** This instance's canvas 2D rendering context. */
    readonly context: CanvasRenderingContext2D;
    /** Whether this instance's canvas is displayed. */
    readonly isDisplayed: boolean;
    /** Clears this canvas. */
    clear(): void;
    /**
     * Resets this instance's canvas. This will erase the canvas of all drawn pixels, reset its state (including all
     * styles, transformations, and cached paths), and clear the Coherent GT command buffer associated with it.
     */
    reset(): void;
}
/**
 * An implementation of MapCanvasLayerCanvasInstance.
 */
export declare class HorizonCanvasLayerCanvasInstanceClass implements HorizonCanvasLayerCanvasInstance {
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    readonly isDisplayed: boolean;
    /**
     * Creates a new canvas instance.
     * @param canvas The canvas element.
     * @param context The canvas 2D rendering context.
     * @param isDisplayed Whether the canvas is displayed.
     */
    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, isDisplayed: boolean);
    /** @inheritdoc */
    clear(): void;
    /** @inheritdoc */
    reset(): void;
}
/**
 * A layer which uses a canvas to draw graphics.
 */
export declare class HorizonCanvasLayer<P extends HorizonCanvasLayerProps = HorizonCanvasLayerProps, C extends HorizonCanvasLayerCanvasInstance = HorizonCanvasLayerCanvasInstance> extends HorizonLayer<P> {
    private readonly displayCanvasRef;
    private width;
    private height;
    private displayCanvasContext;
    private _display?;
    private _buffer?;
    protected isInit: boolean;
    /**
     * Gets this layer's display canvas instance.
     * @returns This layer's display canvas instance.
     * @throws Error if this layer's display canvas instance has not been initialized.
     */
    get display(): C;
    /**
     * Gets this layer's buffer canvas instance.
     * @returns This layer's buffer canvas instance.
     * @throws Error if this layer's buffer canvas instance has not been initialized.
     */
    get buffer(): C;
    /**
     * Attempts to get this layer's display canvas instance.
     * @returns This layer's display canvas instance, or undefined if it has not been initialized.
     */
    tryGetDisplay(): C | undefined;
    /**
     * Attempts to get this layer's buffer canvas instance.
     * @returns This layer's buffer canvas instance, or undefined if it has not been initialized.
     */
    tryGetBuffer(): C | undefined;
    /**
     * Gets the width of the canvas element, in pixels.
     * @returns the width of the canvas element.
     */
    getWidth(): number;
    /**
     * Gets the height of the canvas element, in pixels.
     * @returns the height of the canvas element.
     */
    getHeight(): number;
    /**
     * Sets the width of the canvas element, in pixels.
     * @param width The new width.
     */
    setWidth(width: number): void;
    /**
     * Sets the height of the canvas element, in pixels.
     * @param height The new height.
     */
    setHeight(height: number): void;
    /**
     * Copies the contents of the buffer to the display. Has no effect if this layer does not have a buffer.
     */
    copyBufferToDisplay(): void;
    /**
     * A callback called after the component renders.
     */
    onAfterRender(): void;
    /** @inheritdoc */
    protected onVisibilityChanged(): void;
    /** @inheritdoc */
    onAttached(): void;
    /**
     * Initializes this layer's canvas instances.
     */
    private initCanvasInstances;
    /**
     * Creates a canvas instance.
     * @param canvas The canvas element.
     * @param context The canvas 2D rendering context.
     * @param isDisplayed Whether the canvas is displayed.
     * @returns a canvas instance.
     */
    protected createCanvasInstance(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, isDisplayed: boolean): C;
    /**
     * Updates the canvas element's size.
     */
    protected updateCanvasSize(): void;
    /**
     * Updates the visibility of the display canvas.
     */
    private updateCanvasVisibility;
    /** @inheritdoc */
    render(): VNode;
}
//# sourceMappingURL=HorizonCanvasLayer.d.ts.map