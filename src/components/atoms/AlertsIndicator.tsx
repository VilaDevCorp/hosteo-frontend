import { Text } from '@mantine/core';
import { AlertsInfo } from '../../types/entities';
import { useQuery } from '@tanstack/react-query';
import { AlertIcon } from './AlertIcon';
import { ALERT, Alert } from '../../types/enums';

function AlertCounter({
    alertType,
    count
}: {
    alertType: Alert;
    count: number;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}
        >
            <AlertIcon alertType={alertType} size={28} />
            <Text size="lg" c={'var(--mantine-color-gray-9)'}>
                {count ?? 0}
            </Text>
        </div>
    );
}
export function AlertsIndicator({ onClick }: { onClick?: () => void }) {
    const containerStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'transparent',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default'
    };

    const { data: alertsInfo } = useQuery<AlertsInfo>({
        queryKey: ['schedulerInfo', 'alerts'],
        enabled: false
    });

    const content = (
        <>
            <AlertCounter
                alertType={ALERT.DAYS_LEFT_2_NOT_COMPLETED}
                count={alertsInfo?.nRedAlerts ?? 0}
            />
            <AlertCounter
                alertType={ALERT.DAYS_LEFT_5_UNASSIGNED}
                count={alertsInfo?.nYellowAlerts ?? 0}
            />
        </>
    );

    if (!alertsInfo?.nRedAlerts && !alertsInfo?.nYellowAlerts) {
        return null;
    }
    return onClick ? (
        <button onClick={onClick} style={containerStyles}>
            {content}
        </button>
    ) : (
        <div style={containerStyles}>{content}</div>
    );
}
