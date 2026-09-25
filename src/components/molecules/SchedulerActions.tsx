import { ActionIcon, ActionIconGroup } from '@mantine/core';
import {
    ASSIGNMENT_STATE,
    EVENT_STATE,
    AssignmentState,
    EventState
} from '../../types/enums';
import {
    IconBolt,
    IconCheck,
    IconHourglassEmpty,
    IconTrash,
    IconX
} from '@tabler/icons-react';

interface SchedulerActionProps {
    selectedType: 'events' | 'assignments';
    onEventStateUpdate: (state: EventState) => void;
    onAssignmentStateUpdate: (state: AssignmentState) => void;
    onBulkDelete: () => void;
    onDeselect: () => void;
}

export function SchedulerActions({
    selectedType,
    onEventStateUpdate,
    onAssignmentStateUpdate,
    onBulkDelete,
    onDeselect
}: SchedulerActionProps) {
    return (
        <ActionIconGroup>
            <ActionIcon
                variant="gradient"
                onClick={() =>
                    selectedType === 'events'
                        ? onEventStateUpdate(EVENT_STATE.PENDING)
                        : onAssignmentStateUpdate(ASSIGNMENT_STATE.PENDING)
                }
            >
                <IconHourglassEmpty />
            </ActionIcon>
            {selectedType === 'events' && (
                <ActionIcon
                    variant="outline"
                    onClick={() =>
                        onEventStateUpdate(EVENT_STATE.IN_PROGRESS)
                    }
                >
                    <IconBolt />
                </ActionIcon>
            )}
            <ActionIcon
                variant="outline"
                onClick={() =>
                    selectedType === 'events'
                        ? onEventStateUpdate(EVENT_STATE.FINISHED)
                        : onAssignmentStateUpdate(ASSIGNMENT_STATE.FINISHED)
                }
            >
                <IconCheck />
            </ActionIcon>
            {selectedType === 'events' && (
                <ActionIcon
                    variant="outline"
                    onClick={() => onEventStateUpdate(EVENT_STATE.CANCELLED)}
                >
                    <IconX />
                </ActionIcon>
            )}
            <ActionIcon variant="outline" onClick={() => onBulkDelete()}>
                <IconTrash />
            </ActionIcon>
            <ActionIcon variant="outline" onClick={() => onDeselect()}>
                <IconX />
            </ActionIcon>
        </ActionIconGroup>
    );
}