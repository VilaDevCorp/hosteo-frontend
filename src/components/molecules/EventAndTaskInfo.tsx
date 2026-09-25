import { Text } from '@mantine/core';
import { TaskCategoryBadge } from '../atoms/TaskCategoryBadge';
import { IconAlertTriangle } from '@tabler/icons-react';
import { ALERT } from '../../types/enums';
import { AssignmentFormFieldsWithObjects } from '../../types/forms';
import { EventSchedulerDto } from '../../types/entities';

export function EventAndTaskInfo({
    assignment,
    eventInfo
}: {
    assignment?: AssignmentFormFieldsWithObjects;
    eventInfo?: Record<string, EventSchedulerDto>;
}) {
    const nextEvent = assignment?.nextEventId && eventInfo ? eventInfo[assignment.nextEventId] : undefined;
    const alertColor =
        nextEvent?.alert === ALERT.DAYS_LEFT_5_UNASSIGNED
            ? 'var(--mantine-color-yellow-5)'
            : 'var(--mantine-color-error-5)';

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                maxWidth: '25rem'
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
                <IconAlertTriangle
                    color={alertColor}
                    size={24}
                    style={{ flexShrink: 0 }}
                />
                <Text c="dimmed" lineClamp={1}>
                    {assignment?.apartment?.name ?? ''}
                </Text>
            </span>
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    height: '100%'
                }}
            >
                {assignment?.task?.name && (
                    <Text lineClamp={1}>{assignment?.task?.name}</Text>
                )}
                {assignment?.task?.category && (
                    <TaskCategoryBadge category={assignment?.task.category} />
                )}
                {assignment?.task && assignment.task.duration > 0 && (
                    <Text lineClamp={1} style={{ flexShrink: 0 }}>
                        {assignment?.task?.duration} min
                    </Text>
                )}
            </div>
        </div>
    );
}