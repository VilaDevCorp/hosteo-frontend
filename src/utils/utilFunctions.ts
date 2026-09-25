import dayjs from 'dayjs';
import { Address, AssignmentDto, AssignmentInfoForScheduler, EventSchedulerDto, SchedulerItem } from '../types/entities';
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

export const groupItemsByDate = (
    startOfWeek: string,
    eventInfo: Record<string, EventSchedulerDto>,
    events: string[],
    assignments: AssignmentDto[],
    assignmentBeingModified?: AssignmentInfoForScheduler,
) => {
    const map = new Map<string, SchedulerItem[]>();
    Array.from({ length: 7 }).forEach((_, index) => {
        const dateToAdd = dayjs(startOfWeek)
            .add(index, 'day')
            .format(conf.dateUrlFormat);
        map.set(dateToAdd, []);
    });
    events.forEach((eventId) => {
        const eventSchedulerDto = eventInfo[eventId];
        if (!eventSchedulerDto) return;
        const startDate = dayjs
            .unix(eventSchedulerDto.startDate)
            .format(conf.dateUrlFormat);
        const endDate = dayjs
            .unix(eventSchedulerDto.endDate)
            .format(conf.dateUrlFormat);
        map.get(startDate)?.push({
            type: 'event',
            item: eventSchedulerDto,
            isStart: true,
            date: eventSchedulerDto.startDate
        });
        map.get(endDate)?.push({
            type: 'event',
            item: eventSchedulerDto,
            isStart: false,
            date: eventSchedulerDto.endDate
        });
    });
    assignments.forEach((assignment) => {
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
        dayItems.sort((a, b) => a.date - b.date);
    }
    return map;
};
