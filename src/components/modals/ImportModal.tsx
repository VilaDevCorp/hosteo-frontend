import { useState } from 'react';
import { Button, FileInput, Modal, Select } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUpload } from '@tabler/icons-react';
import { IMPORT_SOURCE, ImportSource } from '../../types/enums';
import { useApi } from '../../hooks/useApi';
import { useError } from '../../hooks/useError';
import { ModalButtons } from '../molecules/ModalButtons';

interface ImportModalProps {
    opened: boolean;
    onClose: () => void;
    onOpenIssuesModal: (nSuccessItems: number) => void;
}

export function ImportModal({
    opened,
    onClose,
    onOpenIssuesModal
}: ImportModalProps) {
    const { importReservations } = useApi();
    const { handleError } = useError();

    const [source, setSource] = useState<ImportSource | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const queryClient = useQueryClient();

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event'] });
        queryClient.invalidateQueries({ queryKey: ['apartments'] });
        queryClient.invalidateQueries({ queryKey: ['apartment'] });
        queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
    };

    const onImported = (nSuccessItems: number) => {
        invalidateQueries();
        queryClient.invalidateQueries({ queryKey: ['importedEvents'] });
        onClose();
        onOpenIssuesModal(nSuccessItems);
    };

    const importEvents = async (file: File | null) => {
        if (!source || !file) {
            throw new Error('Source and file must be provided');
        }
        const result = await importReservations(file, source);
        console.log(result)
        return result.successCount;
    };

    const { mutate: importMutation, isPending: isLoading } = useMutation({
        mutationFn: importEvents,
        onSuccess: (data) => onImported(data),
        onError: handleError
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Import Reservations"
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}
            >
                <Select
                    label="Platform"
                    placeholder="Select platform"
                    data={[
                        { value: IMPORT_SOURCE.BOOKING, label: 'Booking.com' },
                        { value: IMPORT_SOURCE.AIRBNB, label: 'Airbnb' }
                    ]}
                    value={source}
                    onChange={(val) => setSource(val as ImportSource | null)}
                    withAsterisk
                    allowDeselect={false}
                />
                <FileInput
                    label="CSV file"
                    placeholder="Select or drop your .csv file"
                    accept=".csv"
                    value={file}
                    onChange={setFile}
                    withAsterisk
                    clearable
                />
                <ModalButtons>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        leftSection={<IconUpload size={18} />}
                        onClick={() => importMutation(file)}
                        loading={isLoading}
                        disabled={!source || !file}
                    >
                        Import
                    </Button>
                </ModalButtons>
            </div>
        </Modal>
    );
}
