import { Button, Switch, Tabs, TextInput } from '@mantine/core';
import { ApartmentWithTasks, Task } from '../../types/entities';
import { useState } from 'react';
import { notEmptyValidator, useValidator } from '../../hooks/useValidator';
import {
    ApartmentFormFields,
    apartmentToForm,
    formFieldsToCreateApartmentForm,
    formFieldsToUpdateApartmentForm
} from '../../types/forms';
import { useCrud } from '../../hooks/useCrud';
import { useMutation } from '@tanstack/react-query';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { useReactQuery } from '../../hooks/useReactQuery';
import { useError } from '../../hooks/useError';
import { useApi } from '../../hooks/useApi';
import { useConfirmModalWithContext } from '../../hooks/useConfirmModalWithContext';
import { useScreen } from '../../hooks/useScreen';
import { ModalButtons } from '../molecules/ModalButtons';
import { IconPlus } from '@tabler/icons-react';
import { useEntityModal } from '../../hooks/useEntityModal';
import { TaskOrTemplateForm } from './TaskOrTemplateForm';
import { TaskOrTemplateFormSkeleton } from '../skeletons/TaskOrTemplateFormSkeleton';
import { TasksSection } from '../molecules/TasksSection';

export function ApartmentForm({
    onClose,
    entity: apartment
}: {
    onClose?: () => void;
    entity?: ApartmentWithTasks;
}) {
    const { queryClient } = useReactQuery();
    const { handleError } = useError();
    const { hide, unhide } = useApi();
    const { openModal } = useConfirmModalWithContext();
    const [formFields, setFormFields] = useState<ApartmentFormFields>(
        apartmentToForm(apartment)
    );

    const { onOpen: onOpenFormModal, modalComponent: taskFormModal } =
        useEntityModal<Task>({
            entityName: 'task',
            ModalBodyComponent: TaskOrTemplateForm,
            ModalBodySkeleton: TaskOrTemplateFormSkeleton,
            relatedEntity: apartment
        });

    const [section, setSection] = useState<string | null>('apartmentInfo');
    const [showHiddenTasks, setShowHiddenTasks] = useState<boolean>(false);

    const { mutateAsync: toggleTaskVisibility } = useMutation({
        mutationFn: async ({
            id,
            visible
        }: {
            id: string;
            visible: boolean;
        }) => {
            if (visible) {
                await hide('task', id);
            } else {
                await unhide('task', id);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['apartment', apartment?.id]
            });
            queryClient.invalidateQueries({ queryKey: ['apartments'] });
            queryClient.invalidateQueries({ queryKey: ['event'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
            showNotificationSuccess(
                variables.visible ? 'Task hidden' : 'Task shown'
            );
        },
        onError: handleError
    });

    const onToggleTaskVisibility = (id: string, visible: boolean) => {
        const isHiding = visible;
        openModal({
            title: isHiding ? 'Hide task' : 'Show task',
            message: isHiding
                ? 'Are you sure you want to hide this task? It will no longer appear in the default lists.'
                : 'Are you sure you want to show this task?',
            color: isHiding ? 'error' : 'primary',
            onConfirm: () => toggleTaskVisibility({ id, visible })
        });
    };

    const {
        dirty: nameDirty,
        activateDirty: setDirtyName,
        error: nameError,
        message: nameMessage,
        validate: nameValidate
    } = useValidator(formFields.name, [notEmptyValidator]);

    const { create, update: updateApartment } =
        useCrud<ApartmentWithTasks>('apartment');
    const { isTablet } = useScreen();

    const createApartment = async () => {
        await create(formFieldsToCreateApartmentForm(formFields));
    };

    const { mutate: createApartmentMutation, isPending: isLoadingCreate } =
        useMutation({
            mutationFn: createApartment,
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['apartments']
                });
                queryClient.invalidateQueries({
                    queryKey: ['apartment', apartment?.id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['schedulerInfo']
                });
                showNotificationSuccess('Apartment created');
                onClose?.();
            },
            onError: (e) => handleError(e)
        });

    const onUpdateApartment = async () => {
        await updateApartment(formFieldsToUpdateApartmentForm(formFields));
    };

    const { mutate: updateApartmentMutation, isPending: isLoadingUpdate } =
        useMutation({
            mutationFn: onUpdateApartment,
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['apartments']
                });
                queryClient.invalidateQueries({
                    queryKey: ['apartment', apartment?.id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['schedulerInfo']
                });
                showNotificationSuccess('Apartment updated');
                onClose?.();
            },
            onError: (e) => handleError(e)
        });

    const onSubmit = () => {
        if (!nameValidate()) return;

        if (apartment) {
            updateApartmentMutation();
        } else {
            createApartmentMutation();
        }
    };

    const disabledButton = isLoadingCreate || isLoadingUpdate || nameError;

    return (
        <>
            <Tabs
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
                value={section}
                onChange={(value) => setSection(value)}
            >
                <Tabs.List
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Tabs.Tab value="apartmentInfo">
                            Apartment info
                        </Tabs.Tab>
                        {apartment?.id && (
                            <Tabs.Tab value="tasks">Tasks</Tabs.Tab>
                        )}
                    </div>
                    {section === 'tasks' && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center'
                            }}
                        >
                            <Switch
                                label="Show hidden"
                                checked={showHiddenTasks}
                                onChange={(e) =>
                                    setShowHiddenTasks(
                                        e.currentTarget.checked
                                    )
                                }
                            />
                            <Button
                                onClick={() => onOpenFormModal()}
                                leftSection={<IconPlus />}
                                variant="transparent"
                            >
                                Add task
                            </Button>
                        </div>
                    )}
                </Tabs.List>
                <Tabs.Panel
                    value="apartmentInfo"
                    style={{ height: '100%', overflow: 'hidden' }}
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit();
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                overflow: 'auto',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <TextInput
                                    label="Name"
                                    variant="filled"
                                    value={formFields.name}
                                    onBlur={() => setDirtyName()}
                                    onChange={(e) =>
                                        setFormFields({
                                            ...formFields,
                                            name: e.target.value
                                        })
                                    }
                                    withAsterisk
                                    error={
                                        nameError && nameDirty
                                            ? nameMessage
                                            : undefined
                                    }
                                />
                            </div>
                            <TextInput
                                label="Airbnb ID"
                                variant="filled"
                                value={formFields.airbnbId}
                                onChange={(e) =>
                                    setFormFields({
                                        ...formFields,
                                        airbnbId: e.target.value
                                    })
                                }
                            />
                            <TextInput
                                label="Booking ID"
                                variant="filled"
                                value={formFields.bookingId}
                                onChange={(e) =>
                                    setFormFields({
                                        ...formFields,
                                        bookingId: e.target.value
                                    })
                                }
                            />
                            <TextInput
                                label="Street"
                                variant="filled"
                                value={formFields.street}
                                onChange={(e) =>
                                    setFormFields({
                                        ...formFields,
                                        street: e.target.value
                                    })
                                }
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <TextInput
                                    w={isTablet ? '20%' : '30%'}
                                    label="Zip code"
                                    variant="filled"
                                    value={formFields.zipCode}
                                    onChange={(e) =>
                                        setFormFields({
                                            ...formFields,
                                            zipCode: e.target.value
                                        })
                                    }
                                />
                                <TextInput
                                    w={isTablet ? '40%' : '70%'}
                                    label="City"
                                    variant="filled"
                                    value={formFields.city}
                                    onChange={(e) =>
                                        setFormFields({
                                            ...formFields,
                                            city: e.target.value
                                        })
                                    }
                                />
                                {isTablet && (
                                    <TextInput
                                        w={'40%'}
                                        label="Country"
                                        variant="filled"
                                        value={formFields.country}
                                        onChange={(e) =>
                                            setFormFields({
                                                ...formFields,
                                                country: e.target.value
                                            })
                                        }
                                    />
                                )}
                            </div>
                            {!isTablet && (
                                <TextInput
                                    w={'100%'}
                                    label="Country"
                                    variant="filled"
                                    value={formFields.country}
                                    onChange={(e) =>
                                        setFormFields({
                                            ...formFields,
                                            country: e.target.value
                                        })
                                    }
                                />
                            )}
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
                                {apartment ? 'Update' : 'Create'}
                            </Button>
                        </ModalButtons>
                    </form>
                </Tabs.Panel>
                <TasksSection
                    tasks={apartment?.tasks || []}
                    showHidden={showHiddenTasks}
                    onEdit={onOpenFormModal}
                    onToggleVisibility={onToggleTaskVisibility}
                />
            </Tabs>

            {taskFormModal}
        </>
    );
}
