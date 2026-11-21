import { Modal } from '@mantine/core';
import React from 'react';
import { useScreen } from '../../hooks/useScreen';
import { Z_INDEX } from '../../utils/zIndex';

interface EntityModalProps {
    opened: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    onExited?: () => void;
    removeHeader?: boolean;
    size?: 'sm'| 'md' | 'lg';
}

export function EntityModal({
    opened,
    onClose,
    title,
    children,
    onExited,
    removeHeader, 
    size='lg'
}: EntityModalProps) {
    const { isLaptop } = useScreen();
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={size}
            zIndex={Z_INDEX.entityModal}
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
                    height: isLaptop ? 'auto' : '100%',
                    overflow: 'hidden',
                }
            }}
        >
            {children}
        </Modal>
    );
}
