/* eslint-disable no-inner-declarations */
import { ObjectSubject } from '../sub/ObjectSubject';
import { Subject } from '../sub/Subject';
import { SubscribableSetEventType } from '../sub/SubscribableSet';
/** A releative render position. */
export var RenderPosition;
(function (RenderPosition) {
    RenderPosition[RenderPosition["Before"] = 0] = "Before";
    RenderPosition[RenderPosition["After"] = 1] = "After";
    RenderPosition[RenderPosition["In"] = 2] = "In";
})(RenderPosition || (RenderPosition = {}));
/**
 * A display component in the component framework.
 * @typedef P The type of properties for this component.
 * @typedef C The type of context that this component might have.
 */
export class DisplayComponent {
    /**
     * Creates an instance of a DisplayComponent.
     * @param props The propertis of the component.
     */
    constructor(props) {
        /** The context on this component, if any. */
        this.context = undefined;
        /** The type of context for this component, if any. */
        this.contextType = undefined;
        this.props = props;
    }
    /**
     * A callback that is called before the component is rendered.
     */
    onBeforeRender() { return; }
    /**
     * A callback that is called after the component is rendered.
     * @param node The component's VNode.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterRender(node) { return; }
    /**
     * Destroys this component.
     */
    destroy() { return; }
    /**
     * Gets a context data subscription from the context collection.
     * @param context The context to get the subscription for.
     * @returns The requested context.
     * @throws An error if no data for the specified context type could be found.
     */
    getContext(context) {
        if (this.context !== undefined && this.contextType !== undefined) {
            const index = this.contextType.indexOf(context);
            return this.context[index];
        }
        throw new Error('Could not find the provided context type.');
    }
}
/**
 * Base properties for display components.
 */
export class ComponentProps {
}
/**
 * A reference to a component or element node.
 */
export class NodeReference {
    constructor() {
        /** The internal reference instance. */
        this._instance = null;
    }
    /**
     * The instance of the element or component.
     * @returns The instance of the element or component.
     */
    get instance() {
        if (this._instance !== null) {
            return this._instance;
        }
        throw new Error('Instance was null.');
    }
    /**
     * Sets the value of the instance.
     */
    set instance(val) {
        this._instance = val;
    }
    /**
     * Gets the instance, or null if the instance is not populated.
     * @returns The component or element instance.
     */
    getOrDefault() {
        return this._instance;
    }
}
/**
 * Provides a context of data that can be passed down to child components via a provider.
 */
export class Context {
    /**
     * Creates an instance of a Context.
     * @param defaultValue The default value of this context.
     */
    constructor(defaultValue) {
        this.defaultValue = defaultValue;
        /**
         * The provider component that can be set to a specific context value.
         * @param props The props of the provider component.
         * @returns A new context provider.
         */
        this.Provider = (props) => new ContextProvider(props, this);
    }
}
/**
 * A provider component that can be set to a specific context value.
 */
class ContextProvider extends DisplayComponent {
    /**
     * Creates an instance of a ContextProvider.
     * @param props The props on the component.
     * @param parent The parent context instance for this provider.
     */
    constructor(props, parent) {
        super(props);
        this.parent = parent;
    }
    /** @inheritdoc */
    render() {
        var _a;
        const children = (_a = this.props.children) !== null && _a !== void 0 ? _a : [];
        return FSComponent.buildComponent(FSComponent.Fragment, this.props, ...children);
    }
}
/**
 * The FS component namespace.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export var FSComponent;
(function (FSComponent) {
    /**
     * Valid SVG element tags.
     */
    const svgTags = {
        'circle': true,
        'clipPath': true,
        'color-profile': true,
        'cursor': true,
        'defs': true,
        'desc': true,
        'ellipse': true,
        'g': true,
        'image': true,
        'line': true,
        'linearGradient': true,
        'marker': true,
        'mask': true,
        'path': true,
        'pattern': true,
        'polygon': true,
        'polyline': true,
        'radialGradient': true,
        'rect': true,
        'stop': true,
        'svg': true,
        'text': true
    };
    /**
     * A fragment of existing elements with no specific root.
     * @param props The fragment properties.
     * @returns The fragment children.
     */
    function Fragment(props) {
        return props.children;
    }
    FSComponent.Fragment = Fragment;
    /**
     * Builds a JSX based FSComponent.
     * @param type The DOM element tag that will be built.
     * @param props The properties to apply to the DOM element.
     * @param children Any children of this DOM element.
     * @returns The JSX VNode for the component or element.
     */
    // eslint-disable-next-line no-inner-declarations
    function buildComponent(type, props, ...children) {
        let vnode = null;
        if (typeof type === 'string') {
            let element;
            if (svgTags[type] !== undefined) {
                element = document.createElementNS('http://www.w3.org/2000/svg', type);
            }
            else {
                element = document.createElement(type);
            }
            if (props !== null) {
                for (const key in props) {
                    if (key === 'ref' && props.ref !== undefined) {
                        props.ref.instance = element;
                    }
                    else {
                        const prop = props[key];
                        if (key === 'class' && typeof prop === 'object' && 'isSubscribableSet' in prop) {
                            // Bind CSS classes to a subscribable set
                            prop.sub((set, eventType, modifiedKey) => {
                                if (eventType === SubscribableSetEventType.Added) {
                                    element.classList.add(modifiedKey);
                                }
                                else {
                                    element.classList.remove(modifiedKey);
                                }
                            }, true);
                        }
                        else if (typeof prop === 'object' && 'isSubscribable' in prop) {
                            if (key === 'style' && prop instanceof ObjectSubject) {
                                // Bind CSS styles to an object subject.
                                prop.sub((v, style, newValue) => {
                                    element.style.setProperty(style.toString(), newValue);
                                }, true);
                            }
                            else {
                                // Bind an attribute to a subscribable.
                                prop.sub((v) => {
                                    element.setAttribute(key, v);
                                }, true);
                            }
                        }
                        else {
                            element.setAttribute(key, prop);
                        }
                    }
                }
            }
            vnode = {
                instance: element,
                props: props,
                children: null
            };
            vnode.children = createChildNodes(vnode, children);
        }
        else if (typeof type === 'function') {
            if (children !== null && props === null) {
                props = {
                    children: children
                };
            }
            else if (props !== null) {
                props.children = children;
            }
            if (typeof type === 'function' && type.name === 'Fragment') {
                let childNodes = type(props);
                //Handle the case where the single fragment children is an array of nodes passsed down from above
                while (childNodes !== null && childNodes.length > 0 && Array.isArray(childNodes[0])) {
                    childNodes = childNodes[0];
                }
                vnode = {
                    instance: null,
                    props,
                    children: childNodes
                };
            }
            else {
                let instance;
                const pluginSystem = (window._pluginSystem);
                try {
                    instance = type(props);
                }
                catch (_a) {
                    let pluginInstance = undefined;
                    if (pluginSystem !== undefined) {
                        pluginInstance = pluginSystem.onComponentCreating(type, props);
                    }
                    if (pluginInstance !== undefined) {
                        instance = pluginInstance;
                    }
                    else {
                        instance = new type(props);
                    }
                }
                if (props !== null && props.ref !== null && props.ref !== undefined) {
                    props.ref.instance = instance;
                }
                if (instance.contextType !== undefined) {
                    instance.context = instance.contextType.map(c => Subject.create(c.defaultValue));
                }
                if (pluginSystem !== undefined) {
                    pluginSystem.onComponentCreated(instance);
                }
                vnode = {
                    instance,
                    props,
                    children: [instance.render()]
                };
            }
        }
        return vnode;
    }
    FSComponent.buildComponent = buildComponent;
    /**
     * Creates the collection of child VNodes.
     * @param parent The parent VNode.
     * @param children The JSX children to convert to nodes.
     * @returns A collection of child VNodes.
     */
    function createChildNodes(parent, children) {
        let vnodes = null;
        if (children !== null && children !== undefined && children.length > 0) {
            vnodes = [];
            for (const child of children) {
                if (child !== null) {
                    if (child instanceof Array) {
                        const arrayNodes = createChildNodes(parent, child);
                        if (arrayNodes !== null) {
                            vnodes.push(...arrayNodes);
                        }
                    }
                    else if (typeof child === 'object') {
                        if ('isSubscribable' in child) {
                            const node = {
                                instance: child,
                                children: null,
                                props: null,
                                root: undefined,
                            };
                            child.sub((v) => {
                                if (node.root !== undefined) {
                                    // TODO workaround. gotta find a solution for the text node vanishing when text is empty
                                    node.root.nodeValue = (v === '' || v === null || v === undefined)
                                        ? ' '
                                        : v.toString();
                                }
                                else {
                                    // for debugging
                                    // console.warn('Subject has no node!');
                                }
                            });
                            vnodes.push(node);
                        }
                        else {
                            vnodes.push(child);
                        }
                    }
                    else if (typeof child === 'string' || typeof child === 'number') {
                        vnodes.push(createStaticContentNode(child));
                    }
                }
            }
        }
        return vnodes;
    }
    FSComponent.createChildNodes = createChildNodes;
    /**
     * Creates a static content VNode.
     * @param content The content to create a node for.
     * @returns A static content VNode.
     */
    function createStaticContentNode(content) {
        return {
            instance: content,
            children: null,
            props: null
        };
    }
    FSComponent.createStaticContentNode = createStaticContentNode;
    /**
     * Renders a VNode to a DOM element.
     * @param node The node to render.
     * @param element The DOM element to render to.
     * @param position The RenderPosition to put the item in.
     */
    function render(node, element, position = RenderPosition.In) {
        if (node.children && node.children.length > 0 && element !== null) {
            const componentInstance = node.instance;
            if (componentInstance !== null && componentInstance.onBeforeRender !== undefined) {
                componentInstance.onBeforeRender();
            }
            if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
                insertNode(node, position, element);
            }
            else {
                if (position === RenderPosition.After) {
                    for (let i = node.children.length - 1; i >= 0; i--) {
                        if (node.children[i] === undefined || node.children[i] === null) {
                            continue;
                        }
                        insertNode(node.children[i], position, element);
                    }
                }
                else {
                    for (let i = 0; i < node.children.length; i++) {
                        if (node.children[i] === undefined || node.children[i] === null) {
                            continue;
                        }
                        insertNode(node.children[i], position, element);
                    }
                }
            }
            const instance = node.instance;
            if (instance instanceof ContextProvider) {
                visitNodes(node, (n) => {
                    if (n === undefined || n === null) {
                        return false;
                    }
                    const nodeInstance = n.instance;
                    if (nodeInstance !== null && nodeInstance.contextType !== undefined) {
                        const contextSlot = nodeInstance.contextType.indexOf(instance.parent);
                        if (contextSlot >= 0) {
                            if (nodeInstance.context === undefined) {
                                nodeInstance.context = [];
                            }
                            nodeInstance.context[contextSlot].set(instance.props.value);
                        }
                        if (nodeInstance instanceof ContextProvider && nodeInstance !== instance && nodeInstance.parent === instance.parent) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            if (componentInstance !== null && componentInstance.onAfterRender !== undefined) {
                const pluginSystem = (window._pluginSystem);
                componentInstance.onAfterRender(node);
                if (pluginSystem !== undefined) {
                    pluginSystem.onComponentRendered(node);
                }
            }
        }
    }
    FSComponent.render = render;
    /**
     * Inserts a node into the DOM.
     * @param node The node to insert.
     * @param position The position to insert the node in.
     * @param element The element to insert relative to.
     */
    function insertNode(node, position, element) {
        var _a, _b, _c, _d, _e, _f;
        if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
            switch (position) {
                case RenderPosition.In:
                    element.appendChild(node.instance);
                    node.root = (_a = element.lastChild) !== null && _a !== void 0 ? _a : undefined;
                    break;
                case RenderPosition.Before:
                    element.insertAdjacentElement('beforebegin', node.instance);
                    node.root = (_b = element.previousSibling) !== null && _b !== void 0 ? _b : undefined;
                    break;
                case RenderPosition.After:
                    element.insertAdjacentElement('afterend', node.instance);
                    node.root = (_c = element.nextSibling) !== null && _c !== void 0 ? _c : undefined;
                    break;
            }
            if (node.children !== null) {
                for (const child of node.children) {
                    insertNode(child, RenderPosition.In, node.instance);
                }
            }
        }
        else if (typeof node.instance === 'string'
            || (typeof node.instance === 'object'
                && node.instance !== null &&
                'isSubscribable' in node.instance)) {
            let toRender;
            if (typeof node.instance === 'string') {
                toRender = node.instance;
            }
            else {
                toRender = node.instance.get();
                if (toRender === '') {
                    toRender = ' '; // prevent disappearing text node
                }
            }
            switch (position) {
                case RenderPosition.In:
                    element.insertAdjacentHTML('beforeend', toRender);
                    node.root = (_d = element.lastChild) !== null && _d !== void 0 ? _d : undefined;
                    break;
                case RenderPosition.Before:
                    element.insertAdjacentHTML('beforebegin', toRender);
                    node.root = (_e = element.previousSibling) !== null && _e !== void 0 ? _e : undefined;
                    break;
                case RenderPosition.After:
                    element.insertAdjacentHTML('afterend', toRender);
                    node.root = (_f = element.nextSibling) !== null && _f !== void 0 ? _f : undefined;
                    break;
            }
        }
        else if (Array.isArray(node)) {
            if (position === RenderPosition.After) {
                for (let i = node.length - 1; i >= 0; i--) {
                    render(node[i], element, position);
                }
            }
            else {
                for (let i = 0; i < node.length; i++) {
                    render(node[i], element, position);
                }
            }
        }
        else {
            render(node, element, position);
        }
    }
    /**
     * Render a node before a DOM element.
     * @param node The node to render.
     * @param element The element to render boeore.
     */
    function renderBefore(node, element) {
        render(node, element, RenderPosition.Before);
    }
    FSComponent.renderBefore = renderBefore;
    /**
     * Render a node after a DOM element.
     * @param node The node to render.
     * @param element The element to render after.
     */
    function renderAfter(node, element) {
        render(node, element, RenderPosition.After);
    }
    FSComponent.renderAfter = renderAfter;
    /**
     * Remove a previously rendered element.  Currently, this is just a simple
     * wrapper so that all of our high-level "component maniuplation" state is kept
     * in the FSComponent API, but it's not doing anything other than a simple
     * remove() on the element.   This can probably be enhanced.
     * @param element The element to remove.
     */
    function remove(element) {
        if (element !== null) {
            element.remove();
        }
    }
    FSComponent.remove = remove;
    /**
     * Creates a component or element node reference.
     * @returns A new component or element node reference.
     */
    function createRef() {
        return new NodeReference();
    }
    FSComponent.createRef = createRef;
    /**
     * Creates a new context to hold data for passing to child components.
     * @param defaultValue The default value of this context.
     * @returns A new context.
     */
    function createContext(defaultValue) {
        return new Context(defaultValue);
    }
    FSComponent.createContext = createContext;
    /**
     * Visits VNodes with a supplied visitor function within the given children tree.
     * @param node The node to visit.
     * @param visitor The visitor function to inspect VNodes with. Return true if the search should stop at the visited
     * node and not proceed any further down the node's children.
     * @returns True if the visitation should break, or false otherwise.
     */
    function visitNodes(node, visitor) {
        const stopVisitation = visitor(node);
        if (node !== undefined && node !== null && !stopVisitation && node.children !== undefined && node.children !== null) {
            for (let i = 0; i < node.children.length; i++) {
                visitNodes(node.children[i], visitor);
            }
        }
        return true;
    }
    FSComponent.visitNodes = visitNodes;
    /**
     * Parses a space-delimited CSS class string into an array of CSS classes.
     * @param classString A space-delimited CSS class string.
     * @returns An array of CSS classes derived from the specified CSS class string.
     */
    function parseCssClassesFromString(classString) {
        return classString.split(' ').filter(str => str !== '');
    }
    FSComponent.parseCssClassesFromString = parseCssClassesFromString;
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
    function bindCssClassSet(setToBind, classesToSubscribe, reservedClasses) {
        const reservedClassSet = new Set(reservedClasses);
        if (reservedClassSet.size === 0) {
            return classesToSubscribe.sub((set, type, key) => {
                if (type === SubscribableSetEventType.Added) {
                    setToBind.add(key);
                }
                else {
                    setToBind.delete(key);
                }
            }, true);
        }
        else {
            return classesToSubscribe.sub((set, type, key) => {
                if (reservedClassSet.has(key)) {
                    return;
                }
                if (type === SubscribableSetEventType.Added) {
                    setToBind.add(key);
                }
                else {
                    setToBind.delete(key);
                }
            }, true);
        }
    }
    FSComponent.bindCssClassSet = bindCssClassSet;
    /**
     * An empty callback handler.
     */
    FSComponent.EmptyHandler = () => { return; };
})(FSComponent || (FSComponent = {}));
/**
 * A system that handles the registration and boostrapping of plugin scripts.
 */
export class PluginSystem {
    constructor() {
        this.scripts = [];
        this.plugins = [];
        /** An event subscribable that publishes when a new component is about to be created. */
        this.creatingHandlers = [];
        /** An event subscribable that publishes when a new component is created. */
        this.createdHandlers = [];
        /** An event subscribable that publishes when a component has finished rendering. */
        this.renderedHandlers = [];
    }
    /**
     * Adds plugin scripts to load to the system.
     * @param document The panel.xml document to load scripts from.
     * @param instrumentId The ID of the instrument.
     */
    addScripts(document, instrumentId) {
        let pluginTags = undefined;
        const instrumentConfigs = document.getElementsByTagName('Instrument');
        for (let i = 0; i < instrumentConfigs.length; i++) {
            const el = instrumentConfigs.item(i);
            if (el !== null) {
                const nameEl = el.getElementsByTagName('Name');
                if (nameEl.length > 0 && nameEl[0].textContent === instrumentId) {
                    pluginTags = el.getElementsByTagName('Plugin');
                }
            }
        }
        if (pluginTags !== undefined) {
            for (let i = 0; i < pluginTags.length; i++) {
                const scriptUri = pluginTags[i].textContent;
                if (scriptUri !== null) {
                    this.scripts.push(scriptUri);
                }
            }
        }
    }
    /**
     * Starts the plugin system with the included avionics specific plugin binder.
     * @param binder The plugin binder to pass to the individual plugins.
     */
    async startSystem(binder) {
        window._pluginSystem = this;
        this.binder = binder;
        const loadPromises = [];
        for (const script of this.scripts) {
            const scriptTag = document.createElement('script');
            scriptTag.src = script;
            scriptTag.async = false;
            document.head.append(scriptTag);
            loadPromises.push(new Promise((resolve, reject) => {
                scriptTag.onload = () => resolve();
                scriptTag.onerror = (ev) => reject(ev);
            }).catch(e => console.error(e)));
        }
        await Promise.all(loadPromises).then(() => {
            for (const plugin of this.plugins) {
                plugin.onInstalled();
            }
        });
    }
    /**
     * Adds a plugin to the plugin system.
     * @param plugin The plugin to add.
     */
    addPlugin(plugin) {
        this.plugins.push(plugin);
    }
    /**
     * Runs the provided function on all of the registered plugins.
     * @param fun The function to run.
     */
    callPlugins(fun) {
        for (const plugin of this.plugins) {
            fun(plugin);
        }
    }
    /**
     * Subscribes a handler to the component creating hook.
     * @param handler The handler to subscribe.
     */
    subscribeOnComponentCreating(handler) {
        this.creatingHandlers.push(handler);
    }
    /**
     * A hook that allows plugins to replace components that are about to be created with their own implementations.
     * @param constructor The display component constructor that is going to be used.
     * @param props The component props that will be passed into the component.
     * @returns Returns either the display component that will replace, or undefined if the component should not be replaced.
     */
    onComponentCreating(constructor, props) {
        let component = undefined;
        for (let i = 0; i < this.creatingHandlers.length; i++) {
            component = this.creatingHandlers[i](constructor, props);
            if (component !== undefined) {
                return component;
            }
        }
        return undefined;
    }
    /**
     * Subscribes a handler to the component created hook.
     * @param handler The handler to subscribe.
     */
    subscribeOnComponentCreated(handler) {
        this.createdHandlers.push(handler);
    }
    /**
     * A hook that allows plugins to observe components as they are created.
     * @param component The component that was created.
     */
    onComponentCreated(component) {
        for (let i = 0; i < this.creatingHandlers.length; i++) {
            this.createdHandlers[i](component);
        }
    }
    /**
     * Subscribes a handler to the component rendered hook.
     * @param handler The handler to subscribe.
     */
    subscribeOnComponentRendered(handler) {
        this.renderedHandlers.push(handler);
    }
    /**
     * A hook that allows plugins to observe built VNodes after they are rendered.
     * @param node The node that was rendered.
     */
    onComponentRendered(node) {
        for (let i = 0; i < this.creatingHandlers.length; i++) {
            this.renderedHandlers[i](node);
        }
    }
}
/**
 * A plugin that is created and managed by the plugin system.
 */
export class AvionicsPlugin {
    /**
     * Creates an instance of a Plugin.
     * @param binder The avionics specific plugin binder to accept from the system.
     */
    constructor(binder) {
        this.binder = binder;
    }
    /**
     * Loads a CSS file into the instrument.
     * @param uri The URI to the CSS file.
     */
    async loadCss(uri) {
        const linkTag = document.createElement('link');
        linkTag.rel = 'stylesheet';
        linkTag.href = uri;
        document.head.append(linkTag);
        return new Promise((resolve) => {
            linkTag.onload = () => resolve();
        });
    }
}
/**
 * Registers a plugin with the plugin system.
 * @param plugin The plugin to register.
 */
export function registerPlugin(plugin) {
    const pluginSystem = window._pluginSystem;
    if (pluginSystem.binder !== undefined) {
        const instance = new plugin(pluginSystem.binder);
        pluginSystem.addPlugin(instance);
        if (instance.onComponentCreating !== undefined) {
            pluginSystem.subscribeOnComponentCreating(instance.onComponentCreating);
        }
        if (instance.onComponentCreated !== undefined) {
            pluginSystem.subscribeOnComponentCreated(instance.onComponentCreated);
        }
        if (instance.onComponentRendered !== undefined) {
            pluginSystem.subscribeOnComponentRendered(instance.onComponentRendered);
        }
    }
}
const Fragment = FSComponent.Fragment;
export { Fragment };
