import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useState } from 'react';

import { useError } from '../../hooks/useError';
import {
    Assignment,
    Worker,
    SchedulerInfo,
    SchedulerItem
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
import { Button, Modal, Select } from '@mantine/core';
import { SelectWorkerModal } from '../modals/SelectWorkerModal';
import { SchedulerAssignWorker } from '../molecules/SchedulerAssignWorker';
import {
    AssignmentFormFields,
    AssignmentFormFieldsWithObjects,
    assignmentFormFieldsWithObjectsToForm,
    assignmentToForm,
    formFieldsToCreateAssignmentForm,
    formFieldsToUpdateAssignmentForm
} from '../../types/forms';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { useReactQuery } from '../../hooks/useReactQuery';
import { useCrud } from '../../hooks/useCrud';
import { notEmptyValidator, useValidator } from '../../hooks/useValidator';
import { AssignmentTimePicker } from '../atoms/AssignmentTimePicker.tsx';
import { ASSIGNMENT_STATE, AssignmentState } from '../../types/enums.ts';
import { AssignmentStateBadge } from '../atoms/AssignmentStateBadge.tsx';

export function AssignmentScheduler({
    opened,
    onClose,
    assignmentToModify
}: {
    opened: boolean;
    onClose: () => void;
    assignmentToModify?: AssignmentFormFieldsWithObjects;
}) {
    const { queryClient } = useReactQuery();
    const { create, update } = useCrud<Assignment>('assignment');
    const { handleError } = useError();
    const [selectWorkerModalOpened, setSelectWorkerModalOpened] =
        useState<boolean>(false);
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const { fetchWithAuth } = useAuth();
    const [formFields, setFormFields] = useState<AssignmentFormFields>(
        assignmentToForm(undefined, assignmentToModify?.eventId)
    );
    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>();

    useLayoutEffect(() => {
        if (assignmentToModify) {
            setSelectedWorker(assignmentToModify.worker);
            setFormFields(
                assignmentFormFieldsWithObjectsToForm(assignmentToModify)
            );
        } else {
            setFormFields(assignmentToForm(undefined));
        }
    }, [assignmentToModify]);

    const handleClose = () => {
        setFormFields(assignmentToForm(undefined));
        setSelectedWorker(undefined);
        onClose();
    };

    const [startOfWeek, setStartOfWeek] = useState<string>(
        getStartOfWeek(new Date().toISOString())
    );

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
        data: schedulerInfo,
        refetch: reloadSchedulerInfo,
        isError,
        error
    } = useQuery<SchedulerInfo>({
        queryKey: ['assignSchedulerInfo', startOfWeek],
        queryFn: async () => {
            const data = await searchSchedulerData(startOfWeek);
            setItemsByDate(
                groupItemsByDate(
                    startOfWeek,
                    data.eventInfo,
                    data.events,
                    data.assignments,
                    {
                        id: formFields?.id,
                        startDate: formFields?.startDate,
                        endDate: formFields?.endDate,
                        worker: selectedWorker,
                        state: formFields?.state,
                        apartment: assignmentToModify?.apartment,
                        task: assignmentToModify?.task,
                        prevEventId: assignmentToModify?.prevEventId
                    }
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
        reloadSchedulerInfo();
    }, [formFields]);

    const { error: startDateError, validate: startDateValidate } = useValidator(
        formFields.startDate,
        [notEmptyValidator]
    );
    const { error: endDateError, validate: endDateValidate } = useValidator(
        formFields.endDate,
        [notEmptyValidator]
    );

    const {
        dirty: stateDirty,
        activateDirty: setDirtyState,
        error: stateError,
        validate: stateValidate,
        message: stateMessage
    } = useValidator(formFields.state, [notEmptyValidator]);

    useEffect(() => {
        if (isError) {
            handleError(error);
        }
    }, [isError, error]);

    const createAssignment = async () => {
        if (!formFields.taskId) return;
        await create(formFieldsToCreateAssignmentForm(formFields));
    };

    const { mutate: createAssignmentMutation, isPending: isLoadingCreate } =
        useMutation({
            mutationFn: createAssignment,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
                showNotificationSuccess('Assignment created');
                handleClose?.();
            },
            onError: handleError
        });

    const updateAssignment = async () => {
        await update(formFieldsToUpdateAssignmentForm(formFields));
    };

    const { mutate: updateAssignmentMutation, isPending: isLoadingUpdate } =
        useMutation({
            mutationFn: updateAssignment,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
                showNotificationSuccess('Assignment updated');
                handleClose?.();
            },
            onError: handleError
        });

    const onSubmit = () => {
        if (!startDateValidate() || !endDateValidate() || !stateValidate())
            return;

        if (formFields.id) {
            updateAssignmentMutation();
        } else {
            createAssignmentMutation();
        }
    };

    const disabledButton =
        isLoadingCreate ||
        isLoadingUpdate ||
        startDateError ||
        endDateError ||
        stateError;

    const onChangeDate = (value: string) => {
        setFormFields((prev) => {
            const prevStartDate = dayjs(prev.startDate);
            const prevEndDate = dayjs(prev.endDate);
            let newStartDate = dayjs(value);
            let newEndDate = dayjs(value);

            if (newStartDate.isValid()) {
                if (prevStartDate.isValid()) {
                    newStartDate = newStartDate
                        .hour(prevStartDate.hour())
                        .minute(prevStartDate.minute());
                }
            }

            if (newEndDate.isValid()) {
                if (prevEndDate.isValid()) {
                    newEndDate = newEndDate
                        .hour(prevEndDate.hour())
                        .minute(prevEndDate.minute());
                }
            }

            if (newEndDate.isBefore(newStartDate)) {
                newEndDate = newEndDate.add(1, 'day');
            }

            return {
                ...prev,
                startDate: newStartDate.isValid()
                    ? newStartDate.format(conf.dateInputFormat)
                    : '',
                endDate: newEndDate.isValid()
                    ? newEndDate.format(conf.dateInputFormat)
                    : ''
            };
        });
    };

    const getDisabledDates = (date: string): boolean => {
        if (!schedulerInfo || !assignmentToModify) return false;

        const prevEventId = assignmentToModify.prevEventId;
        const nextEventId = assignmentToModify.eventId;

        if (prevEventId && schedulerInfo.eventInfo[prevEventId]) {
            const prevEvent = schedulerInfo.eventInfo[prevEventId];
            if (dayjs(date).isBefore(dayjs.unix(prevEvent.endDate), 'day')) {
                return true;
            }
        }

        if (nextEventId && schedulerInfo.eventInfo[nextEventId]) {
            const nextEvent = schedulerInfo.eventInfo[nextEventId];
            if (dayjs(date).isAfter(dayjs.unix(nextEvent.endDate), 'day')) {
                return true;
            }
        }

        return false;
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Schedule task"
            withCloseButton
            size={'xl'}
            styles={{
                content: {
                    maxWidth: '90rem',
                    height: '100%',
                    flex: 1
                },
                body: {
                    display: 'flex',
                    gap: '1rem',
                    flexDirection: 'column'
                }
            }}
            closeOnEscape={false}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.stopPropagation();
                    handleClose();
                }
                if (e.key === 'Enter') {
                    e.stopPropagation();
                    onSubmit();
                }
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '3rem',
                        alignItems: 'center'
                    }}
                >
                    <SchedulerDatePicker
                        date={startOfWeek}
                        setDate={setStartOfWeek}
                    />
                    {/* <EventAndTaskInfo
                        assignment={assignmentToModify}
                        eventInfo={schedulerInfo?.eventInfo}
                    /> */}
                </div>
                <AssignmentTimePicker
                    formFields={formFields}
                    setFormFields={setFormFields}
                    duration={assignmentToModify?.task?.duration || 0}
                />
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '1rem',
                        justifyContent: 'space-between'
                    }}
                >
                    <SchedulerAssignWorker
                        assignedWorker={selectedWorker}
                        setSelectWorkerModalOpened={setSelectWorkerModalOpened}
                    />
                    <Select
                        value={formFields.state}
                        onChange={(val) => {
                            setFormFields({
                                ...formFields,
                                state: val as AssignmentState
                            });
                            setDirtyState();
                        }}
                        data={Object.values(ASSIGNMENT_STATE)}
                        renderOption={(option) => (
                            <AssignmentStateBadge
                                state={option.option.value as AssignmentState}
                            />
                        )}
                        error={
                            stateError && stateDirty ? stateMessage : undefined
                        }
                        allowDeselect={false}
                    />
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
                {Array.from({ length: 7 }).map((_, index) => {
                    const date = dayjs(startOfWeek)
                        .add(index, 'day')
                        .toISOString();
                    return (
                        <SchedulerDay
                            key={index}
                            date={date}
                            items={
                                itemsByDate?.get(
                                    dayjs(startOfWeek)
                                        .add(index, 'day')
                                        .format(conf.dateUrlFormat)
                                ) || []
                            }
                            disabled={getDisabledDates(date)}
                            isSelected={dayjs(formFields.startDate).isSame(
                                dayjs(date),
                                'day'
                            )}
                            onClick={() => onChangeDate(date)}
                        />
                    );
                })}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}
            >
                <Button
                    variant="outline"
                    onClick={() => {
                        handleClose();
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="filled"
                    onClick={onSubmit}
                    disabled={disabledButton}
                >
                    {formFields?.id ? 'Update' : 'Create'}
                </Button>
            </div>

            <SelectWorkerModal
                opened={selectWorkerModalOpened}
                onClose={() => setSelectWorkerModalOpened(false)}
                onSelect={(worker) => {
                    setFormFields((prev) => {
                        return {
                            ...prev,
                            workerId: worker.id
                        };
                    });
                    setSelectedWorker(worker);
                    setSelectWorkerModalOpened(false);
                }}
            />
        </Modal>
    );
}
