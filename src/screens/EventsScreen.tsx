import { Button, MultiSelect, Switch, TextInput, Title } from '@mantine/core';
import { Layout } from '../components/organism/layout/Layout';
import { EventForm } from '../components/modals/EventForm';
import { useEffect, useState } from 'react';
import {
    IconLayoutGrid,
    IconLayoutList,
    IconPlus,
    IconSearch
} from '@tabler/icons-react';
import { useCrud } from '../hooks/useCrud';
import { Event, EventWithAssignments } from '../types/entities';
import { Page, TableStructure } from '../types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EventStateBadge } from '../components/atoms/EventStateBadge';
import { ApartmentStateBadge } from '../components/atoms/ApartmentStateBadge';
import { EventCard } from '../components/molecules/EventCard';
import { useError } from '../hooks/useError';
import { EVENT_STATE, EventState } from '../types/enums';
import { DataTable } from '../components/organism/DataTable';
import { EventFormSkeleton } from '../components/skeletons/EventFormSkeleton';
import { EventDetailsSkeleton } from '../components/skeletons/EventDetailsSkeleton';
import { useScreen } from '../hooks/useScreen';
import { TopControls } from '../components/molecules/TopControls';
import { useConfirmModalWithContext } from '../hooks/useConfirmModalWithContext';
import { useEntityModal } from '../hooks/useEntityModal';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { conf } from '../../conf';
import { PlatformIcon } from '../components/atoms/PlatformIcon';
import { EventDetails } from '../components/modals/EventDetails';
import { EventCardSkeleton } from '../components/molecules/EventCardSkeleton';
import { showNotificationSuccess } from '../utils/notifUtils';

const tableStructure: TableStructure<Event> = {
    headers: [
        'Apartment',
        'Source',
        'Start date',
        'End date',
        'Name',
        'Status',
        'Ap. status'
    ],
    accesorMethods: [
        (event: Event) => event.apartment.name,
        (event: Event) => <PlatformIcon platform={event.source} size={20} />,
        (event: Event) =>
            dayjs.unix(event.startDate).format(conf.dateTimeFormat),
        (event: Event) => dayjs.unix(event.endDate).format(conf.dateTimeFormat),
        (event: Event) => event.name,
        (event: Event) => <EventStateBadge state={event.state} />,
        (event: Event) => <ApartmentStateBadge state={event.apartment.state} />
    ]
};

export function EventsScreen() {
    const { search, remove } = useCrud<Event>('event');
    const { handleError } = useError();
    const { isTablet } = useScreen();
    const { openModal } = useConfirmModalWithContext();

    const [pageNumber, setPageNumber] = useState<number>(1);
    const [apartmentSearch, setApartmentSearch] = useState<string>('');
    const [debouncedApartmentSearch, setDebouncedApartmentSearch] =
        useState<string>('');
    const [stateSearch, setStateSearch] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    const [cardViewMode, setCardViewMode] = useState<boolean>(true);
    const [showHidden, setShowHidden] = useState<boolean>(false);

    const {
        data: eventPage,
        isLoading,
        isError,
        error
    } = useQuery<Page<Event>>({
        queryKey: [
            'events',
            pageNumber,
            debouncedApartmentSearch,
            stateSearch,
            fromDate,
            toDate,
            showHidden
        ],
        queryFn: () =>
            search(pageNumber - 1, 15, {
                apartmentName: debouncedApartmentSearch,
                states: stateSearch.length > 0 ? stateSearch : undefined,
                startDate: fromDate
                    ? dayjs(fromDate).unix().toString()
                    : undefined,
                endDate: toDate ? dayjs(toDate).unix().toString() : undefined,
                frozen: showHidden
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

    const { onOpen: onOpenFormModal, modalComponent: eventFormModal } =
        useEntityModal<Event>({
            entityName: 'event',
            removeHeader: true,
            ModalBodyComponent: EventForm,
            ModalBodySkeleton: EventFormSkeleton
        });

    const { onOpen: onOpenDetailsModal, modalComponent: eventDetailsModal } =
        useEntityModal<EventWithAssignments>({
            entityName: 'event',
            getTitle: (event: Event | undefined) => {
                if (!event) return '';
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
                            {event.name}
                        </Title>
                        <EventStateBadge state={event.state} />
                    </div>
                );
            },
            ModalBodyComponent: EventDetails,
            ModalBodySkeleton: EventDetailsSkeleton
        });

    useEffect(() => {
        const timer = setTimeout(
            () => setDebouncedApartmentSearch(apartmentSearch),
            500
        );
        return () => clearTimeout(timer);
    }, [apartmentSearch]);

    const deleteEvent = async (id: string) => {
        await remove(id);
    };

    const queryClient = useQueryClient();

    const { mutateAsync: deleteEventMutation } = useMutation({
        mutationFn: deleteEvent,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({
                queryKey: ['event', variables]
            });
            queryClient.invalidateQueries({ queryKey: ['apartments'] });
            queryClient.invalidateQueries({ queryKey: ['apartment'] });
            queryClient.invalidateQueries({
                queryKey: ['schedulerInfo']
            });
            showNotificationSuccess('Event deleted');
        },
        onError: handleError
    });

    const openDeleteModal = (id: string) =>
        openModal({
            title: 'Delete event',
            message: 'Deleting this event will remove it permanently.',
            color: 'error',
            onConfirm: () => deleteEventMutation(id)
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
                        value={apartmentSearch}
                        placeholder={
                            isTablet ? undefined : 'Search by apartment'
                        }
                        onChange={(e) => {
                            setPageNumber(1);
                            setApartmentSearch(e.target.value);
                        }}
                        leftSection={<IconSearch size={14} />}
                        label={isTablet ? 'Search by apartment' : undefined}
                    />
                }
                filters={
                    <>
                        <MultiSelect
                            variant="outlined"
                            value={stateSearch}
                            onChange={(e) => {
                                setPageNumber(1);
                                setStateSearch(e);
                            }}
                            style={{
                                minWidth: isTablet ? '8rem' : 'auto',
                                width: isTablet ? 'auto' : '100%    '
                            }}
                            hidePickedOptions
                            label="State"
                            data={Object.values(EVENT_STATE)}
                            renderOption={(state) => (
                                <EventStateBadge
                                    state={state.option.value as EventState}
                                    noBg
                                />
                            )}
                        />
                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                width: isTablet ? 'auto' : '100%'
                            }}
                        >
                            <DatePickerInput
                                value={fromDate}
                                valueFormat={conf.dateFormat}
                                style={{ width: isTablet ? '8rem' : '100%' }}
                                onChange={(val) => {
                                    setPageNumber(1);
                                    setFromDate(val);
                                }}
                                placeholder="From date"
                                label="From"
                                clearable
                            />
                            <DatePickerInput
                                value={toDate}
                                valueFormat={conf.dateFormat}
                                style={{ width: isTablet ? '8rem' : '100%' }}
                                onChange={setToDate}
                                placeholder="To date"
                                label="To"
                                clearable
                            />
                        </div>
                        <Switch
                            label="Show hidden"
                            checked={showHidden}
                            onChange={(e) => {
                                setPageNumber(1);
                                setShowHidden(e.currentTarget.checked);
                            }}
                        />
                    </>
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
                        {'Add event'}
                    </Button>
                }
                filtersOnModalActivated={
                    stateSearch.length > 0 || !!fromDate || !!toDate || showHidden
                }
            />
            <DataTable
                cardViewMode={cardViewMode}
                CardComponent={EventCard}
                SkeletonComponent={EventCardSkeleton}
                tableStructure={tableStructure}
                isLoading={isLoading}
                page={eventPage!}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                onClick={onOpenDetailsModal}
                onEdit={onOpenFormModal}
                onDelete={openDeleteModal}
                cardMinWidth="15rem"
            />
            {eventFormModal}
            {eventDetailsModal}
        </Layout>
    );
}
