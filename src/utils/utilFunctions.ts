import dayjs from 'dayjs';
import { Address, AlertItem, AssignmentDto, AssignmentInfoForScheduler, EventSchedulerDto, SchedulerItem } from '../types/entities';
import { ApiError, ApiResponse } from '../types/types';
import { conf } from '../../conf';


export const checkResponseException = (
    res: Response,
    resObject: ApiResponse<unknown>
) => {
    if (!res.ok) {
        throw new ApiError({
            statusCode: res.status,
            message: resObject.errorMessage,
            code: resObject.errorCode
        });
    }
};

export const addressToString = (address: Address | undefined) => {
    if (!address) {
        return '';
    }
    return `${address.street ? address.street + ',' : ''} ${address.zipCode ? address.zipCode : ''} ${address.city ? address.city : ''} ${address.country ? `(${address.country})` : ''}`;
};

export function getStartOfWeek(date: string | null) {
    return dayjs(date).startOf('week').toISOString();
}

export function getEndOfWeek(date: string | null) {
    return dayjs(date).endOf('week').toISOString();
}

export const groupItemsByDateAndAddAlerts = (
    startOfWeek: string,
    events?: EventSchedulerDto[],
    assignments?: AssignmentDto[],
    alerts?: AlertItem[],
    assignmentBeingModified?: AssignmentInfoForScheduler,
) => {
    const map = new Map<string, SchedulerItem[]>();
    Array.from({ length: 7 }).forEach((_, index) => {
        const dateToAdd = dayjs(startOfWeek)
            .add(index, 'day')
            .format(conf.dateUrlFormat);
        map.set(dateToAdd, []);
    });

    events && events.forEach((event) => {
        event.alert = alerts?.find(
            (alert) => alert.event.id === event.id
        )?.alertType;
        const startDate = dayjs
            .unix(event.startDate)
            .format(conf.dateUrlFormat);
        const endDate = dayjs
            .unix(event.endDate)
            .format(conf.dateUrlFormat);
        map.get(startDate)?.push({
            type: 'event',
            item: event,
            isStart: true,
            date: event.startDate
        });
        map.get(endDate)?.push({
            type: 'event',
            item: event,
            isStart: false,
            date: event.endDate
        });
    });

    assignments && assignments.forEach((assignment) => {
        if (assignment.id === assignmentBeingModified?.id) return;
        const startDate = dayjs
            .unix(assignment.startDate)
            .format(conf.dateUrlFormat);
        map.get(startDate)?.push({
            type: 'assignment',
            item: assignment,
            isStart: true,
            date: assignment.startDate
        });
    });

    if (assignmentBeingModified?.startDate) {
        map.get(dayjs(assignmentBeingModified.startDate).format(conf.dateUrlFormat))?.push({
            type: 'incompleteAssignment',
            item: assignmentBeingModified,
            isStart: true,
            date: dayjs(assignmentBeingModified.startDate).unix()
        });
    }
    for (const dayItems of map.values()) {
        dayItems.sort((a, b) => {
            const aLabel = a.type === 'event' ? a.item.name : a.item?.task?.name;
            const bLabel = b.type === 'event' ? b.item.name : b.item?.task?.name;
            return (a.date - b.date) - (a.isStart ? 0 : 1) - ((aLabel ?? 0) < (bLabel ?? 0) ? 1 : -1)
        });
    }
    return map;
};
