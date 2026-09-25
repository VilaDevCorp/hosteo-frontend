import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useError } from '../../hooks/useError';
import {
    Assignment,
    AssignmentDto,
    Event,
    EventSchedulerDto,
    SchedulerInfo,
    SchedulerItem,
} from '../../types/entities';
import { ApiResponse } from '../../types/types';
import { useAuth } from '../../hooks/useAuth';
import {
    checkResponseException,
    getStartOfWeek,
    groupItemsByDate
} from '../../utils/utilFunctions';
import dayjs from 'dayjs';
import { SchedulerDatePicker } from '../molecules/SchedulerDatePicker';
import { conf } from '../../../conf';
import { SchedulerDay } from '../molecules/SchedulerDay';
// import { AlertsIndicator } from '../atoms/AlertsIndicator';
// import { AlertsDrawer } from './AlertsDrawer';
// import { AssignmentScheduler } from './AssignmentScheduler';
// import {
//     AssignmentFormFieldsWithObjects,
//     EventFormFields,
//     eventToForm
// } from '../../types/forms';
import {
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
import { AssignmentForm } from '../modals/AssignmentForm';
import { WorkerCardSkeleton } from '../molecules/WorkerCardSkeleton';

export function Scheduler() {
    const { handleError } = useError();

    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const { fetchWithAuth } = useAuth();

    const [startOfWeek, setStartOfWeek] = useState<string>(
        getStartOfWeek(new Date().toISOString())
    );

    const { openModal } = useConfirmModalWithContext();

    const { onOpen: onOpenEditEvent, modalComponent: eventFormModal } =
        useEntityModal<Event>({
            entityName: 'event',
            removeHeader: true,
            ModalBodyComponent: EventForm,
            ModalBodySkeleton: EventFormSkeleton
        });

    // const [openedAssignmentScheduler, setOpenedAssignmentScheduler] =
    //     useState<boolean>(false);
    // const [openedDrawer, setOpenedDrawer] = useState<boolean>(false);

    // const [assignmentToModify, setAssignmentToModify] = useState<
    //     AssignmentFormFieldsWithObjects | undefined
    // >(undefined);

    // const handleCreateNewAssignment = (
    //     eventSchedulerDto: EventSchedulerDto,
    //     task?: TaskDto
    // ) => {
    //     if (!schedulerInfo) return;

    //     const prevEventId = schedulerInfo.previousEvent[eventSchedulerDto.id];

    //     setAssignmentToModify({
    //         id: undefined,
    //         task: task,
    //         apartment: undefined,
    //         worker: undefined,
    //         startDate: undefined,
    //         endDate: undefined,
    //         state: ASSIGNMENT_STATE.PENDING,
    //         eventId: eventSchedulerDto.id,
    //         prevEventId: prevEventId
    //     });
    //     setOpenedAssignmentScheduler(true);
    // };

    const searchSchedulerData = async (
        date: string
    ): Promise<SchedulerInfo> => {
        const url = `${apiUrl}scheduler/${dayjs(date).format(conf.dateUrlFormat)}`;
        const options: RequestInit = {
            method: 'GET',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<SchedulerInfo> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };
    const [itemsByDate, setItemsByDate] =
        useState<Map<string, SchedulerItem[]>>();
    const {
        refetch: reloadSchedulerInfo,
        isError,
        error
    } = useQuery<SchedulerInfo>({
        queryKey: ['schedulerInfo', startOfWeek],
        queryFn: async () => {
            const data = await searchSchedulerData(startOfWeek);
            setItemsByDate(
                groupItemsByDate(
                    startOfWeek,
                    data.eventInfo,
                    data.events,
                    data.assignments
                )
            );
            return data;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        enabled: !!startOfWeek
    });

    useEffect(() => {
        if (isError) {
            handleError(error);
        }
    }, [isError, error]);

    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
        new Set()
    );
    const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<
        Set<string>
    >(new Set());

    const handleSelectEvent = (event: EventSchedulerDto) => {
        if (selectedAssignmentIds.size > 0) {
            return;
        }
        if (selectedEventIds.has(event.id)) {
            setSelectedEventIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(event.id);
                return newSet;
            });
        } else {
            setSelectedEventIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(event.id);
                return newSet;
            });
        }
    };

    const handleSelectAssignment = (assignment: AssignmentDto) => {
        if (selectedEventIds.size > 0) {
            return;
        }
        if (selectedAssignmentIds.has(assignment.id)) {
            setSelectedAssignmentIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(assignment.id);
                return newSet;
            });
        } else {
            setSelectedAssignmentIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(assignment.id);
                return newSet;
            });
        }
    };

    const { eventBulkStateUpdate, assignmentBulkStateUpdate } = useApi();

    const handleBulkEventStateUpdate = async (state: EventState) => {
        const eventIds = Array.from(selectedEventIds.values());
        const errors = await eventBulkStateUpdate(eventIds, state);
        if (errors.length > 0) {
            handleError(errors);
        }
    };
    const { mutate: mutateBulkEventStateUpdate } = useMutation({
        mutationFn: handleBulkEventStateUpdate,
        onSuccess: () => {
            reloadSchedulerInfo();
            setSelectedEventIds(new Set());
        }
    });

    const handleBulkAssignmentStateUpdate = async (state: AssignmentState) => {
        const assignmentIds = Array.from(selectedAssignmentIds.values());
        const errors = await assignmentBulkStateUpdate(assignmentIds, state);
        if (errors.length > 0) {
            handleError(errors);
        }
    };
    const { mutate: mutateBulkAssignmentStateUpdate } = useMutation({
        mutationFn: handleBulkAssignmentStateUpdate,
        onSuccess: () => {
            reloadSchedulerInfo();
            setSelectedAssignmentIds(new Set());
        }
    });

    const { remove: removeEvent } = useCrud('event');
    const { remove: removeAssignment } = useCrud('assignment');

    const queryClient = useQueryClient();

    const onDeleteEvent = async (id: string) => {
        await removeEvent(id);
        showNotificationSuccess('Event deleted');
        queryClient.invalidateQueries({
            queryKey: ['schedulerInfo']
        });
        queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    const openDeleteEventModal = (id: string) =>
        openModal({
            title: 'Delete event',
            message: 'Deleting this event will remove it permanently.',
            color: 'error',
            onConfirm: () => onDeleteEvent(id)
        });

    const {
        onOpen: openAssignmentFormModal,
        modalComponent: assignmentFormModalComponent
    } = useEntityModal<Assignment>({
        entityName: 'assignment',
        ModalBodyComponent: AssignmentForm,
        ModalBodySkeleton: WorkerCardSkeleton,
        relatedEntity: undefined,
        relatedEntitySecondary: undefined
    });

    const onDeleteAssignment = async (id: string) => {
        await removeAssignment(id);
        showNotificationSuccess('Assignment deleted');
        queryClient.invalidateQueries({
            queryKey: ['schedulerInfo']
        });
    };

    const openDeleteAssignmentModal = (id: string) =>
        openModal({
            title: 'Delete assignment',
            message:
                'Are you sure you want to delete this assignment? This action cannot be undone',
            color: 'red',
            onConfirm: () => onDeleteAssignment(id)
        });

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
                    {(selectedEventIds.size > 0 ||
                        selectedAssignmentIds.size > 0) && (
                        <SchedulerActions
                            selectedType={
                                selectedEventIds.size > 0
                                    ? 'events'
                                    : 'assignments'
                            }
                            onEventStateUpdate={mutateBulkEventStateUpdate}
                            onAssignmentStateUpdate={
                                mutateBulkAssignmentStateUpdate
                            }
                            onBulkDelete={() => {}}
                            onDeselect={() => {
                                setSelectedEventIds(new Set());
                                setSelectedAssignmentIds(new Set());
                            }}
                        />
                    )}
                    {/* <AlertsIndicator
                        onClick={() => setOpenedDrawer(true)}
                        redAlertCount={schedulerInfo?.redAlertEvents?.length}
                        yellowAlertCount={
                            schedulerInfo?.yellowAlertEvents?.length
                        }
                    /> */}
                </div>
            </div>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto'
                }}
            >
                {Array.from({ length: 7 }).map((_, index) => (
                    <SchedulerDay
                        key={index}
                        date={dayjs(startOfWeek)
                            .add(index, 'day')
                            .toISOString()}
                        items={
                            itemsByDate?.get(
                                dayjs(startOfWeek)
                                    .add(index, 'day')
                                    .format(conf.dateUrlFormat)
                            ) || []
                        }
                        selectedEventIds={selectedEventIds}
                        onEventClick={handleSelectEvent}
                        onEventEdit={onOpenEditEvent}
                        onEventDelete={openDeleteEventModal}
                        selectedAssignmentIds={selectedAssignmentIds}
                        onAssignmentClick={handleSelectAssignment}
                        onAssignmentEdit={openAssignmentFormModal}
                        onAssignmentDelete={openDeleteAssignmentModal}
                    />
                ))}
            </div>
            {/* <AlertsDrawer
                opened={openedDrawer}
                onClose={() => setOpenedDrawer(false)}
                redAlertEvents={schedulerInfo?.redAlertEvents || []}
                yellowAlertEvents={schedulerInfo?.yellowAlertEvents || []}
                eventInfo={schedulerInfo?.eventInfo || {}}
                handleCreateNewAssignment={handleCreateNewAssignment}
            /> */}
            {eventFormModal}
            {assignmentFormModalComponent}
            {/* <AssignmentScheduler
                opened={openedAssignmentScheduler}
                onClose={() => setOpenedAssignmentScheduler(false)}
                assignmentToModify={assignmentToModify}
            /> */}
        </>
    );
}
