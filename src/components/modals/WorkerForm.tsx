import { Button, Select, TextInput } from '@mantine/core';
import { useCrud } from '../../hooks/useCrud';
import { useError } from '../../hooks/useError';
import { useEffect, useState } from 'react';
import { ModalButtons } from '../molecules/ModalButtons';
import { Worker } from '../../types/entities';
import { LANGUAGE, Language } from '../../types/enums';
import {
    WorkerFormFields,
    formFieldsToCreateWorkerForm,
    formFieldsToUpdateWorkerForm,
    workerToForm
} from '../../types/forms';
import { notEmptyValidator, useValidator } from '../../hooks/useValidator';
import { useMutation } from '@tanstack/react-query';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { useReactQuery } from '../../hooks/useReactQuery';

export function WorkerForm({
    onClose,
    entity: worker
}: {
    onClose?: () => void;
    entity?: Worker;
}) {
    const { create, update } = useCrud<Worker>('worker');
    const { handleError } = useError();
    const { queryClient } = useReactQuery();

    const [formFields, setFormFields] = useState<WorkerFormFields>(
        workerToForm(worker)
    );

    useEffect(() => {
        if (worker) {
            setFormFields(workerToForm(worker));
        }
    }, [worker]);

    const {
        dirty: nameDirty,
        error: nameError,
        message: nameMessage,
        validate: nameValidate,
        activateDirty: setDirtyName
    } = useValidator(formFields.name, [notEmptyValidator]);

    const createWorker = async () => {
        await create(formFieldsToCreateWorkerForm(formFields));
    };

    const { mutate: createWorkerMutation, isPending: isLoadingCreate } =
        useMutation({
            mutationFn: createWorker,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['workers'] });
                queryClient.invalidateQueries({
                    queryKey: ['worker', worker?.id]
                });
                showNotificationSuccess('Worker created');
                onClose?.();
            },
            onError: (e) => handleError(e)
        });

    const updateWorker = async () => {
        await update(formFieldsToUpdateWorkerForm(formFields));
    };

    const { mutate: updateWorkerMutation, isPending: isLoadingUpdate } =
        useMutation({
            mutationFn: updateWorker,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['workers'] });
                queryClient.invalidateQueries({
                    queryKey: ['worker', worker?.id]
                });
                queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
                queryClient.invalidateQueries({ queryKey: ['event'] });

                showNotificationSuccess('Worker updated');
                onClose?.();
            },
            onError: (e) => handleError(e)
        });

    const onSubmit = () => {
        if (!nameValidate()) return;

        if (worker) {
            updateWorkerMutation();
        } else {
            createWorkerMutation();
        }
    };

    const disabledButton = isLoadingCreate || isLoadingUpdate || nameError;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <TextInput
                withAsterisk
                label="Name"
                value={formFields.name}
                onChange={(e) =>
                    setFormFields({
                        ...formFields,
                        name: e.target.value
                    })
                }
                onBlur={() => setDirtyName()}
                error={nameError && nameDirty ? nameMessage : undefined}
            />
            <Select
                label="Language"
                data={Object.values(LANGUAGE)}
                value={formFields.language}
                onChange={(value) =>
                    setFormFields({
                        ...formFields,
                        language: value as Language
                    })
                }
                searchable
            />
            <ModalButtons>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    loading={isLoadingCreate || isLoadingUpdate}
                    disabled={disabledButton}
                >
                    {worker ? 'Update' : 'Create'}
                </Button>
            </ModalButtons>
        </form>
    );
}
