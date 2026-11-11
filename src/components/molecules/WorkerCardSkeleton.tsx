import { Card, Skeleton } from '@mantine/core';

export function WorkerCardSkeleton() {
    return (
        <Card w={'100%'} miw={'15rem'} h={'18rem'}>
            <Card.Section p={'1rem'}>
                <Skeleton height={160} width={160} radius="md" />
            </Card.Section>
            <Card.Section
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem',
                    gap: '0.5rem',
                    height: '100%'
                }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <Skeleton height={16} width={'60%'} />
                    <Skeleton height={20} width={'20%'} radius="xl" />
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        alignItems: 'flex-end',
                        height: '100%'
                    }}
                >
                    <Skeleton height={14} width={'70%'} />
                    <div
                        style={{
                            gap: '0.5rem',
                            display: 'flex'
                        }}
                    >
                        <Skeleton height={28} width={28} />
                        <Skeleton height={28} width={28} />
                    </div>
                </div>
            </Card.Section>
        </Card>
    );
}
