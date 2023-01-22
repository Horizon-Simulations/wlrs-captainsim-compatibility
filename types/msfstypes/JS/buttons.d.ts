declare class ButtonElement extends TemplateElement {
    protected mainFrameElem: HTMLElement;
    protected isInteractive: boolean;
    protected isPadInteractive: boolean;
    get childActiveClass(): string;
    get canFocusOnMouseOver(): boolean;
    get interactive(): boolean;
    set interactive(val: boolean);
    get padInteractive(): boolean;
    set padInteractive(val: boolean);
    get focusedClassName(): string;
    get notHighlightableClassName(): string;
    get hasMouseOver(): boolean;
    set hasMouseOver(val: boolean);
    connectedCallback(): void;
    get defaultClick(): boolean;
    get defaultSoundType(): string;
    get soundType(): string;
    set soundType(type: string);
    disconnectedCallback(): void;
    protected canPlaySound(): boolean;
    set playSoundOnValidate(val: boolean);
    protected canPlaySoundOnValidate(): boolean;
    protected onClick: (e: MouseEvent) => void;
    protected onMouseEnter: () => void;
    protected mouseEnter(): void;
    protected onLeave(): void;
    protected onMouseLeave: () => void;
    protected mouseLeave(): void;
    private onMouseDown;
    protected mouseDown(): void;
    private onMouseUp;
    protected onKeysMode(): void;
    private privateOnKeysMode;
    protected mouseUp(): void;
    private hasSound;
    focus(): void;
    protected onHover(): void;
    private m_inputbarValid;
    setInputBarTitle(title: string): void;
    private checkInputbar;
    getInputBarButtonName(): string;
    blur(): void;
    get tooltip(): string;
    get tooltipFollowsMouse(): boolean;
    get tooltipPosition(): [number, number];
    get cuttableTextBoxes(): HTMLElement[];
    needsTooltip(): boolean;
    get maxTooltipWidth(): number;
    updateTooltip(): void;
    get canBeSelected(): boolean;
    protected get validateOnReturn(): boolean;
    protected onKeyUp(keycode: any): boolean;
    protected onKeyDown(keycode: number): boolean;
    private keydownRouter;
    private keyupRouter;
    protected OnNavigationModeChanged: () => void;
    protected OnLockButtonChanged: () => void;
    protected CanRegisterButton(): boolean;
    protected IsActive(): boolean;
    set selected(bool: boolean);
    get selected(): boolean;
    Validate(): void;
    protected onValidate(): void;
    private findChildButton;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
}
declare class UINavigationBlocElement extends ButtonElement {
    protected m_insideMode: boolean;
    constructor();
    get hasMouseOver(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private onMouseMode;
    protected onKeysMode(): void;
    private onActiveElementChanged;
    get canBeSelected(): boolean;
    focusByKeys(keycode?: number): void;
    focus(): void;
    get needInputbar(): boolean;
    forceInsideMode(): void;
    private m_inputName;
    private m_inputbarExit;
    private exitInside;
    private setInsideMode;
    onKeyUp(keycode: any): boolean;
    onKeyDown(keycode: any): boolean;
    getInputBarButtonName(): string;
    getKeyNavigationDirection(): KeyNavigationDirection;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: any, oldValue: any, newValue: any): void;
    private updateCursorSelectable;
}
declare class ExternalLink extends ButtonElement {
    connectedCallback(): void;
    get interactive(): boolean;
    canBeSelectedWithKeys(): boolean;
    onValidate(): void;
    getInputBarButtonName(): string;
}
declare class InternalLink extends ButtonElement {
    connectedCallback(): void;
    getInputBarButtonName(): string;
    onValidate(): void;
}
