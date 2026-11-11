import { useNavigate } from 'react-router-dom';
import { ApiError } from '../types/types';
import StatusCode from 'status-code-enum';
import { useAuth } from './useAuth';
import { ERROR_CODE, ErrorCode } from '../types/enums';
import { showNotificationError } from '../utils/notifUtils';
import { getErrorMessage } from '../utils/errorMessages';

const SESSION_EXPIRED_CODES: ErrorCode[] = [
    ERROR_CODE.NOT_JWT_TOKEN,
    ERROR_CODE.NOT_CSR_TOKEN,
    ERROR_CODE.USER_AGENT_NOT_MATCH,
    ERROR_CODE.TOKEN_ALREADY_USED,
    ERROR_CODE.INVALID_TOKEN
];

export const useError = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleError = (error: unknown) => {
        console.error('Error:', error);
        if (error instanceof ApiError) {
            const code = error.code as ErrorCode | undefined;
            const message = getErrorMessage(error.code);

            if (code && SESSION_EXPIRED_CODES.includes(code)) {
                logout();
                navigate('/login');
                showNotificationError(message ?? 'Your session has expired');
                return;
            }

            if (message) {
                showNotificationError(message);
                return;
            }

            switch (error.statusCode) {
                case StatusCode.ClientErrorBadRequest:
                    showNotificationError('There are errors in the form');
                    return;
                case StatusCode.ClientErrorNotFound:
                    showNotificationError('Resource not found');
                    return;
                case StatusCode.ClientErrorConflict:
                    showNotificationError(error.message);
                    return;
                case StatusCode.ClientErrorPayloadTooLarge:
                    showNotificationError('File is too large (max 5 MB)');
                    return;
                case StatusCode.ClientErrorUnsupportedMediaType:
                    showNotificationError('Use a PNG or JPEG image');
                    return;
            }
        }
        showNotificationError('An internal error occurred');
    };

    return { handleError };
};
