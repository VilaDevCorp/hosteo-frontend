import { Modal } from '@mantine/core';
import React from 'react';
import { useScreen } from '../../hooks/useScreen';

interface EntityModalProps {
    opened: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    onExited?: () => void;
    removeHeader?: boolean;
}

export function EntityModal({
    opened,
    onClose,
    title,
    children,
    onExited,
    removeHeader
}: EntityModalProps) {
    const { isLaptop } = useScreen();
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={'lg'}
            zIndex={501}
            title={title}
            withCloseButton={!removeHeader}
            transitionProps={{
                onExited: () => onExited?.()
            }}
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
            styles={{
                body: {
                    height: isLaptop ? '40rem' : '100%',
                    overflow: 'hidden'
                }
            }}
        >
            {children}
        </Modal>
    );
}
