import { Card, Title } from '@mantine/core';
import { Apartment } from '../../types/entities';
import styles from '../styles/DataTable.module.css';
import { Img } from '../atoms/Img';

export function ApartmentSimpleCard({
    item,
    onClick
}: {
    item: Apartment;
    onClick?: (id: string) => void;
}) {
    return (
        <Card
            w={'100%'}
            miw={'15rem'}
            h={'12rem'}
            className={styles.selectableCard}
            onClick={() => onClick && onClick(item.id)}
            padding="0"
        >
            <Card.Section>
                <Img
                    src={item.imageUrl}
                    placeholder="/apartment_placeholder.svg"
                    h={140}
                    alt={item.name}
                />
            </Card.Section>
            <Card.Section
                p="xs"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                }}
            >
                <Title order={5} ta="center">
                    {item.name}
                </Title>
            </Card.Section>
        </Card>
    );
}
