import {
    Button,
    ModalCloseButton,
    ModalHeader,
    ModalTitle,
    NumberInput
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCrud } from '../../hooks/useCrud';
import { useError } from '../../hooks/useError';
import { useReactQuery } from '../../hooks/useReactQuery';
import {
    positiveNumberValidator,
    useValidator
} from '../../hooks/useValidator';
import { BalanceDto, Transaction } from '../../types/entities';
import { showNotificationSuccess } from '../../utils/notifUtils';
import { ModalButtons } from '../molecules/ModalButtons';

export function PaymentForm({
    entity,
    onClose,
    relatedEntity
}: {
    entity?: Transaction;
    onClose?: () => void;
    relatedEntity?: BalanceDto;
}) {
    const { handleError } = useError();
    const { queryClient } = useReactQuery();
    const { create: createPayment, update: updatePayment } =
        useCrud<Transaction>('transactions');

    const worker = entity?.worker ?? relatedEntity?.worker;
    const isEdit = !!entity;

    const [amount, setAmount] = useState<string>('');

    useEffect(() => {
        if (entity) {
            setAmount(String(Math.abs(entity.amount)));
        } else if (relatedEntity && relatedEntity.balance > 0) {
            setAmount(String(relatedEntity.balance));
        } else {
            setAmount('');
        }
    }, [entity, relatedEntity]);

    const { dirty, error, message, validate, activateDirty } = useValidator(
        amount,
        [positiveNumberValidator]
    );

    const save = async () => {
        if (entity) {
            await updatePayment({ id: entity.id, amount: Number(amount) });
        } else if (worker) {
            await createPayment({
                workerId: worker.id,
                amount: Number(amount)
            });
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: save,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            showNotificationSuccess(
                isEdit ? 'Payment updated' : 'Payment created'
            );
            onClose?.();
        },
        onError: handleError
    });

    const onSubmit = () => {
        if (!validate()) return;
        mutate();
    };

    return (
        <form
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                flex: 1
            }}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <ModalHeader style={{ padding: '0', minHeight: '30px' }}>
                <ModalTitle>
                    {isEdit
                        ? 'Edit payment to ' + (worker?.name ?? 'worker')
                        : `Pay ${worker?.name ?? 'worker'}`}
                </ModalTitle>
                <ModalCloseButton />
            </ModalHeader>
            <NumberInput
                label="Amount"
                withAsterisk
                value={amount}
                onChange={(value) => setAmount(String(value))}
                onBlur={() => activateDirty()}
                error={error && dirty ? message : undefined}
                min={0}
                allowNegative={false}
                decimalScale={2}
            />
            <ModalButtons>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    loading={isPending}
                    disabled={isPending || !!error}
                >
                    Submit
                </Button>
            </ModalButtons>
        </form>
    );
}
