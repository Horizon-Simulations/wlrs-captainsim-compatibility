/// <reference types="msfstypes/pages/vcockpit/instruments/shared/utils/xmllogic" />
import { EventBus } from '../data/EventBus';
import { ElectricalEvents } from '../instruments/Electrical';
import { Subscription } from '../sub/Subscription';
import { DebounceTimer } from '../utils/time/DebounceTimer';
import { AvionicsSystem, AvionicsSystemState, AvionicsSystemStateEvent } from './AvionicsSystem';
/** A type that pulls keys that have avionics state events from a supplied generic type. */
declare type StateEventsOnly<T> = {
    [K in keyof T as T[K] extends AvionicsSystemStateEvent ? K : never]: T[K];
};
/** The subset of electrical events that have boolean values.  */
declare type ElectricalBools = {
    [K in keyof ElectricalEvents]: ElectricalEvents[K] extends boolean ? ElectricalEvents[K] : never;
};
/**
 * An electrical system key to which system power can be connected.
 */
export declare type SystemPowerKey = keyof ElectricalBools;
/**
 * A basic avionics system with a fixed initialization time and logic.
 */
export declare abstract class BasicAvionicsSystem<T extends Record<string, any>> implements AvionicsSystem {
    readonly index: number;
    protected readonly bus: EventBus;
    protected readonly stateEvent: keyof StateEventsOnly<T> & string;
    protected _state: AvionicsSystemState | undefined;
    /** @inheritdoc */
    get state(): AvionicsSystemState | undefined;
    /** The time it takes in milliseconds for the system to initialize. */
    protected initializationTime: number;
    /** A timeout after which initialization will be complete. */
    protected readonly initializationTimer: DebounceTimer;
    /** Whether or not the system is powered. */
    protected isPowered: boolean | undefined;
    protected electricalPowerSub?: Subscription;
    protected electricalPowerLogic?: CompositeLogicXMLElement;
    /**
     * Creates an instance of a BasicAvionicsSystem.
     * @param index The index of the system.
     * @param bus The instance of the event bus for the system to use.
     * @param stateEvent The key of the state update event to send on state update.
     */
    constructor(index: number, bus: EventBus, stateEvent: keyof StateEventsOnly<T> & string);
    /**
     * Connects this system's power state to an {@link ElectricalEvents} topic or electricity logic element.
     * @param source The source to which to connect this system's power state.
     */
    protected connectToPower(source: SystemPowerKey | CompositeLogicXMLElement): void;
    /**
     * Sets the state of the avionics system and publishes the change.
     * @param state The new state to change to.
     */
    protected setState(state: AvionicsSystemState): void;
    /**
     * Responds to changes in this system's state.
     * @param previousState The previous state.
     * @param currentState The current state.
     */
    protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void;
    /**
     * A callback called when the connected power state of the avionics system changes.
     * @param isPowered Whether or not the system is powered.
     */
    protected onPowerChanged(isPowered: boolean): void;
    /** @inheritdoc */
    onUpdate(): void;
    /**
     * Updates this system's power state from an electricity logic element.
     */
    protected updatePowerFromLogic(): void;
}
export {};
//# sourceMappingURL=BasicAvionicsSystem.d.ts.map