import { Drawer } from '@mantine/core';
import { AlertsInfo } from '../../types/entities';
import { AlertsIndicator } from '../atoms/AlertsIndicator';
import { AlertEvent } from '../molecules/AlertEvent';
import { Accordion } from '@mantine/core';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export function AlertsDrawer({
    opened,
    onClose
}: {
    opened: boolean;
    onClose: () => void;
}) {
    const { data: alertsInfo } = useQuery<AlertsInfo>({
        queryKey: ['schedulerInfo', 'alerts'],
        enabled: false
    });

    const printAlerts = useCallback(() => {
        if (!alertsInfo) return undefined;
        return alertsInfo.alerts.map((alert) => {
            const event = alert.event;
            const prevEvent = alert.prevEvent;
            return (
                <AlertEvent
                    key={event.id}
                    alertType={alert.alertType}
                    event={event}
                    prevEvent={prevEvent}
                />
            );
        });
    }, [alertsInfo]);

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={<AlertsIndicator />}
            size="md"
            position="right"
        >
            <Accordion>{printAlerts()}</Accordion>
        </Drawer>
    );
}
