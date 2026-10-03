import { IconAlertTriangle } from '@tabler/icons-react';
import { ALERT, Alert } from '../../types/enums';

export function AlertIcon({
    alertType,
    size,
    style
}: {
    alertType: Alert;
    size: number;
    style?: React.CSSProperties;
}) {
    return (
        <IconAlertTriangle
            color={
                alertType === ALERT.DAYS_LEFT_5_UNASSIGNED
                    ? 'var(--mantine-color-yellow-5)'
                    : 'var(--mantine-color-error-5)'
            }
            size={size}
            style={{ flexShrink: 0, ...style }}
        />
    );
}
