import { Button, Modal } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useError } from '../../hooks/useError';
import { ModalButtons } from '../molecules/ModalButtons';
import { useAuth } from '../../hooks/useAuth';
import { useEntityImage } from '../../hooks/useEntityImage';
import { EntityImageInput } from '../molecules/EntityImageInput';
import { showNotificationSuccess } from '../../utils/notifUtils';

interface ImportModalProps {
    opened: boolean;
    onClose: () => void;
}

export function ProfileModal({ opened, onClose }: ImportModalProps) {
    const { handleError } = useError();

    const { user } = useAuth();

    const { updateImage } = useApi();

    const image = useEntityImage(user?.imageUrl);

    const queryClient = useQueryClient();

    const applyImageChanges = async () => {
        if (!image.dirty) {
            return;
        }
        await updateImage('self', image.file);
    };

    const { mutate: updateProfileMutation, isPending: isUpdating } =
        useMutation({
            mutationFn: applyImageChanges,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['getUserInfo'] });
                showNotificationSuccess('Profile updated');
                onClose();
            },
            onError: handleError
        });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit profile"
            closeOnEscape={false}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}
            >
                <EntityImageInput
                    image={image}
                    placeholderSrc="/user_placeholder.svg"
                    alt="User picture"
                    disabled={isUpdating}
                />
                <ModalButtons>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        type="submit"
                        onClick={() => {
                            updateProfileMutation();
                        }}
                        loading={isUpdating}
                    >
                        Save
                    </Button>
                </ModalButtons>
            </div>
        </Modal>
    );
}
