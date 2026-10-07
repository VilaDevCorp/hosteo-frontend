import {
    ASSIGNMENT_STATE,
    AssignmentState,
    EVENT_STATE,
    EventState
} from '../../types/enums';
import { ExtendedCustomColors } from '../../mantine';

export function StateIndicator({
    state,
    size
}: {
    state: AssignmentState | EventState;
    size?: 'sm' | 'md' | 'lg';
}) {
    const getBgColor = (): ExtendedCustomColors => {
        switch (state) {
            case ASSIGNMENT_STATE.FINISHED || EVENT_STATE.FINISHED:
                return 'success';
            case ASSIGNMENT_STATE.PENDING || EVENT_STATE.PENDING:
                return 'transparent';
            case EVENT_STATE.CANCELLED:
                return 'error';
            case EVENT_STATE.IN_PROGRESS || ASSIGNMENT_STATE.PENDING:
                return 'warning';
            default:
                return 'primary';
        }
    };


    const getRemSize = () => {
        switch (size) {
            case 'sm':
                return '0.5rem';
            case 'md':
                return '0.75rem';
            case 'lg':
                return '1';
            default:
                return '1rem';
        }
    };

    return (
        <div
            style={{
                width: getRemSize(),
                height: getRemSize(),
                borderRadius: '50%',
                backgroundColor: `var(--mantine-color-${getBgColor()}-3)`,
                border: `1px solid var(--mantine-color-gray-5)`
            }}
        />
    );
}
