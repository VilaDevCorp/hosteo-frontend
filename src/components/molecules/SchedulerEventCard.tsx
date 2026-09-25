import { EventSchedulerDto } from '../../types/entities';
import { ActionIcon, Card, Text, Title } from '@mantine/core';
import styles from '../styles/DataTable.module.css';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { ALERT, Alert } from '../../types/enums';
import { useMemo, useState } from 'react';
import { IconAlertTriangle, IconEdit, IconTrash } from '@tabler/icons-react';

const getAlertColor = (alert: Alert | undefined) => {
    if (!alert) {
        return 'hsla(210, 10%, 40%, 1.00)';
    }
    if (alert === ALERT.DAYS_LEFT_5_UNASSIGNED) {
        return 'var(--mantine-color-yellow-6)';
    } else {
        return 'var(--mantine-color-error-5)';
    }
};
export function SchedulerEventCard({
    item,
    isStart,
    onClick,
    isSelected,
    onEdit,
    onDelete
}: {
    item: EventSchedulerDto;
    isStart?: boolean;
    onClick?: (id: string) => void;
    isSelected?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const alertColor = useMemo(() => getAlertColor(item.alert), [item.alert]);
    const [showContextMenu, setShowContextMenu] = useState<boolean>(false);

    return (
        <Card
            w={'100%'}
            className={onClick ? styles.selectableCard : undefined}
            onClick={onClick && (() => onClick(item.id))}
            padding="0"
            shadow="sm"
            radius={'0'}
            style={{
                backgroundColor: isSelected
                    ? 'var(--mantine-color-blue-0)'
                    : 'white',
                borderLeft: '3px solid ' + alertColor,
                borderRight: '3px solid ' + alertColor,
                borderTop: isStart ? '3px solid ' + alertColor : 'none',
                borderBottom: isStart ? 'none' : '3px solid ' + alertColor,
                borderTopLeftRadius: `${isStart ? '0.5rem' : '0'}`,
                borderTopRightRadius: `${isStart ? '0.5rem' : '0'}`,
                borderBottomLeftRadius: `${isStart ? '0' : '0.5rem'}`,
                borderBottomRightRadius: `${isStart ? '0' : '0.5rem'}`
            }}
            onMouseEnter={() => setShowContextMenu(true)}
            onMouseLeave={() => setShowContextMenu(false)}
        >
            <Card.Section
                style={{
                    position: 'relative',
                    height: '36px',
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
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flex: 1,
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {item.alert && (
                            <IconAlertTriangle
                                color={alertColor}
                                size={16}
                                style={{ flexShrink: 0 }}
                            />
                        )}
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
                            {item.name}
                        </Title>
                    </div>
                    {showContextMenu && (
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
                                    backgroundColor:
                                        'rgba(255, 255, 255, 0.92)',

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
                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Text size="sm" fw={'bold'}>
                            {dayjs.unix(item.startDate).format(conf.timeFormat)}
                        </Text>
                        {item.overdue && (
                            <Text size="xs" c="red" fw="bold">
                                Overdue
                            </Text>
                        )}
                    </div>
                </div>
            </Card.Section>
        </Card>
    );
}
