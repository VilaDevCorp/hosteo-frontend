import { Card, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { AssignmentInfoForScheduler } from '../../types/entities';
import { StateIndicator } from '../atoms/StateIndicator';

export function IncompleteAssignmentCard({
    assignment
}: {
    assignment: AssignmentInfoForScheduler;
}) {
    return (
        <Card
            w={'100%'}
            padding="0"
            radius="md"
            shadow="sm"
            style={{
                border: `3px solid var(--mantine-color-primary-6)`
            }}
        >
            <Card.Section
                style={{
                    position: 'relative',
                    height: '36px',
                    backgroundImage: 'url(apartment_placeholder.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                >
                    <Title
                        order={4}
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                            overflow: 'hidden',
                            fontSize: '1rem'
                        }}
                        fw={'lighter'}
                        c="black"
                    >
                        {assignment?.apartment?.name ?? ''}
                    </Title>
                </div>
            </Card.Section>

            <Card.Section
                p="0.5rem"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}
                >
                    <Text size="sm" lineClamp={1}>
                        {assignment?.task?.name ?? ''}
                    </Text>
                    <Text size="xs" lineClamp={1}>
                        {assignment?.worker?.name ?? ''}
                    </Text>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Text size="sm" fw={'ld'}>
                            {dayjs(assignment.startDate).format(
                                conf.timeFormat
                            )}
                            {' - '}
                            {dayjs(assignment.endDate).format(conf.timeFormat)}
                        </Text>
                        {assignment.state && (
                            <StateIndicator
                                state={assignment.state}
                                size="md"
                            />
                        )}
                    </div>
                </div>
            </Card.Section>
        </Card>
    );
}
