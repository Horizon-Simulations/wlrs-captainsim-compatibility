import { Consumer, EventBus } from '../data';
import { UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue } from './UserSetting';
/**
 * An aliased user setting manager which can dynamically (re)define the settings from which its aliased settings are
 * sourced.
 */
export declare class AliasedUserSettingManager<T extends UserSettingRecord> implements UserSettingManager<T> {
    private readonly bus;
    private readonly aliasedSettings;
    private manager?;
    /**
     * Constructor.
     * @param bus The bus used by this manager to publish setting change events.
     * @param settingDefs The setting definitions used to initialize this manager's settings. The definitions should
     * define the settings' aliased names.
     */
    constructor(bus: EventBus, settingDefs: readonly UserSettingDefinition<T[keyof T & string]>[]);
    /**
     * Defines the mappings from this manager's aliased settings to their source settings. Once the mappings are defined,
     * each aliased setting will take the value of its source setting, and setting the value of the aliased setting will
     * also set the value of the source setting. If a source setting cannot be defined for an aliased setting, the
     * aliased setting's value will be fixed to its default value and cannot be changed.
     * @param masterManager The manager hosting the settings from which this manager's aliased settings will be sourced.
     * @param map The mappings for this manager's aliased settings, as a set of key-value pairs where the keys are the
     * aliased setting names and the values are the source setting names. For any aliased setting whose name does not
     * appear as a key in the mapping, its source setting is assumed to have the same name.
     */
    useAliases<O extends UserSettingRecord>(masterManager: UserSettingManager<O>, map: UserSettingMap<T, O>): void;
    /** @inheritdoc */
    tryGetSetting<K extends string>(name: K): UserSetting<NonNullable<T[K]>> | undefined;
    /** @inheritdoc */
    getSetting<K extends keyof T & string>(name: K): UserSetting<NonNullable<T[K]>>;
    /** @inheritdoc */
    whenSettingChanged<K extends keyof T & string>(name: K): Consumer<NonNullable<T[K]>>;
    /** @inheritdoc */
    getAllSettings(): UserSetting<UserSettingValue>[];
    /** @inheritdoc */
    mapTo<M extends Record<any, UserSettingValue>>(map: UserSettingMap<M, T>): UserSettingManager<M & T>;
}
//# sourceMappingURL=AliasedUserSettingManager.d.ts.map