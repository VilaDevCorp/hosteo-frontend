import { Badge } from '@mantine/core';
import { ASSIGNMENT_STATE, AssignmentState } from '../../types/enums';
import { ExtendedCustomColors } from '../../mantine';

export function AssignmentStateBadge({
    state,
    noBg,
    size
}: {
    state: AssignmentState;
    noBg?: boolean;
    size?: 'sm' | 'md' | 'lg';
}) {
    const getChipColor = (): ExtendedCustomColors => {
        switch (state) {
            case ASSIGNMENT_STATE.FINISHED:
                return 'success';
            case ASSIGNMENT_STATE.PENDING:
                return 'primary';
            default:
                return 'primary';
        }
    };

    return (
        <Badge
            style={{ overflow: 'visible' }}
            variant={noBg ? 'transparent' : 'light'}
            size={size || 'md'}
            color={getChipColor()}
        >
            {state}
        </Badge>
    );
}
