import { Accordion, Text } from '@mantine/core';
import {
    Event,
    EventSchedulerDto,
    eventSchedulerDtoToEventForAssignment,
    Task
} from '../../types/entities';
import { ALERT, Alert, ASSIGNMENT_STATE } from '../../types/enums';
import { conf } from '../../../conf';
import dayjs from 'dayjs';
import { TaskOrTemplateCard } from './TaskOrTemplateCard';
import { AlertIcon } from '../atoms/AlertIcon';
import { SchedulerAssignmentCard } from './SchedulerAssignmentCard';
import { useAssignmentScheduler } from '../../hooks/useAssignmentScheduler';
import { useApi } from '../../hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useError } from '../../hooks/useError';

export function AlertEvent({
    alertType,
    event,
    prevEvent
}: {
    alertType: Alert;
    event: Event;
    prevEvent: EventSchedulerDto;
}) {
    const { onCreateAssignment } = useAssignmentScheduler();

    const onCreateNewAssignment = (
        event: EventSchedulerDto,
        alertedEvent: Event,
        task: Task
    ) => {
        const eventForAssignment = eventSchedulerDtoToEventForAssignment(
            event,
            alertedEvent
        );
        if (!eventForAssignment) {
            return;
        }
        onCreateAssignment(eventForAssignment, task);
    };

    const { handleError } = useError();

    const { assignmentBulkStateUpdate } = useApi();

    const onAssignmentComplete = async (assignmentId: string) => {
        const errors = await assignmentBulkStateUpdate(
            [assignmentId],
            ASSIGNMENT_STATE.FINISHED
        );
        if (errors.length > 0) {
            handleError(errors);
        }
    };

    const queryClient = useQueryClient();

    const { mutate: mutateAssignmentComplete } = useMutation({
        mutationFn: onAssignmentComplete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event'] });
            queryClient.invalidateQueries({ queryKey: ['apartments'] });
            queryClient.invalidateQueries({ queryKey: ['apartment'] });
        }
    });

    return (
        <Accordion.Item key={event.id} value={event.id}>
            <Accordion.Control>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem'
                        }}
                    >
                        <AlertIcon alertType={alertType} size={24} />
                        <Text lineClamp={1}>{event.name}</Text>
                    </div>
                    <Text fw={'bold'}>
                        {dayjs
                            .unix(event.startDate)
                            .format(conf.dateTimeFormat)}
                    </Text>
                </div>
            </Accordion.Control>
            <Accordion.Panel
                styles={{
                    content: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        paddingTop: '0.5rem'
                    }
                }}
            >
                {alertType === ALERT.DAYS_LEFT_2_NOT_COMPLETED
                    ? prevEvent.uncompletedAssignments.map((assignment) => (
                          <SchedulerAssignmentCard
                              key={assignment.id}
                              item={assignment}
                              onClick={() =>
                                  mutateAssignmentComplete(assignment.id)
                              }
                          />
                      ))
                    : prevEvent.mandatoryUnassignedTasks.map((task) => (
                          <TaskOrTemplateCard
                              key={task.id}
                              item={task}
                              onClick={() => {
                                  onCreateNewAssignment(prevEvent, event, task);
                              }}
                          />
                      ))}
            </Accordion.Panel>
        </Accordion.Item>
    );
}
