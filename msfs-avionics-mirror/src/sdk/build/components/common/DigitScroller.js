import { MathUtils } from '../../math/MathUtils';
import { ObjectSubject } from '../../sub/ObjectSubject';
import { SetSubject } from '../../sub/SetSubject';
import { Subject } from '../../sub/Subject';
import { DisplayComponent, FSComponent } from '../FSComponent';
/**
 * A scrolling digit display.
 */
export class DigitScroller extends DisplayComponent {
    /** @inheritdoc */
    constructor(props) {
        var _a;
        super(props);
        this.digitCount = (this.props.base + 2) * 2 + 1;
        this.translationPerDigit = 100 / this.digitCount;
        this.tapeStyle = ObjectSubject.create({
            display: '',
            position: 'absolute',
            left: '0',
            top: `calc(50% - var(--digit-scroller-line-height, 1em) * ${this.digitCount / 2})`,
            width: '100%',
            height: `calc(var(--digit-scroller-line-height, 1em) * ${this.digitCount})`,
            transform: 'translate3d(0, 0, 0)'
        });
        this.nanTextStyle = ObjectSubject.create({
            display: 'none',
            position: 'absolute',
            left: '0%',
            top: '50%',
            width: '100%',
            transform: 'translateY(-50%)'
        });
        this.digitPlaceFactor = this.props.factor;
        this.scrollThreshold = (_a = this.props.scrollThreshold) !== null && _a !== void 0 ? _a : 0;
        this.translateY = Subject.create(0);
        if (props.base < 3 || Math.floor(props.base) !== props.base) {
            throw new Error(`DigitScroller: invalid number base (${this.props.base})`);
        }
        if (props.factor === 0) {
            throw new Error(`DigitScroller: invalid factor (${props.factor})`);
        }
    }
    /** @inheritdoc */
    onAfterRender() {
        this.translateY.sub(translateY => {
            this.tapeStyle.set('transform', `translate3d(0, ${translateY}%, 0)`);
        });
        this.valueSub = this.props.value.sub(this.update.bind(this), true);
    }
    /**
     * Updates this display.
     * @param value This display's value.
     */
    update(value) {
        if (isNaN(value)) {
            this.nanTextStyle.set('display', '');
            this.tapeStyle.set('display', 'none');
            return;
        }
        this.nanTextStyle.set('display', 'none');
        this.tapeStyle.set('display', '');
        const base = this.props.base;
        const valueSign = value < 0 ? -1 : 1;
        const valueAbs = Math.abs(value);
        let pivot = Math.floor(valueAbs / this.digitPlaceFactor) * this.digitPlaceFactor;
        let digit = Math.floor(pivot / this.digitPlaceFactor) % base;
        let digitTranslate = (valueAbs - pivot) / this.digitPlaceFactor;
        const threshold = this.scrollThreshold / this.digitPlaceFactor;
        digitTranslate = (digitTranslate > threshold) ? (digitTranslate - threshold) / (1 - threshold) : 0;
        if (digitTranslate >= 0.5) {
            pivot += this.digitPlaceFactor;
            digit = (digit + 1) % base;
            digitTranslate -= 1;
        }
        let tapeTranslate = 0;
        if (pivot <= this.digitPlaceFactor) {
            tapeTranslate = (digit + digitTranslate) * valueSign * this.translationPerDigit;
        }
        else {
            tapeTranslate = (((digit + base - 2) % base + 2) + digitTranslate) * valueSign * this.translationPerDigit;
        }
        this.translateY.set(MathUtils.round(tapeTranslate, 0.1));
    }
    /** @inheritdoc */
    render() {
        var _a, _b;
        let cssClass;
        if (this.props.class !== undefined && typeof this.props.class === 'object') {
            cssClass = SetSubject.create(['digit-scroller']);
            this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, ['digit-scroller']);
        }
        else {
            cssClass = `digit-scroller ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}`;
        }
        return (FSComponent.buildComponent("div", { class: cssClass, style: 'overflow: hidden' },
            FSComponent.buildComponent("div", { class: 'digit-scroller-digit-tape', style: this.tapeStyle }, this.renderDigits()),
            FSComponent.buildComponent("div", { class: 'digit-scroller-nan', style: this.nanTextStyle }, (_b = this.props.nanString) !== null && _b !== void 0 ? _b : '–')));
    }
    /**
     * Renders text for each of this display's individual digits.
     * @returns This display's individual digit text, as an array of VNodes.
     */
    renderDigits() {
        var _a;
        const base = this.props.base;
        const renderFunc = (_a = this.props.renderDigit) !== null && _a !== void 0 ? _a : ((digit) => (Math.abs(digit) % base).toString());
        // Digits to render: -(base + 2), -(base + 1), -(base), -(base - 1), ... -1, 0, 1, ... , base - 1, base, base + 1, base + 2
        const zeroIndexOffset = base + 2;
        return Array.from({ length: this.digitCount }, (v, index) => {
            const digit = zeroIndexOffset - index;
            return (FSComponent.buildComponent("div", { style: `position: absolute; left: 0; top: ${50 + (index - zeroIndexOffset - 0.5) * this.translationPerDigit}%; width: 100%; height: ${this.translationPerDigit}%;` },
                FSComponent.buildComponent("span", { class: 'digit-scroller-digit', style: 'vertical-align: baseline;' }, renderFunc(digit))));
        });
    }
    /** @inheritdoc */
    destroy() {
        var _a, _b;
        super.destroy();
        (_a = this.valueSub) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.cssClassSub) === null || _b === void 0 ? void 0 : _b.destroy();
    }
}
