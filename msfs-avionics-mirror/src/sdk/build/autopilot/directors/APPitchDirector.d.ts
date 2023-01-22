import { EventBus } from '../../data';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';
/**
 * An autopilot pitch director.
 */
export declare class APPitchDirector implements PlaneDirector {
    private readonly bus;
    private readonly apValues;
    private readonly pitchIncrement;
    private readonly minPitch;
    private readonly maxPitch;
    state: DirectorState;
    private keyInterceptManager?;
    /** A callback called when the director activates. */
    onActivate?: () => void;
    /** A callback called when the director arms. */
    onArm?: () => void;
    private selectedPitch;
    private currentPitch;
    /**
     * Creates an instance of the LateralDirector.
     * @param bus The event bus to use with this instance.
     * @param apValues are the AP Values subjects.
     * @param pitchIncrement is the pitch increment, in degrees, to use when the user presses the pitch inc/dec keys (default: 0.5)
     * @param minPitch is the negative minimum pitch angle, in degrees, to clamp the pitch to. (default: -15)
     * @param maxPitch is the positive maximum pitch angle, in degrees, to clamp the pitch to. (default: 20)
     */
    constructor(bus: EventBus, apValues: APValues, pitchIncrement?: number, minPitch?: number, maxPitch?: number);
    /**
     * Activates this director.
     */
    activate(): void;
    /**
     * Arms this director.
     * This director has no armed mode, so it activates immediately.
     */
    arm(): void;
    /**
     * Deactivates this director.
     */
    deactivate(): void;
    /**
     * Responds to key intercepted events.
     * @param k the key event data
     */
    private onKeyIntercepted;
    /**
     * Updates this director.
     */
    update(): void;
    /**
     * Sets the desired AP pitch angle.
     * @param targetPitch The desired AP pitch angle.
     */
    private setPitch;
}
//# sourceMappingURL=APPitchDirector.d.ts.map