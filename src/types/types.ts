import { ReactNode } from 'react';
import { ErrorCode } from './enums';

export interface SelectOption {
    label: string;
    value: string;
}

export interface Page<T> {
    totalRows: number;
    totalPages: number;
    content: T[];
}

export interface Card<T> {
    item: T;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleVisibility?: () => void;
}

export interface TableStructure<T> {
    headers: ReactNode[];
    accesorMethods: ((item: T) => ReactNode)[];
}

export interface ApiResponse<T> {
    data: T;
    errorMessage: string;
    errorCode: ErrorCode;
}

export class ApiError extends Error {
    statusCode: number;
    message: string;
    code?: string;

    constructor({
        message,
        statusCode,
        code
    }: {
        message: string;
        statusCode: number;
        code?: string;
    }) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
    }
}

