import { Skeleton, Stack } from '@mantine/core';
import { ModalButtons } from '../molecules/ModalButtons';

export function PaymentFormSkeleton() {
    return (
        <Stack gap="lg">
            <div>
                <Skeleton height={20} width={100} mb={8} />
                <Skeleton height={36} />
            </div>
            <ModalButtons>
                <Skeleton height={36} width={80} />
                <Skeleton height={36} width={80} />
            </ModalButtons>
        </Stack>
    );
}
