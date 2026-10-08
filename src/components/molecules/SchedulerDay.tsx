import dayjs from 'dayjs';
import { Text } from '@mantine/core';
import { SchedulerEventCard } from './SchedulerEventCard';
import { SchedulerItem } from '../../types/entities';
import { SchedulerAssignmentCard } from './SchedulerAssignmentCard';
import { IncompleteAssignmentCard } from './IncompleteAssignmentCard.tsx';
import styles from './SchedulerDay.module.css';

export function SchedulerDay({
    date,
    items,
    onClick,
    disabled,
    selectedEventIds,
    onEventClick,
    onEventEdit,
    onEventDelete,
    selectedAssignmentIds,
    onAssignmentClick,
    onAssignmentEdit,
    onAssignmentDelete
}: {
    date: string;
    items: SchedulerItem[];
    onClick?: () => void;
    disabled?: boolean;
    isSelected?: boolean;
    selectedEventIds?: Set<string>;
    onEventClick?: (eventId: string) => void;
    onEventEdit?: (eventId: string) => void;
    onEventDelete?: (eventId: string) => void;
    selectedAssignmentIds?: Set<string>;
    onAssignmentClick?: (assignmentId: string) => void;
    onAssignmentEdit?: (assignmentId: string) => void;
    onAssignmentDelete?: (assignmentId: string) => void;
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                height: '100%',
                maxHeight: '100%',
                flex: 1,
                justifyContent: 'center',
                minWidth: '170px',
                overflow: 'hidden',
                filter: disabled ? 'brightness(0.5)' : 'none',
                pointerEvents: disabled ? 'none' : 'auto',
                cursor:
                    disabled || onClick === undefined ? 'default' : 'pointer'
            }}
            onClick={onClick}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'center'
                }}
            >
                <Text
                    c="dimmed"
                    style={{
                        textTransform: 'uppercase'
                    }}
                >
                    {dayjs(date).format('dd')}
                </Text>
                <Text fw={'bold'}>{dayjs(date).format('DD')}</Text>
            </div>
            <div
                style={{
                    backgroundColor: 'var(--mantine-color-background-2)',
                    height: '100%',
                    padding: '0.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    overflow: 'auto',
                    borderRadius: 'var(--mantine-radius-md)'
                }}
                className={styles.scrollContainer}
            >
                {items.map((item) => {
                    if (item.type === 'event') {
                        const eventSchedulerDto = item.item;
                        return (
                            <SchedulerEventCard
                                key={eventSchedulerDto.id}
                                item={eventSchedulerDto}
                                isStart={item.isStart}
                                isSelected={selectedEventIds?.has(
                                    eventSchedulerDto.id
                                )}
                                onClick={
                                    onEventClick
                                        ? () =>
                                              onEventClick(eventSchedulerDto.id)
                                        : undefined
                                }
                                onEdit={
                                    onEventEdit
                                        ? () =>
                                              onEventEdit(eventSchedulerDto.id)
                                        : undefined
                                }
                                onDelete={
                                    onEventDelete
                                        ? () =>
                                              onEventDelete(
                                                  eventSchedulerDto.id
                                              )
                                        : undefined
                                }
                            />
                        );
                    }
                    if (item.type === 'assignment') {
                        const assignment = item.item;
                        return (
                            <SchedulerAssignmentCard
                                key={assignment.id}
                                item={assignment}
                                onClick={
                                    onAssignmentClick
                                        ? () => onAssignmentClick(assignment.id)
                                        : undefined
                                }
                                isSelected={selectedAssignmentIds?.has(
                                    assignment.id
                                )}
                                onEdit={
                                    onAssignmentEdit
                                        ? () => onAssignmentEdit(assignment.id)
                                        : undefined
                                }
                                onDelete={
                                    onAssignmentDelete
                                        ? () =>
                                              onAssignmentDelete(assignment.id)
                                        : undefined
                                }
                            />
                        );
                    }
                    const incompleteAssignment = item.item;
                    return (
                        <IncompleteAssignmentCard
                            key={'incomplete_assignment'}
                            assignment={incompleteAssignment}
                        />
                    );
                })}
            </div>
        </div>
    );
}
