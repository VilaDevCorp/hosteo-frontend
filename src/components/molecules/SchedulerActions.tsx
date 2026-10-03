import { ActionIcon, ActionIconGroup, Text } from '@mantine/core';
import {
    ASSIGNMENT_STATE,
    AssignmentState,
    EVENT_STATE,
    EventState
} from '../../types/enums';
import {
    IconBan,
    IconBolt,
    IconCheck,
    IconCheckbox,
    IconHourglassEmpty,
    IconPlayerPlay,
    IconTrash,
    IconX
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useError } from '../../hooks/useError';
import { ITEM_TYPE, ItemType } from '../../types/entities';
import styles from './SchedulerActions.module.css';

interface SchedulerActionProps {
    selectedEventIds: Set<string>;
    setSelectedEventIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedAssignmentIds: Set<string>;
    setSelectedAssignmentIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function SchedulerActions({
    selectedEventIds,
    setSelectedEventIds,
    selectedAssignmentIds,
    setSelectedAssignmentIds
}: SchedulerActionProps) {
    const { eventBulkStateUpdate, assignmentBulkStateUpdate } = useApi();

    const { handleError } = useError();

    const onBulkEventStateUpdate = async (state: EventState) => {
        const eventIds = Array.from(selectedEventIds.values());
        const errors = await eventBulkStateUpdate(eventIds, state);
        if (errors.length > 0) {
            handleError(errors);
        }
    };
    const { mutate: mutateBulkEventStateUpdate } = useMutation({
        mutationFn: onBulkEventStateUpdate,
        onSuccess: () => {
            // reloadSchedulerInfo();
            setSelectedEventIds(new Set());
        }
    });

    const onBulkAssignmentStateUpdate = async (state: AssignmentState) => {
        const assignmentIds = Array.from(selectedAssignmentIds.values());
        const errors = await assignmentBulkStateUpdate(assignmentIds, state);
        if (errors.length > 0) {
            handleError(errors);
        }
    };
    const { mutate: mutateBulkAssignmentStateUpdate } = useMutation({
        mutationFn: onBulkAssignmentStateUpdate,
        onSuccess: () => {
            // reloadSchedulerInfo();
            setSelectedAssignmentIds(new Set());
        }
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

    return (
        isVisible && (
            <>
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
                        onClick={() => true}
                    >
                        <IconTrash />
                    </ActionIcon>
                </ActionIconGroup>
            </>
        )
    );
}
