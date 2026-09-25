import { Card, Skeleton } from '@mantine/core';

export function EventCardSkeleton() {
    return (
        <Card w={'100%'} miw={'10rem'} h={'12rem'} padding="0" radius="md">
            <Card.Section>
                <Skeleton height={80} radius={0} />
            </Card.Section>

            <Card.Section
                p="md"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                    height: 'calc(100% - 80px)'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                    }}
                >
                    <Skeleton height={14} width="50%" />
                    <Skeleton height={20} width="25%" radius="xl" />
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}
                    >
                        <Skeleton height={20} width={20} circle />
                        <Skeleton height={14} width={80} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Skeleton height={28} width={28} />
                        <Skeleton height={28} width={28} />
                    </div>
                </div>
            </Card.Section>
        </Card>
    );
}