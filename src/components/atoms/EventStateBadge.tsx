import { Badge } from '@mantine/core';
import { EVENT_STATE, EventState } from '../../types/enums';
import { ExtendedCustomColors } from '../../mantine';

export function EventStateBadge({
    state,
    noBg,
    size
}: {
    state: EventState;
    noBg?: boolean;
    size?: string;
}) {
    const getColor = (): ExtendedCustomColors => {
        switch (state) {
            case EVENT_STATE.FINISHED:
                return 'success';
            case EVENT_STATE.PENDING:
                return 'warning';
            case EVENT_STATE.CANCELLED:
                return 'error';
            case EVENT_STATE.IN_PROGRESS:
                return 'primary';
            default:
                return 'primary';
        }
    };

    return (
        <Badge
            variant={noBg ? 'transparent' : 'filled'}
            color={getColor()}
            size={size || 'md'}
        >
            {state.replace('_', ' ')}
        </Badge>
    );
}