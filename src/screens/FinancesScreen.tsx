import {
    ActionIcon,
    Button,
    Group,
    Loader,
    Pagination,
    Table,
    Text,
    Title
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { BalanceCard } from '../components/molecules/BalanceCard';
import { PaymentForm } from '../components/modals/PaymentForm';
import { PaymentFormSkeleton } from '../components/skeletons/PaymentFormSkeleton';
import { Layout } from '../components/organism/layout/Layout';
import { useConfirmModalWithContext } from '../hooks/useConfirmModalWithContext';
import { useApi } from '../hooks/useApi';
import { useCrud } from '../hooks/useCrud';
import { useEntityModal } from '../hooks/useEntityModal';
import { useError } from '../hooks/useError';
import { useScreen } from '../hooks/useScreen';
import { BalanceDto, Transaction } from '../types/entities';
import { Page } from '../types/types';
import { formatAmount } from '../utils/moneyUtils';
import { showNotificationSuccess } from '../utils/notifUtils';
import { conf } from '../../conf';

export function FinancesScreen() {
    const { isTablet } = useScreen();
    const { handleError } = useError();
    const { openModal } = useConfirmModalWithContext();
    const { getBalances } = useApi();
    const { search: searchTransactions, remove: removeTransaction } =
        useCrud<Transaction>('transactions');
    const queryClient = useQueryClient();

    const [pageNumber, setPageNumber] = useState<number>(1);
    const [selectedWorkerId, setSelectedWorkerId] = useState<
        string | undefined
    >(undefined);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        null,
        null
    ]);
    const [payBalance, setPayBalance] = useState<BalanceDto | undefined>(
        undefined
    );

    const { onOpen: onOpenPaymentModal, modalComponent: paymentModal } =
        useEntityModal<Transaction>({
            entityName: 'transactions',
            removeHeader: true,
            relatedEntity: payBalance,
            ModalBodyComponent: PaymentForm,
            ModalBodySkeleton: PaymentFormSkeleton
        });

    const {
        data: balances,
        isLoading: isLoadingBalances,
        isError: balancesError,
        error: balancesErrorObject
    } = useQuery<BalanceDto[]>({
        queryKey: ['transactions', 'balances'],
        queryFn: getBalances,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false
    });

    const startDate = dateRange[0]
        ? String(dayjs(dateRange[0]).startOf('day').unix())
        : undefined;
    const endDate = dateRange[1]
        ? String(dayjs(dateRange[1]).endOf('day').unix())
        : undefined;

    const {
        data: transactionPage,
        isLoading: isLoadingTransactions,
        isError: transactionsError,
        error: transactionsErrorObject
    } = useQuery<Page<Transaction>>({
        queryKey: [
            'transactions',
            pageNumber,
            selectedWorkerId,
            startDate,
            endDate
        ],
        queryFn: () =>
            searchTransactions(pageNumber - 1, 15, {
                workerId: selectedWorkerId,
                startDate,
                endDate
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false
    });

    useEffect(() => {
        if (balancesError) {
            handleError(balancesErrorObject);
        }
    }, [balancesError, balancesErrorObject]);

    useEffect(() => {
        if (transactionsError) {
            handleError(transactionsErrorObject);
        }
    }, [transactionsError, transactionsErrorObject]);

    const balancesByWorkerId = useMemo(
        () =>
            new Map(
                (balances ?? []).map((balance) => [balance.worker.id, balance])
            ),
        [balances]
    );

    const selectedBalance = selectedWorkerId
        ? balancesByWorkerId.get(selectedWorkerId)
        : undefined;

    const { mutateAsync: deletePaymentMutation } = useMutation({
        mutationFn: (id: string) => removeTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            showNotificationSuccess('Payment deleted');
        },
        onError: handleError
    });

    const openDeletePaymentModal = (transaction: Transaction) =>
        openModal({
            title: 'Delete payment',
            message: 'Are you sure you want to delete this payment?',
            color: 'error',
            onConfirm: () => deletePaymentMutation(transaction.id)
        });

    return (
        <Layout>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flex: 1,
                    minHeight: 0,
                    flexDirection: isTablet ? 'row' : 'column'
                }}
            >
                <section
                    style={{
                        width: isTablet ? '30%' : '100%',
                        minWidth: isTablet ? '14rem' : undefined,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        overflow: isTablet ? 'hidden' : 'visible'
                    }}
                >
                    <Title order={3}>Balances</Title>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(10rem, 1fr))',
                            gap: '1rem',
                            rowGap: '1.5rem',
                            alignContent: 'start',
                            overflowY: isTablet ? 'auto' : 'visible',
                            flex: 1,
                            paddingRight: '0.4rem'
                        }}
                    >
                        {isLoadingBalances ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gridColumn: '1 / -1',
                                    padding: '2rem'
                                }}
                            >
                                <Loader />
                            </div>
                        ) : (
                            (balances ?? []).map((balance) => (
                                <BalanceCard
                                    key={balance.worker.id}
                                    worker={balance.worker}
                                    balance={balance.balance}
                                    selected={
                                        selectedWorkerId === balance.worker.id
                                    }
                                    onSelect={() => {
                                        setPageNumber(1);
                                        setSelectedWorkerId(balance.worker.id);
                                    }}
                                    onPay={() => {
                                        setPayBalance(balance);
                                        onOpenPaymentModal();
                                    }}
                                />
                            ))
                        )}
                    </div>
                </section>

                <section
                    style={{
                        width: isTablet ? '70%' : '100%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        overflow: isTablet ? 'hidden' : 'visible',
                        flex: 1
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}
                    >
                        <Title order={3}>
                            {selectedBalance
                                ? `${selectedBalance?.worker.name ?? 'Worker'} — ${formatAmount(selectedBalance.balance ?? 0)}`
                                : 'Transactions'}
                        </Title>
                        {selectedWorkerId && (
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconX size={14} />}
                                onClick={() => {
                                    setPageNumber(1);
                                    setSelectedWorkerId(undefined);
                                }}
                            >
                                Deselect
                            </Button>
                        )}
                    </div>

                    <DatePicker
                        type="range"
                        value={dateRange}
                        onChange={(value) => {
                            setPageNumber(1);
                            setDateRange(value as [Date | null, Date | null]);
                        }}
                        numberOfColumns={isTablet ? 2 : 1}
                    />

                    <div
                        style={{
                            overflow: isTablet ? 'auto' : 'visible',
                            flex: 1
                        }}
                    >
                        {isLoadingTransactions ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '2rem'
                                }}
                            >
                                <Loader />
                            </div>
                        ) : (
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Date</Table.Th>
                                        <Table.Th>Worker</Table.Th>
                                        <Table.Th>Amount</Table.Th>
                                        <Table.Th>Reason</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {(transactionPage?.content ?? []).map(
                                        (transaction) => {
                                            const isPayment =
                                                !transaction.assignment;
                                            const amount = isPayment
                                                ? -Math.abs(transaction.amount)
                                                : Math.abs(transaction.amount);
                                            const reason =
                                                transaction.assignment
                                                    ? `${transaction.assignment.task.name} (${transaction.assignment.task.apartment.name})`
                                                    : 'Payment';

                                            return (
                                                <Table.Tr key={transaction.id}>
                                                    <Table.Td>
                                                        {dayjs(
                                                            transaction.createdAt
                                                        ).format(
                                                            conf.dateFormat
                                                        )}
                                                    </Table.Td>
                                                    <Table.Td>
                                                        {
                                                            transaction.worker
                                                                .name
                                                        }
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text
                                                            c={
                                                                isPayment
                                                                    ? 'error'
                                                                    : 'success'
                                                            }
                                                        >
                                                            {formatAmount(
                                                                amount
                                                            )}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        {reason}
                                                    </Table.Td>
                                                    <Table.Td>
                                                        {isPayment && (
                                                            <Group
                                                                gap="xs"
                                                                wrap="nowrap"
                                                            >
                                                                <ActionIcon
                                                                    variant="transparent"
                                                                    onClick={() =>
                                                                        onOpenPaymentModal(
                                                                            transaction.id
                                                                        )
                                                                    }
                                                                >
                                                                    <IconEdit />
                                                                </ActionIcon>
                                                                <ActionIcon
                                                                    variant="transparent"
                                                                    color="error"
                                                                    onClick={() =>
                                                                        openDeletePaymentModal(
                                                                            transaction
                                                                        )
                                                                    }
                                                                >
                                                                    <IconTrash />
                                                                </ActionIcon>
                                                            </Group>
                                                        )}
                                                    </Table.Td>
                                                </Table.Tr>
                                            );
                                        }
                                    )}
                                </Table.Tbody>
                            </Table>
                        )}
                    </div>
                    {transactionPage && transactionPage.totalPages > 1 && (
                        <Pagination
                            value={pageNumber}
                            onChange={setPageNumber}
                            total={transactionPage.totalPages}
                            gap={'1rem'}
                            style={{ alignSelf: 'center' }}
                        />
                    )}
                </section>
            </div>

            {paymentModal}
        </Layout>
    );
}
