import { notifications } from "@mantine/notifications"

const showNotificationError = (message: string) => {
    notifications.show({
        message,
        color: 'error'
    });
}

const showNotificationSuccess = (message: string) => {
    notifications.show({
        message,
        color: 'success'
    });
}

export { showNotificationError, showNotificationSuccess }