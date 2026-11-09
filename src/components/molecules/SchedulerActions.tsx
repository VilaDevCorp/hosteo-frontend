import { ActionIcon, ActionIconGroup, Text } from '@mantine/core';
import { useState } from 'react';
import {
    ASSIGNMENT_STATE,
    AssignmentState,
    EVENT_STATE,
    EventState
} from '../../types/enums';
import {
    IconBan,
    IconCheckbox,
    IconHourglassEmpty,
    IconPlayerPlay,
    IconTrash,
    IconX
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useError } from '../../hooks/useError';
import {
    AssignmentOperationError,
    BulkOperationResponse,
    EventOperationError,
    ITEM_TYPE,
    ItemType
} from '../../types/entities';
import styles from './SchedulerActions.module.css';
import { useConfirmModalWithContext } from '../../hooks/useConfirmModalWithContext';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { BulkOperationResultModal } from '../modals/BulkOperationResultModal';
import { BulkAction, getBulkResultLabel } from '../../utils/bulkResultLabel';

interface SchedulerActionProps {
    selectedEventIds: Set<string>;
    setSelectedEventIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedAssignmentIds: Set<string>;
    setSelectedAssignmentIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

type BulkEventResult = BulkOperationResponse<EventOperationError>;
type BulkAssignmentResult = BulkOperationResponse<AssignmentOperationError>;

interface BulkResultModalState {
    itemType: ItemType;
    action: BulkAction;
    successCount: number;
    errors: (EventOperationError | AssignmentOperationError)[];
}

export function SchedulerActions({
    selectedEventIds,
    setSelectedEventIds,
    selectedAssignmentIds,
    setSelectedAssignmentIds
}: SchedulerActionProps) {
    const {
        eventBulkStateUpdate,
        assignmentBulkStateUpdate,
        eventBulkDelete,
        assignmentBulkDelete
    } = useApi();

    const { handleError } = useError();
    const queryClient = useQueryClient();
    const { openModal } = useConfirmModalWithContext();

    const [bulkResult, setBulkResult] = useState<BulkResultModalState | null>(
        null
    );

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event'] });
        queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
        queryClient.invalidateQueries({ queryKey: ['apartments'] });
        queryClient.invalidateQueries({ queryKey: ['apartment'] });
    };

    const showBulkResult = (
        itemType: ItemType,
        action: BulkAction,
        result: BulkEventResult | BulkAssignmentResult
    ) => {
        invalidateQueries();

        if (itemType === ITEM_TYPE.EVENT) {
            setSelectedEventIds(new Set());
        } else {
            setSelectedAssignmentIds(new Set());
        }

        if (result.errors.length === 0) {
            showNotificationSuccess(
                getBulkResultLabel(itemType, action, result.successCount)
            );
        } else {
            setBulkResult({
                itemType,
                action,
                successCount: result.successCount,
                errors: result.errors
            });
        }
    };

    const onBulkEventStateUpdate = async (
        state: EventState
    ): Promise<BulkEventResult> => {
        const eventIds = Array.from(selectedEventIds.values());
        return eventBulkStateUpdate(eventIds, state);
    };
    const { mutate: mutateBulkEventStateUpdate } = useMutation({
        mutationFn: onBulkEventStateUpdate,
        onSuccess: (result) => {
            showBulkResult(ITEM_TYPE.EVENT, 'update', result);
        },
        onError: handleError
    });

    const onBulkAssignmentStateUpdate = async (
        state: AssignmentState
    ): Promise<BulkAssignmentResult> => {
        const assignmentIds = Array.from(selectedAssignmentIds.values());
        return assignmentBulkStateUpdate(assignmentIds, state);
    };
    const { mutate: mutateBulkAssignmentStateUpdate } = useMutation({
        mutationFn: onBulkAssignmentStateUpdate,
        onSuccess: (result) => {
            showBulkResult(ITEM_TYPE.ASSIGNMENT, 'update', result);
        },
        onError: handleError
    });

    const isVisible =
        selectedEventIds.size > 0 || selectedAssignmentIds.size > 0;
    const itemType: ItemType =
        selectedEventIds.size > 0 ? ITEM_TYPE.EVENT : ITEM_TYPE.ASSIGNMENT;

    const onDeselect = () => {
        if (selectedEventIds.size > 0) {
            setSelectedEventIds(new Set());
        } else if (selectedAssignmentIds.size > 0) {
            setSelectedAssignmentIds(new Set());
        }
    };

    const deleteEvents = async (
        ids: string[]
    ): Promise<BulkEventResult> => {
        return eventBulkDelete(ids);
    };

    const { mutateAsync: deleteEventsMutation } = useMutation({
        mutationFn: deleteEvents,
        onSuccess: (result, variables) => {
            showBulkResult(ITEM_TYPE.EVENT, 'delete', result);
            variables.forEach((id) => {
                queryClient.invalidateQueries({ queryKey: ['event', id] });
            });
        },
        onError: handleError
    });

    const openDeleteEventsModal = (ids: string[]) =>
        openModal({
            title: 'Delete events',
            message: 'Deleting these events will remove them permanently.',
            color: 'error',
            onConfirm: async () => {
                await deleteEventsMutation(ids);
            }
        });

    const deleteAssignments = async (
        ids: string[]
    ): Promise<BulkAssignmentResult> => {
        return assignmentBulkDelete(ids);
    };

    const { mutateAsync: deleteAssignmentsMutation } = useMutation({
        mutationFn: deleteAssignments,
        onSuccess: (result) => {
            showBulkResult(ITEM_TYPE.ASSIGNMENT, 'delete', result);
        },
        onError: handleError
    });

    const openDeleteAssignmentsModal = (ids: string[]) =>
        openModal({
            title: 'Delete assignments',
            message:
                'Are you sure you want to delete these assignments? This action cannot be undone',
            color: 'red',
            onConfirm: async () => {
                await deleteAssignmentsMutation(ids);
            }
        });

    return (
        <>
            {isVisible && (
                <ActionIconGroup className={styles.schedulerActionsContainer}>
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            paddingRight: '0.75rem',
                            borderRight: '1px solid var(--mantine-color-gray-3)'
                        }}
                    >
                        <ActionIcon
                            className={styles.deselectButton}
                            size={'sm'}
                            variant="transparent"
                            onClick={onDeselect}
                        >
                            <IconX />
                        </ActionIcon>
                        <Text size="sm" c="dimmed">{`${
                            itemType === ITEM_TYPE.EVENT
                                ? `${selectedEventIds.size} events`
                                : `${selectedAssignmentIds.size} assignments`
                        } selected`}</Text>
                    </div>

                    <ActionIcon
                        variant="transparent"
                        size={'lg'}
                        onClick={() =>
                            itemType === ITEM_TYPE.EVENT
                                ? mutateBulkEventStateUpdate(
                                      EVENT_STATE.PENDING
                                  )
                                : mutateBulkAssignmentStateUpdate(
                                      ASSIGNMENT_STATE.PENDING
                                  )
                        }
                    >
                        <IconHourglassEmpty />
                    </ActionIcon>
                    {itemType === ITEM_TYPE.EVENT && (
                        <ActionIcon
                            size={'lg'}
                            variant="transparent"
                            onClick={() =>
                                mutateBulkEventStateUpdate(
                                    EVENT_STATE.IN_PROGRESS
                                )
                            }
                        >
                            <IconPlayerPlay />
                        </ActionIcon>
                    )}
                    <ActionIcon
                        variant="transparent"
                        size={'lg'}
                        onClick={() =>
                            itemType === ITEM_TYPE.EVENT
                                ? mutateBulkEventStateUpdate(
                                      EVENT_STATE.FINISHED
                                  )
                                : mutateBulkAssignmentStateUpdate(
                                      ASSIGNMENT_STATE.FINISHED
                                  )
                        }
                    >
                        <IconCheckbox />
                    </ActionIcon>

                    {itemType === ITEM_TYPE.EVENT && (
                        <ActionIcon
                            variant="transparent"
                            size={'lg'}
                            onClick={() =>
                                mutateBulkEventStateUpdate(
                                    EVENT_STATE.CANCELLED
                                )
                            }
                        >
                            <IconBan />
                        </ActionIcon>
                    )}
                    <ActionIcon
                        variant="transparent"
                        color="red"
                        size={'lg'}
                        onClick={() => {
                            if (itemType === ITEM_TYPE.EVENT) {
                                openDeleteEventsModal(
                                    Array.from(selectedEventIds)
                                );
                            } else {
                                openDeleteAssignmentsModal(
                                    Array.from(selectedAssignmentIds)
                                );
                            }
                        }}
                    >
                        <IconTrash />
                    </ActionIcon>
                </ActionIconGroup>
            )}
            <BulkOperationResultModal
                opened={bulkResult !== null}
                onClose={() => setBulkResult(null)}
                itemType={bulkResult?.itemType ?? ITEM_TYPE.EVENT}
                action={bulkResult?.action ?? 'update'}
                successCount={bulkResult?.successCount ?? 0}
                errors={bulkResult?.errors ?? []}
            />
        </>
    );
}
