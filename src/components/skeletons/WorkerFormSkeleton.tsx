import { Skeleton } from '@mantine/core';
import { ModalButtons } from '../molecules/ModalButtons';

export function WorkerFormSkeleton() {
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
            <Skeleton height={36} width="100%" mb="0.5rem" radius="md" />
            <Skeleton height={36} width="100%" mb="0.5rem" radius="md" />
            <Skeleton height={36} width="100%" mb="0.5rem" radius="md" />
            <Skeleton height={36} width="100%" mb="2rem" radius="md" />

            <ModalButtons>
                <Skeleton height={36} width={80} radius="md" />
                <Skeleton height={36} width={80} radius="md" />
            </ModalButtons>
        </div>
    );
}
