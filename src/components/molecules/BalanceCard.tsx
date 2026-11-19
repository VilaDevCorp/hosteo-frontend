import { Button, Card, Title } from '@mantine/core';
import { Worker } from '../../types/entities';
import styles from '../styles/DataTable.module.css';
import { BalanceBadge } from '../atoms/BalanceBadge';
import { Img } from '../atoms/Img';

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
    onSelect: (workerId: string) => void;
    onPay: () => void;
}) {
    return (
        <Card
            w={'100%'}
            className={styles.selectableCard}
            data-selected={selected}
            onClick={() => onSelect(worker?.id ?? '')}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
            }}
        >
            <Card.Section
                w={'100%'}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '0.5rem',
                    padding: '1rem'
                }}
            >
                <Img
                    src={worker?.imageUrl}
                    placeholder="/user_placeholder.svg"
                    w={'3rem'}
                    h={'3rem'}
                    radius={'50%'}
                    fit="cover"
                    alt="Worker picture"
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Title order={5} style={{ textAlign: 'center' }}>
                        {worker?.name ?? 'Unknown worker'}
                    </Title>
                    <BalanceBadge balance={balance} />
                </div>
            </Card.Section>
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
