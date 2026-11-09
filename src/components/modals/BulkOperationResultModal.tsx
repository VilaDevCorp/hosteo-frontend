import { Card, Group, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { useScreen } from '../../hooks/useScreen';
import {
    AssignmentOperationError,
    EventOperationError,
    ITEM_TYPE,
    ItemType
} from '../../types/entities';
import { getErrorMessage } from '../../utils/errorMessages';
import { Z_INDEX } from '../../utils/zIndex';
import { BulkAction, getBulkResultLabel } from '../../utils/bulkResultLabel';

export interface BulkOperationResultModalProps {
    opened: boolean;
    onClose: () => void;
    itemType: ItemType;
    action: BulkAction;
    successCount: number;
    errors: (EventOperationError | AssignmentOperationError)[];
}

const formatDateTime = (unix: number) =>
    dayjs.unix(unix).format(conf.dateTimeFormat);

interface ErrorRow {
    id: string;
    apartmentName: string;
    startDate: number;
    endDate: number;
    person: string;
    message: string;
}

const toErrorRow = (
    item: EventOperationError | AssignmentOperationError,
    itemType: ItemType
): ErrorRow => {
    const message = getErrorMessage(item.error) ?? item.error;

    if (itemType === ITEM_TYPE.EVENT) {
        const { event } = item as EventOperationError;
        return {
            id: event.id,
            apartmentName: event.apartment.name,
            startDate: event.startDate,
            endDate: event.endDate,
            person: event.name,
            message
        };
    }

    const { assignment } = item as AssignmentOperationError;
    return {
        id: assignment.id,
        apartmentName: assignment.task.apartment.name,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        person: assignment.worker.name,
        message
    };
};

export function BulkOperationResultModal({
    opened,
    onClose,
    itemType,
    action,
    successCount,
    errors
}: BulkOperationResultModalProps) {
    const { isTablet } = useScreen();
    const errorRows = errors.map((item) => toErrorRow(item, itemType));

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Operation results"
            size="lg"
            zIndex={Z_INDEX.entityModal}
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
        >
            <Stack gap="md">
                <Text size="sm" fw={500} c="success">
                    {getBulkResultLabel(itemType, action, successCount)}
                </Text>

                <ScrollArea
                    style={{ height: isTablet ? '60vh' : '100%' }}
                    scrollbars="y"
                >
                    <Stack gap="sm">
                        {errorRows.map((row) => (
                            <Card
                                key={row.id}
                                padding="md"
                                radius="md"
                                withBorder
                            >
                                <Group
                                    justify="space-between"
                                    align="flex-start"
                                    wrap="nowrap"
                                >
                                    <Stack
                                        gap={0}
                                        style={{ flex: 1, minWidth: 0 }}
                                    >
                                        <Text size="sm" fw={700}>
                                            {row.apartmentName}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {formatDateTime(row.startDate)} -{' '}
                                            {formatDateTime(row.endDate)}
                                        </Text>
                                        <Text size="sm">{row.person}</Text>
                                    </Stack>
                                    <Text
                                        size="sm"
                                        c="error"
                                        style={{
                                            maxWidth: '40%',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {row.message}
                                    </Text>
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                </ScrollArea>
            </Stack>
        </Modal>
    );
}
