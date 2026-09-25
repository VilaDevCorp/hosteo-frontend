import { APARTMENT_STATE, ApartmentState } from '../../types/enums';
import { Badge } from '@mantine/core';
import { ExtendedCustomColors } from '../../mantine';

export function ApartmentStateBadge({
    state,
    noBg
}: {
    state: ApartmentState;
    noBg?: boolean;
}) {
    const getChipColor = (): ExtendedCustomColors => {
        switch (state) {
            case APARTMENT_STATE.READY:
                return 'success';
            case APARTMENT_STATE.OCCUPIED:
                return 'warning';
            case APARTMENT_STATE.USED:
                return 'error';
            default:
                return 'success';
        }
    };

    return (
        <Badge
            style={{ overflow: 'visible' }}
            variant={noBg ? 'transparent' : 'light'}
            size="md"
            color={getChipColor()}
        >
            {state}
        </Badge>
    );
}
