import { DebounceTimer } from '../utils/time/DebounceTimer';
import { AvionicsSystemState } from './AvionicsSystem';
/**
 * A basic avionics system with a fixed initialization time and logic.
 */
export class BasicAvionicsSystem {
    /**
     * Creates an instance of a BasicAvionicsSystem.
     * @param index The index of the system.
     * @param bus The instance of the event bus for the system to use.
     * @param stateEvent The key of the state update event to send on state update.
     */
    constructor(index, bus, stateEvent) {
        this.index = index;
        this.bus = bus;
        this.stateEvent = stateEvent;
        /** The time it takes in milliseconds for the system to initialize. */
        this.initializationTime = 0;
        /** A timeout after which initialization will be complete. */
        this.initializationTimer = new DebounceTimer();
    }
    /** @inheritdoc */
    get state() {
        return this._state;
    }
    /**
     * Connects this system's power state to an {@link ElectricalEvents} topic or electricity logic element.
     * @param source The source to which to connect this system's power state.
     */
    connectToPower(source) {
        var _a;
        (_a = this.electricalPowerSub) === null || _a === void 0 ? void 0 : _a.destroy();
        this.electricalPowerSub = undefined;
        this.electricalPowerLogic = undefined;
        if (typeof source === 'string') {
            this.electricalPowerSub = this.bus.getSubscriber()
                .on(source)
                .whenChanged()
                .handle(this.onPowerChanged.bind(this));
        }
        else {
            this.electricalPowerLogic = source;
            this.updatePowerFromLogic();
        }
    }
    /**
     * Sets the state of the avionics system and publishes the change.
     * @param state The new state to change to.
     */
    setState(state) {
        if (this._state !== state) {
            const previous = this._state;
            this._state = state;
            this.onStateChanged(previous, state);
            this.bus.pub(this.stateEvent, { index: this.index, previous, current: state });
        }
    }
    /**
     * Responds to changes in this system's state.
     * @param previousState The previous state.
     * @param currentState The current state.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onStateChanged(previousState, currentState) {
        // noop
    }
    /**
     * A callback called when the connected power state of the avionics system changes.
     * @param isPowered Whether or not the system is powered.
     */
    onPowerChanged(isPowered) {
        if (this.isPowered === undefined) {
            this.initializationTimer.clear();
            if (isPowered) {
                this.setState(AvionicsSystemState.On);
            }
            else {
                this.setState(AvionicsSystemState.Off);
            }
        }
        else {
            if (isPowered) {
                this.setState(AvionicsSystemState.Initializing);
                this.initializationTimer.schedule(() => this.setState(AvionicsSystemState.On), this.initializationTime);
            }
            else {
                this.initializationTimer.clear();
                this.setState(AvionicsSystemState.Off);
            }
        }
        this.isPowered = isPowered;
    }
    /** @inheritdoc */
    onUpdate() {
        this.updatePowerFromLogic();
    }
    /**
     * Updates this system's power state from an electricity logic element.
     */
    updatePowerFromLogic() {
        if (this.electricalPowerLogic === undefined) {
            return;
        }
        const isPowered = this.electricalPowerLogic.getValue() !== 0;
        if (isPowered !== this.isPowered) {
            this.onPowerChanged(isPowered);
        }
    }
}
