import { Subscribable } from '../sub/Subscribable';
import { MutableSubscribableSet, SubscribableSet } from '../sub/SubscribableSet';
import { Subscription } from '../sub/Subscription';
/**
 * An interface that describes a virtual DOM node.
 */
export interface VNode {
    /** The created instance of the node. */
    instance: NodeInstance;
    /**
     * The root DOM node of this VNode
     * @type {Node}
     * @memberof VNode
     */
    root?: Node;
    /** Any properties to apply to the node. */
    props: any;
    /** The children of this node. */
    children: VNode[] | null;
}
/** A union of possible types of a VNode instance. */
export declare type NodeInstance = HTMLElement | SVGElement | DisplayComponent<any> | string | number | null | Subscribable<any>;
/** A union of possible child element types. */
declare type DisplayChildren = VNode | string | number | Subscribable<any> | (VNode | string | number | Subscribable<any>)[] | null;
/** A releative render position. */
export declare enum RenderPosition {
    Before = 0,
    After = 1,
    In = 2
}
/** Mapped length undefined tuple to a tuple of Contexts. */
export declare type ContextTypes<T extends unknown[]> = {
    [Index in keyof T]: Context<T[Index]>;
};
/** Mapped length undefined tuple to a tuple of context subscriptions. */
export declare type ContextSubcriptions<T extends unknown[]> = {
    [Index in keyof T]: Subscribable<T[Index]>;
};
/**
 * A display component in the component framework.
 * @typedef P The type of properties for this component.
 * @typedef C The type of context that this component might have.
 */
export declare abstract class DisplayComponent<P, Contexts extends unknown[] = []> {
    /** The properties of the component. */
    props: P & ComponentProps;
    /** The context on this component, if any. */
    context?: [...ContextSubcriptions<Contexts>];
    /** The type of context for this component, if any. */
    readonly contextType?: readonly [...ContextTypes<Contexts>];
    /**
     * Creates an instance of a DisplayComponent.
     * @param props The propertis of the component.
     */
    constructor(props: P);
    /**
     * A callback that is called before the component is rendered.
     */
    onBeforeRender(): void;
    /**
     * A callback that is called after the component is rendered.
     * @param node The component's VNode.
     */
    onAfterRender(node: VNode): void;
    /**
     * Renders the component.
     * @returns A JSX element to be rendered.
     */
    abstract render(): VNode | null;
    /**
     * Destroys this component.
     */
    destroy(): void;
    /**
     * Gets a context data subscription from the context collection.
     * @param context The context to get the subscription for.
     * @returns The requested context.
     * @throws An error if no data for the specified context type could be found.
     */
    protected getContext(context: ContextTypes<Contexts>[number]): ContextSubcriptions<Contexts>[number];
}
/**
 * Base properties for display components.
 */
export declare class ComponentProps {
    /** The children of the display component. */
    children?: DisplayChildren[];
    /** A reference to the display component. */
    ref?: NodeReference<any>;
}
/**
 * A constructor signature for a DisplayComponent.
 */
export declare type DisplayComponentFactory<P extends ComponentProps, Contexts extends Context<unknown>[] = []> = new (props: P) => DisplayComponent<P, Contexts>;
/**
 * A type for the Fragment function.
 */
export declare type FragmentFactory = (props: ComponentProps) => DisplayChildren[] | undefined;
/**
 * A reference to a component or element node.
 */
export declare class NodeReference<T extends (DisplayComponent<any> | HTMLElement | SVGElement)> {
    /** The internal reference instance. */
    private _instance;
    /**
     * The instance of the element or component.
     * @returns The instance of the element or component.
     */
    get instance(): T;
    /**
     * Sets the value of the instance.
     */
    set instance(val: T);
    /**
     * Gets the instance, or null if the instance is not populated.
     * @returns The component or element instance.
     */
    getOrDefault(): T | null;
}
/**
 * Provides a context of data that can be passed down to child components via a provider.
 */
export declare class Context<T> {
    readonly defaultValue: T;
    /**
     * The provider component that can be set to a specific context value.
     * @param props The props of the provider component.
     * @returns A new context provider.
     */
    readonly Provider: (props: ContextProviderProps<T>) => ContextProvider<T>;
    /**
     * Creates an instance of a Context.
     * @param defaultValue The default value of this context.
     */
    constructor(defaultValue: T);
}
/**
 * Props on the ContextProvider component.
 */
interface ContextProviderProps<T> extends ComponentProps {
    /** The value of the context underneath this provider. */
    value: T;
}
/**
 * A provider component that can be set to a specific context value.
 */
declare class ContextProvider<T> extends DisplayComponent<ContextProviderProps<T>> {
    readonly parent: Context<T>;
    /**
     * Creates an instance of a ContextProvider.
     * @param props The props on the component.
     * @param parent The parent context instance for this provider.
     */
    constructor(props: ContextProviderProps<T>, parent: Context<T>);
    /** @inheritdoc */
    render(): VNode | null;
}
/**
 * The FS component namespace.
 */
export declare namespace FSComponent {
    /**
     * Definitions for JSX transpilation.
     */
    namespace JSX {
        /**
         * The intrinsic DOM elements that can be defined.
         */
        interface IntrinsicElements {
            [elemName: string]: any;
            /** A reference to the HTML element node. */
            ref?: NodeReference<any>;
        }
    }
    /**
     * A fragment of existing elements with no specific root.
     * @param props The fragment properties.
     * @returns The fragment children.
     */
    function Fragment(props: ComponentProps): DisplayChildren[] | undefined;
    /**
     * Builds a JSX based FSComponent.
     * @param type The DOM element tag that will be built.
     * @param props The properties to apply to the DOM element.
     * @param children Any children of this DOM element.
     * @returns The JSX VNode for the component or element.
     */
    function buildComponent<T extends DisplayComponentFactory<P> | keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | FragmentFactory, P extends ComponentProps>(type: T, props: P | null, ...children: DisplayChildren[]): VNode | null;
    /**
     * Creates the collection of child VNodes.
     * @param parent The parent VNode.
     * @param children The JSX children to convert to nodes.
     * @returns A collection of child VNodes.
     */
    function createChildNodes(parent: VNode, children: DisplayChildren[]): VNode[] | null;
    /**
     * Creates a static content VNode.
     * @param content The content to create a node for.
     * @returns A static content VNode.
     */
    function createStaticContentNode(content: string | number): VNode;
    /**
     * Renders a VNode to a DOM element.
     * @param node The node to render.
     * @param element The DOM element to render to.
     * @param position The RenderPosition to put the item in.
     */
    function render(node: VNode, element: HTMLElement | SVGElement | null, position?: RenderPosition): void;
    /**
     * Render a node before a DOM element.
     * @param node The node to render.
     * @param element The element to render boeore.
     */
    function renderBefore(node: VNode, element: HTMLElement | SVGElement | null): void;
    /**
     * Render a node after a DOM element.
     * @param node The node to render.
     * @param element The element to render after.
     */
    function renderAfter(node: VNode, element: HTMLElement | SVGElement | null): void;
    /**
     * Remove a previously rendered element.  Currently, this is just a simple
     * wrapper so that all of our high-level "component maniuplation" state is kept
     * in the FSComponent API, but it's not doing anything other than a simple
     * remove() on the element.   This can probably be enhanced.
     * @param element The element to remove.
     */
    function remove(element: HTMLElement | SVGElement | null): void;
    /**
     * Creates a component or element node reference.
     * @returns A new component or element node reference.
     */
    function createRef<T extends (DisplayComponent<any, any> | HTMLElement | SVGElement)>(): NodeReference<T>;
    /**
     * Creates a new context to hold data for passing to child components.
     * @param defaultValue The default value of this context.
     * @returns A new context.
     */
    function createContext<T>(defaultValue: T): Context<T>;
    /**
     * Visits VNodes with a supplied visitor function within the given children tree.
     * @param node The node to visit.
     * @param visitor The visitor function to inspect VNodes with. Return true if the search should stop at the visited
     * node and not proceed any further down the node's children.
     * @returns True if the visitation should break, or false otherwise.
     */
    function visitNodes(node: VNode, visitor: (node: VNode) => boolean): boolean;
    /**
     * Parses a space-delimited CSS class string into an array of CSS classes.
     * @param classString A space-delimited CSS class string.
     * @returns An array of CSS classes derived from the specified CSS class string.
     */
    function parseCssClassesFromString(classString: string): string[];
    /**
     * Binds a {@link MutableSubscribableSet} to a subscribable set of CSS classes. CSS classes added to and removed from
     * the subscribed set will also be added to and removed from the bound set, with the exception of a set of reserved
     * classes. The presence or absence of any of the reserved classes in the bound set is not affected by the subscribed
     * set; these reserved classes may be freely added to and removed from the bound set.
     * @param setToBind The set to bind.
     * @param classesToSubscribe A set of CSS classes to which to subscribe.
     * @param reservedClasses An iterable of reserved classes.
     * @returns The newly created subscription to the subscribed CSS class set.
     */
    function bindCssClassSet(setToBind: MutableSubscribableSet<string>, classesToSubscribe: SubscribableSet<string>, reservedClasses: Iterable<string>): Subscription;
    /**
     * An empty callback handler.
     */
    const EmptyHandler: () => void;
}
/**
 * A system that handles the registration and boostrapping of plugin scripts.
 */
export declare class PluginSystem<T extends AvionicsPlugin<B>, B> {
    private readonly scripts;
    private readonly plugins;
    /** The avionics specific plugin binder to inject into each plugin. */
    binder?: B;
    /** An event subscribable that publishes when a new component is about to be created. */
    readonly creatingHandlers: ((constructor: DisplayComponentFactory<any>, props: any) => DisplayComponent<any> | undefined)[];
    /** An event subscribable that publishes when a new component is created. */
    readonly createdHandlers: ((component: DisplayComponent<any>) => void)[];
    /** An event subscribable that publishes when a component has finished rendering. */
    readonly renderedHandlers: ((node: VNode) => void)[];
    /**
     * Adds plugin scripts to load to the system.
     * @param document The panel.xml document to load scripts from.
     * @param instrumentId The ID of the instrument.
     */
    addScripts(document: XMLDocument, instrumentId: string): void;
    /**
     * Starts the plugin system with the included avionics specific plugin binder.
     * @param binder The plugin binder to pass to the individual plugins.
     */
    startSystem(binder: B): Promise<void>;
    /**
     * Adds a plugin to the plugin system.
     * @param plugin The plugin to add.
     */
    addPlugin(plugin: T): void;
    /**
     * Runs the provided function on all of the registered plugins.
     * @param fun The function to run.
     */
    callPlugins(fun: (plugin: T) => void): void;
    /**
     * Subscribes a handler to the component creating hook.
     * @param handler The handler to subscribe.
     */
    subscribeOnComponentCreating(handler: (constructor: DisplayComponentFactory<any>, props: any) => DisplayComponent<any> | undefined): void;
    /**
     * A hook that allows plugins to replace components that are about to be created with their own implementations.
     * @param constructor The display component constructor that is going to be used.
     * @param props The component props that will be passed into the component.
     * @returns Returns either the display component that will replace, or undefined if the component should not be replaced.
     */
    onComponentCreating(constructor: DisplayComponentFactory<any>, props: any): DisplayComponent<any> | undefined;
    /**
     * Subscribes a handler to the component created hook.
     * @param handler The handler to subscribe.
     */
    subscribeOnComponentCreated(handler: (component: DisplayComponent<any>) => void): void;
    /**
     * A hook that allows plugins to observe components as they are created.
     * @param component The component that was created.
     */
    onComponentCreated(component: DisplayComponent<any>): void;
    /**
     * Subscribes a handler to the component rendered hook.
     * @param handler The handler to subscribe.
     */
    subscribeOnComponentRendered(handler: (node: VNode) => void): void;
    /**
     * A hook that allows plugins to observe built VNodes after they are rendered.
     * @param node The node that was rendered.
     */
    onComponentRendered(node: VNode): void;
}
/**
 * A plugin that is created and managed by the plugin system.
 */
export declare abstract class AvionicsPlugin<T> {
    protected readonly binder: T;
    /**
     * Creates an instance of a Plugin.
     * @param binder The avionics specific plugin binder to accept from the system.
     */
    constructor(binder: T);
    /**
     * A callback run when the plugin has been installed.
     */
    abstract onInstalled(): void;
    /**
     * An optional hook called when a component is about to be created. Returning a component causes
     * that component to be used instead of the one that was to be created, and returning undefined
     * will cause the original component to be created. If this hook is present, it will be called
     * for EVERY component instantiation, so be sure to ensure that this code is well optimized.
     */
    onComponentCreating?: (constructor: DisplayComponentFactory<any>, props: any) => DisplayComponent<any> | undefined;
    /**
     * An optional hook called when a component is created. If this hook is present,
     * it will be called for EVERY component instantiation, so be sure to ensure
     * that this code is well optimized.
     */
    onComponentCreated?: (component: DisplayComponent<any>) => void;
    /**
     * An optional hook called when a component has completed rendering. If this hook
     * is present, it will be called for EVERY component render completion, so be sure
     * to ensure that this code is well optimized.
     */
    onComponentRendered?: (node: VNode) => void;
    /**
     * Loads a CSS file into the instrument.
     * @param uri The URI to the CSS file.
     */
    protected loadCss(uri: string): Promise<void>;
}
/**
 * Registers a plugin with the plugin system.
 * @param plugin The plugin to register.
 */
export declare function registerPlugin<T>(plugin: new (binder: T) => AvionicsPlugin<T>): void;
declare const Fragment: typeof FSComponent.Fragment;
export { Fragment };
//# sourceMappingURL=FSComponent.d.ts.map