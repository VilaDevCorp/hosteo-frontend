import { ActionIcon, Button, Popover, Text, Title } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconCalendar, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { BalanceCard } from '../components/molecules/BalanceCard';
import { PaymentForm } from '../components/modals/PaymentForm';
import { PaymentFormSkeleton } from '../components/skeletons/PaymentFormSkeleton';
import { useConfirmModalWithContext } from '../hooks/useConfirmModalWithContext';
import { useApi } from '../hooks/useApi';
import { useCrud } from '../hooks/useCrud';
import { useEntityModal } from '../hooks/useEntityModal';
import { useError } from '../hooks/useError';
import { useScreen } from '../hooks/useScreen';
import { Assignment, BalanceDto, Transaction } from '../types/entities';
import { Page, TableStructure } from '../types/types';
import { showNotificationSuccess } from '../utils/notifUtils';
import { conf } from '../../conf';
import { BalanceBadge } from '../components/atoms/BalanceBadge';
import { DataTable } from '../components/organism/DataTable';

const getReason = (assignment?: Assignment): string =>
    assignment
        ? `${assignment.task.name} (${assignment.task.apartment.name})`
        : 'Payment';

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

    const tableStructure: TableStructure<Transaction> = {
        headers: ['Date', 'Worker', 'Amount', 'Reason', ''],
        accesorMethods: [
            (transaction) =>
                dayjs.unix(transaction.createdAt).format(conf.dateTimeFormat),
            (transaction) => transaction.worker?.name ?? 'Unknown worker',
            (transaction) => <BalanceBadge balance={transaction.amount} />,
            (transaction) => getReason(transaction.assignment)
        ]
    };

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

    const openDeletePaymentModal = (id: string) =>
        openModal({
            title: 'Delete payment',
            message: 'Are you sure you want to delete this payment?',
            color: 'error',
            onConfirm: () => deletePaymentMutation(id)
        });

    return (
        <>
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
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            rowGap: '1.5rem',
                            alignContent: 'start',
                            overflowY: isTablet ? 'auto' : 'visible',
                            flex: 1,
                            paddingRight: '0.4rem'
                        }}
                    >
                        {(balances ?? []).map((balance) => (
                            <BalanceCard
                                key={balance.worker.id}
                                worker={balance.worker}
                                balance={balance.balance}
                                selected={
                                    selectedWorkerId === balance.worker.id
                                }
                                onSelect={(workerId: string) => {
                                    setPageNumber(1);
                                    if (selectedWorkerId === workerId) {
                                        setSelectedWorkerId(undefined);
                                        return;
                                    }
                                    setSelectedWorkerId(workerId);
                                }}
                                onPay={() => {
                                    setPayBalance(balance);
                                    onOpenPaymentModal();
                                }}
                            />
                        ))}
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
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}
                    >
                        {selectedBalance ? (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}
                            >
                                <Title order={3}>
                                    {selectedBalance.worker.name ?? 'Worker'}{' '}
                                </Title>
                                <span>
                                    <BalanceBadge
                                        balance={selectedBalance.balance}
                                        textProps={{ size: 'lg' }}
                                    />
                                </span>
                            </div>
                        ) : (
                            <Title order={3}>{'All workers'}</Title>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Text size="md" c="dimmed">
                                {(startDate || endDate) &&
                                    `${startDate ? dayjs(dayjs.unix(Number(startDate))).format(conf.dateFormat) : ''} - ${endDate ? dayjs(dayjs.unix(Number(endDate))).format(conf.dateFormat) : 'Unset'}`}
                            </Text>
                            <Popover>
                                <Popover.Target>
                                    <ActionIcon variant="transparent">
                                        <IconCalendar />
                                    </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <DatePicker
                                        type="range"
                                        defaultDate={dateRange[0] ?? undefined}
                                        value={dateRange}
                                        onChange={(value) => {
                                            setPageNumber(1);
                                            setDateRange(
                                                value as [
                                                    Date | null,
                                                    Date | null
                                                ]
                                            );
                                        }}
                                    />{' '}
                                </Popover.Dropdown>
                            </Popover>
                            {(startDate || endDate) && (
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    leftSection={<IconX size={14} />}
                                    onClick={() => {
                                        setPageNumber(1);
                                        setDateRange([null, null]);
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    <DataTable
                        cardViewMode={false}
                        tableStructure={tableStructure}
                        isLoading={isLoadingTransactions}
                        page={transactionPage!}
                        pageNumber={pageNumber}
                        setPageNumber={setPageNumber}
                        onEdit={onOpenPaymentModal}
                        onDelete={openDeletePaymentModal}
                        hideActionButtons={(item) =>
                            item?.assignment !== undefined
                        }
                    />
                </section>
            </div>

            {paymentModal}
        </>
    );
}
