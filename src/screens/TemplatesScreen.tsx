import { Button, TextInput } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconPlus, IconSearch } from '@tabler/icons-react'; // Removed IconLayoutGrid, IconLayoutList as layout is fixed
import { useState, useEffect } from 'react';

import { Layout } from '../components/organism/layout/Layout';
import { TopControls } from '../components/molecules/TopControls';
import { DataTable } from '../components/organism/DataTable';
import { TaskOrTemplateCard } from '../components/molecules/TaskOrTemplateCard';

import { useCrud } from '../hooks/useCrud';
import { useError } from '../hooks/useError';
import { useScreen } from '../hooks/useScreen';
import { useConfirmModalWithContext } from '../hooks/useConfirmModalWithContext';
import { useEntityModal } from '../hooks/useEntityModal';
import { Template } from '../types/entities';
import { Page, TableStructure } from '../types/types';
import { TaskOrTemplateForm } from '../components/modals/TaskOrTemplateForm';
import { TaskOrTemplateFormSkeleton } from '../components/skeletons/TaskOrTemplateFormSkeleton';
import { TaskOrTemplateCardSkeleton } from '../components/molecules/TaskOrTemplateCardSkeleton';
import { useTaskOrTemplateDetailsModal } from '../components/organism/TaskOrTemplateDetailsModal';
import { showNotificationSuccess } from '../utils/notifUtils';

const tableStructure: TableStructure<Template> = {
    headers: [],
    accesorMethods: []
};

export function TemplatesScreen() {
    const { search, remove } = useCrud<Template>('template'); // Entity name 'template'
    const { handleError } = useError();
    const { isTablet } = useScreen();
    const { openModal } = useConfirmModalWithContext();

    const [pageNumber, setPageNumber] = useState<number>(1);
    const [nameSearch, setNameSearch] = useState<string>('');
    const [debouncedNameSearch, setDebouncedNameSearch] = useState<string>('');

    const {
        data: templatePage,
        refetch: reloadTemplates,
        isLoading,
        isError,
        error
    } = useQuery<Page<Template>>({
        queryKey: ['templates', pageNumber, debouncedNameSearch],
        queryFn: () =>
            search(pageNumber - 1, 15, {
                name: debouncedNameSearch
            }),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false
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

    const { onOpen: onOpenFormModal, modalComponent: templateFormModal } =
        useEntityModal<Template>({
            entityName: 'template',
            ModalBodyComponent: TaskOrTemplateForm,
            ModalBodySkeleton: TaskOrTemplateFormSkeleton
        });

    const { onOpenDetailsModal, detailsModal } =
        useTaskOrTemplateDetailsModal('template');

    const onDeleteTemplate = async (id: string) => {
        await remove(id);
        showNotificationSuccess('Template deleted');
        reloadTemplates();
    };

    const openDeleteModal = (id: string) =>
        openModal({
            title: 'Delete template',
            message: `Are you sure you want to delete this template? This action cannot be undone.`,
            color: 'red',
            onConfirm: () => onDeleteTemplate(id)
        });

    return (
        <Layout>
            <TopControls
                keywordFilter={
                    <TextInput
                        variant="outlined"
                        style={{
                            width: isTablet ? '15rem' : '100%'
                        }}
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
                // Only filter is search by name
                filters={null}
                // Card view only, so no switch needed. Passing null or empty fragment.
                cardViewModeComponent={null}
                addButton={
                    <Button
                        leftSection={<IconPlus />}
                        onClick={() => onOpenFormModal()}
                    >
                        {'Add template'}
                    </Button>
                }
                filtersOnModalActivated={false}
            />
            <DataTable
                cardViewMode={true}
                CardComponent={TaskOrTemplateCard}
                SkeletonComponent={TaskOrTemplateCardSkeleton}
                tableStructure={tableStructure}
                isLoading={isLoading}
                page={templatePage!}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                onClick={onOpenDetailsModal}
                onEdit={onOpenFormModal}
                onDelete={openDeleteModal}
                cardMinWidth="15rem"
            />
            {templateFormModal}
            {detailsModal}
        </Layout>
    );
}
