import { Button, Modal } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useMutation } from '@tanstack/react-query';
import { IconFileText } from '@tabler/icons-react';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useError } from '../../hooks/useError';
import { useScreen } from '../../hooks/useScreen';
import { WorkerInstructions } from '../../types/entities';
import { generateWorkerInstructionsList } from '../../utils/instructions';
import { ModalButtons } from '../molecules/ModalButtons';

interface GenerateInstructionsModalProps {
    opened: boolean;
    onClose: () => void;
    onGenerated: (workerInstructions: WorkerInstructions[]) => void;
}

export function GenerateInstructionsModal({
    opened,
    onClose,
    onGenerated
}: GenerateInstructionsModalProps) {
    const { getWorkerAssignments } = useApi();
    const { handleError } = useError();
    const { isTablet } = useScreen();

    const [dateRange, setDateRange] = useState<[string | null, string | null]>([
        null,
        null
    ]);

    const generateInstructions = async () => {
        const [startDate, endDate] = dateRange;
        if (!startDate || !endDate) {
            throw new Error('A start and end date must be selected');
        }
        const workerAssignments = await getWorkerAssignments(
            startDate,
            endDate
        );
        return generateWorkerInstructionsList(workerAssignments);
    };

    const { mutate: generateMutation, isPending: isLoading } = useMutation({
        mutationFn: generateInstructions,
        onSuccess: onGenerated,
        onError: handleError
    });

    const closeModal = () => {
        if (isLoading) {
            return;
        }
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            title="Generate Instructions"
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    closeModal();
                }
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'center'
                }}
            >
                <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <DatePicker
                        type="range"
                        value={dateRange}
                        onChange={setDateRange}
                        numberOfColumns={isTablet ? 2 : 1}
                    />
                </div>
                <ModalButtons>
                    <Button
                        variant="outline"
                        onClick={closeModal}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        leftSection={<IconFileText size={18} />}
                        onClick={() => generateMutation()}
                        loading={isLoading}
                        disabled={!dateRange[0] || !dateRange[1]}
                    >
                        Generate
                    </Button>
                </ModalButtons>
            </div>
        </Modal>
    );
}
