import { Card, Text, Title } from '@mantine/core';
import { CardControls } from '../atoms/CardControls';
import { Template, Task } from '../../types/entities';
import styles from '../styles/DataTable.module.css';
import { TaskCategoryBadge } from '../atoms/TaskCategoryBadge';
import { formatAmount } from '../../utils/moneyUtils';

interface TaskOrTemplateCardProps {
    item: Template | Task;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleVisibility?: () => void;
    onClick?: () => void;
    onAssign?: () => void;
}

export function TaskOrTemplateCard({
    item,
    onEdit,
    onDelete,
    onToggleVisibility,
    onClick
}: TaskOrTemplateCardProps) {
    return (
        <Card
            w={'100%'}
            miw={'8rem'}
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
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '3rem',
                            width: '100%'
                        }}
                    >
                        {'cost' in item && (
                            <Text size="md">{formatAmount(item.cost)}</Text>
                        )}
                        <Text size="md" c="dimmed">
                            {item.duration} min
                        </Text>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'space-between'
                        }}
                    >
                        <TaskCategoryBadge category={item.category} />
                        <CardControls
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleVisibility={onToggleVisibility}
                            visible={
                                'visible' in item ? item.visible : undefined
                            }
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
