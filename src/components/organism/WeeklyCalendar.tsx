import dayjs from 'dayjs';
import { SchedulerDay } from '../molecules/SchedulerDay';
import { conf } from '../../../conf';
import {
    AlertsInfo,
    AssignmentInfoForScheduler,
    SchedulerInfo
} from '../../types/entities';
import { useQuery } from '@tanstack/react-query';
import { groupItemsByDateAndAddAlerts } from '../../utils/utilFunctions';
import { useApi } from '../../hooks/useApi';
import { SetStateAction, useEffect, useMemo } from 'react';
import { useError } from '../../hooks/useError';
import { AssignmentFormFields } from '../../types/forms';

interface WeeklyCalendarProps {
    startOfWeek: string;
    selectedEventIds?: Set<string>;
    onSelectEvent?: (eventId: string) => void;
    onEditEvent?: (eventId: string) => void;
    onDeleteEvent?: (eventId: string) => void;

    selectedAssignmentIds?: Set<string>;
    onSelectAssignment?: (assignmentId: string) => void;
    onEditAssignment?: (assignmentId: string) => void;
    onDeleteAssignment?: (assignmentId: string) => void;
    assignmentBeingModified?: AssignmentInfoForScheduler;
    setFormFields?: React.Dispatch<SetStateAction<AssignmentFormFields>>;
}

export function WeeklyCalendar(props: WeeklyCalendarProps) {
    const {
        startOfWeek,
        selectedEventIds,
        onSelectEvent,
        onEditEvent,
        onDeleteEvent,
        selectedAssignmentIds,
        onSelectAssignment,
        onEditAssignment,
        onDeleteAssignment,
        assignmentBeingModified,
        setFormFields
    } = props;

    const { searchSchedulerData, getAlertsInfo } = useApi();

    const { handleError } = useError();

    const { data: alertsInfo } = useQuery<AlertsInfo>({
        queryKey: ['schedulerInfo', 'alerts'],
        queryFn: async () => {
            return await getAlertsInfo();
        }
    });

    const {
        data: schedulerInfo,
        isError,
        error
    } = useQuery<SchedulerInfo>({
        queryKey: ['schedulerInfo', startOfWeek],
        queryFn: async () => {
            return await searchSchedulerData(startOfWeek);
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: false,
        retry: false,
        enabled: !!startOfWeek
    });

    const schedulerItemsByDate = useMemo(
        () =>
            groupItemsByDateAndAddAlerts(
                startOfWeek,
                schedulerInfo?.events,
                schedulerInfo?.assignments,
                alertsInfo?.alerts,
                assignmentBeingModified
            ),
        [startOfWeek, schedulerInfo, assignmentBeingModified, alertsInfo]
    );

    useEffect(() => {
        if (isError) {
            handleError(error);
        }
    }, [isError, error]);

    const getDisabledDates = (date: string): boolean => {
        if (!assignmentBeingModified) return false;
        const event = assignmentBeingModified.event;
        const nextEvent = assignmentBeingModified?.event?.nextEvent;
        if (event) {
            if (dayjs(date).isBefore(dayjs.unix(event.endDate), 'day')) {
                return true;
            }
        }
        if (nextEvent) {
            if (dayjs(date).isAfter(dayjs.unix(nextEvent.startDate), 'day')) {
                return true;
            }
        }
        return false;
    };

    const onChangeDate = (value: string) => {
        setFormFields &&
            setFormFields((prev) => {
                const prevStartDate = dayjs(prev.startDate);
                const prevEndDate = dayjs(prev.endDate);
                let newStartDate = dayjs(value);
                let newEndDate = dayjs(value);

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

                if (newEndDate.isBefore(newStartDate)) {
                    newEndDate = newEndDate.add(1, 'day');
                }

                return {
                    ...prev,
                    startDate: newStartDate.isValid()
                        ? newStartDate.format(conf.dateInputFormat)
                        : '',
                    endDate: newEndDate.isValid()
                        ? newEndDate.format(conf.dateInputFormat)
                        : ''
                };
            });
    };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto'
            }}
        >
            {Array.from({ length: 7 }).map((_, index) => {
                const date = dayjs(startOfWeek).add(index, 'day');
                return (
                    <SchedulerDay
                        key={index}
                        date={dayjs(startOfWeek)
                            .add(index, 'day')
                            .toISOString()}
                        items={
                            schedulerItemsByDate?.get(
                                date.format(conf.dateUrlFormat)
                            ) || []
                        }
                        disabled={getDisabledDates(date.toISOString())}
                        selectedEventIds={selectedEventIds}
                        onEventClick={onSelectEvent}
                        onEventEdit={onEditEvent}
                        onEventDelete={onDeleteEvent}
                        selectedAssignmentIds={selectedAssignmentIds}
                        onAssignmentClick={onSelectAssignment}
                        onAssignmentEdit={onEditAssignment}
                        onAssignmentDelete={onDeleteAssignment}
                        onClick={() => onChangeDate(date.toISOString())}
                    />
                );
            })}
        </div>
    );
}
