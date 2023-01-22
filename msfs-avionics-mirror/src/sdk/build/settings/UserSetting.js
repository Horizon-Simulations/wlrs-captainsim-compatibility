import { AbstractSubscribable } from '../sub/AbstractSubscribable';
/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus.
 */
export class DefaultUserSettingManager {
    /**
     * Constructor.
     * @param bus The bus used by this manager to publish setting change events.
     * @param settingDefs The setting definitions used to initialize this manager's settings.
     */
    constructor(bus, settingDefs) {
        this.bus = bus;
        this.publisher = bus.getPublisher();
        this.subscriber = bus.getSubscriber();
        this.settings = new Map(settingDefs.map(def => {
            const syncTopic = `${DefaultUserSettingManager.SYNC_TOPIC_PREFIX}${def.name}`;
            const entry = {
                syncTopic,
                syncTime: 0
            };
            entry.setting = new SyncableUserSetting(def, this.onSettingValueChanged.bind(this, entry));
            this.subscriber.on(syncTopic).handle(this.onSettingValueSynced.bind(this, entry));
            this.onSettingValueChanged(entry, entry.setting.value);
            return [def.name, entry];
        }));
    }
    /** @inheritdoc */
    tryGetSetting(name) {
        var _a;
        return (_a = this.settings.get(name)) === null || _a === void 0 ? void 0 : _a.setting;
    }
    /** @inheritdoc */
    getSetting(name) {
        const setting = this.tryGetSetting(name);
        if (setting === undefined) {
            throw new Error(`DefaultUserSettingManager: Could not find setting with name ${name}`);
        }
        return setting;
    }
    /** @inheritdoc */
    getAllSettings() {
        return Array.from(this.settings.values(), entry => entry.setting);
    }
    /** @inheritdoc */
    whenSettingChanged(name) {
        const setting = this.settings.get(name);
        if (!setting) {
            throw new Error(`DefaultUserSettingManager: Could not find setting with name ${name}`);
        }
        return this.subscriber.on(name).whenChanged();
    }
    /** @inheritdoc */
    mapTo(map) {
        return new MappedUserSettingManager(this, map);
    }
    /**
     * A callback which is called when one of this manager's settings has its value changed locally.
     * @param entry The entry for the setting that was changed.
     * @param value The new value of the setting.
     */
    onSettingValueChanged(entry, value) {
        entry.syncTime = Date.now();
        this.publisher.pub(entry.syncTopic, { value, syncTime: entry.syncTime }, true, true);
    }
    /**
     * A callback which is called when a setting changed event is received over the event bus.
     * @param entry The entry for the setting that was changed.
     * @param data The sync data.
     */
    onSettingValueSynced(entry, data) {
        // protect against race conditions by not responding to sync events older than the last time this manager synced
        // the setting
        if (data.syncTime < entry.syncTime) {
            return;
        }
        entry.syncTime = data.syncTime;
        entry.setting.syncValue(data.value);
        // publish the public setting change event. Do NOT sync across the bus because doing so can result in older events
        // being received after newer events.
        this.publisher.pub(entry.setting.definition.name, data.value, false, true);
    }
}
DefaultUserSettingManager.SYNC_TOPIC_PREFIX = 'usersetting.';
/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus, using a mapping from
 * abstracted settings keys to true underlying settings keys.
 */
export class MappedUserSettingManager {
    /**
     * Creates an instance of a MappedUserSettingManager.
     * @param parent The parent setting manager.
     * @param map The map of abstracted keys to true underlying keys.
     */
    constructor(parent, map) {
        this.parent = parent;
        this.map = map;
    }
    /** @inheritdoc */
    tryGetSetting(name) {
        var _a;
        const mappedName = ((_a = this.map[name]) !== null && _a !== void 0 ? _a : name);
        return this.parent.tryGetSetting(mappedName);
    }
    /** @inheritdoc */
    getSetting(name) {
        var _a;
        const mappedName = ((_a = this.map[name]) !== null && _a !== void 0 ? _a : name);
        return this.parent.getSetting(mappedName);
    }
    /** @inheritdoc */
    whenSettingChanged(name) {
        var _a;
        const mappedName = ((_a = this.map[name]) !== null && _a !== void 0 ? _a : name);
        return this.parent.whenSettingChanged(mappedName);
    }
    /** @inheritdoc */
    getAllSettings() {
        return this.parent.getAllSettings();
    }
    /** @inheritdoc */
    mapTo(map) {
        return new MappedUserSettingManager(this, map);
    }
}
/**
 * An implementation of a user setting which can be synced across multiple instances.
 */
class SyncableUserSetting extends AbstractSubscribable {
    /**
     * Constructor.
     * @param definition This setting's definition.
     * @param valueChangedCallback A function to be called whenever the value of this setting changes.
     */
    constructor(definition, valueChangedCallback) {
        super();
        this.definition = definition;
        this.valueChangedCallback = valueChangedCallback;
        this.isMutableSubscribable = true;
        this._value = definition.defaultValue;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** This setting's current value. */
    get value() {
        return this._value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set value(v) {
        if (this._value === v) {
            return;
        }
        this._value = v;
        this.valueChangedCallback(v);
        this.notify();
    }
    /**
     * Syncs this setting to a value. This will not trigger a call to valueChangedCallback.
     * @param value The value to which to sync.
     */
    syncValue(value) {
        if (this._value === value) {
            return;
        }
        this._value = value;
        this.notify();
    }
    /** @inheritdoc */
    get() {
        return this._value;
    }
    /**
     * Sets the value of this setting.
     * @param value The new value.
     */
    set(value) {
        this.value = value;
    }
    /** @inheritdoc */
    resetToDefault() {
        this.set(this.definition.defaultValue);
    }
}
