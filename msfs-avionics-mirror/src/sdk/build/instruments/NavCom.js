import { EventSubscriber } from '../data/EventSubscriber';
import { SimVarValueType } from '../data/SimVars';
import { BasePublisher, SimVarPublisher } from './BasePublishers';
import { NavSourceType } from './NavProcessor';
import { FrequencyBank, RadioType } from './RadioCommon';
/** A publisher to poll and publish nav/com simvars. */
export class NavComSimVarPublisher extends SimVarPublisher {
    /**
     * Create a NavComSimVarPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the pace of publishing
     */
    constructor(bus, pacer = undefined) {
        super(NavComSimVarPublisher.simvars, bus, pacer);
    }
}
NavComSimVarPublisher.simvars = new Map([
    ['nav_active_frequency_1', { name: 'NAV ACTIVE FREQUENCY:1', type: SimVarValueType.MHz }],
    ['nav_standby_frequency_1', { name: 'NAV STANDBY FREQUENCY:1', type: SimVarValueType.MHz }],
    ['nav_ident_1', { name: 'NAV IDENT:1', type: SimVarValueType.String }],
    ['nav_signal_1', { name: 'NAV SIGNAL:1', type: SimVarValueType.Number }],
    ['nav_active_frequency_2', { name: 'NAV ACTIVE FREQUENCY:2', type: SimVarValueType.MHz }],
    ['nav_standby_frequency_2', { name: 'NAV STANDBY FREQUENCY:2', type: SimVarValueType.MHz }],
    ['nav_ident_2', { name: 'NAV IDENT:2', type: SimVarValueType.String }],
    ['nav_signal_2', { name: 'NAV SIGNAL:2', type: SimVarValueType.Number }],
    ['com_active_frequency_1', { name: 'COM ACTIVE FREQUENCY:1', type: SimVarValueType.MHz }],
    ['com_standby_frequency_1', { name: 'COM STANDBY FREQUENCY:1', type: SimVarValueType.MHz }],
    ['com_active_frequency_2', { name: 'COM ACTIVE FREQUENCY:2', type: SimVarValueType.MHz }],
    ['com_standby_frequency_2', { name: 'COM STANDBY FREQUENCY:2', type: SimVarValueType.MHz }],
    ['adf_standby_frequency_1', { name: 'ADF STANDBY FREQUENCY:1', type: SimVarValueType.KHz }],
    ['adf_active_frequency_1', { name: 'ADF ACTIVE FREQUENCY:1', type: SimVarValueType.KHz }],
    ['com_status_1', { name: 'COM STATUS:1', type: SimVarValueType.Number }],
    ['com_status_2', { name: 'COM STATUS:2', type: SimVarValueType.Number }]
]);
/**
 * A convenience class for creating a radio configuration set.
 *
 * Implementers should instantiate this and then populate the various maps
 * with the H events that their radio sends and which displays they affect.
 */
export class NavComConfig {
    constructor() {
        this.navSwitchEvents = new Map();
        this.navSelectorEvents = new Map();
        this.navWholeIncEvents = new Map();
        this.navWholeDecEvents = new Map();
        this.navFractionIncEvents = new Map();
        this.navFractionDecEvents = new Map();
        this.comSwitchEvents = new Map();
        this.comSelectorEvents = new Map();
        this.comWholeIncEvents = new Map();
        this.comWholeDecEvents = new Map();
        this.comFractionIncEvents = new Map();
        this.comFractionDecEvents = new Map();
        this.comVolumeIncEvents = new Map();
        this.comVolumeDecEvents = new Map();
        this.navVolumeIncEvents = new Map();
        this.navVolumeDecEvents = new Map();
    }
}
/**
 * Sends radio events from the nav/com controller to subscribers.
 */
class NavComPublisher extends BasePublisher {
    /**
     * Creates a NavComPublisher
     * @param bus The event bus to publish to.
     * @param pacer An optional pace to use to control the rate of publishing.
     * @param sync Whether to use synced events.
     */
    constructor(bus, pacer, sync = true) {
        super(bus, pacer);
        this.sync = sync;
    }
    /**
     * Publish a radio state event.
     *
     * This sets the complete state of a radio for initialzation or resync.
     * @param radio The Radio data to publish.
     */
    publishRadioState(radio) {
        if (radio !== undefined) {
            super.publish('set_radio_state', radio, this.sync);
        }
    }
    /**
     * Publish a frequency change event.
     *
     * Unlike a radio state event, this just changes a specific frequency.
     * We provide this to avoid issues with potentially conflicting updates
     * if active and standby get updated quickly and we send a snapshot after
     * each.
     * @param radio The Radio to change.
     * @param bank The frequency bank to update.
     * @param frequency The new frequency to set.
     */
    publishFreqChange(radio, bank, frequency) {
        if (radio !== undefined) {
            super.publish('set_frequency', { radio: radio, bank: bank, frequency: frequency }, this.sync);
        }
    }
    /**
     * Publish the ident of the currently tuned station.
     * @param index The index number of the tuned radio.
     * @param ident The ident as a string.
     */
    publishIdent(index, ident) {
        super.publish('set_ident', { index: index, ident: ident }, this.sync);
    }
    /**
     * Publish the signal strength of the currently tuned station.
     * @param index The index number of the tuned radio.
     * @param strength The signal strength as a number.
     */
    publishSignalStrength(index, strength) {
        super.publish('set_signal_strength', strength, this.sync);
    }
    /**
     * Publish the ADF1 Active Frequency in Khz.
     * @param freq The active frequency in Khz.
     */
    publishAdfActiveFrequencySet(freq) {
        super.publish('adf_active_frequency_1', freq, false);
    }
    /**
     * Publish the ADF1 Standby Frequency in Khz.
     * @param freq The standby frequency in Khz.
     */
    publishAdfStandbyFrequencySet(freq) {
        super.publish('adf_standby_frequency_1', freq, false);
    }
}
/**
 * The core instrument that will drive all of a system's radios.
 */
export class NavComInstrument {
    /**
     * Create a NavComController.
     * @param bus The event bus to publish to.
     * @param config A NavComConfig object defining the radio configuration.
     * @param numNavRadios The number of nav radios in the system.
     * @param numComRadios The number of com radios in the system.
     * @param sync Whether to sync events or not, default true.
     */
    constructor(bus, config, numNavRadios, numComRadios, sync = true) {
        this.navRadios = new Array();
        this.comRadios = new Array();
        /**
         * Handle an hEvent.
         * @param hEvent The event that needs to be handled.
         */
        this.eventHandler = (hEvent) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            if (this.config !== undefined) {
                // We can't use a switch statement here because of the need to retrieve
                // the key from each map.  Sorry it's so ugly.
                if ((_a = this.config.navSwitchEvents) === null || _a === void 0 ? void 0 : _a.has(hEvent)) {
                    this.swapFreqs(this.getSelectedRadio(this.navRadios));
                }
                else if ((_b = this.config.navSelectorEvents) === null || _b === void 0 ? void 0 : _b.has(hEvent)) {
                    this.swapSelection(this.navRadios);
                }
                else if ((_c = this.config.navWholeIncEvents) === null || _c === void 0 ? void 0 : _c.has(hEvent)) {
                    this.wholeInc(this.getSelectedRadio(this.navRadios));
                }
                else if ((_d = this.config.navWholeDecEvents) === null || _d === void 0 ? void 0 : _d.has(hEvent)) {
                    this.wholeDec(this.getSelectedRadio(this.navRadios));
                }
                else if ((_e = this.config.navFractionIncEvents) === null || _e === void 0 ? void 0 : _e.has(hEvent)) {
                    this.fractInc(this.getSelectedRadio(this.navRadios));
                }
                else if ((_f = this.config.navFractionDecEvents) === null || _f === void 0 ? void 0 : _f.has(hEvent)) {
                    this.fractDec(this.getSelectedRadio(this.navRadios));
                }
                else if ((_g = this.config.comSwitchEvents) === null || _g === void 0 ? void 0 : _g.has(hEvent)) {
                    this.swapFreqs(this.getSelectedRadio(this.comRadios));
                }
                else if ((_h = this.config.comSelectorEvents) === null || _h === void 0 ? void 0 : _h.has(hEvent)) {
                    this.swapSelection(this.comRadios);
                }
                else if ((_j = this.config.comWholeIncEvents) === null || _j === void 0 ? void 0 : _j.has(hEvent)) {
                    this.wholeInc(this.getSelectedRadio(this.comRadios));
                }
                else if ((_k = this.config.comWholeDecEvents) === null || _k === void 0 ? void 0 : _k.has(hEvent)) {
                    this.wholeDec(this.getSelectedRadio(this.comRadios));
                }
                else if ((_l = this.config.comFractionIncEvents) === null || _l === void 0 ? void 0 : _l.has(hEvent)) {
                    this.fractInc(this.getSelectedRadio(this.comRadios));
                }
                else if ((_m = this.config.comFractionDecEvents) === null || _m === void 0 ? void 0 : _m.has(hEvent)) {
                    this.fractDec(this.getSelectedRadio(this.comRadios));
                }
                else if ((_o = this.config.comVolumeIncEvents) === null || _o === void 0 ? void 0 : _o.has(hEvent)) {
                    this.volumeInc(this.getSelectedRadio(this.comRadios));
                }
                else if ((_p = this.config.comVolumeDecEvents) === null || _p === void 0 ? void 0 : _p.has(hEvent)) {
                    this.volumeDec(this.getSelectedRadio(this.comRadios));
                }
                else if ((_q = this.config.navVolumeIncEvents) === null || _q === void 0 ? void 0 : _q.has(hEvent)) {
                    this.volumeInc(this.getSelectedRadio(this.navRadios));
                }
                else if ((_r = this.config.navVolumeDecEvents) === null || _r === void 0 ? void 0 : _r.has(hEvent)) {
                    this.volumeDec(this.getSelectedRadio(this.navRadios));
                }
            }
        };
        this.bus = bus;
        this.config = config;
        // Populate our radio arrays.
        for (let i = 1; i <= numNavRadios; i++) {
            this.navRadios.push({
                index: i,
                activeFrequency: 0,
                ident: null,
                signal: 0,
                standbyFrequency: 0,
                radioType: RadioType.Nav,
                selected: false
            });
        }
        for (let i = 1; i <= numComRadios; i++) {
            this.comRadios.push({
                index: i,
                activeFrequency: 0,
                ident: null,
                signal: 0,
                standbyFrequency: 0,
                radioType: RadioType.Com,
                selected: false
            });
        }
        // Create our publishers and subscribers.
        this.hevents = this.bus.getSubscriber();
        this.publisher = new NavComPublisher(bus, undefined, sync);
        this.simVarPublisher = new NavComSimVarPublisher(this.bus);
        this.simVarSubscriber = new EventSubscriber(this.bus);
        this.controlSubscriber = bus.getSubscriber();
    }
    /**
     * Initialize the instrument.
     */
    init() {
        // Start our two publishers.
        this.publisher.startPublish();
        this.simVarPublisher.startPublish();
        // Set up our event handlers, for both H events and simvar updates.
        this.hevents.on('hEvent').handle(this.eventHandler);
        const navProcessorSubscriber = this.bus.getSubscriber();
        navProcessorSubscriber.on('cdi_select').handle(this.setActiveRadio.bind(this));
        this.controlSubscriber.on('publish_radio_states').handle(this.publishRadioStates.bind(this));
        this.controlSubscriber.on('standby_com_freq').handle(this.setStandbyFreq.bind(this, RadioType.Com));
        this.controlSubscriber.on('com_spacing_set').handle(this.setComSpacing.bind(this));
        this.controlSubscriber.on('standby_nav_freq').handle(this.setStandbyFreq.bind(this, RadioType.Nav));
        this.simVarSubscriber.on('nav_active_frequency_1').whenChangedBy(0.01).handle((data) => {
            this.updateRadioFreqCb(RadioType.Nav, 0, FrequencyBank.Active, data);
        });
        this.simVarSubscriber.on('nav_standby_frequency_1').whenChangedBy(0.01).handle((data) => {
            this.updateRadioFreqCb(RadioType.Nav, 0, FrequencyBank.Standby, data);
        });
        this.simVarSubscriber.on('nav_active_frequency_2').whenChangedBy(0.01).handle((data) => {
            this.updateRadioFreqCb(RadioType.Nav, 1, FrequencyBank.Active, data);
        });
        this.simVarSubscriber.on('nav_standby_frequency_2').whenChangedBy(0.01).handle((data) => {
            this.updateRadioFreqCb(RadioType.Nav, 1, FrequencyBank.Standby, data);
        });
        this.simVarSubscriber.on('com_active_frequency_1').whenChangedBy(0.001).handle((data) => {
            this.updateRadioFreqCb(RadioType.Com, 0, FrequencyBank.Active, data);
        });
        this.simVarSubscriber.on('com_standby_frequency_1').whenChangedBy(0.001).handle((data) => {
            this.updateRadioFreqCb(RadioType.Com, 0, FrequencyBank.Standby, data);
        });
        this.simVarSubscriber.on('com_active_frequency_2').whenChangedBy(0.001).handle((data) => {
            this.updateRadioFreqCb(RadioType.Com, 1, FrequencyBank.Active, data);
        });
        this.simVarSubscriber.on('com_standby_frequency_2').whenChangedBy(0.001).handle((data) => {
            this.updateRadioFreqCb(RadioType.Com, 1, FrequencyBank.Standby, data);
        });
        this.simVarSubscriber.on('nav_ident_1').whenChanged().handle((data) => {
            this.navRadios[0].ident = data;
            this.publisher.publishIdent(1, data);
        });
        this.simVarSubscriber.on('nav_ident_2').whenChanged().handle((data) => {
            this.navRadios[1].ident = data;
            this.publisher.publishIdent(2, data);
        });
        this.simVarSubscriber.on('nav_signal_1').withPrecision(0).handle((data) => {
            this.navRadios[0].signal = data;
            this.publisher.publishSignalStrength(1, data);
        });
        this.simVarSubscriber.on('nav_signal_2').withPrecision(0).handle((data) => {
            this.navRadios[1].signal = data;
            this.publisher.publishSignalStrength(2, data);
        });
        this.simVarSubscriber.on('adf_active_frequency_1').whenChanged().handle((freq) => {
            this.publisher.publishAdfActiveFrequencySet(freq);
        });
        this.simVarSubscriber.on('adf_standby_frequency_1').whenChanged().handle((freq) => {
            this.publisher.publishAdfStandbyFrequencySet(freq);
        });
        // Configure and publish the initial state of all our radios.
        this.navRadios[0].selected = true;
        this.comRadios[0].selected = true;
        for (let i = 0; i < this.navRadios.length; i++) {
            this.updateAndPublish(this.navRadios[i]);
        }
        for (let i = 0; i < this.comRadios.length; i++) {
            this.updateAndPublish(this.comRadios[i]);
        }
    }
    /**
     * Perform events for the update loop.
     */
    onUpdate() {
        // Currently, we just need to update our simvar publisher so it polls.
        this.simVarPublisher.onUpdate();
    }
    /**
     * Get the current frequency of a radio.
     * @param radioType The RadioType to query.
     * @param index The index number of the desired radio.
     * @param bank The FrequencyBank to query.
     * @returns The frequency in MHz.
     */
    getFrequency(radioType, index, bank) {
        return SimVar.GetSimVarValue(`${radioType == RadioType.Com ? 'COM' : 'NAV'} ${bank == FrequencyBank.Active ? 'ACTIVE' : 'STANDBY'} FREQUENCY:${index}`, 'MHz');
    }
    /**
     * React to a change on a radio frequency simvar.
     * @param type The RadioType to update.
     * @param index Index of the radio in the internal array.
     * @param bank The FrequencyBank in the selected radio to update.
     * @param freq The new frequency in MHz.
     */
    updateRadioFreqCb(type, index, bank, freq) {
        // Note: 'index' here is the index of the radio in our internal array,
        // not the device index.  This is confusing, and we should probably use
        // different words for each of the two data points.
        // TODO Disambigurate radio device number"index" from index in internal array.
        const radioArr = type == RadioType.Nav ? this.navRadios : this.comRadios;
        switch (bank) {
            case FrequencyBank.Active:
                radioArr[index].activeFrequency = freq;
                this.publisher.publishFreqChange(radioArr[index], FrequencyBank.Active, freq);
                break;
            case FrequencyBank.Standby:
                radioArr[index].standbyFrequency = freq;
                this.publisher.publishFreqChange(radioArr[index], FrequencyBank.Standby, freq);
                break;
        }
    }
    /**
     * Get the current selected radio in a collection of radios.
     * @param radios An array of Radios.
     * @returns The selected Radio in the array.
     */
    getSelectedRadio(radios) {
        for (const radio of radios) {
            if (radio.selected) {
                return radio;
            }
        }
        return undefined;
    }
    /**
     * Swap frequencies in a radio.
     * @param radio The radio whose frequencies we want to swap.
     */
    swapFreqs(radio) {
        if (radio !== undefined) {
            this.setKVar('SWAP', radio);
        }
    }
    /**
     * Update the frequencies in a radio from simvars.
     *
     * This is useful for snapshot updates as long as we're not worried
     * about one of the frequencies being updated while the snapshot is in
     * flight.
     * @param radio the radio to update
     */
    updateAndPublish(radio) {
        if (radio !== undefined) {
            radio.activeFrequency = this.getFrequency(radio.radioType, radio.index, FrequencyBank.Active);
            radio.standbyFrequency = this.getFrequency(radio.radioType, radio.index, FrequencyBank.Standby);
        }
        switch (radio === null || radio === void 0 ? void 0 : radio.radioType) {
            case RadioType.Com:
                this.comRadios[radio.index - 1] = radio;
                break;
            case RadioType.Nav:
                this.navRadios[radio.index - 1] = radio;
                break;
        }
        this.publisher.publishRadioState(radio);
    }
    /**
     * Explicitly set a new selected nav radio.
     * @param navSourceId An array of Radios to toggle.
     */
    setActiveRadio(navSourceId) {
        if (navSourceId.type === NavSourceType.Nav) {
            for (let i = 0; i < this.navRadios.length; i++) {
                const radio = this.navRadios[i];
                if (radio.index == navSourceId.index) {
                    radio.selected = true;
                }
                else {
                    radio.selected = false;
                }
                this.publisher.publishRadioState(radio);
            }
        }
    }
    /**
     * Set the standby frequency of the currently selected nav or com radio.
     * @param radioType The radio type we want to set standby for.
     * @param frequency The frequency in MHz as a string.
     */
    setStandbyFreq(radioType, frequency) {
        let radio;
        switch (radioType) {
            case RadioType.Com:
                radio = this.getSelectedRadio(this.comRadios);
                break;
            case RadioType.Nav:
                radio = this.getSelectedRadio(this.navRadios);
                break;
        }
        this.freqSet(radio, FrequencyBank.Standby, frequency);
    }
    /**
     * Toggle which of the radios is selected.
     * @param radios An array of Radios to toggle.
     */
    swapSelection(radios) {
        // TODO It would be nice to extend this to handle systems with more than 2 radios
        for (let i = 0; i < radios.length; i++) {
            radios[i].selected = !radios[i].selected;
            this.publisher.publishRadioState(radios[i]);
        }
    }
    /**
     * Increase the volume of the selected nav or com radio.
     * @param radio The radio whose volume we want to increase.
     */
    volumeInc(radio) {
        if (radio !== undefined) {
            SimVar.SetSimVarValue(`K:${radio.radioType}${radio.index}_VOLUME_INC`, 'number', 0);
        }
    }
    /**
     * Increase the volume of the selected nav or com radio.
     * @param radio The radio whose volume we want to increase.
     */
    volumeDec(radio) {
        if (radio !== undefined) {
            SimVar.SetSimVarValue(`K:${radio.radioType}${radio.index}_VOLUME_DEC`, 'number', 0);
        }
    }
    /**
     * Increase the integer portion of a frequency.
     * @param radio The Radio to update.
     */
    wholeInc(radio) {
        this.setKVar('WHOLE_INC', radio);
    }
    /**
     * Decrease the integer portion of a frequency.
     * @param radio The Radio to update.
     */
    wholeDec(radio) {
        this.setKVar('WHOLE_DEC', radio);
    }
    /**
     * Increase the decimal portion of a frequency.
     * @param radio The Radio to update.
     */
    fractInc(radio) {
        this.setKVar('FRACT_INC', radio);
    }
    /**
     * Decrease the decimal portion of a frequency.
     * @param radio The Radio to update.
     */
    fractDec(radio) {
        this.setKVar('FRACT_DEC', radio);
    }
    /**
     * Set the full frequency of a radio.
     * @param radio The Radio to update.
     * @param bank The FrequencyBank to update.
     * @param freq The new frequency in MHz as a string.
     */
    freqSet(radio, bank, freq) {
        if (!radio) {
            return;
        }
        let radioId;
        if (radio.radioType == RadioType.Com) {
            const first = radio.index == 1 ? 'COM' : `COM${radio.index}`;
            const second = bank == FrequencyBank.Active ? 'RADIO' : 'STBY_RADIO';
            radioId = `${first}_${second}`;
        }
        else {
            radioId = `NAV${radio.index}_${bank == FrequencyBank.Active ? 'RADIO' : 'STBY'}`;
        }
        const freqMhz = Math.round(parseFloat(freq) * 1000) / 1000;
        SimVar.SetSimVarValue(`K:${radioId}_SET_HZ`, 'Hz', (Math.round(freqMhz * 1000000)));
    }
    /**
     * Set the K var for a frequency event
     * @param action A string defining whole/fract and inc/dec.
     * @param radio The radio this frequency is for.
     */
    setKVar(action, radio) {
        if (radio == undefined) {
            return;
        }
        let device;
        switch (radio.radioType) {
            case RadioType.Nav:
                device = `NAV${radio.index}`;
                break;
            case RadioType.Com:
                if (action == 'SWAP') {
                    // Com radios break the naming pattern for swap events. :(
                    device = radio.index == 1 ? 'COM_STBY' : `COM${radio.index}`;
                }
                else {
                    device = radio.index == 1 ? 'COM' : `COM${radio.index}`;
                }
                break;
            default: // this should never happen
                return;
        }
        SimVar.SetSimVarValue(`K:${device}_RADIO_${action}`, 'number', 0);
    }
    /**
     * Send an update of all our radio states.
     * @param data True if we really want to do this.  (We need to support non-paramaterized commands.())
     */
    publishRadioStates(data) {
        if (!data) {
            return;
        }
        for (const radio of this.navRadios) {
            this.publisher.publishRadioState(radio);
        }
        for (const radio of this.comRadios) {
            this.publisher.publishRadioState(radio);
        }
    }
    /**
     * Sets the COM frequency spacing.
     * @param evt The event that is setting the spacing.
     */
    setComSpacing(evt) {
        const currentSpacing = SimVar.GetSimVarValue(`COM SPACING MODE:${evt.index}`, SimVarValueType.Enum);
        if (currentSpacing !== evt.spacing) {
            SimVar.SetSimVarValue(`K:COM_${evt.index.toFixed(0)}_SPACING_MODE_SWITCH`, 'number', 0);
        }
    }
}
