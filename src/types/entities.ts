import {
    Alert,
    ApartmentState,
    AssignmentState,
    EventSource,
    EventState,
    EventType,
    CategoryEnum,
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
}


export interface TaskWithApartment extends BaseEntity {
    name: string;
    category: CategoryEnum;
    duration: number;
    type: TaskType;
    steps: string[];
    apartment: Apartment;
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
}

export interface EventWithAssignments extends Omit<Event, 'apartment'> {
    apartment: ApartmentWithTasks;
    assignments: Assignment[];
}

export interface TaskDto {
    id: string;
    name: string;
    category: CategoryEnum;
    duration: number;
    type: TaskType;
    steps: string[];
}

export interface AssignmentDto {
    id: string;
    task: TaskWithApartment;
    startDate: number;
    endDate: number;
    worker: Worker;
    state: AssignmentState;
    eventId: string;
}

export interface EventSchedulerDto {
    id: string;
    type: EventType;
    startDate: number;
    endDate: number;
    name: string;
    source: EventSource;
    nMandatoryAssignedTasks: number;
    nExtraAssignedTasks: number;
    mandatoryUnassignedTasks: TaskDto[];
    nCompletedAssignments: number;
    uncompletedAssignments: AssignmentDto[];
    alert?: Alert;
    overdue: boolean;
}

interface SchedulerEventItem {
    type: 'event';
    item: EventSchedulerDto;
    isStart: boolean;
    date: number;
}

interface SchedulerAssignmentItem {
    type: 'assignment';
    item: AssignmentDto;
    isStart: boolean;
    date: number;
}

interface SchedulerIncompleteAssignmentItem {
    type: 'incompleteAssignment';
    item: AssignmentInfoForScheduler;
    isStart: boolean;
    date: number;
}

export type SchedulerItem =
    | SchedulerEventItem
    | SchedulerAssignmentItem
    | SchedulerIncompleteAssignmentItem;

export interface SchedulerInfo {
    eventInfo: Record<string, EventSchedulerDto>;
    previousEvent: Record<string, string>;
    events: string[];
    redAlertEvents: string[];
    yellowAlertEvents: string[];
    assignments: AssignmentDto[];
}

export interface ImpEvent {
    apartment: Apartment;
    startDate: Date;
    endDate: Date;
    name: string;
    state: EventState;
    source: EventSource;
    type: EventType;
    conflict: Conflict;
    creationError: string;
}

export interface ImportResult {
    successCount: number;
    failureCount: number;
}

export interface AssignmentInfoForScheduler {
    id?: string;
    task?: Task | TaskDto;
    startDate?: string;
    endDate?: string;
    worker?: Worker;
    state?: AssignmentState;
    apartment?: Apartment;
    prevEventId?: string;
    nextEventId?: string;
}

export interface AssignmentUpdateError {
    assignment: Assignment;
    error: string;
}

export interface EventUpdateError {
    event: Event;
    error: string;
}