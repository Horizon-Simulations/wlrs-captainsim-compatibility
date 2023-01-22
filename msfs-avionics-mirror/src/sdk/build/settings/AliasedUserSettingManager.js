import { BasicConsumer } from '../data';
import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { MappedUserSettingManager } from './UserSetting';
/**
 * An aliased user setting manager which can dynamically (re)define the settings from which its aliased settings are
 * sourced.
 */
export class AliasedUserSettingManager {
    /**
     * Constructor.
     * @param bus The bus used by this manager to publish setting change events.
     * @param settingDefs The setting definitions used to initialize this manager's settings. The definitions should
     * define the settings' aliased names.
     */
    constructor(bus, settingDefs) {
        this.bus = bus;
        this.aliasedSettings = new Map(settingDefs.map(def => [def.name, new AliasedUserSetting(def)]));
    }
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
    useAliases(masterManager, map) {
        this.manager = masterManager.mapTo(map);
        for (const aliasedSetting of this.aliasedSettings.values()) {
            aliasedSetting.useSource(this.manager.tryGetSetting(aliasedSetting.definition.name));
        }
    }
    /** @inheritdoc */
    tryGetSetting(name) {
        return this.aliasedSettings.get(name);
    }
    /** @inheritdoc */
    getSetting(name) {
        const setting = this.tryGetSetting(name);
        if (setting === undefined) {
            throw new Error(`AliasedUserSettingManager: Could not find setting with name ${name}`);
        }
        return setting;
    }
    /** @inheritdoc */
    whenSettingChanged(name) {
        const setting = this.aliasedSettings.get(name);
        if (!setting) {
            throw new Error(`AliasedUserSettingManager: Could not find setting with name ${name}`);
        }
        return new BasicConsumer((handler, paused) => {
            return setting.sub(handler, true, paused);
        }).whenChanged();
    }
    /** @inheritdoc */
    getAllSettings() {
        return Array.from(this.aliasedSettings.values());
    }
    /** @inheritdoc */
    mapTo(map) {
        return new MappedUserSettingManager(this, map);
    }
}
/**
 * A user setting with a value which is sourced from another setting. While the setting has no source, its value is
 * fixed to its default value and cannot be changed.
 */
class AliasedUserSetting extends AbstractSubscribable {
    /**
     * Constructor.
     * @param definition This setting's definition.
     */
    constructor(definition) {
        super();
        this.definition = definition;
        this.isMutableSubscribable = true;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** This setting's current value. */
    get value() {
        var _a, _b;
        return (_b = (_a = this.setting) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.definition.defaultValue;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set value(v) {
        this.setting && (this.setting.value = v);
    }
    /**
     * Sets this setting's source.
     * @param setting The user setting to use as the new source, or `undefined` to leave this setting without a source.
     */
    useSource(setting) {
        var _a;
        const oldValue = this.value;
        (_a = this.settingSub) === null || _a === void 0 ? void 0 : _a.destroy();
        this.setting = setting;
        if (setting !== undefined) {
            this.settingSub = setting.sub(() => { this.notify(); });
        }
        else {
            this.settingSub = undefined;
        }
        if (oldValue !== this.value) {
            this.notify();
        }
    }
    /** @inheritdoc */
    get() {
        return this.value;
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
