import { useState } from 'react';
import { AssignmentScheduler } from '../components/organism/AssignmentScheduler';
import { useQuery } from '@tanstack/react-query';
import {
    AssignmentWithNextEventDto,
    EventForAssignment,
    Task
} from '../types/entities';
import { useCrud } from './useCrud';
import { Modal } from '@mantine/core';

export const useAssignmentScheduler = () => {
    const [assignmentId, setAssignmentId] = useState<string | undefined>();
    const [event, setEvent] = useState<EventForAssignment | undefined>();
    const [task, setTask] = useState<Task | undefined>();
    const [opened, setOpened] = useState<boolean>(false);

    const { get } = useCrud<AssignmentWithNextEventDto>('assignment');

    const { data: assignment, isLoading: isLoadingAssignment } =
        useQuery<AssignmentWithNextEventDto>({
            queryKey: ['assignment', assignmentId],
            queryFn: async () => await get(assignmentId!),
            enabled: !!assignmentId
        });

    const onUpdateAssignment = (assignmentId: string) => {
        setAssignmentId(assignmentId);
        setOpened(true);
    };

    const onCreateAssignment = (event: EventForAssignment, task: Task) => {
        setEvent(event);
        setTask(task);
        setOpened(true);
    };

    const onClose = () => {
        setOpened(false);
        setAssignmentId(undefined);
        setEvent(undefined);
        setTask(undefined);
    };

    const assignmentScheduler = (
        <Modal
            opened={opened}
            onClose={onClose}
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
        >
            {isLoadingAssignment ? (
                <>{'Loading...'}</>
            ) : (
                <AssignmentScheduler
                    assignment={assignment}
                    event={event}
                    task={task}
                    onClose={onClose}
                />
            )}
        </Modal>
    );

    return { assignmentScheduler, onCreateAssignment, onUpdateAssignment };
};
