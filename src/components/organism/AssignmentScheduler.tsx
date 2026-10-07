import { useMutation } from '@tanstack/react-query';
import { useLayoutEffect, useState } from 'react';

import { useError } from '../../hooks/useError';
import {
    Assignment,
    AssignmentWithNextEventDto,
    EventForAssignment,
    eventToEventForAssignment,
    Task,
    Worker
} from '../../types/entities';
import { getStartOfWeek } from '../../utils/utilFunctions';
import { SchedulerDatePicker } from '../molecules/SchedulerDatePicker';
import { Button, Select } from '@mantine/core';
import { SelectWorkerModal } from '../modals/SelectWorkerModal';
import { SchedulerAssignWorker } from '../molecules/SchedulerAssignWorker';
import {
    AssignmentFormFields,
    assignmentToForm,
    eventAndTaskToAssignmentForm,
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
import { WeeklyCalendar } from './WeeklyCalendar.tsx';
import { EventAndTaskInfo } from '../molecules/EventAndTaskInfo.tsx';

export function AssignmentScheduler({
    onClose,
    assignment,
    event,
    task
}: {
    onClose: () => void;
    assignment?: AssignmentWithNextEventDto;
    event?: EventForAssignment;
    task?: Task;
}) {
    const { queryClient } = useReactQuery();
    const { create, update } = useCrud<Assignment>('assignment');
    const { handleError } = useError();
    const [selectWorkerModalOpened, setSelectWorkerModalOpened] =
        useState<boolean>(false);

    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>();

    const [formFields, setFormFields] = useState<AssignmentFormFields>(
        assignment
            ? assignmentToForm(assignment)
            : event && task
              ? eventAndTaskToAssignmentForm(event, task)
              : ({} as AssignmentFormFields)
    );

    useLayoutEffect(() => {
        setSelectedWorker(assignment?.worker);
    }, [assignment]);

    const [startOfWeek, setStartOfWeek] = useState<string>(
        getStartOfWeek(new Date().toISOString())
    );

    const { error: startDateError, validate: startDateValidate } = useValidator(
        formFields.startDate || '',
        [notEmptyValidator]
    );
    const { error: endDateError, validate: endDateValidate } = useValidator(
        formFields.endDate || '',
        [notEmptyValidator]
    );

    const {
        dirty: stateDirty,
        activateDirty: setDirtyState,
        error: stateError,
        validate: stateValidate,
        message: stateMessage
    } = useValidator(formFields.state, [notEmptyValidator]);

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event'] });
        queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
        queryClient.invalidateQueries({ queryKey: ['apartments'] });
        queryClient.invalidateQueries({ queryKey: ['apartment'] });
    };

    const createAssignment = async () => {
        if (!formFields.taskId) return;
        await create(formFieldsToCreateAssignmentForm(formFields));
    };

    const { mutate: createAssignmentMutation, isPending: isLoadingCreate } =
        useMutation({
            mutationFn: createAssignment,
            onSuccess: () => {
                invalidateQueries();
                showNotificationSuccess('Assignment created');
                onClose?.();
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
                invalidateQueries();
                showNotificationSuccess('Assignment updated');
                onClose?.();
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

    const eventId = assignment?.event?.id || event?.id;

    return (
        <>
            <div
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.stopPropagation();
                        onClose();
                    }
                    if (e.key === 'Enter') {
                        e.stopPropagation();
                        onSubmit();
                    }
                }}
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
                    {eventId && (
                        <EventAndTaskInfo
                            eventId={eventId}
                            task={assignment?.task || task}
                            apartmentName={
                                assignment?.event?.apartment?.name ||
                                event?.apartmentName
                            }
                        />
                    )}
                </div>
                <AssignmentTimePicker
                    formFields={formFields}
                    setFormFields={setFormFields}
                    duration={assignment?.task?.duration || task?.duration || 0}
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
            <WeeklyCalendar
                startOfWeek={startOfWeek}
                assignmentBeingModified={{
                    id: formFields?.id,
                    startDate: formFields?.startDate,
                    endDate: formFields?.endDate,
                    worker: selectedWorker,
                    state: formFields?.state,
                    apartment: assignment?.event.apartment,
                    task: assignment?.task || task,
                    event: assignment
                        ? eventToEventForAssignment(assignment.event)
                        : event
                }}
                setFormFields={setFormFields}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}
            >
                <Button variant="outline" onClick={onClose}>
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
        </>
    );
}
