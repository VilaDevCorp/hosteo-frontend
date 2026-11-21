import { Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { WorkerInstructions } from '../../types/entities';
import { useScreen } from '../../hooks/useScreen';
import { WorkerInstructionsCard } from '../molecules/WorkerInstructionsCard';

interface WorkerInstructionsModalProps {
    opened: boolean;
    onClose: () => void;
    workerInstructions: WorkerInstructions[];
}

export function WorkerInstructionsModal({
    opened,
    onClose,
    workerInstructions
}: WorkerInstructionsModalProps) {
    const { isTablet } = useScreen();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Worker Instructions"
            size="xl"
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
        >
            <ScrollArea
                className='thinScroll'
                style={{ height: isTablet ? '60vh' : '100%' }}
                scrollbars="y"
            >
                <Stack gap="md">
                    {workerInstructions.length > 0 ? (
                        workerInstructions.map((item) => (
                            <WorkerInstructionsCard
                                key={item.worker.id}
                                item={item}
                            />
                        ))
                    ) : (
                        <Text c="dimmed">
                            No assignments found for the selected dates.
                        </Text>
                    )}
                </Stack>
            </ScrollArea>
        </Modal>
    );
}
