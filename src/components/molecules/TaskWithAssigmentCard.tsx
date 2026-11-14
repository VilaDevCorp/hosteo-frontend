import {
    Button,
    Card,
    Image,
    Text,
    Title,
    useMantineTheme
} from '@mantine/core';
import { CardControls } from '../atoms/CardControls';
import { Assignment, Task } from '../../types/entities';
import { TaskCategoryBadge } from '../atoms/TaskCategoryBadge';
import { useScreen } from '../../hooks/useScreen';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { IconCheck } from '@tabler/icons-react';
import { Img } from '../atoms/Img';

interface TaskWithAssigmentCardProps {
    task: Task;
    assignment?: Assignment;
    onAssign: (task: Task) => void;
    onDelete?: (id: string) => void;
}

export function TaskWithAssigmentCard({
    task,
    assignment,
    onAssign,
    onDelete
}: TaskWithAssigmentCardProps) {
    const { isTablet } = useScreen();
    const theme = useMantineTheme();

    return (
        <Card
            w={'100%'}
            miw={'8rem'}
            p={0}
            h={'8rem'}
            style={{
                aligntasks: 'center',
                gap: '2rem',
                flexDirection: isTablet ? 'row' : 'column'
            }}
        >
            <div
                style={{
                    alignItems: 'center',
                    width: '40%',
                    gap: '1rem',
                    height: '100%',
                    display: 'flex',
                    padding: '1rem',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}
                >
                    <Title
                        order={4}
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden'
                        }}
                    >
                        {task.name}
                    </Title>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}
                >
                    <Text size="sm" c="dimmed">
                        {task.steps.length} steps
                    </Text>
                    <TaskCategoryBadge category={task.category} />
                </div>
            </div>

            {assignment ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        width: '60%',
                        height: '100%',
                        borderRadius: 'md',
                        padding: '1rem',
                        background: theme.colors.primary[0]
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Img
                            src={assignment.worker.imageUrl}
                            placeholder="/user_placeholder.svg"
                            w={'2rem'}
                            h={'2rem'}
                            alt="Worker picture"
                        />
                        <Text
                            size="sm"
                            c="dimmed"
                            style={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 1,
                                overflow: 'hidden'
                            }}
                        >
                            {assignment.worker.name}
                        </Text>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    ></div>
                    <Text size="sm">
                        {dayjs
                            .unix(assignment.startDate)
                            .format(conf.dateTimeFormat)}{' '}
                        -{' '}
                        {dayjs
                            .unix(assignment.endDate)
                            .format(conf.dateTimeFormat)}
                    </Text>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                    >
                        <Button
                            leftSection={<IconCheck />}
                            variant="subtle"
                            size="xs"
                            color="success"
                        >
                            Complete
                        </Button>
                        <CardControls
                            onEdit={onAssign && (() => onAssign(task))}
                            onDelete={onDelete && (() => onDelete(task.id))}
                        />
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        width: '60%',
                        height: '100%',
                        justifyContent: 'center',
                        borderRadius: 'md',
                        padding: '1rem'
                    }}
                >
                    <Button
                        variant="outline"
                        size="xs"
                        color="primary"
                        onClick={onAssign && (() => onAssign(task))}
                    >
                        Assign task
                    </Button>
                </div>
            )}
        </Card>
    );
}
