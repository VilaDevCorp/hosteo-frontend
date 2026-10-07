import { Button, Card, Group, Text } from '@mantine/core';
import {
    IconAlertTriangle,
    IconEdit,
    IconTrash
} from '@tabler/icons-react';
import { EventCardItem, FailedImportedEvent } from '../../types/entities';
import { EventCard } from './EventCard';

const importedEventToEventCardItem = (
    item: FailedImportedEvent
): EventCardItem => ({
    id: item.id,
    name: item.name,
    startDate: item.startDate,
    endDate: item.endDate,
    source: item.source,
    state: undefined,
    apartment: undefined
});

export function ImportIssueCard({
    item,
    onDismiss
}: {
    item: FailedImportedEvent;
    onDismiss: (id: string) => void;
}) {
    return (
        <Card padding="md" radius="md" withBorder>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'stretch'
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <EventCard item={importedEventToEventCardItem(item)} />
                </div>
                <div
                    style={{
                        width: '14rem',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                    }}
                >
                    <Group gap="0.5rem" wrap="nowrap" align="flex-start">
                        <IconAlertTriangle
                            color="var(--mantine-color-error-5)"
                            size={20}
                            style={{ flexShrink: 0, marginTop: '0.2rem' }}
                        />
                        <Text
                            size="sm"
                            c="error"
                            style={{ wordBreak: 'break-word' }}
                        >
                            {item.error}
                        </Text>
                    </Group>
                    <Group gap="0.5rem" justify="flex-end">
                        <Button
                            variant="outline"
                            size="xs"
                            leftSection={<IconEdit size={16} />}
                            onClick={() => {
                                // Placeholder: edit functionality not implemented yet.
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="filled"
                            color="error"
                            size="xs"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => onDismiss(item.id)}
                        >
                            Dismiss
                        </Button>
                    </Group>
                </div>
            </div>
        </Card>
    );
}
