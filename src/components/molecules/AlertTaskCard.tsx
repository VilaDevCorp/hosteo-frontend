import { Task } from '../../types/entities';
import { Button, Card, Text, Title } from '@mantine/core';
import { IconClockEdit } from '@tabler/icons-react';

export function AlertTaskCard({
    task,
    onCreateAssignment
}: {
    task: Task;
    onCreateAssignment: (task: Task) => void;
}) {
    return (
        <Card
            w={'100%'}
            padding="0"
            radius="md"
            shadow="sm"
            style={{
                flexShrink: 0,
                backgroundColor: 'white',
                flexDirection: 'column'
            }}
        >
            <Card.Section
                p="0.75rem"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Title
                    order={4}
                    style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 1,
                        overflow: 'hidden',
                        fontSize: '0.875rem'
                    }}
                    fw={'bold'}
                    c="black"
                >
                    {task.name}
                </Title>
                <Text size="0.8rem" fw={'bold'}>
                    {task.duration} min
                </Text>
            </Card.Section>
            <Card.Section
                p="0.75rem"
                pt="0"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                ></div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.25rem'
                    }}
                >
                    <Text size="0.875rem" lineClamp={1} c={'dimmed'}>
                        {task.category[0].toUpperCase() +
                            task.category.slice(1).toLowerCase()}
                    </Text>
                    <Button
                        leftSection={<IconClockEdit size={16} />}
                        variant="subtle"
                        color="success"
                        size="xs"
                        onClick={() => onCreateAssignment(task)}
                    >
                        Assign
                    </Button>
                </div>
            </Card.Section>
        </Card>
    );
}
