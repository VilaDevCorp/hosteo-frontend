import { Accordion, Text } from '@mantine/core';
import { Event, EventSchedulerDto, Task } from '../../types/entities';
import { ALERT, Alert } from '../../types/enums';
import { conf } from '../../../conf';
import dayjs from 'dayjs';
import { TaskOrTemplateCard } from './TaskOrTemplateCard';
import { AlertIcon } from '../atoms/AlertIcon';
import { SchedulerAssignmentCard } from './SchedulerAssignmentCard';

export function AlertEvent({
    alertType,
    event,
    prevEvent,
    handleCreateNewAssignment
}: {
    alertType: Alert;
    event: Event;
    prevEvent: EventSchedulerDto;
    handleCreateNewAssignment: (
        event: EventSchedulerDto,
        alertedEvent: Event,
        task: Task
    ) => void;
}) {
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
                          />
                      ))
                    : prevEvent.mandatoryUnassignedTasks.map((task) => (
                          <TaskOrTemplateCard
                              key={task.id}
                              item={task}
                              onClick={() => {
                                  handleCreateNewAssignment(
                                      prevEvent,
                                      event,
                                      task
                                  );
                              }}
                          />
                      ))}
            </Accordion.Panel>
        </Accordion.Item>
    );
}
