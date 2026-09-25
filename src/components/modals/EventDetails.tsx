import { Divider, Image, Text, useMantineTheme } from '@mantine/core';
import { Assignment, EventWithAssignments, Task } from '../../types/entities';
import { useScreen } from '../../hooks/useScreen';
import { PlatformIcon } from '../atoms/PlatformIcon';
import { ApartmentStateBadge } from '../atoms/ApartmentStateBadge';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { IconLogin, IconLogout } from '@tabler/icons-react';
import { useEntityModal } from '../../hooks/useEntityModal';
import { AssignmentForm } from './AssignmentForm';
import { WorkerCardSkeleton } from '../molecules/WorkerCardSkeleton';
import { useState } from 'react';
import { TaskWithAssigmentCard } from '../molecules/TaskWithAssigmentCard';
import { useReactQuery } from '../../hooks/useReactQuery';
import { useCrud } from '../../hooks/useCrud';
import { useConfirmModalWithContext } from '../../hooks/useConfirmModalWithContext';
import { showNotificationSuccess } from '../../utils/notifUtils';

export function EventDetails({
    entity: event
}: {
    entity?: EventWithAssignments;
}) {
    const { isTablet } = useScreen();
    const theme = useMantineTheme();
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(
        undefined
    );

    const { openModal } = useConfirmModalWithContext();

    const {
        onOpen: openAssignmentFormModal,
        modalComponent: assignmentFormModalComponent
    } = useEntityModal<Assignment>({
        entityName: 'assignment',
        ModalBodyComponent: AssignmentForm,
        ModalBodySkeleton: WorkerCardSkeleton,
        relatedEntity: event,
        relatedEntitySecondary: selectedTask

    });

    const { remove: removeAssignment } = useCrud('assignment');

    const { queryClient } = useReactQuery();

    const onDeleteAssignment = async (id: string) => {
        await removeAssignment(id);
        showNotificationSuccess('Assignment deleted');
        queryClient.invalidateQueries({
            queryKey: ['event', event?.id]
        });
    };

    const openDeleteModal = (id: string) =>
        openModal({
            title: 'Delete assignment',
            message:
                'Are you sure you want to delete this assignment? This action cannot be undone',
            color: 'red',
            onConfirm: () => onDeleteAssignment(id)
        });

    return event ? (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',

                    flexDirection: isTablet ? 'row' : 'column'
                }}
            >
                <Image
                    src="/apartment_placeholder.svg"
                    height={120}
                    style={{
                        objectFit: 'contain',
                        objectPosition: isTablet ? 'left' : 'center'
                    }}
                    alt="Apartment picture"
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        width: '100%',
                        justifyContent: 'space-between'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}
                        >
                            <PlatformIcon platform={event.source} size={24} />
                            <Text>{event.apartment.name}</Text>
                        </div>
                        <ApartmentStateBadge state={event.apartment.state} />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <IconLogin color={theme.colors.success[5]} />
                            <Text>
                                {dayjs
                                    .unix(event.startDate)
                                    .format(conf.dateTimeWithWeekDayAndTime)}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <IconLogout color={theme.colors.error[5]} />
                            <Text>
                                {dayjs
                                    .unix(event.endDate)
                                    .format(conf.dateTimeWithWeekDayAndTime)}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
            <Divider />
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1rem',
                    width: '100%',
                    overflowY: 'auto',
                    height: '100%',
                    paddingRight: '0.4rem'
                }}
            >
                {event?.apartment?.tasks &&
                    event.apartment.tasks
                        .filter(
                            (task) =>
                                !event.assignments.some(
                                    (assignment) =>
                                        assignment.task.id === task.id
                                )
                        )
                        .map((task) => (
                            <TaskWithAssigmentCard
                                task={task}
                                onAssign={() => {
                                    setSelectedTask(task);
                                    openAssignmentFormModal();
                                }}
                            />
                        ))}
                {event?.assignments.map((assignment) => (
                    <TaskWithAssigmentCard
                        task={assignment.task}
                        assignment={assignment}
                        onAssign={() => {
                            setSelectedTask(assignment.task);
                            openAssignmentFormModal(assignment.id);
                        }}
                        onDelete={() => openDeleteModal(assignment.id)}
                    />
                ))}
            </div>
            {assignmentFormModalComponent}
        </div>
    ) : (
        <></>
    );
}