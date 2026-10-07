import { Button, Modal, Text } from '@mantine/core';
import { ExtendedCustomColors } from '../../mantine';
import { ModalButtons } from '../molecules/ModalButtons';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

export interface ConfirmModalProperties {
    title: string;
    message: string;
    color: ExtendedCustomColors;
    onConfirm: () => void;
}

export const ConfirmationModal = ({
    opened,
    onClose,
    confirmModalProperties
}: {
    opened: boolean;
    onClose: () => void;
    confirmModalProperties: ConfirmModalProperties | undefined;
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onConfirmAndClose = async () => {
        if (!onConfirm) return;
        try {
            setIsLoading(true);
            await onConfirm();
            onClose();
        } catch (e) {
            // Intentionally ignored
        } finally {
            setIsLoading(false);
        }
    };

    const { title, message, color, onConfirm } = confirmModalProperties || {};

    return (
        <Modal
            zIndex={1000}
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
            title={
                <div
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}
                >
                    <IconAlertTriangle color={color} size={24} />
                    <Text fw={700}>{title}</Text>
                </div>
            }
            opened={opened}
            onClose={onClose}
        >
            <Text size="sm">{message}</Text>
            <ModalButtons>
                <Button onClick={onClose} color={color} variant="outline">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirmAndClose}
                    color={color}
                    variant="filled"
                    loading={isLoading}
                >
                    Confirm
                </Button>
            </ModalButtons>
        </Modal>
    );
};
