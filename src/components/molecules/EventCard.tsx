import { EventCardItem } from '../../types/entities';
import { Card, Text, Title } from '@mantine/core';
import { EventStateBadge } from '../atoms/EventStateBadge';
import { ApartmentStateBadge } from '../atoms/ApartmentStateBadge';
import { PlatformIcon } from '../atoms/PlatformIcon';
import styles from '../styles/DataTable.module.css';
import dayjs from 'dayjs';
import { CardControls } from '../atoms/CardControls';
import { conf } from '../../../conf';

export function EventCard({
    item,
    onClick,
    onEdit,
    onDelete
}: {
    item: EventCardItem;
    onClick?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}) {
    return (
        <Card
            w={'100%'}
            miw={'10rem'}
            h={'12rem'}
            className={onClick ? styles.selectableCard : undefined}
            onClick={onClick && (() => onClick(item.id))}
            padding="0"
            radius="md"
        >
            <Card.Section
                style={{
                    position: 'relative',
                    height: '80px',
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
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'center',
                            height: '100%',
                            gap: '0.5rem'
                        }}
                    >
                        <Title
                            order={4}
                            style={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                                overflow: 'hidden'
                            }}
                            c="black"
                        >
                            {item.apartment?.name ?? ''}
                        </Title>
                        {item.apartment?.state && (
                            <ApartmentStateBadge state={item.apartment.state} />
                        )}
                    </div>
                </div>
            </Card.Section>

            <Card.Section
                p="md"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                    height: 'calc(100% - 140px)'
                }}
            >
                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <Text size="sm" fw={500}>
                            {item.startDate != null
                                ? dayjs
                                      .unix(item.startDate)
                                      .format(conf.dateTimeFormat)
                                : ''}{' '}
                            -{' '}
                            {item.endDate != null
                                ? dayjs
                                      .unix(item.endDate)
                                      .format(conf.dateTimeFormat)
                                : ''}
                        </Text>
                        {item.state && <EventStateBadge state={item.state} />}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <PlatformIcon platform={item.source ?? ''} />
                        <Text
                            fw={500}
                            style={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 1,
                                overflow: 'hidden',
                                wordBreak: 'break-all'
                            }}
                        >
                            {item.name ?? ''}
                        </Text>
                    </div>
                    <CardControls
                        onEdit={onEdit && (() => onEdit(item.id))}
                        onDelete={onDelete && (() => onDelete(item.id))}
                    />
                </div>
            </Card.Section>
        </Card>
    );
}
