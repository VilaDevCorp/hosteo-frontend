import { Worker } from '../../types/entities';
import { ActionIcon, Button, Image, Text, Title } from '@mantine/core';
import { Flag } from '../atoms/Flag';
import { SelectWorkerModal } from '../modals/SelectWorkerModal';
import { useState } from 'react';
import { IconEdit } from '@tabler/icons-react';

export function WorkerSelector({
    worker,
    onSelectWorker
}: {
    worker?: Worker;
    onSelectWorker: (worker: Worker) => void;
}) {
    const [selectWorkerModalOpened, setSelectWorkerModalOpened] =
        useState(false);

    return (
        <>
            <div
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                }}
            >
                <div
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%'
                        }}
                    >
                        <Image
                            src="/user_placeholder.svg"
                            w={'10rem'}
                            opacity={worker ? 1 : 0.2}
                            alt="Worker picture"
                        />
                    </div>
                    {worker ? (
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                paddingBottom: '1rem',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                height: '5rem'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Text c="dimmed" size="sm">
                                    <Flag country={worker.language} />
                                </Text>
                                <Title
                                    order={4}
                                    style={{
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {worker.name}
                                </Title>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <ActionIcon
                                    variant="transparent"
                                    onClick={() => {
                                        setSelectWorkerModalOpened(true);
                                    }}
                                >
                                    <IconEdit />
                                </ActionIcon>
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setSelectWorkerModalOpened(true)}
                            variant="subtle"
                        >
                            Select Worker
                        </Button>
                    )}
                </div>
            </div>
            <SelectWorkerModal
                opened={selectWorkerModalOpened}
                onClose={() => setSelectWorkerModalOpened(false)}
                onSelect={onSelectWorker}
            />
        </>
    );
}
