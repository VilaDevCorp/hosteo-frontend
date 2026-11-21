import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { TopControls } from '../molecules/TopControls';
import { DataTable } from '../organism/DataTable';
import { EntityModal } from '../molecules/EntityModal';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCrud } from '../../hooks/useCrud';
import { useScreen } from '../../hooks/useScreen';
import { WorkerCard } from '../molecules/WorkerCard';
import { WorkerCardSkeleton } from '../molecules/WorkerCardSkeleton';
import { Worker } from '../../types/entities';
import { Page } from '../../types/types';

export function SelectWorkerModal({
    opened,
    onClose,
    onSelect
}: {
    opened: boolean;
    onClose: () => void;
    onSelect: (worker: Worker) => void;
}) {
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [nameSearch, setNameSearch] = useState<string>('');
    const [debouncedNameSearch, setDebouncedNameSearch] = useState<string>('');
    const { search: searchWorkers } = useCrud<Worker>('worker');
    const { isTablet } = useScreen();

    const { data: workerPage, isLoading: isLoadingWorkers } = useQuery<
        Page<Worker>
    >({
        queryKey: [
            'workers',
            'assignment-selection',
            pageNumber,
            debouncedNameSearch
        ],
        queryFn: () =>
            searchWorkers(pageNumber - 1, 10, { name: debouncedNameSearch }) // Small page size for modal
    });

    const onWorkerSelect = (id: string) => {
        const worker = workerPage?.content.find((w) => w.id === id);
        if (worker) {
            onSelect(worker);
            onClose();
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedNameSearch(nameSearch);
        }, 500);

        return () => clearTimeout(timer);
    }, [nameSearch]);
    return (
        <EntityModal title="Select a worker" opened={opened} onClose={onClose}>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    width: 'auto',
                    gap: '1rem',
                }}
            >
                <TopControls
                    keywordFilter={
                        <TextInput
                            variant="outlined"
                            value={nameSearch}
                            placeholder={
                                isTablet ? undefined : 'Search by name'
                            }
                            onChange={(e) => {
                                setPageNumber(1);
                                setNameSearch(e.target.value);
                            }}
                            leftSection={<IconSearch size={14} />}
                            label={isTablet ? 'Search by name' : undefined}
                        />
                    }
                />
                <DataTable
                    cardViewMode={true}
                    CardComponent={WorkerCard}
                    tableStructure={{ headers: [], accesorMethods: [] }}
                    SkeletonComponent={WorkerCardSkeleton}
                    isLoading={isLoadingWorkers}
                    page={workerPage!}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    onClick={onWorkerSelect}
                    cardMinWidth="10rem"
                />
            </div>
        </EntityModal>
    );
}
