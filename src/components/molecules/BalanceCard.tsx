import { Button, Card, Text, Title } from '@mantine/core';
import { Worker } from '../../types/entities';
import { EntityImage } from '../atoms/EntityImage';
import { formatAmount } from '../../utils/moneyUtils';
import styles from '../styles/DataTable.module.css';

export function BalanceCard({
    worker,
    balance,
    selected,
    onSelect,
    onPay
}: {
    worker?: Worker;
    balance: number;
    selected: boolean;
    onSelect: () => void;
    onPay: () => void;
}) {
    const balanceColor =
        balance > 0 ? 'success' : balance < 0 ? 'error' : 'dimmed';

    return (
        <Card
            w={'100%'}
            miw={'12rem'}
            className={styles.selectableCard}
            data-selected={selected}
            onClick={onSelect}
            style={{ alignItems: 'center', cursor: 'pointer' }}
        >
            <Card.Section p={'1rem'}>
                <EntityImage
                    src={worker?.imageUrl}
                    placeholder="/user_placeholder.svg"
                    w={'7rem'}
                    h={'7rem'}
                    fit="cover"
                    alt="Worker picture"
                />
            </Card.Section>
            <Title order={5} style={{ textAlign: 'center' }}>
                {worker?.name ?? 'Unknown worker'}
            </Title>
            <Text
                c={balanceColor}
                fw={700}
                style={{ marginBottom: '0.5rem' }}
            >
                {formatAmount(balance)}
            </Text>
            <Button
                variant="light"
                size="xs"
                onClick={(e) => {
                    e.stopPropagation();
                    onPay();
                }}
            >
                Pay
            </Button>
        </Card>
    );
}
