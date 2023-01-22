import { Consumer } from '../data/Consumer';
import { EventBus, Publisher } from '../data/EventBus';
import { EventSubscriber } from '../data/EventSubscriber';
import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { MutableSubscribable } from '../sub/Subscribable';
/** The supported data types for a user setting. */
export declare type UserSettingValue = boolean | number | string;
/**
 * A definition for a user setting.
 */
export interface UserSettingDefinition<T extends UserSettingValue> {
    /** The name of this setting. */
    readonly name: string;
    /** The default value of this setting. */
    readonly defaultValue: T;
}
/**
 * A user setting.
 */
export interface UserSetting<T extends UserSettingValue> extends MutableSubscribable<T> {
    /** This setting's definition. */
    readonly definition: UserSettingDefinition<T>;
    /** This setting's current value. */
    value: T;
    /** Resets this setting to its default value. */
    resetToDefault(): void;
}
/**
 * An entry for a user setting in UserSettingManager.
 */
export declare type UserSettingManagerEntry<T extends UserSettingValue> = {
    /** A user setting. */
    setting: SyncableUserSetting<T>;
    /** The event topic used to sync the setting. */
    syncTopic: string;
    /** The timestamp of the most recent sync event. */
    syncTime: number;
};
/**
 * Data provided for a setting sync event.
 */
export declare type UserSettingManagerSyncData<T extends UserSettingValue> = {
    /** The synced value of the setting. */
    value: T;
    /** The timestamp of this sync event. */
    syncTime: number;
};
/**
 * A record which maps user setting names to user setting value types.
 */
export declare type UserSettingRecord = Record<any, UserSettingValue>;
/**
 * Filters a record of user settings to just those settings whose values extend a certain type.
 */
export declare type UserSettingValueFilter<T extends UserSettingRecord, V> = {
    [Property in keyof T as (T[Property] extends V ? Property : never)]: T[Property];
};
/**
 * A user setting type derived from a user setting record. If the provided key does not exist in the record, a type of
 * `undefined` is returned. If the provided key is optional in the record, a union type of `UserSetting<T> | undefined`
 * is returned, where `T` is the value type mapped to the key in the record.
 */
export declare type UserSettingFromRecord<R extends UserSettingRecord, K extends string> = K extends keyof R ? R[K] extends NonNullable<R[K]> ? UserSetting<R[K]> : UserSetting<NonNullable<R[K]>> | undefined : undefined;
/**
 * An entry that maps one set of setting definitions to another.
 */
export declare type UserSettingMap<Aliased, Original> = {
    [Property in keyof Aliased]?: keyof Original;
};
/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus.
 */
export interface UserSettingManager<T extends UserSettingRecord> {
    /**
     * Attempts to get a setting from this manager.
     * @param name The name of the setting to get.
     * @returns The requested setting, or `undefined` if no such setting exists.
     */
    tryGetSetting<K extends string>(name: K): UserSetting<NonNullable<T[K]>> | undefined;
    /**
     * Gets a setting from this manager.
     * @param name The name of the setting to get.
     * @returns The requested setting.
     * @throws Error if no setting with the specified name exists.
     */
    getSetting<K extends keyof T & string>(name: K): UserSetting<NonNullable<T[K]>>;
    /**
     * Gets a consumer which notifies handlers when the value of a setting changes.
     * @param name The name of a setting.
     * @returns a consumer which notifies handlers when the value of the setting changes.
     * @throws Error if no setting with the specified name exists.
     */
    whenSettingChanged<K extends keyof T & string>(name: K): Consumer<NonNullable<T[K]>>;
    /**
     * Gets an array of all settings of this manager.
     * @returns an array of all settings of this manager.
     */
    getAllSettings(): UserSetting<UserSettingValue>[];
    /**
     * Maps a subset of this manager's settings to ones with aliased names, and creates a new setting manager which
     * supports accessing the settings using their aliases.
     * @param map A map defining the aliases of a subset of this manager's settings, with aliased setting names as keys
     * and original setting names as values.
     * @returns A new setting manager which supports accessing a subset of this manager's settings using aliased names.
     */
    mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, T>): UserSettingManager<M & T>;
}
/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus.
 */
export declare class DefaultUserSettingManager<T extends UserSettingRecord> implements UserSettingManager<T> {
    protected readonly bus: EventBus;
    private static readonly SYNC_TOPIC_PREFIX;
    protected readonly settings: Map<string, UserSettingManagerEntry<UserSettingValue>>;
    protected readonly publisher: Publisher<any>;
    protected readonly subscriber: EventSubscriber<any>;
    /**
     * Constructor.
     * @param bus The bus used by this manager to publish setting change events.
     * @param settingDefs The setting definitions used to initialize this manager's settings.
     */
    constructor(bus: EventBus, settingDefs: readonly UserSettingDefinition<T[keyof T]>[]);
    /** @inheritdoc */
    tryGetSetting<K extends string>(name: K): UserSetting<NonNullable<T[K]>> | undefined;
    /** @inheritdoc */
    getSetting<K extends keyof T & string>(name: K): UserSetting<NonNullable<T[K]>>;
    /** @inheritdoc */
    getAllSettings(): UserSetting<UserSettingValue>[];
    /** @inheritdoc */
    whenSettingChanged<K extends keyof T & string>(name: K): Consumer<NonNullable<T[K]>>;
    /** @inheritdoc */
    mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, T>): MappedUserSettingManager<M, T>;
    /**
     * A callback which is called when one of this manager's settings has its value changed locally.
     * @param entry The entry for the setting that was changed.
     * @param value The new value of the setting.
     */
    protected onSettingValueChanged<K extends keyof T>(entry: UserSettingManagerEntry<T[K]>, value: T[K]): void;
    /**
     * A callback which is called when a setting changed event is received over the event bus.
     * @param entry The entry for the setting that was changed.
     * @param data The sync data.
     */
    protected onSettingValueSynced<K extends keyof T>(entry: UserSettingManagerEntry<T[K]>, data: UserSettingManagerSyncData<T[K]>): void;
}
/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus, using a mapping from
 * abstracted settings keys to true underlying settings keys.
 */
export declare class MappedUserSettingManager<T extends UserSettingRecord, O extends UserSettingRecord> implements UserSettingManager<T & O> {
    private readonly parent;
    private readonly map;
    /**
     * Creates an instance of a MappedUserSettingManager.
     * @param parent The parent setting manager.
     * @param map The map of abstracted keys to true underlying keys.
     */
    constructor(parent: UserSettingManager<O>, map: UserSettingMap<T, O>);
    /** @inheritdoc */
    tryGetSetting<K extends string>(name: K): UserSetting<NonNullable<(T & O)[K]>> | undefined;
    /** @inheritdoc */
    getSetting<K extends keyof T & string>(name: K): UserSetting<NonNullable<(T & O)[K]>>;
    /** @inheritdoc */
    whenSettingChanged<K extends keyof T & string>(name: K): Consumer<NonNullable<(T & O)[K]>>;
    /** @inheritdoc */
    getAllSettings(): UserSetting<UserSettingValue>[];
    /** @inheritdoc */
    mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, T & O>): MappedUserSettingManager<M, T & O>;
}
/**
 * An implementation of a user setting which can be synced across multiple instances.
 */
declare class SyncableUserSetting<T extends UserSettingValue> extends AbstractSubscribable<T> implements UserSetting<T> {
    readonly definition: UserSettingDefinition<T>;
    private readonly valueChangedCallback;
    readonly isMutableSubscribable = true;
    private _value;
    /** This setting's current value. */
    get value(): T;
    set value(v: T);
    /**
     * Constructor.
     * @param definition This setting's definition.
     * @param valueChangedCallback A function to be called whenever the value of this setting changes.
     */
    constructor(definition: UserSettingDefinition<T>, valueChangedCallback: (value: T) => void);
    /**
     * Syncs this setting to a value. This will not trigger a call to valueChangedCallback.
     * @param value The value to which to sync.
     */
    syncValue(value: T): void;
    /** @inheritdoc */
    get(): T;
    /**
     * Sets the value of this setting.
     * @param value The new value.
     */
    set(value: T): void;
    /** @inheritdoc */
    resetToDefault(): void;
}
export {};
//# sourceMappingURL=UserSetting.d.ts.map