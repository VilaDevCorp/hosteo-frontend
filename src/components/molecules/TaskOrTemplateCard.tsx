import { Card, Text, Title } from '@mantine/core';
import { CardControls } from '../atoms/CardControls';
import { Template, Task } from '../../types/entities';
import styles from '../styles/DataTable.module.css';
import { TaskCategoryBadge } from '../atoms/TaskCategoryBadge';

interface TaskOrTemplateCardProps {
    item: Template | Task;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    onAssign?: () => void;
}

export function TaskOrTemplateCard({
    item,
    onEdit,
    onDelete,
    onClick
}: TaskOrTemplateCardProps) {
    return (
        <Card
            w={'100%'}
            miw={'8rem'}
            h={'8.125rem'}
            style={{
                gap: '1rem',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            className={onClick ? styles.selectableCard : undefined}
            onClick={onClick && (() => onClick())}
        >
            <Title
                order={4}
                style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden'
                }}
            >
                {item.name}
            </Title>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'space-between',
                    width: '100%'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent:
                            onEdit || onDelete ? 'flex-start' : 'space-between',
                        width: '100%'
                    }}
                >
                    <Text size="sm" c="dimmed">
                        {item.duration} min
                    </Text>
                    <TaskCategoryBadge category={item.category} />
                </div>
                <CardControls onEdit={onEdit} onDelete={onDelete} />
            </div>
        </Card>
    );
}
