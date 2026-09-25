import { createContext, ReactNode } from 'react';
import {
    AssignmentUpdateError,
    EventUpdateError,
    User
} from '../types/entities';
import { ApiResponse } from '../types/types';
import { checkResponseException } from '../utils/utilFunctions';
import { RegisterUserForm } from '../types/forms';
import { AssignmentState, EventState } from '../types/enums';
import { useAuth } from '../hooks/useAuth';

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
    ) => Promise<EventUpdateError[]>;
    assignmentBulkStateUpdate: (
        assignmentIds: string[],
        state: AssignmentState
    ) => Promise<AssignmentUpdateError[]>;
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
    ): Promise<EventUpdateError[]> => {
        const url = `${apiUrl}events/state/${state}`;
        const options: RequestInit = {
            method: 'PATCH',
            body: JSON.stringify(eventIds),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<EventUpdateError[]> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const assignmentBulkStateUpdate = async (
        assignmentIds: string[],
        state: AssignmentState
    ): Promise<AssignmentUpdateError[]> => {
        const url = `${apiUrl}assignments/state/${state}`;
        const options: RequestInit = {
            method: 'PATCH',
            body: JSON.stringify(assignmentIds),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<AssignmentUpdateError[]> =
            await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const value: ApiContext = {
        register,
        forgottenPassword,
        resetPassword,
        eventBulkStateUpdate,
        assignmentBulkStateUpdate
    };

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};