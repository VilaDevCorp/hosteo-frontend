import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useError } from '../../hooks/useError';
import {
    Event,
    EventSchedulerDto,
    eventSchedulerDtoToEventForAssignment,
    SchedulerInfo,
    Task
} from '../../types/entities';
import { getStartOfWeek } from '../../utils/utilFunctions';
import { SchedulerDatePicker } from '../molecules/SchedulerDatePicker';
import { AlertsIndicator } from '../atoms/AlertsIndicator';
import { AlertsDrawer } from './AlertsDrawer';
import { AssignmentFormFieldsWithObjects } from '../../types/forms';
import {
    ASSIGNMENT_STATE,
    AssignmentState,
    EventState
} from '../../types/enums';
import { useApi } from '../../hooks/useApi';
import { SchedulerActions } from '../molecules/SchedulerActions';
import { EventForm } from '../modals/EventForm';
import { useEntityModal } from '../../hooks/useEntityModal';
import { EventFormSkeleton } from '../skeletons/EventFormSkeleton';
import { useCrud } from '../../hooks/useCrud';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { useConfirmModalWithContext } from '../../hooks/useConfirmModalWithContext';
import { WeeklyCalendar } from './WeeklyCalendar';
import { useAssignmentScheduler } from '../../hooks/useAssignmentScheduler';

export function Scheduler() {
    const { handleError } = useError();

    const [startOfWeek, setStartOfWeek] = useState<string>(
        getStartOfWeek(new Date().toISOString())
    );

    const { openModal } = useConfirmModalWithContext();

    const { onOpen: onEditEvent, modalComponent: eventFormModal } =
        useEntityModal<Event>({
            entityName: 'event',
            removeHeader: true,
            ModalBodyComponent: EventForm,
            ModalBodySkeleton: EventFormSkeleton
        });

    const [openedDrawer, setOpenedDrawer] = useState<boolean>(false);

    const { assignmentScheduler, onCreateAssignment, onUpdateAssignment } =
        useAssignmentScheduler();

    const onCreateNewAssignment = (
        event: EventSchedulerDto,
        alertedEvent: Event,
        task: Task
    ) => {
        const eventForAssignment = eventSchedulerDtoToEventForAssignment(
            event,
            alertedEvent
        );
        if (!eventForAssignment) {
            return;
        }
        onCreateAssignment(eventForAssignment, task);
    };

    // const onEditAssignment = (assignment: AssignmentDto) => {
    //     setAssignmentForm({
    //         id: assignment.id,
    //         task: assignment.task,
    //         startDate: dayjs
    //             .unix(assignment.startDate)
    //             .format(conf.dateInputFormat),
    //         endDate: dayjs
    //             .unix(assignment.endDate)
    //             .format(conf.dateInputFormat),
    //         worker: assignment.worker,
    //         state: assignment.state,
    //         event: assignment.,
    //         alertedEvent: assignment.event
    //     });
    //     setOpenedAssignmentScheduler(true);
    // };

    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
        new Set()
    );
    const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<
        Set<string>
    >(new Set());

    const onSelectEvent = (eventId: string) => {
        if (selectedAssignmentIds.size > 0) {
            return;
        }
        if (selectedEventIds.has(eventId)) {
            setSelectedEventIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(eventId);
                return newSet;
            });
        } else {
            setSelectedEventIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(eventId);
                return newSet;
            });
        }
    };

    const onSelectAssignment = (assignmentId: string) => {
        if (selectedEventIds.size > 0) {
            return;
        }
        if (selectedAssignmentIds.has(assignmentId)) {
            setSelectedAssignmentIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(assignmentId);
                return newSet;
            });
        } else {
            setSelectedAssignmentIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(assignmentId);
                return newSet;
            });
        }
    };

    const { remove: removeEvent } = useCrud('event');
    const { remove: removeAssignment } = useCrud('assignment');

    const queryClient = useQueryClient();

    const deleteEvent = async (id: string) => {
        await removeEvent(id);
        showNotificationSuccess('Event deleted');
        queryClient.invalidateQueries({
            queryKey: ['schedulerInfo']
        });
        queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    const onDeleteEvent = (id: string) => {
        openModal({
            title: 'Delete event',
            message: 'Deleting this event will remove it permanently.',
            color: 'error',
            onConfirm: () => deleteEvent(id)
        });
    };

    const deleteAssignment = async (id: string) => {
        await removeAssignment(id);
        showNotificationSuccess('Assignment deleted');
        queryClient.invalidateQueries({
            queryKey: ['schedulerInfo']
        });
    };

    const onDeleteAssignment = (id: string) => {
        openModal({
            title: 'Delete assignment',
            message:
                'Are you sure you want to delete this assignment? This action cannot be undone',
            color: 'red',
            onConfirm: () => deleteAssignment(id)
        });
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <SchedulerDatePicker
                    date={startOfWeek}
                    setDate={setStartOfWeek}
                />
                <div
                    style={{
                        display: 'flex',
                        gap: '3rem',
                        alignItems: 'center'
                    }}
                >
                    <SchedulerActions
                        selectedEventIds={selectedEventIds}
                        setSelectedEventIds={setSelectedEventIds}
                        selectedAssignmentIds={selectedAssignmentIds}
                        setSelectedAssignmentIds={setSelectedAssignmentIds}
                    />
                    <AlertsIndicator onClick={() => setOpenedDrawer(true)} />
                </div>
            </div>
            <WeeklyCalendar
                startOfWeek={startOfWeek}
                selectedEventIds={selectedEventIds}
                onSelectEvent={onSelectEvent}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                onSelectAssignment={onSelectAssignment}
                onEditAssignment={onUpdateAssignment}
                onDeleteAssignment={onDeleteAssignment}
            />
            <AlertsDrawer
                opened={openedDrawer}
                onClose={() => setOpenedDrawer(false)}
                onCreateNewAssignment={onCreateNewAssignment}
            />
            {eventFormModal}
            {assignmentScheduler}
        </>
    );
}
