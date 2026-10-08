import { Accordion, Text, Title } from '@mantine/core';
import {
    Event,
    EventSchedulerDto,
    eventSchedulerDtoToEventForAssignment,
    Task
} from '../../types/entities';
import { ALERT, Alert } from '../../types/enums';
import { conf } from '../../../conf';
import dayjs from 'dayjs';
import { AlertIcon } from '../atoms/AlertIcon';
import { useAssignmentSchedulerWithContext } from '../../hooks/useAssignmentSchedulerWithContext';
import { AlertAssignmentCard } from './AlertAssignmentCard';
import { AlertTaskCard } from './AlertTaskCard';

const alertMessage = {
    [ALERT.DAYS_LEFT_2_NOT_COMPLETED]: 'Tasks to complete',
    [ALERT.DAYS_LEFT_2_UNASSIGNED]: 'Tasks to assign',
    [ALERT.DAYS_LEFT_5_UNASSIGNED]: 'Tasks to assign'
};

export function AlertEvent({
    alertType,
    event,
    prevEvent
}: {
    alertType: Alert;
    event: Event;
    prevEvent: EventSchedulerDto;
}) {
    const { onCreateAssignment } = useAssignmentSchedulerWithContext();

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

    return (
        <Accordion.Item
            key={event.id}
            value={event.id}
            styles={{ item: { padding: 0 } }}
        >
            <Accordion.Control>
                <div
                    style={{
                        position: 'relative',
                        height: '50px',
                        backgroundImage: 'url(apartment_placeholder.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        marginRight: '1rem'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                                height: '100%',
                                gap: '0.5rem'
                            }}
                        >
                            <Title
                                order={6}
                                style={{
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                    overflow: 'hidden'
                                }}
                                c="black"
                            >
                                {event.apartment.name ?? ''}
                            </Title>
                            <Text fw={'bold'} size="0.8rem">
                                {dayjs
                                    .unix(event.startDate)
                                    .format(conf.dateTimeFormat)}
                            </Text>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginRight: '1rem'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}
                        >
                            <AlertIcon alertType={alertType} size={24} />
                            <Text size="0.875rem" fw={'bold'} c={'dimmed'}>
                                {alertMessage[alertType]}
                            </Text>
                        </div>
                        <Text size="0.9rem" lineClamp={1}>
                            {event.name}
                        </Text>
                    </div>
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
                          <AlertAssignmentCard
                              key={assignment.id}
                              assignment={assignment}
                          />
                      ))
                    : prevEvent.mandatoryUnassignedTasks.map((task) => (
                          <AlertTaskCard
                              key={task.id}
                              task={task}
                              onCreateAssignment={(task: Task) =>
                                  onCreateNewAssignment(prevEvent, event, task)
                              }
                          />
                      ))}
            </Accordion.Panel>
        </Accordion.Item>
    );
}
