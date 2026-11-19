import { Button, Card, Group, Textarea, Title } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { WorkerInstructions } from '../../types/entities';
import {
    showNotificationError,
    showNotificationSuccess
} from '../../utils/notifUtils';
import { EntityImage } from '../atoms/EntityImage';
import { useScreen } from '../../hooks/useScreen';

export function WorkerInstructionsCard({
    item
}: {
    item: WorkerInstructions;
}) {
    const { isTablet } = useScreen();

    const copyToClipboard = async (text: string) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }
        // Fallback for non-secure contexts, where the Clipboard API is unavailable.
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!copied) {
            throw new Error('Copy command failed');
        }
    };

    const copyInstructions = async () => {
        try {
            await copyToClipboard(item.instructions);
            showNotificationSuccess(
                `Instructions of ${item.worker.name} copied`
            );
        } catch {
            showNotificationError('The instructions could not be copied');
        }
    };

    return (
        <Card padding="md" withBorder>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '8rem',
                        flexShrink: 0
                    }}
                >
                    <EntityImage
                        src={item.worker.imageUrl}
                        placeholder="/user_placeholder.svg"
                        w={isTablet ? '6rem' : '4rem'}
                        h={isTablet ? '6rem' : '4rem'}
                        radius="50%"
                        fit="cover"
                        alt={`${item.worker.name} picture`}
                    />
                    <Title order={5} ta="center">
                        {item.worker.name}
                    </Title>
                </div>
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}
                >
                    <Textarea
                        value={item.instructions}
                        readOnly
                        autosize
                        minRows={6}
                        maxRows={12}
                        styles={{
                            input: {
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                            }
                        }}
                    />
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconCopy size={16} />}
                            onClick={copyInstructions}
                        >
                            Copy
                        </Button>
                    </Group>
                </div>
            </div>
        </Card>
    );
}
