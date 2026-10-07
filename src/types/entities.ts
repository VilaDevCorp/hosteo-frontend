import {
    Alert,
    ApartmentState,
    AssignmentState,
    EventSource,
    EventState,
    EventType,
    CategoryEnum,
    ImportSource,
    Language,
    TaskType,
} from './enums';

export interface Address {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
}

export interface BaseEntity {
    id: string;
    createdAt: Date;
    createdBy?: User;
}

export interface LoginResponse {
    authToken: string;
    sessionId: string;
}


export interface User extends BaseEntity {
    username: string;
    email: string;
    validated: boolean;
}

export interface Conflict {
    message: string;
}

export interface Apartment extends BaseEntity {
    name: string;
    airbnbId?: string;
    bookingId?: string;
    address?: Address;
    state: ApartmentState;
    visible: boolean;
}

export interface ApartmentWithTasks extends Apartment {
    tasks: Task[];
}

export interface Task extends BaseEntity {
    name: string;
    category: CategoryEnum;
    duration: number;
    type: TaskType;
    steps: string[];
    visible: boolean;
}

export interface TaskWithApartment extends BaseEntity {
    name: string;
    category: CategoryEnum;
    duration: number;
    type: TaskType;
    steps: string[];
    apartment: Apartment;
    visible: boolean;
}

export interface Template extends BaseEntity {
    name: string;
    type: TaskType;
    category: CategoryEnum;
    duration: number;
    steps: string[];
}

export interface ApartmentWithTasks extends Apartment {
    tasks: Task[];
}

export interface Worker extends BaseEntity {
    name: string;
    language: Language;
    visible: boolean;
}

export interface Assignment extends BaseEntity {
    task: TaskWithApartment;
    startDate: number;
    endDate: number;
    worker: Worker;
    state: AssignmentState;
    event: Event;
}

export interface Event extends BaseEntity {
    apartment: Apartment;
    startDate: number;
    endDate: number;
    name: string;
    state: EventState;
    source: EventSource;
    type: EventType;
    nextEvent?: Event;
}

export interface EventWithAssignments extends Omit<Event, 'apartment'> {
    apartment: ApartmentWithTasks;
    assignments: Assignment[];
}

export interface AssignmentWithNextEventDto extends BaseEntity {
    task: Task;
    startDate: number;
    endDate: number;
    worker: Worker;
    state: AssignmentState;
    event: Event;
    nextEvent: Event;
}

export interface AssignmentDto extends BaseEntity {
    task: TaskWithApartment;
    startDate: number;
    endDate: number;
    worker: Worker;
    state: AssignmentState;
    eventId: string;
    frozen: boolean;
}


export interface EventSchedulerDto {
    id: string;
    type: EventType;
    state: EventState;
    startDate: number;
    endDate: number;
    name: string;
    apartmentName: string;
    source: EventSource;
    nMandatoryAssignedTasks: number;
    nExtraAssignedTasks: number;
    mandatoryUnassignedTasks: Task[];
    nCompletedAssignments: number;
    uncompletedAssignments: AssignmentDto[];
    alert?: Alert;
    overdue: boolean;
    frozen: boolean;
}

export const ITEM_TYPE = {
    EVENT: 'event',
    ASSIGNMENT: 'assignment',
    INCOMPLETE_ASSIGNMENT: 'incompleteAssignment'
} as const;

export type ItemType = typeof ITEM_TYPE[keyof typeof ITEM_TYPE];

interface SchedulerEventItem {
    type: typeof ITEM_TYPE.EVENT;
    item: EventSchedulerDto;
    isStart: boolean;
    date: number;
}

interface SchedulerAssignmentItem {
    type: typeof ITEM_TYPE.ASSIGNMENT;
    item: AssignmentDto;
    isStart: boolean;
    date: number;
}

interface SchedulerIncompleteAssignmentItem {
    type: typeof ITEM_TYPE.INCOMPLETE_ASSIGNMENT;
    item: AssignmentInfoForScheduler;
    isStart: boolean;
    date: number;
}

export type SchedulerItem =
    | SchedulerEventItem
    | SchedulerAssignmentItem
    | SchedulerIncompleteAssignmentItem;

export interface SchedulerInfo {
    events: EventSchedulerDto[];
    assignments: AssignmentDto[];
}

export interface AlertsInfo {
    alerts: AlertItem[];
    nRedAlerts: number;
    nYellowAlerts: number;
}

export interface AlertItem {
    alertType: Alert;
    event: Event;
    prevEvent: EventSchedulerDto;
}

export interface FailedImportedEvent extends BaseEntity {
    apartmentId?: string;
    name?: string;
    startDate?: number;
    endDate?: number;
    source: ImportSource;
    error: string;
}

export interface ImportBatchResult {
    successCount: number;
    failedEvents: FailedImportedEvent[];
}

export interface EventCardItem {
    id: string;
    name?: string;
    startDate?: number;
    endDate?: number;
    source?: EventSource | ImportSource;
    state?: EventState;
    apartment?: Apartment;
}

export const eventSchedulerDtoToEventForAssignment = (event?: EventSchedulerDto, nextEvent?: Event)
    : EventForAssignment | undefined => {
    if (!event) {
        return undefined;
    }
    return {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        apartmentName: event.apartmentName,
        source: event.source,
        nextEvent: nextEvent
    };
};

export const eventToEventForAssignment = (event: Event): EventForAssignment => {
    return {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        apartmentName: event.apartment.name,
        source: event.source,
        nextEvent: event.nextEvent
    };
};

export interface EventForAssignment {
    id: string;
    name: string;
    startDate: number;
    endDate: number;
    apartmentName: string;
    source: EventSource;
    nextEvent?: Event;
}

export interface AssignmentInfoForScheduler {
    id?: string;
    task?: Task;
    startDate?: string;
    endDate?: string;
    worker?: Worker;
    state?: AssignmentState;
    apartment?: Apartment;
    event?: EventForAssignment
}

export interface AssignmentOperationError {
    assignment: Assignment;
    error: string;
}

export interface EventOperationError {
    event: Event;
    error: string;
}