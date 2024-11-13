import { Notification, toast } from "../ui";
import { ReactNode } from "react";

type ToastConfig = {
    title: string;
}

/**
 * Shows a toast notification with the given message and type.
 *
 * @param {string} type Type of the notification. Can be 'success', 'warning', 'danger', or 'info'.
 * @param {ReactNode} message The message to be displayed in the toast notification.
 * @Param {string} title The title of the toast notification. Defaults to the capitalized type.
 */
const showToast = (type: 'success' | 'warning' | 'danger' | 'info', message: ReactNode, config: ToastConfig = { title: '' }) => {
    if (config.title == '') {
        config.title = type === 'danger' ? 'Error' : type.charAt(0).toUpperCase() + type.slice(1);
    }
    toast.push(
        <Notification
            title={config.title}
            type={type}

        >
            {message}
        </Notification>,
        { placement: 'bottom-end' }
    );
};

const toastNotification = {
    success: (message: ReactNode, config?: ToastConfig) => showToast('success', message, config),
    warning: (message: ReactNode, config?: ToastConfig) => showToast('warning', message, config),
    error: (message: ReactNode, config?: ToastConfig) => showToast('danger', message, config),
    info: (message: ReactNode, config?: ToastConfig) => showToast('info', message, config),
};

export default toastNotification;
