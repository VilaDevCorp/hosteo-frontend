import { Worker } from '../../types/entities';
import { Card, Title } from '@mantine/core';
import styles from '../styles/DataTable.module.css';
import { CardControls } from '../atoms/CardControls';
import { Flag } from '../atoms/Flag';
import { Img } from '../atoms/Img';

export function WorkerCard({
    item,
    onClick,
    onEdit,
    onDelete,
    onToggleVisibility
}: {
    item: Worker;
    onClick?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onToggleVisibility?: () => void;
}) {
    return (
        <Card
            w={'100%'}
            miw={'8rem'}
            style={{
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
            className={onClick ? styles.selectableCard : undefined}
            onClick={onClick && (() => onClick(item.id))}
        >
            <Card.Section p={'1rem'}>
                <Img
                    src={item.imageUrl}
                    placeholder="/user_placeholder.svg"
                    w={'5rem'}
                    h={'5rem'}
                    radius={'50%'}
                    fit="cover"
                    alt="Worker picture"
                />
            </Card.Section>
            <Card.Section
                style={{
                    display: 'flex',
                    width: '100%',
                    paddingBottom: '1rem',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Flag country={item.language} />
                    <Title
                        order={4}
                        style={{
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {item.name}
                    </Title>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
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
