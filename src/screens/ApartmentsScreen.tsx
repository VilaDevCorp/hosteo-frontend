import { Button, MultiSelect, Switch, TextInput, Title } from '@mantine/core';
import { Layout } from '../components/organism/layout/Layout';
import { ApartmentForm } from '../components/modals/ApartmentForm';
import { useEffect, useState } from 'react';
import {
    IconLayoutGrid,
    IconLayoutList,
    IconPlus,
    IconSearch
} from '@tabler/icons-react';
import { useCrud } from '../hooks/useCrud';
import { ApartmentWithTasks } from '../types/entities';
import { Page, TableStructure } from '../types/types';
import { useQuery } from '@tanstack/react-query';
import { addressToString } from '../utils/utilFunctions';
import { ApartmentStateBadge } from '../components/atoms/ApartmentStateBadge';
import { PlatformIcon } from '../components/atoms/PlatformIcon';
import { ApartmentCard } from '../components/molecules/ApartmentCard';
import { useError } from '../hooks/useError';
import { APARTMENT_STATE, ApartmentState } from '../types/enums';
import { DataTable } from '../components/organism/DataTable';
import { ApartmentCardSkeleton } from '../components/molecules/ApartmentCardSkeleton';
import { ApartmentDetails } from '../components/modals/ApartmentDetails';
import { useScreen } from '../hooks/useScreen';
import { TopControls } from '../components/molecules/TopControls';
import { ApartmentFormSkeleton } from '../components/skeletons/ApartmentFormSkeleton';
import { ApartmentDetailsSkeleton } from '../components/skeletons/ApartmentDetailsSkeleton';
import { useConfirmModalWithContext } from '../hooks/useConfirmModalWithContext';
import { useEntityModal } from '../hooks/useEntityModal';
import { showNotificationSuccess } from '../utils/notifUtils';

const tableStructure: TableStructure<ApartmentWithTasks> = {
    headers: [
        'Name',
        <div
            key="airbnb"
            style={{
                gap: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                width: 'max-content'
            }}
        >
            <PlatformIcon platform={'airbnb'} />
            Airbnb ID
        </div>,
        <div
            key="booking"
            style={{
                gap: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                width: 'max-content'
            }}
        >
            <PlatformIcon platform={'booking'} />
            Booking ID
        </div>,
        'State',
        'Address'
    ],
    accesorMethods: [
        (apartment) => apartment.name,
        (apartment) => apartment.airbnbId,
        (apartment) => apartment.bookingId,
        (apartment) => <ApartmentStateBadge state={apartment.state} />,
        (apartment) => addressToString(apartment.address)
    ]
};

export function ApartmentsScreen() {
    const { search, remove } = useCrud<ApartmentWithTasks>('apartment');
    const { handleError } = useError();
    const { isTablet } = useScreen();
    const { openModal } = useConfirmModalWithContext();

    const [pageNumber, setPageNumber] = useState<number>(1);
    const [nameSearch, setNameSearch] = useState<string>('');
    const [debouncedNameSearch, setDebouncedNameSearch] = useState<string>('');
    const [stateSearch, setStateSearch] = useState<string[]>([]);
    const [cardViewMode, setCardViewMode] = useState<boolean>(true);

    const {
        data: apartmentPage,
        refetch: reloadApartments,
        isLoading,
        isError,
        error
    } = useQuery<Page<ApartmentWithTasks>>({
        queryKey: ['apartments', pageNumber, debouncedNameSearch, stateSearch],
        queryFn: () =>
            search(pageNumber - 1, 15, {
                name: debouncedNameSearch,
                states: stateSearch.length > 0 ? stateSearch : undefined
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

    const { onOpen: onOpenFormModal, modalComponent: apartmentFormModal } =
        useEntityModal<ApartmentWithTasks>({
            entityName: 'apartment',
            ModalBodyComponent: ApartmentForm,
            ModalBodySkeleton: ApartmentFormSkeleton
        });

    const {
        onOpen: onOpenDetailsModal,
        modalComponent: apartmentDetailsModal
    } = useEntityModal<ApartmentWithTasks>({
        entityName: 'apartment',
        getTitle: (apartment) => {
            if (!apartment) return '';
            return (
                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center'
                    }}
                >
                    <Title
                        order={4}
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                            overflow: 'hidden'
                        }}
                    >
                        {apartment.name}
                    </Title>
                    <ApartmentStateBadge state={apartment.state} />
                </div>
            );
        },
        ModalBodyComponent: ApartmentDetails,
        ModalBodySkeleton: ApartmentDetailsSkeleton
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedNameSearch(nameSearch), 500);
        return () => clearTimeout(timer);
    }, [nameSearch]);

    const onDeleteApartment = async (id: string) => {
        await remove(id);
        showNotificationSuccess('Apartment deleted');
        reloadApartments();
    };

    const openDeleteModal = (id: string) =>
        openModal({
            title: 'Delete apartment',
            message:
                'Deleting this apartment will delete all the associated information like events, assignments and tasks',
            color: 'error',
            onConfirm: () => onDeleteApartment(id)
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
                filters={
                    <MultiSelect
                        variant="outlined"
                        value={stateSearch}
                        onChange={(e) => {
                            setPageNumber(1);
                            setStateSearch(e);
                        }}
                        style={{
                            minWidth: isTablet ? '8rem' : 'auto',
                            width: isTablet ? 'auto' : '100%'
                        }}
                        hidePickedOptions
                        label="State"
                        data={Object.values(APARTMENT_STATE)}
                        renderOption={(state) => (
                            <ApartmentStateBadge
                                state={state.option.value as ApartmentState}
                                noBg
                            />
                        )}
                    />
                }
                cardViewModeComponent={
                    <Switch
                        variant="filled"
                        onChange={() => setCardViewMode(!cardViewMode)}
                        checked={cardViewMode}
                        onLabel={
                            <IconLayoutGrid
                                size={16}
                                color="var(--mantine-color-background-0)"
                            />
                        }
                        offLabel={
                            <IconLayoutList
                                size={16}
                                color="var(--mantine-color-background-0)"
                            />
                        }
                    />
                }
                addButton={
                    <Button
                        leftSection={<IconPlus />}
                        onClick={() => onOpenFormModal()}
                    >
                        {'Add apartment'}
                    </Button>
                }
                filtersOnModalActivated={stateSearch.length > 0}
            />
            <DataTable
                cardViewMode={cardViewMode}
                CardComponent={ApartmentCard}
                SkeletonComponent={ApartmentCardSkeleton}
                tableStructure={tableStructure}
                isLoading={isLoading}
                page={apartmentPage!}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                onClick={onOpenDetailsModal}
                onEdit={onOpenFormModal}
                onDelete={openDeleteModal}
            />
            {apartmentFormModal}
            {apartmentDetailsModal}
        </Layout>
    );
}
