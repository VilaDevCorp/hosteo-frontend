import { Button, Group, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconRotateClockwise, IconTrashX } from '@tabler/icons-react';
import { ImportBatchResult, FailedImportedEvent } from '../../types/entities';
import { useApi } from '../../hooks/useApi';
import { useError } from '../../hooks/useError';
import { useConfirmModalWithContext } from '../../hooks/useConfirmModalWithContext';
import { useScreen } from '../../hooks/useScreen';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { ImportIssueCard } from '../molecules/ImportIssueCard';

interface ImportIssuesModalProps {
    opened: boolean;
    onClose: () => void;
    nSuccessItems?: number;
}

export function ImportIssuesModal({
    opened,
    onClose,
    nSuccessItems
}: ImportIssuesModalProps) {
    const {
        getFailedImportedEvents,
        retryFailedImportedEvents,
        dismissFailedImportedEvent,
        dismissAllFailedImportedEvents
    } = useApi();
    const { handleError } = useError();
    const { openModal } = useConfirmModalWithContext();
    const { isTablet } = useScreen();
    const queryClient = useQueryClient();

    const { data: failedImportedEvents, isLoading } = useQuery<
        FailedImportedEvent[]
    >({
        queryKey: ['failedImportedEvents'],
        queryFn: getFailedImportedEvents
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['failedImportedEvents'] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event'] });
        queryClient.invalidateQueries({ queryKey: ['apartments'] });
        queryClient.invalidateQueries({ queryKey: ['apartment'] });
        queryClient.invalidateQueries({ queryKey: ['schedulerInfo'] });
    };

    const { mutateAsync: retryMutation, isPending: isRetrying } = useMutation({
        mutationFn: retryFailedImportedEvents,
        onSuccess: (result: ImportBatchResult) => {
            invalidate();
        },
        onError: handleError
    });

    const { mutateAsync: dismissOneMutation } = useMutation({
        mutationFn: dismissFailedImportedEvent,
        onSuccess: () => invalidate(),
        onError: handleError
    });

    const { mutateAsync: dismissAllMutation, isPending: isDismissing } =
        useMutation({
            mutationFn: dismissAllFailedImportedEvents,
            onSuccess: () => {
                invalidate();
                showNotificationSuccess('All pending import issues dismissed');
            },
            onError: handleError
        });

    const onDismissAll = () =>
        openModal({
            title: 'Dismiss all issues',
            message:
                'This will permanently remove all pending import issues. This action cannot be undone.',
            color: 'error',
            onConfirm: () => dismissAllMutation()
        });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Import Issues"
            size="xl"
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
        >
            <Stack gap="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text size="sm" c="success" fw={500} style={{ flex: 1 }}>
                        {`${
                            nSuccessItems === undefined
                                ? ''
                                : `${nSuccessItems} reservations added to the calendar. `
                        }${failedImportedEvents?.length} items require attention.`}
                    </Text>
                    <Group gap="0.5rem" wrap="nowrap">
                        <Button
                            variant="outline"
                            size="xs"
                            leftSection={<IconRotateClockwise size={16} />}
                            loading={isRetrying}
                            onClick={() => retryMutation()}
                        >
                            Retry All
                        </Button>
                        <Button
                            variant="filled"
                            color="error"
                            size="xs"
                            leftSection={<IconTrashX size={16} />}
                            loading={isDismissing}
                            onClick={onDismissAll}
                        >
                            Dismiss All
                        </Button>
                    </Group>
                </Group>
                <ScrollArea
                    style={{ height: isTablet ? '60vh' : '100%' }}
                    scrollbars="y"
                >
                    <Stack gap="md">
                        {isLoading ? (
                            <Text c="dimmed">Loading…</Text>
                        ) : failedImportedEvents &&
                          failedImportedEvents.length > 0 ? (
                            failedImportedEvents.map((item) => (
                                <ImportIssueCard
                                    key={item.id}
                                    item={item}
                                    onDismiss={(id) => dismissOneMutation(id)}
                                />
                            ))
                        ) : (
                            <Text c="dimmed">No pending import issues.</Text>
                        )}
                    </Stack>
                </ScrollArea>
            </Stack>
        </Modal>
    );
}
