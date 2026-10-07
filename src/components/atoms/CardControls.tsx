import { ActionIcon } from '@mantine/core';
import { IconEdit, IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react';

export function CardControls({
    onEdit,
    onDelete,
    onToggleVisibility,
    visible,
    flexDirection = 'row'
}: {
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleVisibility?: () => void;
    visible?: boolean;
    flexDirection?: 'row' | 'column';
}) {
    return onEdit || onDelete || onToggleVisibility ? (
        <div
            style={{
                gap: '0.5rem',
                display: 'flex',
                flexDirection: flexDirection
            }}
        >
            {onEdit && (
                <ActionIcon
                    variant="transparent"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    <IconEdit />
                </ActionIcon>
            )}
            {onToggleVisibility && (
                <ActionIcon
                    variant="transparent"
                    color={visible !== false ? 'error' : undefined}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility();
                    }}
                >
                    {visible !== false ? <IconEyeOff /> : <IconEye />}
                </ActionIcon>
            )}
            {onDelete && (
                <ActionIcon
                    variant="transparent"
                    color="error"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <IconTrash />
                </ActionIcon>
            )}
        </div>
    ) : null;
}
