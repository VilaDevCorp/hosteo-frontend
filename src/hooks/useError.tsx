import { useNavigate } from 'react-router-dom';
import { ApiError } from '../types/types';
import StatusCode from 'status-code-enum';
import { useAuth } from './useAuth';
import { ERROR_CODE, ErrorCode } from '../types/enums';
import { showNotificationError } from '../utils/notifUtils';

export const useError = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleError = (error: unknown) => {
        console.error('Error:', error);
        if (error instanceof ApiError) {
            switch (error.statusCode) {
                case StatusCode.ClientErrorUnauthorized:
                    if (
                        error.code &&
                        (
                            [
                                ERROR_CODE.NOT_JWT_TOKEN,
                                ERROR_CODE.NOT_CSR_TOKEN,
                                ERROR_CODE.USER_AGENT_NOT_MATCH,
                                ERROR_CODE.TOKEN_ALREADY_USED,
                                ERROR_CODE.INVALID_TOKEN
                            ] as ErrorCode[]
                        ).includes(error.code as ErrorCode)
                    ) {
                        logout();
                        navigate('/login');
                        showNotificationError('Your session has expired');
                        return;
                    }
                    break;
                case StatusCode.ClientErrorBadRequest:
                    showNotificationError('There are errors in the form');
                    return;
                case StatusCode.ClientErrorNotFound:
                    showNotificationError('Resource not found');
                    return;
                case StatusCode.ClientErrorConflict:
                    showNotificationError(error.message);
                    return;
            }
        }
        showNotificationError('An internal error occurred');
    };

    return { handleError };
};
