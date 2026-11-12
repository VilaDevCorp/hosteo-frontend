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
import { EntityImageInput } from '../molecules/EntityImageInput';
import { useEntityImage } from '../../hooks/useEntityImage';
import { useApi } from '../../hooks/useApi';

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
    const { updateImage } = useApi();

    const [formFields, setFormFields] = useState<WorkerFormFields>(
        workerToForm(worker)
    );
    const image = useEntityImage(worker?.imageUrl);
    const resetImage = image.reset;

    useEffect(() => {
        if (worker) {
            setFormFields(workerToForm(worker));
            resetImage();
        }
    }, [worker, resetImage]);

    const {
        dirty: nameDirty,
        error: nameError,
        message: nameMessage,
        validate: nameValidate,
        activateDirty: setDirtyName
    } = useValidator(formFields.name, [notEmptyValidator]);

    const applyImageChanges = async (id: string) => {
        if (!image.dirty) {
            return;
        }
        try {
            await updateImage('worker', id, image.file);
        } catch (e) {
            // The worker is already saved, so keep the flow going and just
            // report the image problem instead of inviting a duplicate create.
            handleError(e);
        }
    };

    const createWorker = async () => {
        const created = await create(formFieldsToCreateWorkerForm(formFields));
        await applyImageChanges(created.id);
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
        if (worker) {
            await applyImageChanges(worker.id);
        }
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
            <div style={{ marginBottom: '1rem' }}>
                <EntityImageInput
                    image={image}
                    placeholderSrc="/user_placeholder.svg"
                    alt="Worker picture"
                    disabled={isLoadingCreate || isLoadingUpdate}
                />
            </div>
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
