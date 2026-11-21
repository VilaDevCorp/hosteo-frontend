import { Text } from '@mantine/core';
import { formatAmount } from '../../utils/moneyUtils';

export function BalanceBadge({
    balance,
    textProps
}: {
    balance: number;
    textProps?: React.ComponentProps<typeof Text>;
}) {
    const balanceInverse = -balance;
    const balanceColor =
        balanceInverse > 0
            ? 'success'
            : balanceInverse < 0
              ? 'error'
              : 'dimmed';

    return (
        <Text
            c={balanceColor}
            fw={700}
            {...textProps}
            style={{ textAlign: 'right' }}
        >
            {formatAmount(balanceInverse)}
        </Text>
    );
}
