import {
    Button,
    Group,
    NumberInput,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput
} from '@mantine/core';
import { Apartment, Task, Template } from '../../types/entities';
import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useError } from '../../hooks/useError';
import { useReactQuery } from '../../hooks/useReactQuery';
import { useCrud } from '../../hooks/useCrud';
import { useMutation } from '@tanstack/react-query';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { ModalButtons } from '../molecules/ModalButtons';
import { notEmptyValidator, useValidator } from '../../hooks/useValidator';
import {
    TaskFormFields,
    TemplateFormFields,
    formFieldsToCreateTaskForm,
    formFieldsToCreateTemplateForm,
    formFieldsToUpdateTaskForm,
    formFieldsToUpdateTemplateForm,
    taskToForm,
    templateToForm
} from '../../types/forms';
import {
    CATEGORY_ENUM,
    TASK_TYPE,
    CategoryEnum,
    TaskType
} from '../../types/enums';
import { TaskStep } from '../atoms/TaskStep';

export function TaskOrTemplateForm({
    onClose,
    entity,
    relatedEntity
}: {
    onClose?: () => void;
    entity?: Template | Task;
    relatedEntity?: any;
}) {
    const apartment = relatedEntity as Apartment | undefined;
    const { handleError } = useError();
    const { queryClient } = useReactQuery();
    const { create: createTask, update: updateTask } = useCrud<Task>('task');
    const { create: createTemplate, update: updateTemplate } =
        useCrud<Template>('template');

    const IS_TASK = apartment?.id;

    const invalidateQueries = () => {
        if (IS_TASK) {
            queryClient.invalidateQueries({
                queryKey: ['task', entity?.id]
            });
            queryClient.invalidateQueries({
                queryKey: ['apartment', apartment?.id]
            });
        } else {
            queryClient.invalidateQueries({
                queryKey: ['template', entity?.id]
            });
            queryClient.invalidateQueries({
                queryKey: ['templates']
            });
        }
    };

    const [formFields, setFormFields] = useState<
        TemplateFormFields | TaskFormFields
    >(
        IS_TASK
            ? taskToForm(entity as Task, apartment?.id)
            : templateToForm(entity)
    );

    const [newStepValue, setNewStepValue] = useState<string>('');

    const {
        dirty: nameDirty,
        activateDirty: setDirtyName,
        error: nameError,
        message: nameMessage,
        validate: nameValidate
    } = useValidator(formFields.name, [notEmptyValidator]);

    const createEntity = async () => {
        if (IS_TASK) {
            await createTask(
                formFieldsToCreateTaskForm(formFields as TaskFormFields)
            );
        } else {
            await createTemplate(
                formFieldsToCreateTemplateForm(formFields as TemplateFormFields)
            );
        }
    };

    const { mutate: createEntityMutation, isPending: isLoadingCreate } =
        useMutation({
            mutationFn: createEntity,
            onSuccess: () => {
                invalidateQueries();
                showNotificationSuccess(
                    `${apartment?.id ? 'Task' : 'Template'} created`
                );
                onClose?.();
            },
            onError: (e) => handleError(e)
        });

    const updateEntity = async () => {
        if (!entity) return;
        if (IS_TASK) {
            await updateTask(
                formFieldsToUpdateTaskForm(formFields as TaskFormFields)
            );
        } else {
            await updateTemplate(
                formFieldsToUpdateTemplateForm(formFields as TemplateFormFields)
            );
        }
    };

    const { mutate: updateEntityMutation, isPending: isLoadingUpdate } =
        useMutation({
            mutationFn: updateEntity,
            onSuccess: () => {
                invalidateQueries();
                showNotificationSuccess(
                    `${IS_TASK ? 'Task' : 'Template'} updated`
                );
                onClose?.();
            },
            onError: (e) => handleError(e)
        });

    const onSubmit = () => {
        if (!nameValidate()) return;

        if (entity) {
            updateEntityMutation();
        } else {
            createEntityMutation();
        }
    };

    // Handle adding a new step
    const handleAddStep = () => {
        if (!newStepValue.trim()) return;
        setFormFields({
            ...formFields,
            steps: [...formFields.steps, newStepValue]
        });
        setNewStepValue('');
    };

    const disabledButton = isLoadingCreate || isLoadingUpdate || nameError;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <Stack gap="lg">
                <TextInput
                    label="Name"
                    withAsterisk
                    value={formFields.name}
                    onBlur={() => setDirtyName()}
                    onChange={(e) =>
                        setFormFields({ ...formFields, name: e.target.value })
                    }
                    error={nameError && nameDirty ? nameMessage : undefined}
                />

                <Select
                    label="Category"
                    data={Object.values(CATEGORY_ENUM)}
                    value={formFields.category}
                    onChange={(value) =>
                        setFormFields({
                            ...formFields,
                            category: value as CategoryEnum
                        })
                    }
                    searchable
                />

                <NumberInput
                    label="Duration (minutes)"
                    value={formFields.duration}
                    onChange={(value) =>
                        setFormFields({
                            ...formFields,
                            duration: Number(value)
                        })
                    }
                    min={0}
                />

                {'type' in formFields && (
                    <Select
                        label="Type"
                        data={Object.values(TASK_TYPE)}
                        value={(formFields as TaskFormFields).type}
                        onChange={(value) =>
                            setFormFields({
                                ...formFields,
                                type: value as TaskType
                            })
                        }
                        withAsterisk
                        allowDeselect={false}
                    />
                )}

                <Stack gap="xs">
                    <Text size="sm" fw={500}>
                        Steps
                    </Text>
                    {formFields.steps.length === 0 && (
                        <Text c="dimmed" size="sm" fs="italic">
                            No steps added yet.
                        </Text>
                    )}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            overflowY: 'auto',
                            padding: '0.25rem'
                        }}
                    >
                        {formFields.steps.map((step, index) => (
                            <TaskStep
                                key={index}
                                index={index}
                                value={step}
                                onEdit={(index, value) => {
                                    setFormFields((oldValue) => {
                                        const newVal = [...oldValue.steps];
                                        newVal[index] = value;
                                        return {
                                            ...oldValue,
                                            steps: newVal
                                        };
                                    });
                                }}
                                onDelete={(index) => {
                                    const newVal = [...formFields.steps];
                                    newVal.splice(index, 1);
                                    setFormFields({
                                        ...formFields,
                                        steps: newVal
                                    });
                                }}
                            />
                        ))}
                    </div>

                    <Group align="flex-start" mt="md">
                        <Textarea
                            placeholder="Add a new step..."
                            value={newStepValue}
                            onChange={(e) =>
                                setNewStepValue(e.currentTarget.value)
                            }
                            autosize
                            minRows={1}
                            style={{ flex: 1 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddStep();
                                }
                            }}
                        />
                        <Button
                            variant="light"
                            onClick={handleAddStep}
                            leftSection={<IconPlus />}
                            disabled={!newStepValue.trim()}
                        >
                            Add
                        </Button>
                    </Group>
                </Stack>
            </Stack>
            <ModalButtons>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    disabled={disabledButton}
                    type="submit"
                    loading={isLoadingCreate || isLoadingUpdate}
                >
                    {entity ? 'Update' : 'Create'}
                </Button>
            </ModalButtons>
        </form>
    );
}
