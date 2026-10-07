import {
    Button,
    Select,
    TextInput,
    Radio,
    ActionIcon,
    ModalHeader,
    ModalCloseButton,
    ModalTitle,
    RadioGroup
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Event, Apartment } from '../../types/entities';
import { useEffect, useState } from 'react';
import { notEmptyValidator, useValidator } from '../../hooks/useValidator';
import { useCrud } from '../../hooks/useCrud';
import { useMutation, useQuery } from '@tanstack/react-query';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { useReactQuery } from '../../hooks/useReactQuery';
import { useError } from '../../hooks/useError';
import {
    EVENT_SOURCE,
    EVENT_STATE,
    EVENT_TYPE,
    EventSource,
    EventState,
    EventType
} from '../../types/enums';
import { EventStateBadge } from '../atoms/EventStateBadge';
import { ModalButtons } from '../molecules/ModalButtons';
import { DataTable } from '../organism/DataTable';
import { ApartmentSimpleCard } from '../molecules/ApartmentSimpleCard';
import { ApartmentSimpleCardSkeleton } from '../skeletons/ApartmentSimpleCardSkeleton';
import { IconArrowLeft, IconSearch } from '@tabler/icons-react';
import { Page as PageType } from '../../types/types';
import {
    EventFormFields,
    eventToForm,
    formFieldsToCreateEventForm,
    formFieldsToUpdateEventForm
} from '../../types/forms';
import { conf } from '../../../conf';
import { TopControls } from '../molecules/TopControls';
import { useScreen } from '../../hooks/useScreen';
import dayjs from 'dayjs';
import { CustomTimePicker } from '../atoms/CustomTimePicker';
import { PlatformIcon } from '../atoms/PlatformIcon';

export function EventForm({
    onClose,
    entity: event
}: {
    onClose?: () => void;
    entity?: Event;
}) {
    const { queryClient } = useReactQuery();
    const { handleError } = useError();
    const { search: searchApartments } = useCrud<Apartment>('apartment');
    const { create, update } = useCrud<Event>('event');
    const { isTablet } = useScreen();

    const [step, setStep] = useState<number>(event ? 2 : 1);
    const [selectedApartment, setSelectedApartment] = useState<
        Apartment | undefined
    >(undefined);

    const [formFields, setFormFields] = useState<EventFormFields>(
        eventToForm(event)
    );

    const [pageNumber, setPageNumber] = useState<number>(1);
    const [nameSearch, setNameSearch] = useState<string>('');
    const [debouncedNameSearch, setDebouncedNameSearch] = useState<string>('');

    const { data: apartmentPage, isLoading: isLoadingApartments } = useQuery<
        PageType<Apartment>
    >({
        queryKey: [
            'apartments',
            'event-selection',
            pageNumber,
            debouncedNameSearch
        ],
        queryFn: () =>
            searchApartments(pageNumber - 1, 10, { name: debouncedNameSearch })
    });

    useEffect(() => {
        if (!event) {
            setStep(1);
            setSelectedApartment(undefined);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedNameSearch(nameSearch);
        }, 500);

        return () => clearTimeout(timer);
    }, [nameSearch]);

    // Validators
    const {
        dirty: nameDirty,
        error: nameError,
        message: nameMessage,
        validate: nameValidate,
        activateDirty: setDirtyName
    } = useValidator(formFields.name, [notEmptyValidator]);

    const { error: startDateError, validate: startDateValidate } = useValidator(
        formFields.startDate,
        [notEmptyValidator]
    );

    const { error: endDateError, validate: endDateValidate } = useValidator(
        formFields.endDate,
        [notEmptyValidator]
    );

    const {
        dirty: sourceDirty,
        activateDirty: setDirtySource,
        error: sourceError,
        validate: sourceValidate,
        message: sourceMessage
    } = useValidator(formFields.source, [notEmptyValidator]);

    const {
        dirty: stateDirty,
        activateDirty: setDirtyState,
        error: stateError,
        validate: stateValidate,
        message: stateMessage
    } = useValidator(formFields.state, [notEmptyValidator]);

    const createEvent = async () => {
        await create(formFieldsToCreateEventForm(formFields));
    };

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({
            queryKey: ['schedulerInfo']
        });
        queryClient.invalidateQueries({ queryKey: ['apartments'] });
        queryClient.invalidateQueries({ queryKey: ['apartment'] });
    };

    const { mutate: createEventMutation, isPending: isLoadingCreate } =
        useMutation({
            mutationFn: createEvent,
            onSuccess: () => {
                invalidateQueries();
                showNotificationSuccess('Event created');
                onClose?.();
            },
            onError: handleError
        });

    const updateEvent = async () => {
        await update(formFieldsToUpdateEventForm(formFields));
    };

    const { mutate: updateEventMutation, isPending: isLoadingUpdate } =
        useMutation({
            mutationFn: updateEvent,
            onSuccess: () => {
                invalidateQueries();
                queryClient.invalidateQueries({
                    queryKey: ['event', event?.id]
                });
                showNotificationSuccess('Event updated');
                onClose?.();
            },
            onError: handleError
        });

    const onSubmit = () => {
        if (
            !nameValidate() ||
            !startDateValidate() ||
            !endDateValidate() ||
            !sourceValidate() ||
            !stateValidate()
        )
            return;

        if (event) {
            updateEventMutation();
        } else {
            createEventMutation();
        }
    };

    const handleApartmentSelect = (id: string) => {
        const apt = apartmentPage?.content.find((a) => a.id === id);
        if (apt) {
            setFormFields((prev) => ({
                ...prev,
                apartmentId: apt.id
            }));
            setSelectedApartment(apt);
            setStep(2);
        }
    };

    const disabledButton =
        isLoadingCreate ||
        isLoadingUpdate ||
        nameError ||
        startDateError ||
        endDateError ||
        sourceError ||
        stateError;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '400px'
            }}
        >
            <ModalHeader style={{ padding: '0', minHeight: '30px' }}>
                <ModalTitle>
                    {step == 1 ? (
                        'Select an apartment'
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            {!event && (
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() => setStep(1)}
                                >
                                    <IconArrowLeft size={18} />
                                </ActionIcon>
                            )}
                            Event
                            {event
                                ? event.apartment.name
                                : selectedApartment?.name}
                        </div>
                    )}
                </ModalTitle>
                <ModalCloseButton />
            </ModalHeader>
            {step === 1 && (
                <>
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflowX: 'hidden',
                            overflowY: 'auto',
                            width: 'auto',
                            gap: '1rem'
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
                                    label={
                                        isTablet ? 'Search by name' : undefined
                                    }
                                />
                            }
                        />
                        <DataTable
                            cardViewMode={true}
                            CardComponent={ApartmentSimpleCard}
                            SkeletonComponent={ApartmentSimpleCardSkeleton}
                            tableStructure={{ headers: [], accesorMethods: [] }}
                            isLoading={isLoadingApartments}
                            page={apartmentPage!}
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            onClick={handleApartmentSelect}
                            cardMinWidth="15rem"
                        />
                    </div>
                </>
            )}

            {step === 2 && (
                <form
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <DatePicker
                            type="range"
                            defaultDate={formFields.startDate}
                            value={[formFields.startDate, formFields.endDate]}
                            onChange={(value) => {
                                setFormFields((prev) => {
                                    const prevStartDate = dayjs(prev.startDate);
                                    const prevEndDate = dayjs(prev.endDate);
                                    let newStartDate = dayjs(value[0]);
                                    let newEndDate = dayjs(value[1]);

                                    if (newStartDate.isValid()) {
                                        if (prevStartDate.isValid()) {
                                            newStartDate = newStartDate
                                                .hour(prevStartDate.hour())
                                                .minute(prevStartDate.minute());
                                        }
                                    }
                                    if (newEndDate.isValid()) {
                                        if (prevEndDate.isValid()) {
                                            newEndDate = newEndDate
                                                .hour(prevEndDate.hour())
                                                .minute(prevEndDate.minute());
                                        }
                                    }

                                    return {
                                        ...prev,
                                        startDate: newStartDate.isValid()
                                            ? newStartDate.format(
                                                  conf.dateInputFormat
                                              )
                                            : '',
                                        endDate: newEndDate.isValid()
                                            ? newEndDate.format(
                                                  conf.dateInputFormat
                                              )
                                            : ''
                                    };
                                });
                            }}
                        />

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                gap: '1rem'
                            }}
                        >
                            <CustomTimePicker
                                isStart={true}
                                date={formFields.startDate}
                                updateDate={(value: string) =>
                                    setFormFields((oldValue) => {
                                        return {
                                            ...oldValue,
                                            startDate: value
                                        };
                                    })
                                }
                            />
                            <CustomTimePicker
                                isStart={false}
                                date={formFields.endDate}
                                updateDate={(value: string) =>
                                    setFormFields((oldValue) => {
                                        return {
                                            ...oldValue,
                                            endDate: value
                                        };
                                    })
                                }
                            />
                            <RadioGroup
                                label="Source"
                                withAsterisk
                                value={formFields.source}
                                error={
                                    sourceError && sourceDirty
                                        ? sourceMessage
                                        : undefined
                                }
                                onChange={(val) => {
                                    setFormFields({
                                        ...formFields,
                                        source: val as EventSource
                                    });
                                    setDirtySource();
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '1.5rem'
                                    }}
                                >
                                    {Object.values(EVENT_SOURCE).map((src) => (
                                        <Radio
                                            key={src}
                                            value={src}
                                            label={
                                                <PlatformIcon
                                                    platform={src}
                                                    size={24}
                                                />
                                            }
                                        />
                                    ))}
                                </div>
                            </RadioGroup>
                            <Select
                                label="Type"
                                value={formFields.type}
                                onChange={(val) => {
                                    setFormFields({
                                        ...formFields,
                                        type: val as EventType
                                    });
                                }}
                                data={Object.values(EVENT_TYPE)}
                                withAsterisk
                                allowDeselect={false}
                            />
                            <Select
                                label="State"
                                value={formFields.state}
                                onChange={(val) => {
                                    setFormFields({
                                        ...formFields,
                                        state: val as EventState
                                    });
                                    setDirtyState();
                                }}
                                data={Object.values(EVENT_STATE)}
                                withAsterisk
                                renderOption={(option) => (
                                    <EventStateBadge
                                        state={
                                            option.option.value as EventState
                                        }
                                    />
                                )}
                                error={
                                    stateError && stateDirty
                                        ? stateMessage
                                        : undefined
                                }
                                allowDeselect={false}
                            />
                        </div>
                    </div>

                    <TextInput
                        label="Name"
                        value={formFields.name}
                        onChange={(val) => {
                            setFormFields({
                                ...formFields,
                                name: val.target.value
                            });
                            setDirtyName();
                        }}
                        error={nameError && nameDirty ? nameMessage : undefined}
                        withAsterisk
                    />

                    <ModalButtons>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            disabled={disabledButton}
                            type="submit"
                            loading={isLoadingCreate || isLoadingUpdate}
                        >
                            {event ? 'Update' : 'Save'}
                        </Button>
                    </ModalButtons>
                </form>
            )}
        </div>
    );
}
