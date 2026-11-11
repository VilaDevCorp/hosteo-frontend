import { Apartment } from '../../types/entities';
import { Card, Text, Title } from '@mantine/core';
import { ApartmentStateBadge } from '../atoms/ApartmentStateBadge';
import { addressToString } from '../../utils/utilFunctions';
import styles from '../styles/DataTable.module.css';
import { CardControls } from '../atoms/CardControls';
import { EntityImage } from '../atoms/EntityImage';

export function ApartmentCard({
    item,
    onClick,
    onEdit,
    onDelete,
    onToggleVisibility
}: {
    item: Apartment;
    onClick?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onToggleVisibility?: () => void;
}) {
    return (
        <Card
            w={'100%'}
            miw={'20rem'}
            h={'18rem'}
            className={onClick ? styles.selectableCard : undefined}
            onClick={onClick && (() => onClick(item.id))}
        >
            <Card.Section>
                <EntityImage
                    src={item.imageUrl}
                    placeholder="/apartment_placeholder.svg"
                    h={160}
                    w={'100%'}
                    fit="cover"
                    alt="Apartment picture"
                />
            </Card.Section>
            <Card.Section
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem',
                    gap: '0.5rem',
                    height: '100%'
                }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
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
                    <ApartmentStateBadge state={item.state} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        alignItems: 'flex-end',
                        height: '100%'
                    }}
                >
                    <Text
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden'
                        }}
                        c="dimmed"
                        size="sm"
                    >
                        {addressToString(item.address)}
                    </Text>
                    <CardControls
                        onEdit={onEdit && (() => onEdit(item.id))}
                        onDelete={onDelete && (() => onDelete(item.id))}
                        onToggleVisibility={onToggleVisibility}
                        visible={item.visible}
                    />
                </div>
            </Card.Section>
        </Card>
    );
}
