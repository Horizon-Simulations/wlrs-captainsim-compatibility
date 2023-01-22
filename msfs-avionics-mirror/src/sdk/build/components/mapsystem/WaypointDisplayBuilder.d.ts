import { Waypoint } from '../../navigation/Waypoint';
import { MapCullableLocationTextLabel } from '../map/MapCullableTextLabel';
import { MapWaypointIcon } from '../map/MapWaypointIcon';
import { MapSystemIconFactory, MapSystemLabelFactory, MapSystemWaypointsRenderer } from './MapSystemWaypointsRenderer';
/**
 * A class that builds a configuration for the waypoint display.
 */
export declare class WaypointDisplayBuilder {
    protected readonly iconFactory: MapSystemIconFactory;
    protected readonly labelFactory: MapSystemLabelFactory;
    protected readonly waypointRenderer: MapSystemWaypointsRenderer;
    protected roleGroup: string;
    protected isCenterTarget: boolean;
    /**
     * Creates an instance of the WaypointDisplayBuilder.
     * @param iconFactory The icon factory to use with this builder.
     * @param labelFactory The label factory to use with this builder.
     * @param waypointRenderer The waypoint renderer to use with this builder.
     */
    constructor(iconFactory: MapSystemIconFactory, labelFactory: MapSystemLabelFactory, waypointRenderer: MapSystemWaypointsRenderer);
    /**
     * Adds a icon configuration to the waypoint display system.
     * @param role The role to add this waypoint display config for.
     * @param type The type of waypoint to add an icon for.
     * @param config The waypoint icon factory to add as a configuration.
     * @returns The modified builder.
     */
    addIcon<T extends Waypoint>(role: number | string, type: string, config: (waypoint: T) => MapWaypointIcon<T>): this;
    /**
     * Adds a default icon configuration to the waypoint display system, if no other configuration is found.
     * @param role The role to add this waypoint display config for.
     * @param config The waypoint icon factory to add as a configuration.
     * @returns The modified builder.
     */
    addDefaultIcon<T extends Waypoint>(role: number | string, config: (waypoint: T) => MapWaypointIcon<T>): this;
    /**
     * Adds a label configuration to the waypoint display system.
     * @param role The role to add this waypoint display config for.
     * @param type The type of waypoint to add an label for.
     * @param config The waypoint label factory to add as a configuration.
     * @returns The modified builder.
     */
    addLabel<T extends Waypoint>(role: number | string, type: string, config: (waypoint: T) => MapCullableLocationTextLabel): this;
    /**
     * Adds a label configuration to the waypoint display system.
     * @param role The role to add this waypoint display config for.
     * @param config The waypoint label factory to add as a configuration.
     * @returns The modified builder.
     */
    addDefaultLabel<T extends Waypoint>(role: number | string, config: (waypoint: T) => MapCullableLocationTextLabel): this;
    /**
     * Determines the role ID given either a numeric or string based role.
     * @param role The role to determine.
     * @returns The numeric role ID.
     */
    private determineRoleId;
    /**
     * Registers a waypoint display role for use with the flight plan rendering
     * system.
     * @param name The name of the role to register.
     * @returns The modified builder.
     */
    registerRole(name: string): this;
    /**
     * Gets the ID of a role in the waypoint display system.
     * @param role The name of the role to get the ID for.
     * @returns The ID of the role.
     * @throws An error if an invalid role name is supplied.
     */
    getRoleId(role: string): number;
    /**
     * Configures the center for waypoint searches for this display.
     * @param center If center, then waypoint searches will use the map center. If target,
     * waypoint searches will use the map target with offset.
     * @returns The modified builder.
     */
    withSearchCenter(center: 'center' | 'target'): this;
    /**
     * Gets if the waypoint search is using the map target with offset as the search center.
     * @returns True if the search center is the map target, false if it is the map center.
     */
    getIsCenterTarget(): boolean;
}
//# sourceMappingURL=WaypointDisplayBuilder.d.ts.map