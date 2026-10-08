import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge, Button } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

import { Event, FailedImportedEvent } from '../../types/entities';
import { getStartOfWeek } from '../../utils/utilFunctions';
import { SchedulerDatePicker } from '../molecules/SchedulerDatePicker';
import { AlertsIndicator } from '../atoms/AlertsIndicator';
import { AlertsDrawer } from './AlertsDrawer';
import { SchedulerActions } from '../molecules/SchedulerActions';
import { EventForm } from '../modals/EventForm';
import { ImportModal } from '../modals/ImportModal';
import { ImportIssuesModal } from '../modals/ImportIssuesModal';
import { useEntityModal } from '../../hooks/useEntityModal';
import { EventFormSkeleton } from '../skeletons/EventFormSkeleton';
import { useCrud } from '../../hooks/useCrud';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { useConfirmModalWithContext } from '../../hooks/useConfirmModalWithContext';
import { WeeklyCalendar } from './WeeklyCalendar';
import { useAssignmentSchedulerWithContext } from '../../hooks/useAssignmentSchedulerWithContext';
import { useError } from '../../hooks/useError';
import { useApi } from '../../hooks/useApi';

export function Scheduler() {
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
    const [importModalOpened, setImportModalOpened] = useState<boolean>(false);
    const [issuesModalOpened, setIssuesModalOpened] = useState<boolean>(false);

    const { onUpdateAssignment } = useAssignmentSchedulerWithContext();

    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
        new Set()
    );
    const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<
        Set<string>
    >(new Set());

    const [nSuccessItems, setNSuccessItems] = useState<number | undefined>(
        undefined
    );

    const onOpenIssuesModal = (nSuccessItems: number) => {
        setNSuccessItems(nSuccessItems);
        setIssuesModalOpened(true);
    };

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

    const { handleError } = useError();

    const { getFailedImportedEvents } = useApi();

    const { data: failedImportedEvents } = useQuery<FailedImportedEvent[]>({
        queryKey: ['failedImportedEvents'],
        queryFn: getFailedImportedEvents
    });

    const deleteEvent = async (id: string) => {
        await removeEvent(id);
    };

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event'] });
        queryClient.invalidateQueries({ queryKey: ['apartments'] });
        queryClient.invalidateQueries({ queryKey: ['apartment'] });
        queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
    };

    const { mutateAsync: deleteEventMutation } = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            invalidateQueries();
            showNotificationSuccess('Event deleted');
        },
        onError: handleError
    });

    const onDeleteEvent = (id: string) =>
        openModal({
            title: 'Delete event',
            message: 'Deleting this event will remove it permanently.',
            color: 'error',
            onConfirm: () => deleteEventMutation(id)
        });

    const deleteAssignment = async (id: string) => {
        await removeAssignment(id);
    };

    const { mutateAsync: deleteAssignmentMutation } = useMutation({
        mutationFn: deleteAssignment,
        onSuccess: () => {
            invalidateQueries();
            showNotificationSuccess('Assignment deleted');
        },
        onError: handleError
    });

    const onDeleteAssignment = (id: string) => {
        openModal({
            title: 'Delete assignment',
            message:
                'Are you sure you want to delete this assignment? This action cannot be undone',
            color: 'red',
            onConfirm: () => deleteAssignmentMutation(id)
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
                    <Button
                        variant="filled"
                        leftSection={<IconUpload size={18} />}
                        onClick={() => setImportModalOpened(true)}
                    >
                        Import Reservations
                    </Button>
                    {failedImportedEvents?.length &&
                        failedImportedEvents.length > 0 && (
                            <Badge
                                variant="filled"
                                color="warning"
                                size="lg"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setIssuesModalOpened(true)}
                            >
                                Pending Issues ({failedImportedEvents.length})
                            </Badge>
                        )}
                    <AlertsIndicator onClick={() => setOpenedDrawer(true)} />
                </div>
            </div>
            <WeeklyCalendar
                startOfWeek={startOfWeek}
                selectedEventIds={selectedEventIds}
                onSelectEvent={onSelectEvent}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                selectedAssignmentIds={selectedAssignmentIds}
                onSelectAssignment={onSelectAssignment}
                onEditAssignment={onUpdateAssignment}
                onDeleteAssignment={onDeleteAssignment}
            />
            <AlertsDrawer
                opened={openedDrawer}
                onClose={() => setOpenedDrawer(false)}
            />
            {eventFormModal}
            <ImportModal
                opened={importModalOpened}
                onClose={() => setImportModalOpened(false)}
                onOpenIssuesModal={onOpenIssuesModal}
            />
            <ImportIssuesModal
                opened={issuesModalOpened}
                onClose={() => setIssuesModalOpened(false)}
                nSuccessItems={nSuccessItems}
            />
        </>
    );
}
