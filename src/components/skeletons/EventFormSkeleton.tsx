import { Skeleton, Stack } from '@mantine/core';

export function EventFormSkeleton() {
    return (
        <Stack gap="lg">
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
        </Stack>
    );
}