import { createContext, ReactNode } from 'react';
import {
    AlertsInfo,
    AssignmentOperationError,
    BulkOperationResponse,
    EventOperationError,
    ImportBatchResult,
    FailedImportedEvent,
    SchedulerInfo,
    User
} from '../types/entities';
import { ApiError, ApiResponse } from '../types/types';
import { checkResponseException } from '../utils/utilFunctions';
import { FailedImportedEventUpdateForm, RegisterUserForm } from '../types/forms';
import { AssignmentState, EventState, ImportSource } from '../types/enums';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';
import { conf } from '../../conf';

export interface ApiContext {
    register: (user: RegisterUserForm) => void;
    forgottenPassword: (username: string) => Promise<void>;
    resetPassword: (
        username: string,
        code: string,
        password: string
    ) => Promise<void>;
    eventBulkStateUpdate: (
        eventIds: string[],
        state: EventState
    ) => Promise<BulkOperationResponse<EventOperationError>>;
    eventBulkDelete: (
        eventIds: string[]
    ) => Promise<BulkOperationResponse<EventOperationError>>;
    assignmentBulkStateUpdate: (
        assignmentIds: string[],
        state: AssignmentState
    ) => Promise<BulkOperationResponse<AssignmentOperationError>>;
    assignmentBulkDelete: (
        assignmentIds: string[]
    ) => Promise<BulkOperationResponse<AssignmentOperationError>>;
    searchSchedulerData: (date: string) => Promise<SchedulerInfo>;
    getAlertsInfo: () => Promise<AlertsInfo>;
    hide: (entity: string, id: string) => Promise<void>;
    unhide: (entity: string, id: string) => Promise<void>;
    updateImage: (
        entity: 'apartment' | 'worker',
        id: string,
        file?: File | null
    ) => Promise<void>;
    importReservations: (
        file: File,
        source: ImportSource
    ) => Promise<ImportBatchResult>;
    getFailedImportedEvents: () => Promise<FailedImportedEvent[]>;
    updateFailedImportedEvent: (
        id: string,
        form: FailedImportedEventUpdateForm
    ) => Promise<FailedImportedEvent>;
    retryFailedImportedEvents: () => Promise<ImportBatchResult>;
    dismissFailedImportedEvent: (id: string) => Promise<void>;
    dismissAllFailedImportedEvents: () => Promise<void>;
}

export const ApiContext = createContext<ApiContext>({} as ApiContext);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const { fetchWithAuth } = useAuth();

    const register = async (form: RegisterUserForm) => {
        const url = `${apiUrl}public/register`;
        const options: RequestInit = {
            method: 'POST',
            body: JSON.stringify(form),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetch(url, options);
        const resObject: ApiResponse<User> = await res.json();
        checkResponseException(res, resObject);
    };

    const forgottenPassword = async (username: string): Promise<void> => {
        const url = `${apiUrl}public/forgotten-password/${username}`;
        const options: RequestInit = {
            method: 'POST'
        };
        const res = await fetch(url, options);
        const resObject: ApiResponse<unknown> = await res.json();
        checkResponseException(res, resObject);
    };

    const resetPassword = async (
        username: string,
        code: string,
        password: string
    ): Promise<void> => {
        const url = `${apiUrl}public/reset-password/${username}/${code}`;
        const options: RequestInit = {
            method: 'POST',
            body: password,
            headers: new Headers({
                'content-type': 'text/plain'
            })
        };
        const res = await fetch(url, options);
        const resObject: ApiResponse<unknown> = await res.json();
        checkResponseException(res, resObject);
    };

    const eventBulkStateUpdate = async (
        eventIds: string[],
        state: EventState
    ): Promise<BulkOperationResponse<EventOperationError>> => {
        const url = `${apiUrl}events/state/${state}`;
        const options: RequestInit = {
            method: 'PATCH',
            body: JSON.stringify(eventIds),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<BulkOperationResponse<EventOperationError>> =
            await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const eventBulkDelete = async (
        eventIds: string[]
    ): Promise<BulkOperationResponse<EventOperationError>> => {
        const url = `${apiUrl}events`;
        const options: RequestInit = {
            method: 'DELETE',
            body: JSON.stringify(eventIds),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<BulkOperationResponse<EventOperationError>> =
            await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const assignmentBulkStateUpdate = async (
        assignmentIds: string[],
        state: AssignmentState
    ): Promise<BulkOperationResponse<AssignmentOperationError>> => {
        const url = `${apiUrl}assignments/state/${state}`;
        const options: RequestInit = {
            method: 'PATCH',
            body: JSON.stringify(assignmentIds),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<
            BulkOperationResponse<AssignmentOperationError>
        > = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const assignmentBulkDelete = async (
        assignmentIds: string[]
    ): Promise<BulkOperationResponse<AssignmentOperationError>> => {
        const url = `${apiUrl}assignments`;
        const options: RequestInit = {
            method: 'DELETE',
            body: JSON.stringify(assignmentIds),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<
            BulkOperationResponse<AssignmentOperationError>
        > = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const searchSchedulerData = async (
        date: string
    ): Promise<SchedulerInfo> => {
        const url = `${apiUrl}scheduler/${dayjs(date).format(conf.dateUrlFormat)}`;
        const options: RequestInit = {
            method: 'GET',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<SchedulerInfo> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const getAlertsInfo = async (): Promise<AlertsInfo> => {
        const url = `${apiUrl}alerts`;
        const options: RequestInit = {
            method: 'GET',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<AlertsInfo> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const hide = async (entity: string, id: string): Promise<void> => {
        const url = `${apiUrl}${entity}/${id}/hide`;
        const options: RequestInit = {
            method: 'PATCH',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<unknown> = await res.json();
        checkResponseException(res, resObject);
    };

    const unhide = async (entity: string, id: string): Promise<void> => {
        const url = `${apiUrl}${entity}/${id}/unhide`;
        const options: RequestInit = {
            method: 'PATCH',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<unknown> = await res.json();
        checkResponseException(res, resObject);
    };

    // Passing no file deletes the image (the API treats it as an idempotent delete).
    const updateImage = async (
        entity: 'apartment' | 'worker',
        id: string,
        file?: File | null
    ): Promise<void> => {
        const url = `${apiUrl}${entity}/${id}/image`;
        const options: RequestInit = {
            method: 'PUT'
        };
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            options.body = formData;
        }
        const res = await fetchWithAuth(url, options);
        if (res.ok) {
            return;
        }
        let resObject: ApiResponse<unknown> | undefined;
        try {
            resObject = await res.json();
        } catch {
            resObject = undefined;
        }
        throw new ApiError({
            statusCode: res.status,
            message: resObject?.errorMessage ?? '',
            code: resObject?.errorCode
        });
    };

    const importReservations = async (
        file: File,
        source: ImportSource
    ): Promise<ImportBatchResult> => {
        const url = `${apiUrl}imported-events/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source', source);
        const options: RequestInit = {
            method: 'POST',
            body: formData
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<ImportBatchResult> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const getFailedImportedEvents = async (): Promise<FailedImportedEvent[]> => {
        const url = `${apiUrl}imported-events`;
        const options: RequestInit = {
            method: 'GET',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<FailedImportedEvent[]> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const updateFailedImportedEvent = async (
        id: string,
        form: FailedImportedEventUpdateForm
    ): Promise<FailedImportedEvent> => {
        const url = `${apiUrl}imported-events/${id}`;
        const options: RequestInit = {
            method: 'PATCH',
            body: JSON.stringify(form),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<FailedImportedEvent> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const retryFailedImportedEvents = async (): Promise<ImportBatchResult> => {
        const url = `${apiUrl}imported-events/retry`;
        const options: RequestInit = {
            method: 'POST'
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<ImportBatchResult> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const dismissFailedImportedEvent = async (id: string): Promise<void> => {
        const url = `${apiUrl}imported-events/${id}`;
        const options: RequestInit = {
            method: 'DELETE'
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<unknown> = await res.json();
        checkResponseException(res, resObject);
    };

    const dismissAllFailedImportedEvents = async (): Promise<void> => {
        const url = `${apiUrl}imported-events`;
        const options: RequestInit = {
            method: 'DELETE'
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<unknown> = await res.json();
        checkResponseException(res, resObject);
    };

    const value: ApiContext = {
        register,
        forgottenPassword,
        resetPassword,
        eventBulkStateUpdate,
        assignmentBulkStateUpdate,
        eventBulkDelete,
        assignmentBulkDelete,
        searchSchedulerData,
        getAlertsInfo,
        hide,
        unhide,
        updateImage,
        importReservations,
        getFailedImportedEvents,
        updateFailedImportedEvent,
        retryFailedImportedEvents,
        dismissFailedImportedEvent,
        dismissAllFailedImportedEvents
    };

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
