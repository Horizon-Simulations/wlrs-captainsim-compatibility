import { Subscribable } from '../../sub/Subscribable';
import { SubscribableSet } from '../../sub/SubscribableSet';
import { ComponentProps, DisplayComponent, VNode } from '../FSComponent';
/**
 * Component props for DigitScroller.
 */
export interface DigitScrollerProps extends ComponentProps {
    /** The value to which the scroller is bound. */
    value: Subscribable<number>;
    /** The number base used by the scroller. Must be an integer greater than or equal to `3`. */
    base: number;
    /**
     * The factor represented by the scroller's digit. The factor relates the digit to its nominal value as
     * `value = digit * factor`. Cannot be `0`.
     */
    factor: number;
    /**
     * The amount the scroller's value must deviate from the current displayed digit's nominal value before the digit
     * begins to scroll. Defaults to `0`.
     */
    scrollThreshold?: number;
    /**
     * A function which renders each digit of the scroller to a text string. If not defined, each digit will be rendered
     * using the `Number.toString()` method.
     */
    renderDigit?: (digit: number) => string;
    /** The string to render when the scroller's value is `NaN`. Defaults to `–`. */
    nanString?: string;
    /** CSS class(es) to apply to the root of the digit scroller. */
    class?: string | SubscribableSet<string>;
}
/**
 * A scrolling digit display.
 */
export declare class DigitScroller extends DisplayComponent<DigitScrollerProps> {
    private readonly digitCount;
    private readonly translationPerDigit;
    private readonly tapeStyle;
    private readonly nanTextStyle;
    private readonly digitPlaceFactor;
    private readonly scrollThreshold;
    private readonly translateY;
    private valueSub?;
    private cssClassSub?;
    /** @inheritdoc */
    constructor(props: DigitScrollerProps);
    /** @inheritdoc */
    onAfterRender(): void;
    /**
     * Updates this display.
     * @param value This display's value.
     */
    private update;
    /** @inheritdoc */
    render(): VNode;
    /**
     * Renders text for each of this display's individual digits.
     * @returns This display's individual digit text, as an array of VNodes.
     */
    private renderDigits;
    /** @inheritdoc */
    destroy(): void;
}
//# sourceMappingURL=DigitScroller.d.ts.map