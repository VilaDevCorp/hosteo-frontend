import { Skeleton } from '@mantine/core';
import { useScreen } from '../../hooks/useScreen';
import { ModalButtons } from '../molecules/ModalButtons';

export function ApartmentFormSkeleton() {
    const { isTablet } = useScreen();

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                }}
            >
                <Skeleton height={120} width={'10rem'} mb="1rem" radius="md" />
                <Skeleton height={36} width={'10rem'} mb="1rem" radius="md" />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Skeleton height={36} width="100%" mb="1rem" radius="md" />
                <Skeleton height={36} width="8rem" mb="1rem" radius="md" />
            </div>

            <Skeleton height={36} width="100%" mb="1rem" radius="md" />
            <Skeleton height={36} width="100%" mb="1rem" radius="md" />
            <Skeleton height={36} width="100%" mb="1rem" radius="md" />

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Skeleton
                    height={36}
                    width={isTablet ? '20%' : '30%'}
                    mb="1rem"
                    radius="md"
                />
                <Skeleton
                    height={36}
                    width={isTablet ? '40%' : '70%'}
                    mb="1rem"
                    radius="md"
                />
                {isTablet && (
                    <Skeleton height={36} width="40%" mb="1rem" radius="md" />
                )}
            </div>
            {!isTablet && (
                <Skeleton height={36} width="100%" mb="1rem" radius="md" />
            )}

            <ModalButtons>
                <Skeleton height={36} width={80} radius="md" />
                <Skeleton height={36} width={80} radius="md" />
            </ModalButtons>
        </div>
    );
}
