import { ActionIcon, Pagination, Skeleton, Table } from '@mantine/core';
import { Card, Page, TableStructure } from '../../types/types';
import { ComponentType } from 'react';
import { BaseEntity } from '../../types/entities';
import { IconEdit, IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react';
import styles from '../styles/DataTable.module.css';

interface DataTableProps<T extends BaseEntity> {
    cardViewMode: boolean;
    CardComponent: ComponentType<Card<T>>;
    cardMinWidth?: string;
    SkeletonComponent?: ComponentType;
    tableStructure: TableStructure<T>;
    isLoading: boolean;
    page: Page<T>;
    pageNumber: number;
    setPageNumber: (pageNumber: number) => void;
    onClick?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onToggleVisibility?: (id: string, visible: boolean) => void;
    isVisible?: (item: T) => boolean;
}

export function DataTable<T extends BaseEntity>({
    cardViewMode,
    CardComponent,
    cardMinWidth,
    SkeletonComponent,
    tableStructure,
    isLoading,
    page,
    pageNumber,
    setPageNumber,
    onClick,
    onDelete,
    onEdit,
    onToggleVisibility,
    isVisible
}: DataTableProps<T>) {
    const printCardsBodyContent = () =>
        page?.content.map((item) => (
            <CardComponent
                key={item.id}
                item={item}
                onClick={onClick && (() => onClick(item.id))}
                onDelete={onDelete && (() => onDelete(item.id))}
                onEdit={onEdit && (() => onEdit(item.id))}
                onToggleVisibility={
                    onToggleVisibility && isVisible
                        ? () => onToggleVisibility(item.id, isVisible(item))
                        : undefined
                }
            />
        ));

    const printCardsBodySkeleton = () => {
        if (SkeletonComponent) {
            return Array.from({ length: 15 }, (_, index) => (
                <SkeletonComponent key={index} />
            ));
        }
        return Array.from({ length: 15 }, (_, index) => (
            <Skeleton key={index} height={300} />
        ));
    };

    const printTableBodySkeleton = () => (
        <>
            {Array.from({ length: 15 }, (_, index) => (
                <Table.Tr key={index}>
                    {tableStructure.accesorMethods.map(
                        (_accessorMethod, index) => (
                            <Table.Td key={index}>
                                <Skeleton
                                    height={10}
                                    mt={'0.5rem'}
                                    mb={'0.5rem'}
                                />
                            </Table.Td>
                        )
                    )}
                    <Table.Td>
                        <Skeleton height={10} mt={'0.5rem'} mb={'0.5rem'} />
                    </Table.Td>
                </Table.Tr>
            ))}
        </>
    );

    const printTableBodyContent = () => (
        <>
            {page?.content.map((item) => (
                <Table.Tbody>
                    <Table.Tr
                        key={item.id}
                        className={styles.selectableTr}
                        onClick={() => {
                            onClick && onClick(item.id);
                        }}
                    >
                        {tableStructure.accesorMethods.map(
                            (accessorMethod, index) => (
                                <Table.Td key={index}>
                                    {accessorMethod(item)}
                                </Table.Td>
                            )
                        )}
                        <Table.Td
                            style={{
                                gap: '0.5rem',
                                display: 'flex'
                            }}
                        >
                            <ActionIcon
                                variant="transparent"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit && onEdit(item.id);
                                }}
                            >
                                <IconEdit />
                            </ActionIcon>
                            {onToggleVisibility ? (
                                <ActionIcon
                                    variant="transparent"
                                    color={
                                        isVisible?.(item) ? 'error' : undefined
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleVisibility(
                                            item.id,
                                            isVisible?.(item) ?? true
                                        );
                                    }}
                                >
                                    {isVisible?.(item) ? (
                                        <IconEyeOff />
                                    ) : (
                                        <IconEye />
                                    )}
                                </ActionIcon>
                            ) : (
                                <ActionIcon
                                    variant="transparent"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete && onDelete(item.id);
                                    }}
                                >
                                    <IconTrash />
                                </ActionIcon>
                            )}
                        </Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            ))}
        </>
    );

    return (
        <>
            <section style={{ overflow: 'auto', height: '100%' }}>
                {cardViewMode ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(' +
                                (cardMinWidth || '20rem') +
                                ',1fr))',
                            justifyItems: 'center',
                            gap: '1rem',
                            rowGap: '2rem'
                        }}
                    >
                        {isLoading
                            ? printCardsBodySkeleton()
                            : printCardsBodyContent()}
                    </div>
                ) : (
                    <Table style={{ width: '100%', overflowX: 'auto' }}>
                        <Table.Thead>
                            <Table.Tr>
                                {tableStructure.headers.map((header, index) => (
                                    <Table.Th key={index}>{header}</Table.Th>
                                ))}
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        {isLoading
                            ? printTableBodySkeleton()
                            : printTableBodyContent()}
                    </Table>
                )}
            </section>
            {page && (
                <Pagination
                    value={pageNumber}
                    onChange={setPageNumber}
                    total={page?.totalPages}
                    gap={'1rem'}
                    style={{ alignSelf: 'center' }}
                />
            )}
        </>
    );
}
