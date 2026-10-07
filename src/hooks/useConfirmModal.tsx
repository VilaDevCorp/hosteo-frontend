import { ReactNode, useState } from 'react';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { ExtendedCustomColors } from '../mantine';

export interface ConfirmModalProperties {
    title: string;
    message: string;
    color: ExtendedCustomColors;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export interface IUseConfirmModal {
    openModal: (props: ConfirmModalProperties) => void;
    modalComponent: ReactNode;
}

export const useConfirmModal = (): IUseConfirmModal => {
    const [opened, setOpened] = useState<boolean>(false);
    const [confirmModalProperties, setConfirmModalProperties] = useState<
        ConfirmModalProperties | undefined
    >(undefined);

    const onOpenModal = () => {
        setOpened(true);
    };

    const onCloseModal = () => {
        setOpened(false);
    };

    const ModalComponent = (
        <ConfirmationModal
            opened={opened}
            onClose={onCloseModal}
            confirmModalProperties={confirmModalProperties}
        />
    );

    return {
        openModal: (props: ConfirmModalProperties) => {
            setConfirmModalProperties(props);
            onOpenModal();
        },
        modalComponent: ModalComponent
    };
};
