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
            padding={'sm'}
            style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                flex: '0 0 100%'
            }}
        >
            <Card.Section
                p={'sm'}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '0.5rem'
                }}
            >
                <Img
                    src={worker?.imageUrl}
                    placeholder="/user_placeholder.svg"
                    w={'2.5rem'}
                    h={'2.5rem'}
                    radius={'50%'}
                    fit="cover"
                    alt="Worker picture"
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flex: 1,
                        minWidth: 0,
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Title order={5} style={{ textAlign: 'center' }}>
                        {worker?.name ?? 'Unknown worker'}
                    </Title>
                    <BalanceBadge
                        balance={balance}
                        textProps={{ size: 'xl' }}
                    />
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
