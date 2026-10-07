import { Address, Apartment, Event, Task, Template, EventSchedulerDto, AssignmentWithNextEventDto, EventForAssignment } from './entities';
import {
    ASSIGNMENT_STATE,
    CATEGORY_ENUM,
    EVENT_SOURCE,
    EVENT_STATE,
    EVENT_TYPE,
    LANGUAGE,
    TASK_TYPE,
    AssignmentState,
    CategoryEnum,
    EventSource,
    EventState,
    EventType,
    Language,
    TaskType,
} from './enums';
import { Worker } from './entities';
import dayjs from 'dayjs';
import { conf } from '../../conf';

export interface LoginResponse {
    authToken: string;
    sessionId: string;
}

export interface RegisterUserForm {
    username: string;
    email: string;
    password: string;
}

export const apartmentToForm = (apartment: Apartment | undefined): ApartmentFormFields => {
    if (!apartment) {
        return {
            name: '',
            airbnbId: '',
            bookingId: '',
            street: '',
            city: '',
            zipCode: '',
            country: '',
        }
    }
    return {
        id: apartment?.id,
        name: apartment?.name,
        airbnbId: apartment?.airbnbId,
        bookingId: apartment?.bookingId,
        street: apartment?.address?.street,
        city: apartment.address?.city,
        zipCode: apartment.address?.zipCode,
        country: apartment.address?.country,
    }
}

export const formFieldsToCreateApartmentForm = (formFields: ApartmentFormFields): ApartmentCreateForm => {
    return {
        name: formFields.name,
        airbnbId: formFields.airbnbId || undefined,
        bookingId: formFields.bookingId || undefined,
        address: formFields.street || formFields.city || formFields.zipCode || formFields.country ? {
            street: formFields.street,
            city: formFields.city,
            zipCode: formFields.zipCode,
            country: formFields.country
        } : undefined,
        visible: true
    }
}

export const formFieldsToUpdateApartmentForm = (formFields: ApartmentFormFields): ApartmentUpdateForm => {
    if (!formFields.id) {
        throw new Error('Id is required');
    }
    return {
        id: formFields.id,
        name: formFields.name,
        airbnbId: formFields.airbnbId || undefined,
        bookingId: formFields.bookingId || undefined,
        address: formFields.street || formFields.city || formFields.zipCode || formFields.country ? {
            street: formFields.street,
            city: formFields.city,
            zipCode: formFields.zipCode,
            country: formFields.country
        } : undefined,
        visible: true
    }
}

export interface ApartmentFormFields {
    id?: string;
    name: string;
    airbnbId?: string;
    bookingId?: string;
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
}

export interface ApartmentCreateForm {
    name: string;
    airbnbId?: string;
    bookingId?: string;
    address?: Address;
    visible: boolean;
}

export interface ApartmentUpdateForm {
    id: string;
    name: string;
    airbnbId?: string;
    bookingId?: string;
    address?: Address;
    visible: boolean;
}


export interface EventCreateForm {
    apartmentId: string;
    startDate: number;
    endDate: number;
    name: string;
    state: EventState;
    source: EventSource;
    type: EventType;
}

export interface EventUpdateForm {
    id: string;
    startDate: number;
    endDate: number;
    name: string;
    state: EventState;
    source: EventSource;
    type: EventType;
}

export interface EventFormFields {
    id?: string;
    apartmentId?: string;
    startDate: string;
    endDate: string;
    name: string;
    state: EventState;
    source: EventSource;
    type: EventType;
}



export const eventToForm = (event: Event | undefined): EventFormFields => {
    if (!event) {
        return {
            name: '',
            startDate: '',
            endDate: '',
            state: EVENT_STATE.PENDING,
            source: EVENT_SOURCE.NONE,
            type: EVENT_TYPE.BOOKING,
        };
    }
    return {
        id: event.id,
        name: event.name,
        startDate: dayjs.unix(event.startDate).format(conf.dateInputFormat),
        endDate: dayjs.unix(event.endDate).format(conf.dateInputFormat),
        state: event.state,
        source: event.source,
        type: event.type,
        apartmentId: event.apartment.id
    };
};

export const formFieldsToCreateEventForm = (formFields: EventFormFields): EventCreateForm => {
    if (!formFields.apartmentId) {
        throw new Error('ApartmentId is required');
    }
    return {
        apartmentId: formFields.apartmentId,
        startDate: dayjs(formFields.startDate, conf.dateInputFormat).unix(),
        endDate: dayjs(formFields.endDate, conf.dateInputFormat).unix(),
        name: formFields.name,
        state: formFields.state,
        source: formFields.source,
        type: formFields.type,
    };
};

export const formFieldsToUpdateEventForm = (formFields: EventFormFields): EventUpdateForm => {
    if (!formFields.id) {
        throw new Error('Id is required');
    }
    return {
        id: formFields.id,
        name: formFields.name,
        state: formFields.state,
        source: formFields.source,
        type: formFields.type,
        startDate: dayjs(formFields.startDate, conf.dateInputFormat).unix(),
        endDate: dayjs(formFields.endDate, conf.dateInputFormat).unix(),
    };
};

export interface FailedImportedEventUpdateForm {
    apartmentId?: string;
    name?: string;
    startDate?: number;
    endDate?: number;
}

export interface TaskCreateForm {
    apartmentId: string;
    name: string;
    category: CategoryEnum;
    duration: number;
    type: TaskType;
    steps: string[];
}

export interface TaskUpdateForm {
    id: string;
    name: string;
    category: CategoryEnum;
    duration: number;
    type: TaskType;
    steps: string[];
}

export interface TaskFormFields {
    id?: string;
    apartmentId?: string;
    name: string;
    category: CategoryEnum;
    duration: number;
    type: TaskType;
    steps: string[];
}

export const taskToForm = (task: Task | undefined, apartmentId?: string): TaskFormFields => {
    if (!task) {
        if (!apartmentId) {
            throw new Error('ApartmentId is required');
        }
        return {
            apartmentId,
            name: '',
            category: CATEGORY_ENUM.CLEANING,
            duration: 0,
            type: TASK_TYPE.MANDATORY,
            steps: []
        };
    }
    return {
        id: task.id,
        name: task.name,
        category: task.category,
        duration: task.duration,
        type: task.type,
        steps: task.steps
    };
}

export const formFieldsToCreateTaskForm = (formFields: TaskFormFields): TaskCreateForm => {
    if (!formFields.apartmentId) {
        throw new Error('ApartmentId is required');
    }
    return {
        apartmentId: formFields.apartmentId,
        name: formFields.name,
        category: formFields.category,
        duration: formFields.duration,
        type: formFields.type,
        steps: formFields.steps
    };
}

export const formFieldsToUpdateTaskForm = (formFields: TaskFormFields): TaskUpdateForm => {
    if (!formFields.id) {
        throw new Error('Id is required');
    }
    return {
        id: formFields.id,
        name: formFields.name,
        category: formFields.category,
        duration: formFields.duration,
        type: formFields.type,
        steps: formFields.steps,
    };
}

export interface TemplateCreateForm {
    name: string;
    type: TaskType;
    category: CategoryEnum;
    duration: number;
    steps: string[];
}

export interface TemplateUpdateForm {
    id: string;
    name: string;
    type: TaskType;
    category: CategoryEnum;
    duration: number;
    steps: string[];
}

export interface TemplateFormFields {
    id?: string;
    name: string;
    type: TaskType;
    category: CategoryEnum;
    duration: number;
    steps: string[];
}

export const templateToForm = (template: Template | undefined): TemplateFormFields => {
    if (!template) {
        return {
            name: '',
            type: TASK_TYPE.MANDATORY,
            category: CATEGORY_ENUM.CLEANING,
            duration: 0,
            steps: []
        };
    }
    return {
        id: template.id,
        name: template.name,
        type: template.type,
        category: template.category,
        duration: template.duration,
        steps: template.steps
    };
};

export const formFieldsToCreateTemplateForm = (formFields: TemplateFormFields): TemplateCreateForm => {
    return {
        name: formFields.name,
        type: formFields.type,
        category: formFields.category,
        duration: formFields.duration,
        steps: formFields.steps
    };
};

export const formFieldsToUpdateTemplateForm = (formFields: TemplateFormFields): TemplateUpdateForm => {
    if (!formFields.id) {
        throw new Error('Id is required');
    }
    return {
        id: formFields.id,
        name: formFields.name,
        type: formFields.type,
        category: formFields.category,
        duration: formFields.duration,
        steps: formFields.steps
    };
};


export interface AssignmentCreateForm {
    taskId: string;
    startDate: number;
    endDate: number;
    workerId: string;
    eventId: string;
    state: AssignmentState;
}

export interface AssignmentUpdateForm {
    id: string;
    startDate: number;
    endDate: number;
    workerId: string;
    eventId: string;
    state: AssignmentState;
}

export interface AssignmentFormFields {
    id?: string;
    taskId?: string;
    workerId?: string;
    eventId?: string;
    startDate?: string;
    endDate?: string;
    state: AssignmentState;
}

export const formFieldsToCreateAssignmentForm = (formFields: AssignmentFormFields): AssignmentCreateForm => {
    if (!formFields.taskId || !formFields.eventId || !formFields.workerId) {
        throw new Error('TaskId, EventId, and WorkerId are required');
    }
    return {
        taskId: formFields.taskId,
        startDate: dayjs(formFields.startDate, conf.dateInputFormat).unix(),
        endDate: dayjs(formFields.endDate, conf.dateInputFormat).unix(),
        workerId: formFields.workerId,
        eventId: formFields.eventId,
        state: formFields.state
    };
};

export const formFieldsToUpdateAssignmentForm = (formFields: AssignmentFormFields): AssignmentUpdateForm => {
    if (!formFields.id || !formFields.workerId || !formFields.eventId) {
        throw new Error('Id, WorkerId, and EventId are required');
    }
    return {
        id: formFields.id,
        startDate: dayjs(formFields.startDate, conf.dateInputFormat).unix(),
        endDate: dayjs(formFields.endDate, conf.dateInputFormat).unix(),
        workerId: formFields.workerId,
        eventId: formFields.eventId,
        state: formFields.state
    };
};

export interface AssignmentFormFieldsWithObjects {
    id?: string;
    task?: Task;
    startDate?: string;
    endDate?: string;
    worker?: Worker;
    state?: AssignmentState;
    apartment?: Apartment;
    event: EventSchedulerDto
    alertedEvent: Event
}


export const assignmentToForm = (assignment: AssignmentWithNextEventDto): AssignmentFormFields => {
    return {
        id: assignment.id,
        taskId: assignment.task?.id,
        startDate: dayjs.unix(assignment.startDate).format(conf.dateInputFormat),
        endDate: dayjs.unix(assignment.endDate).format(conf.dateInputFormat),
        workerId: assignment.worker?.id,
        eventId: assignment.event.id,
        state: assignment.state
    };
};

export const eventAndTaskToAssignmentForm = (event: EventForAssignment, task: Task): AssignmentFormFields => {
    return {
        taskId: task.id,
        state: ASSIGNMENT_STATE.PENDING,
        eventId: event.id,
    };
};

export interface WorkerCreateForm {
    name: string;
    language: Language;
    visible: boolean;
}

export interface WorkerUpdateForm {
    id: string;
    name: string;
    language: Language;
    visible: boolean;
}

export interface WorkerFormFields {
    id?: string;
    name: string;
    language: Language;
}


export const workerToForm = (worker: Worker | undefined): WorkerFormFields => {
    if (!worker) {
        return {
            name: '',
            language: LANGUAGE.EN,
        };
    }
    return {
        id: worker.id,
        name: worker.name,
        language: worker.language,
    };
};

export const formFieldsToCreateWorkerForm = (formFields: WorkerFormFields): WorkerCreateForm => {
    return {
        name: formFields.name,
        language: formFields.language,
        visible: true
    };
};

export const formFieldsToUpdateWorkerForm = (formFields: WorkerFormFields): WorkerUpdateForm => {
    if (!formFields.id) {
        throw new Error('Id is required');
    }
    return {
        id: formFields.id,
        name: formFields.name,
        language: formFields.language,
        visible: true
    };
};