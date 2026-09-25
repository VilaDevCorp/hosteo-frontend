import { Skeleton, Stack } from '@mantine/core';

export function EventDetailsSkeleton() {
    return (
        <Stack gap="lg">
            <Skeleton height={120} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
        </Stack>
    );
}