import { Button, Select } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Assignment, Task, Worker } from '../../types/entities';
import { useState } from 'react';
import { notEmptyValidator, useValidator } from '../../hooks/useValidator';
import { useCrud } from '../../hooks/useCrud';
import { useMutation } from '@tanstack/react-query';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { useReactQuery } from '../../hooks/useReactQuery';
import { useError } from '../../hooks/useError';
import { ModalButtons } from '../molecules/ModalButtons';
import {
    AssignmentFormFields,
    assignmentToForm,
    formFieldsToCreateAssignmentForm,
    formFieldsToUpdateAssignmentForm
} from '../../types/forms';
import { conf } from '../../../conf';
import dayjs from 'dayjs';
import { CustomTimePicker } from '../atoms/CustomTimePicker';
import { AssignmentStateBadge } from '../atoms/AssignmentStateBadge';
import { WorkerSelector } from '../molecules/WorkerSelector';
import { Event } from '../../types/entities';
import { ASSIGNMENT_STATE, AssignmentState } from '../../types/enums';

export function AssignmentForm({
    onClose,
    entity: assignment,
    relatedEntity,
    relatedEntitySecondary
}: {
    onClose?: () => void;
    entity?: Assignment;
    relatedEntity?: any;
    relatedEntitySecondary?: any;
}) {
    const { queryClient } = useReactQuery();
    const { handleError } = useError();
    const { create, update } = useCrud<Assignment>('assignment');

    const event = relatedEntity as Event;
    const task = relatedEntitySecondary as Task;

    const [formFields, setFormFields] = useState<AssignmentFormFields>(
        assignmentToForm(assignment, event?.id, task?.id)
    );
    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(
        assignment?.worker
    );

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

    const createAssignment = async () => {
        await create(formFieldsToCreateAssignmentForm(formFields));
    };

    const { mutate: createAssignmentMutation, isPending: isLoadingCreate } =
        useMutation({
            mutationFn: createAssignment,
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['event', event?.id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['schedulerInfo']
                });
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
                queryClient.invalidateQueries({
                    queryKey: ['event', event?.id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['schedulerInfo']
                });
                showNotificationSuccess('Assignment updated');
                onClose?.();
            },
            onError: handleError
        });

    const onSubmit = () => {
        if (!startDateValidate() || !endDateValidate() || !stateValidate())
            return;

        if (assignment) {
            updateAssignmentMutation();
        } else {
            createAssignmentMutation();
        }
    };

    const handleWorkerSelect = (worker: Worker) => {
        if (worker) {
            setFormFields((prev) => ({
                ...prev,
                workerId: worker.id
            }));
        }
        setSelectedWorker(worker);
    };

    const disabledButton =
        isLoadingCreate ||
        isLoadingUpdate ||
        startDateError ||
        endDateError ||
        stateError;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '400px'
            }}
        >
            <form
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '1rem'
                    }}
                >
                    <WorkerSelector
                        worker={selectedWorker}
                        onSelectWorker={handleWorkerSelect}
                    />
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <DatePicker
                        type="default"
                        defaultDate={formFields.startDate}
                        value={formFields.startDate}
                        onChange={(value) => {
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
                                        ? newStartDate.format(
                                              conf.dateInputFormat
                                          )
                                        : '',
                                    endDate: newEndDate.isValid()
                                        ? newEndDate.format(
                                              conf.dateInputFormat
                                          )
                                        : ''
                                };
                            });
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            gap: '1rem'
                        }}
                    >
                        <CustomTimePicker
                            isStart={true}
                            date={formFields.startDate}
                            updateDate={(value: string) =>
                                setFormFields((oldValue) => {
                                    const duration = task?.duration
                                        ? task.duration
                                        : 0;
                                    return {
                                        ...oldValue,
                                        startDate: value,
                                        endDate: dayjs(value)
                                            .add(duration, 'minute')
                                            .format(conf.dateInputFormat)
                                    };
                                })
                            }
                        />
                        <CustomTimePicker
                            isStart={false}
                            date={formFields.endDate}
                            updateDate={(value: string) =>
                                setFormFields((oldValue) => {
                                    const startDate = dayjs(oldValue.startDate);
                                    const newEndDate = dayjs(value);
                                    let endDate = startDate
                                        .set('hour', newEndDate.hour())
                                        .set('minute', newEndDate.minute());

                                    if (endDate.isBefore(startDate)) {
                                        endDate = endDate.add(1, 'day');
                                    }
                                    return {
                                        ...oldValue,
                                        endDate: endDate.format(
                                            conf.dateInputFormat
                                        )
                                    };
                                })
                            }
                        />
                        <Select
                            label="State"
                            value={formFields.state}
                            onChange={(val) => {
                                setFormFields({
                                    ...formFields,
                                    state: val as AssignmentState
                                });
                                setDirtyState();
                            }}
                            data={Object.values(ASSIGNMENT_STATE)}
                            withAsterisk
                            renderOption={(option) => (
                                <AssignmentStateBadge
                                    state={
                                        option.option.value as AssignmentState
                                    }
                                />
                            )}
                            error={
                                stateError && stateDirty
                                    ? stateMessage
                                    : undefined
                            }
                            allowDeselect={false}
                        />
                    </div>
                </div>
                <ModalButtons>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={disabledButton}
                        type="submit"
                        loading={isLoadingCreate || isLoadingUpdate}
                    >
                        {assignment ? 'Update' : 'Save'}
                    </Button>
                </ModalButtons>
            </form>
        </div>
    );
}
