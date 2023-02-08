/// <reference path="../../../typings/fs-base-ui/html_ui/JS/common.d.ts" />

/**
 * NotificationParams container for popups to package popup metadata
 */
export type NotificationParams = {
    __Type: string;
    buttons: NotificationButton[];
    style: string;
    displayGlobalPopup: boolean;
    contentData: string;
    contentUrl: string;
    contentTemplate: string;
    id: string;
    title: string;
    time: number;
}

/**
 * PopUp utility class to create a pop-up UI element
 *
 * Usage:
 * import { PopUp } from '@shared/popup';
 * ...
 * const popup = new PopUp();
 * popup.showPopUp("CRITICAL SETTING CHANGED", "Your message here", "small", yesFunc, noFunc);
 * popup.showInformation("CRITICAL MESSAGE", "Your message here", "small", yesFunc);
 */
export class PopUp {
    params: NotificationParams;

    popupListener: any;

    /**
     * Creates a Popup
     */
    constructor() {
        const title = 'B77HS POPUP';
        const time = new Date().getTime();
        this.popupListener = undefined;
        this.params = {
            __Type: 'SNotificationParams',
            buttons: [new NotificationButton('TT:MENU.YES', `B77HS_POP_${title}_${time}_YES`), new NotificationButton('TT:MENU.NO', `B77HS_POP_${title}_${time}_NO`)],
            style: 'normal',
            displayGlobalPopup: true,
            contentData: 'Default Message',
            contentUrl: '', // i.e. "/templates/Controls/PopUp_EditPreset/PopUp_EditPreset.html";
            contentTemplate: '', // i.e. "popup-edit-preset";
            id: `${title}_${time}`,
            title,
            time,
        };
    }

    /**
     * Pass Popup display data to Coherent
     * @param params
     */
    /* eslint-disable no-underscore-dangle */
    _showPopUp(params: any = {}): void {
        Coherent.trigger('SHOW_POP_UP', params);
    }

    /**
     * Show popup with given or already initiated parameters
     * @param {string} title Title for popup - will show in menu bar
     * @param {string} message Popup message
     * @param {string} style Style/Type of popup. Valid types are small|normal|big|big-help
     * @param {function} callbackYes Callback function -> YES button is clicked.
     * @param {function} callbackNo Callback function -> NO button is clicked.
     */
    showPopUp(title: string, message: string, style: 'small'| 'normal'| 'big'| 'big-help', callbackYes: () => void, callbackNo: () => void): void {
        if (title) {
            this.params.title = title;
        }
        if (message) {
            this.params.contentData = message;
        }
        if (style) {
            this.params.style = style;
        }
        if (callbackYes) {
            const yes = (typeof callbackYes === 'function') ? callbackYes : () => callbackYes;
            Coherent.on(`B77HS_POP_${this.params.id}_YES`, () => {
                Coherent.off(`B77HS_POP_${this.params.id}_YES`, null, null);
                yes();
            });
        }
        if (callbackNo) {
            const no = (typeof callbackNo === 'function') ? callbackNo : () => callbackNo;
            Coherent.on(`B77HS_POP_${this.params.id}_NO`, () => {
                Coherent.off(`B77HS_POP_${this.params.id}_NO`, null, null);
                no();
            });
        }

        if (!this.popupListener) {
            this.popupListener = RegisterViewListener('JS_LISTENER_POPUP', this._showPopUp.bind(null, this.params));
        } else {
            this._showPopUp(this.params);
        }
    }

    /**
     * Show information with given or already initiated parameters
     * @param {string} title Title for popup - will show in menu bar
     * @param {string} message Popup message
     * @param {string} style Style/Type of popup. Valid types are small|normal|big|big-help
     * @param {function} callback Callback function -> OK button is clicked.
     */
    showInformation(title: string, message: string, style: 'small'| 'normal'| 'big'| 'big-help', callback: () => void): void {
        if (title) {
            this.params.title = title;
        }
        if (message) {
            this.params.contentData = message;
        }
        if (style) {
            this.params.style = style;
        }
        if (callback) {
            const yes = (typeof callback === 'function') ? callback : () => callback;
            Coherent.on(`B77HS_POP_${this.params.id}_YES`, () => {
                Coherent.off(`B77HS_POP_${this.params.id}_YES`, null, null);
                yes();
            });
        }
        this.params.buttons = [new NotificationButton('TT:MENU.OK', `B77HS_POP_${this.params.id}_YES`)];

        if (!this.popupListener) {
            this.popupListener = RegisterViewListener('JS_LISTENER_POPUP', this._showPopUp.bind(null, this.params));
        } else {
            this._showPopUp(this.params);
        }
    }
}
