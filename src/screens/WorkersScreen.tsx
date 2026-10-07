import { Button, Switch, TextInput } from '@mantine/core';
import { Layout } from '../components/organism/layout/Layout';
import { useEffect, useState } from 'react';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useCrud } from '../hooks/useCrud';
import { Worker } from '../types/entities';
import { Page } from '../types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useError } from '../hooks/useError';
import { useApi } from '../hooks/useApi';
import { useConfirmModalWithContext } from '../hooks/useConfirmModalWithContext';
import { useScreen } from '../hooks/useScreen';
import { TopControls } from '../components/molecules/TopControls';
import { DataTable } from '../components/organism/DataTable';
import { WorkerCard } from '../components/molecules/WorkerCard';
import { WorkerCardSkeleton } from '../components/molecules/WorkerCardSkeleton';
import { WorkerForm } from '../components/modals/WorkerForm';
import { useEntityModal } from '../hooks/useEntityModal';
import { WorkerFormSkeleton } from '../components/skeletons/WorkerFormSkeleton';
import { showNotificationSuccess } from '../utils/notifUtils';

export function WorkersScreen() {
    const { search } = useCrud<Worker>('worker');
    const { hide, unhide } = useApi();
    const { handleError } = useError();
    const { isTablet } = useScreen();
    const { openModal } = useConfirmModalWithContext();

    const [pageNumber, setPageNumber] = useState<number>(1);
    const [nameSearch, setNameSearch] = useState<string>('');
    const [debouncedNameSearch, setDebouncedNameSearch] = useState<string>('');
    const [showHidden, setShowHidden] = useState<boolean>(false);

    const {
        data: workerPage,
        refetch: reloadWorkers,
        isLoading,
        isError,
        error
    } = useQuery<Page<Worker>>({
        queryKey: ['workers', pageNumber, debouncedNameSearch, showHidden],
        queryFn: () =>
            search(pageNumber - 1, 15, {
                name: debouncedNameSearch,
                visible: !showHidden
            }),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false
    });

    const { onOpen, modalComponent: workerFormModal } = useEntityModal<Worker>({
        entityName: 'worker',
        ModalBodyComponent: WorkerForm,
        ModalBodySkeleton: WorkerFormSkeleton
    });

    useEffect(() => {
        if (isError) {
            handleError(error);
        }
    }, [isError, error]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedNameSearch(nameSearch), 500);
        return () => clearTimeout(timer);
    }, [nameSearch]);

    const queryClient = useQueryClient();

    const { mutateAsync: toggleWorkerVisibility } = useMutation({
        mutationFn: async ({
            id,
            visible
        }: {
            id: string;
            visible: boolean;
        }) => {
            if (visible) {
                await hide('worker', id);
            } else {
                await unhide('worker', id);
            }
        },
        onSuccess: (_, variables) => {
            reloadWorkers();
            queryClient.invalidateQueries({ queryKey: ['worker'] });
            showNotificationSuccess(
                variables.visible ? 'Worker hidden' : 'Worker shown'
            );
        },
        onError: handleError
    });

    const onToggleWorkerVisibility = (id: string, visible: boolean) => {
        const isHiding = visible;
        openModal({
            title: isHiding ? 'Hide worker' : 'Show worker',
            message: isHiding
                ? 'Are you sure you want to hide this worker? It will no longer appear in the default lists or selectors.'
                : 'Are you sure you want to show this worker?',
            color: isHiding ? 'error' : 'primary',
            onConfirm: () => toggleWorkerVisibility({ id, visible })
        });
    };

    return (
        <Layout>
            <TopControls
                keywordFilter={
                    <TextInput
                        variant="outlined"
                        value={nameSearch}
                        placeholder={isTablet ? undefined : 'Search by name'}
                        onChange={(e) => {
                            setPageNumber(1);
                            setNameSearch(e.target.value);
                        }}
                        leftSection={<IconSearch size={14} />}
                        label={isTablet ? 'Search by name' : undefined}
                    />
                }
                filters={
                    <Switch
                        label="Show hidden"
                        checked={showHidden}
                        onChange={(e) => {
                            setPageNumber(1);
                            setShowHidden(e.currentTarget.checked);
                        }}
                    />
                }
                filtersOnModalActivated={showHidden}
                addButton={
                    <Button leftSection={<IconPlus />} onClick={() => onOpen()}>
                        {'Add worker'}
                    </Button>
                }
            />
            <DataTable
                cardViewMode={true}
                CardComponent={WorkerCard}
                cardMinWidth="14rem"
                SkeletonComponent={WorkerCardSkeleton}
                tableStructure={{ accesorMethods: [], headers: [] }}
                isLoading={isLoading}
                page={workerPage!}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                onEdit={onOpen}
                onToggleVisibility={onToggleWorkerVisibility}
                isVisible={(worker) => worker.visible}
            />
            {workerFormModal}
        </Layout>
    );
}
