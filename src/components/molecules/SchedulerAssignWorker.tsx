import { Worker } from '../../types/entities';
import { ActionIcon, Button, Text } from '@mantine/core';
import { Flag } from '../atoms/Flag';
import { IconEdit } from '@tabler/icons-react';

export function SchedulerAssignWorker({
    assignedWorker,
    setSelectWorkerModalOpened
}: {
    assignedWorker: Worker | undefined;
    setSelectWorkerModalOpened: (opened: boolean) => void;
}) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                width: '100%'
            }}
        >
            {assignedWorker ? (
                <span
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}
                >
                    <ActionIcon
                        size={'sm'}
                        variant={'transparent'}
                        mr={'0.25rem'}
                        onClick={() => setSelectWorkerModalOpened(true)}
                    >
                        <IconEdit />
                    </ActionIcon>
                    <Text
                        lineClamp={1}
                        maw={'10rem'}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {assignedWorker?.name}
                    </Text>
                    <Flag country={assignedWorker?.language} />
                </span>
            ) : (
                <Button
                    variant={'filled'}
                    fullWidth
                    onClick={() => setSelectWorkerModalOpened(true)}
                >
                    {'Select worker'}
                </Button>
            )}
        </div>
    );
}
