import { ApiResponse, Page } from '../types/types';
import { checkResponseException } from '../utils/utilFunctions';
import { useAuth } from './useAuth';

interface CrudOperations<T> {
    create: (form: unknown) => Promise<T>;
    update: (form: unknown) => Promise<T>;
    get: (id: string) => Promise<T>;
    search: (
        pageNumber: number,
        pageSize: number | null,
        filters: SearchFilters
    ) => Promise<Page<T>>;
    remove: (id: string) => Promise<void>;
}

type SearchFilters = { [key: string]: string | boolean | string[] | undefined };

export function useCrud<T>(entity: string): CrudOperations<T> {
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const { fetchWithAuth } = useAuth();

    const create = async (form: unknown): Promise<T> => {
        const url = `${apiUrl}${entity}`;
        const options: RequestInit = {
            method: 'POST',
            body: JSON.stringify(form),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<T> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const update = async (form: unknown): Promise<T> => {
        const url = `${apiUrl}${entity}`;
        const options: RequestInit = {
            method: 'PUT',
            body: JSON.stringify(form),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<T> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const get = async (id: string): Promise<T> => {
        const url = `${apiUrl}${entity}/${id}`;
        const options: RequestInit = {
            method: 'GET',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<T> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const search = async (
        pageNumber: number,
        pageSize: number | null,
        filters: SearchFilters
    ) => {
        const body = { pageNumber, pageSize };
        Object.assign(body, filters);

        const url = `${apiUrl}${entity}/search`;
        const options: RequestInit = {
            method: 'POST',
            body: JSON.stringify(body),
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject: ApiResponse<Page<T>> = await res.json();
        checkResponseException(res, resObject);
        return resObject.data;
    };

    const remove = async (id: string): Promise<void> => {
        const url = `${apiUrl}${entity}/${id}`;
        const options: RequestInit = {
            method: 'DELETE',
            headers: new Headers({
                'content-type': 'application/json'
            })
        };
        const res = await fetchWithAuth(url, options);
        const resObject = await res.json();
        checkResponseException(res, resObject);
    };

    const value: CrudOperations<T> = {
        create,
        update,
        get,
        search,
        remove
    };

    return value;
}
