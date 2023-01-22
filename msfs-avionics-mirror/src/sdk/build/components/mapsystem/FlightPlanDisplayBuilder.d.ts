import { Subscribable } from '../../sub';
import { LegStyleHandler, LegWaypointHandler, MapSystemPlanRenderer } from './MapSystemPlanRenderer';
import { MapSystemIconFactory, MapSystemLabelFactory, MapSystemWaypointsRenderer } from './MapSystemWaypointsRenderer';
import { WaypointDisplayBuilder } from './WaypointDisplayBuilder';
/**
 * A class that builds the configuration for the flight plan display.
 */
export declare class FlightPlanDisplayBuilder extends WaypointDisplayBuilder {
    private readonly flightPlanRenderer;
    private readonly planIndex;
    protected roleGroup: string;
    /**
     * Creates an instance of the WaypointDisplayBuilder.
     * @param iconFactory The icon factory to use with this builder.
     * @param labelFactory The label factory to use with this builder.
     * @param waypointRenderer The waypoint renderer to use with this builder.
     * @param flightPlanRenderer The flight plan renderer to use with this builder.
     * @param planIndex The flight plan index to be displayed by this system.
     */
    constructor(iconFactory: MapSystemIconFactory, labelFactory: MapSystemLabelFactory, waypointRenderer: MapSystemWaypointsRenderer, flightPlanRenderer: MapSystemPlanRenderer, planIndex: number);
    /**
     * Registers a waypoint display role for use with the flight plan rendering
     * system.
     * @param name The name of the role to register.
     * @returns The modified builder.
     */
    registerRole(name: string): this;
    /**
     * Configures the flight path display to use styles returned by the provided function.
     * @param handler The handler to use to return the required path rendering styles.
     * @returns The modified builder.
     */
    withLegPathStyles(handler: LegStyleHandler): this;
    /**
     * Configures the flight plan waypoint display to use the roles returned by the
     * provided function.
     * @param handler The handler to use to return the required waypoint display roles.
     * @returns The modified builder.
     */
    withLegWaypointRoles(handler: LegWaypointHandler): this;
    /**
     * Configures the flight plan flight path display to set visibility of leg-to-leg
     * turn anticipation transitions.
     * @param visible Whether or not the leg-to-leg turn anticipation transitions will be visible.
     * @returns The modified builder.
     */
    withAnticipationTurns(visible: boolean | Subscribable<boolean>): this;
}
//# sourceMappingURL=FlightPlanDisplayBuilder.d.ts.map