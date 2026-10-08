import { AssignmentDto } from '../../types/entities';
import { Button, Card, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { IconCheckbox } from '@tabler/icons-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useError } from '../../hooks/useError';
import { ASSIGNMENT_STATE } from '../../types/enums';

export function AlertAssignmentCard({
    assignment
}: {
    assignment: AssignmentDto;
}) {
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
                    {assignment.task.name}
                </Title>
                <Text size="0.8rem" fw={'bold'}>
                    {dayjs.unix(assignment.startDate).format(conf.dateFormat)}{' '}
                    {dayjs.unix(assignment.startDate).format(conf.timeFormat)}
                    {' - '}
                    {dayjs.unix(assignment.endDate).format(conf.timeFormat)}
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
                        {assignment.worker.name}
                    </Text>
                    <Button
                        leftSection={<IconCheckbox size={16} />}
                        variant="subtle"
                        color="success"
                        size="xs"
                        onClick={() => mutateAssignmentComplete(assignment.id)}
                    >
                        Complete
                    </Button>
                </div>
            </Card.Section>
        </Card>
    );
}
