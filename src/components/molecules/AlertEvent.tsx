import { Accordion, Text } from '@mantine/core';
import { EventSchedulerDto, TaskDto } from '../../types/entities';
import { ALERT } from '../../types/enums';
import { IconAlertTriangle } from '@tabler/icons-react';
import { conf } from '../../../conf';
import dayjs from 'dayjs';
import { TaskOrTemplateCard } from './TaskOrTemplateCard';

export function AlertEvent({
    eventSchedulerDto,
    handleCreateNewAssignment
}: {
    eventSchedulerDto: EventSchedulerDto;
    handleCreateNewAssignment: (eventSchedulerDto: EventSchedulerDto, task?: TaskDto) => void;
}) {
    return (
        <Accordion.Item key={eventSchedulerDto.id} value={eventSchedulerDto.id}>
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
                        {eventSchedulerDto.alert === ALERT.DAYS_LEFT_5_UNASSIGNED ? (
                            <IconAlertTriangle
                                color="var(--mantine-color-yellow-5)"
                                size={24}
                                style={{ flexShrink: 0 }}
                            />
                        ) : (
                            <IconAlertTriangle
                                color="var(--mantine-color-error-5)"
                                size={24}
                                style={{ flexShrink: 0 }}
                            />
                        )}
                        <Text lineClamp={1}>
                            {eventSchedulerDto.name}
                        </Text>
                    </div>
                    <Text fw={'bold'}>
                        {dayjs
                            .unix(eventSchedulerDto.startDate)
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
                {eventSchedulerDto.mandatoryUnassignedTasks.map((task) => (
                    <TaskOrTemplateCard
                        key={task.id}
                        item={task}
                        onClick={() => {
                            handleCreateNewAssignment(eventSchedulerDto, task);
                        }}
                    />
                ))}
            </Accordion.Panel>
        </Accordion.Item>
    );
}