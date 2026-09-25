export const EVENT_STATE = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    FINISHED: 'FINISHED',
    CANCELLED: 'CANCELLED'
} as const;

export type EventState = (typeof EVENT_STATE)[keyof typeof EVENT_STATE];


export const EVENT_SOURCE = {
    NONE: 'NONE',
    AIRBNB: 'AIRBNB',
    BOOKING: 'BOOKING',
} as const;

export type EventSource = (typeof EVENT_SOURCE)[keyof typeof EVENT_SOURCE];

export const TASK_TYPE = {
    MANDATORY: 'MANDATORY',
    EXTRA: 'EXTRA'
} as const;

export type TaskType = (typeof TASK_TYPE)[keyof typeof TASK_TYPE];


export const EVENT_TYPE = {
    BOOKING: 'BOOKING',
    PERSONAL_USE: 'PERSONAL_USE',
    MAINTENANCE: 'MAINTENANCE'
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];


export const CATEGORY_ENUM = {
    CLEANING: 'CLEANING',
    MAINTENANCE: 'MAINTENANCE',
    REPAIR: 'REPAIR',
    INSPECTION: 'INSPECTION',
    OTHER: 'OTHER'
} as const;

export type CategoryEnum = (typeof CATEGORY_ENUM)[keyof typeof CATEGORY_ENUM];


export const LANGUAGE = {
    EN: 'EN',
    ES: 'ES',
    FR: 'FR',
    DE: 'DE',
    IT: 'IT',
    PT: 'PT',
    NL: 'NL',
    PL: 'PL',
    SV: 'SV',
    NO: 'NO',
    DA: 'DA',
    FI: 'FI',
    CS: 'CS',
    HU: 'HU',
    RO: 'RO',
    BG: 'BG',
    HR: 'HR',
    SL: 'SL',
    EL: 'EL',
    TR: 'TR',
    UK: 'UK',
    RU: 'RU'
} as const;

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];


export const ASSIGNMENT_STATE = {
    PENDING: 'PENDING',
    FINISHED: 'FINISHED',
} as const;

export type AssignmentState =
    (typeof ASSIGNMENT_STATE)[keyof typeof ASSIGNMENT_STATE];


export const APARTMENT_STATE = {
    READY: 'READY',
    OCCUPIED: 'OCCUPIED',
    USED: 'USED'
} as const;

export type ApartmentState =
    (typeof APARTMENT_STATE)[keyof typeof APARTMENT_STATE];


export const ALERT = {
    DAYS_LEFT_2_UNASSIGNED: 'DAYS_LEFT_2_UNASSIGNED',
    DAYS_LEFT_5_UNASSIGNED: 'DAYS_LEFT_5_UNASSIGNED',
    DAYS_LEFT_2_NOT_COMPLETED: 'DAYS_LEFT_2_NOT_COMPLETED'
} as const;

export type Alert = (typeof ALERT)[keyof typeof ALERT];


export const CONFLICT_TYPE = {
    ASSIGNMENT_CONFLICT: 'ASSIGNMENT_CONFLICT',
    BOOKING_CONFLICT: 'BOOKING_CONFLICT',
    IMPORT_BOOKING_CONFLICT: 'IMPORT_BOOKING_CONFLICT'
} as const;

export type ConflictType = (typeof CONFLICT_TYPE)[keyof typeof CONFLICT_TYPE];


export const VALIDATION_CODE_TYPE = {
    ACTIVATE_ACCOUNT: 'ACTIVATE_ACCOUNT',
    RESET_PASSWORD: 'RESET_PASSWORD'
} as const;

export type ValidationCodeType =
    (typeof VALIDATION_CODE_TYPE)[keyof typeof VALIDATION_CODE_TYPE];


export const ERROR_CODE = {
    NOT_JWT_TOKEN: 'NOT_JWT_TOKEN',
    NOT_CSR_TOKEN: 'NOT_CSR_TOKEN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    USERNAME_IN_USE: 'USERNAME_IN_USE',
    EMAIL_IN_USE: 'EMAIL_IN_USE',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    USER_AGENT_NOT_MATCH: 'USER_AGENT_NOT_MATCH',
    TOKEN_ALREADY_USED: 'TOKEN_ALREADY_USED'
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];