import { AssignmentDto } from '../../types/entities';
import { ActionIcon, Card, Text, Title } from '@mantine/core';
import styles from '../styles/DataTable.module.css';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { useState } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { StateIndicator } from '../atoms/StateIndicator';

export function SchedulerAssignmentCard({
    item,
    onClick,
    onEdit,
    onDelete,
    isSelected
}: {
    item: AssignmentDto;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isSelected?: boolean;
}) {
    const [showContextMenu, setShowContextMenu] = useState<boolean>(false);

    const isFrozen = item.frozen;

    return (
        <Card
            w={'100%'}
            className={onClick && !isFrozen ? styles.selectableCard : undefined}
            onClick={onClick && !isFrozen ? () => onClick() : undefined}
            data-selected={isSelected ? 'true' : 'false'}
            padding="0"
            radius="md"
            shadow="sm"
            style={{
                flexShrink: 0,
                cursor: onClick && !isFrozen ? 'pointer' : 'default',
                opacity: isFrozen ? 0.5 : 1
            }}
            onMouseEnter={
                onClick && !isFrozen
                    ? () => setShowContextMenu(true)
                    : undefined
            }
            onMouseLeave={
                onClick && !isFrozen
                    ? () => setShowContextMenu(false)
                    : undefined
            }
        >
            <Card.Section
                style={{
                    position: 'relative',
                    minHeight: '36px',
                    backgroundImage: 'url(apartment_placeholder.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                >
                    <Title
                        order={4}
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                            overflow: 'hidden',
                            fontSize: '0.875rem'
                        }}
                        fw={'lighter'}
                        c="black"
                    >
                        {item.task.apartment.name}
                    </Title>
                </div>
            </Card.Section>

            <Card.Section
                p="0.5rem"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Text size="sm" fw={'bold'}>
                        {dayjs.unix(item.startDate).format(conf.timeFormat)}
                        {' - '}
                        {dayjs.unix(item.endDate).format(conf.timeFormat)}
                    </Text>
                    <StateIndicator state={item.state} size="md" />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}
                >
                    <Text size="sm" lineClamp={1}>
                        {item.task.name}
                    </Text>
                    <Text size="xs" lineClamp={1}>
                        {item.worker.name}
                    </Text>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    ></div>
                </div>
            </Card.Section>
            {showContextMenu && !isFrozen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <div
                        style={{
                            padding: '.2rem',
                            borderTopRightRadius: '0.5rem',
                            borderBottomLeftRadius: '0.5rem',
                            borderTopLeftRadius: '0.5rem',
                            borderBottomRightRadius: '0.5rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',

                            height: '2rem',
                            display: 'flex',
                            gap: '0.5rem'
                        }}
                    >
                        <ActionIcon
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                            }}
                            variant="subtle"
                        >
                            <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            color="error"
                            variant="subtle"
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </div>
                </div>
            )}
        </Card>
    );
}
