import { EventBus, KeyEvents, KeyInterceptManager } from 'msfssdk';

let nxNotificationsListener: ViewListener.ViewListener;

/**
 * NotificationData container for notifications to package notification metadata
 */
export type NotificationData = {
    id: string;
    title: string;
    type: string;
    theme: string;
    image: string;
    description: string;
    timeout: number;
    time: number;
}

/**
 * Notification utility class to create a notification event and element
 *
 * Usage:
 * import { NotificationManager } from '@shared/notification';
 * ...
 * const notification = new NotificationManager();
 * notification.showNotification({ message: 'Your notification here!' });
*/

export class NotificationManager {
    eventBus: EventBus;

    manager: KeyInterceptManager;

    notifications: Notification[];

    constructor() {
        this.notifications = [];
        this.eventBus = new EventBus();
        KeyInterceptManager.getManager(this.eventBus).then((man) => {
            this.manager = man;
            this.registerIntercepts();
        });
    }

    registerIntercepts() {
        this.manager.interceptKey('PAUSE_TOGGLE', true);
        this.manager.interceptKey('PAUSE_ON', true);
        this.manager.interceptKey('PAUSE_OFF', true);
        this.manager.interceptKey('PAUSE_SET', true);

        const subscriber = this.eventBus.getSubscriber<KeyEvents>();
        subscriber.on('key_intercept').handle((keyData) => {
            switch (keyData.key) {
            case 'PAUSE_TOGGLE':
            case 'PAUSE_ON':
            case 'PAUSE_OFF':
            case 'PAUSE_SET':
                this.notifications.forEach((notif: Notification) => {
                    notif.hideNotification();
                });
                this.notifications.length = 0;
                break;
            default:
                break;
            }
        });
    }

    showNotification(params: any = {}): void {
        const notif: Notification = new Notification();
        notif.showNotification(params);
        this.notifications.push(notif);
    }
}

class Notification {
    time: number;

    params: NotificationData;

    /**
     * Creates a Notification
     */
    constructor() {
        const title = 'B77HS ALERT';
        this.time = new Date().getTime();
        this.params = {
            id: `${title}_${this.time}`,
            title,
            type: 'MESSAGE',
            theme: 'GAMEPLAY',
            image: 'IMAGE_NOTIFICATION',
            description: 'Default Message',
            timeout: 10000,
            time: this.time,
        };
    }

    /**
     * Modify the display data for this Notification
     * @param {string} params.title Title for notification - will show as the message header
     * @param {string} params.type Type of Notification - Valid types are MESSAGE|SUBTITLES
     * @param {string} params.theme Theme of Notification. Valid types are TIPS|GAMEPLAY|SYSTEM
     * @param {string} params.image Notification image. Valid types are IMAGE_NOTIFICATION|IMAGE_SCORE
     * @param {string} params.message Notification message
     * @param {number} params.timeout Time in ms before notification message will disappear
     */
    private setData(params: any = {}): void {
        if (params.title) {
            this.params.title = params.title;
            this.params.id = `${params.title}_${new Date().getTime()}`;
        }
        if (params.type) {
            this.params.type = params.type;
        }
        if (params.theme) {
            this.params.theme = params.theme;
        }
        if (params.image) {
            this.params.image = params.image;
        }
        if (params.message) {
            this.params.description = params.message;
        }
        if (params.timeout) {
            this.params.timeout = params.timeout;
        }
    }

    /**
     * Show notification with given or already initiated parametrs.
     * @param {string} params.title Title for notification - will show as the message header
     * @param {string} params.type Type of Notification - Valid types are MESSAGE|SUBTITLES
     * @param {string} params.theme Theme of Notification. Valid types are TIPS|GAMEPLAY|SYSTEM
     * @param {string} params.image Notification image. Valid types are IMAGE_NOTIFICATION|IMAGE_SCORE
     * @param {string} params.message Notification message
     * @param {number} params.timeout Time in ms before notification message will disappear
     */
    showNotification(params: any = {}): void {
        this.setData(params);

        if (!nxNotificationsListener) {
            nxNotificationsListener = RegisterViewListener('JS_LISTENER_NOTIFICATIONS');
        }
        nxNotificationsListener.triggerToAllSubscribers('SendNewNotification', this.params);
        setTimeout(() => {
            // TODO FIXME: May break in the future, check every update
            this.hideNotification();
        }, this.params.timeout);
    }

    hideNotification() {
        nxNotificationsListener.triggerToAllSubscribers('HideNotification', this.params.type, null, this.params.id);
    }
}
