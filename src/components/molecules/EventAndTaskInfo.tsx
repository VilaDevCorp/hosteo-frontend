import { Text, Title } from '@mantine/core';
import { TaskCategoryBadge } from '../atoms/TaskCategoryBadge';
import { AlertsInfo, Task } from '../../types/entities';
import { useQuery } from '@tanstack/react-query';
import { AlertIcon } from '../atoms/AlertIcon';

export function EventAndTaskInfo({
    eventId,
    task,
    apartmentName
}: {
    eventId: string;
    task?: Task;
    apartmentName?: string;
}) {
    const { data: alertsInfo } = useQuery<AlertsInfo>({
        queryKey: ['schedulerInfo', 'alerts'],
        enabled: false
    });

    const alert = alertsInfo?.alerts?.find(
        (alert) => alert.event.id === eventId
    )?.alertType;

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                gap: '1rem'
            }}
        >
            <span
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    height: '100%'
                }}
            >
                {alert && (
                    <AlertIcon
                        alertType={alert}
                        size={16}
                        style={{ marginRight: '0.5rem' }}
                    />
                )}

                <Title order={4} lineClamp={1}>
                    {`${task?.name} (${apartmentName ?? ''})`}
                </Title>
            </span>
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    height: '100%'
                }}
            >
                {task?.category && (
                    <TaskCategoryBadge category={task.category} />
                )}
                {task && task.duration > 0 && (
                    <Text lineClamp={1} style={{ flexShrink: 0 }}>
                        {task?.duration} min
                    </Text>
                )}
            </div>
        </div>
    );
}
