import { ERROR_CODE, ErrorCode } from '../types/enums';

export const ERROR_MSG: Record<ErrorCode, string> = {
    [ERROR_CODE.NOT_JWT_TOKEN]: 'Your session has expired',
    [ERROR_CODE.NOT_CSR_TOKEN]: 'Your session has expired',
    [ERROR_CODE.INVALID_TOKEN]: 'Your session has expired',
    [ERROR_CODE.USER_AGENT_NOT_MATCH]: 'Your session has expired',
    [ERROR_CODE.TOKEN_ALREADY_USED]: 'Your session has expired',
    [ERROR_CODE.INVALID_CREDENTIALS]: 'Wrong credentials',
    [ERROR_CODE.USERNAME_IN_USE]: 'The username is already in use',
    [ERROR_CODE.EMAIL_IN_USE]: 'The email is already in use',
    [ERROR_CODE.DUPLICATED_EVENT_FOR_TASK]:
        'The task is already linked to another event',
    [ERROR_CODE.NOT_AVAILABLE_DATES]: 'The selected dates are not available',
    [ERROR_CODE.UNRECOGNIZED_APARTMENT_ID]:
        'The apartment could not be found',
    [ERROR_CODE.COMPLETE_TASK_ON_NOT_FINISHED_EVENT]:
        'The task cannot be completed while its event is not finished',
    [ERROR_CODE.NEXT_OF_PENDING_CANNOT_BE_INPROGRESS_OR_FINISHED]:
        'The next event of a pending event cannot be in progress or finished',
    [ERROR_CODE.PREV_OF_INPROGRESS_CANNOT_BE_PENDING_OR_INPROGRESS]:
        'The previous event of an event in progress cannot be pending or in progress',
    [ERROR_CODE.NEXT_OF_INPROGRESS_CANNOT_BE_FINISHED_OR_INPROGRESS]:
        'The next event of an event in progress cannot be finished or in progress',
    [ERROR_CODE.PREV_OF_FINISHED_CANNOT_BE_PENDING_OR_INPROGRESS]:
        'The previous event of a finished event cannot be pending or in progress',
    [ERROR_CODE.CHANGE_IN_ASSIGNMENTS_OF_PAST_EVENT]:
        'The assignments of a past event cannot be changed',
    [ERROR_CODE.ASSIGN_CHANGE_LAST_FINISHED_EVENT_ANOTHER_EVENT_IN_PROGRESS]:
        'The last finished event cannot be changed while another event is in progress',
    [ERROR_CODE.ASSIGNMENT_ENDS_AFTER_NEXT_EVENT_STARTS]:
        'The assignment cannot end after the next event starts',
    [ERROR_CODE.ASSIGNMENT_STARTS_BEFORE_EVENT_ENDS]:
        'The assignment cannot start before the event ends',
    [ERROR_CODE.ENTITY_FROZEN]:
        'The entity is frozen and cannot be modified',
    [ERROR_CODE.UNEXPECTED_ERROR]: 'An internal error occurred'
};

export const getErrorMessage = (code?: string): string | undefined => {
    if (!code) {
        return undefined;
    }
    return ERROR_MSG[code as ErrorCode];
};
