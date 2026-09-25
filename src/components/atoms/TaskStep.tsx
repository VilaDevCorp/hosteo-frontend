import { ActionIcon, Textarea } from '@mantine/core';
import { CardControls } from './CardControls';
import { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

export function TaskStep({
    index,
    value,
    onEdit,
    onDelete
}: {
    index: number;
    value: string;
    onEdit?: (index: number, value: string) => void;
    onDelete?: (index: number) => void;
}) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newValue, setNewValue] = useState<string>(value);

    const handleEdit = () => {
        if (onEdit) {
            onEdit(index, newValue);
        }
        setIsEditing(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <span
                style={{
                    backgroundColor: 'var(--mantine-color-primary-5)',
                    color: 'var(--mantine-color-white)',
                    borderRadius: '100%',
                    width: '1.5rem',
                    fontWeight: 'bold',
                    height: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0.5rem'
                }}
            >
                {index + 1}
            </span>
            {isEditing ? (
                <>
                    <Textarea
                        w={'100%'}
                        minRows={1}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                    <div
                        style={{
                            gap: '0.5rem',
                            display: 'flex'
                        }}
                    >
                        <ActionIcon
                            variant="transparent"
                            color="success"
                            onClick={() => {
                                handleEdit();
                            }}
                        >
                            <IconCheck />
                        </ActionIcon>
                        <ActionIcon
                            variant="transparent"
                            color="error"
                            onClick={() => {
                                setIsEditing(false);
                            }}
                        >
                            <IconX />
                        </ActionIcon>
                    </div>
                </>
            ) : (
                <>
                    <p style={{ width: '100%', margin: '0' }}>{value}</p>
                    {onEdit && onDelete && (
                        <CardControls
                            onEdit={() => {
                                setNewValue(value);
                                setIsEditing(true);
                            }}
                            onDelete={() => onDelete(index)}
                        />
                    )}
                </>
            )}
        </div>
    );
}
