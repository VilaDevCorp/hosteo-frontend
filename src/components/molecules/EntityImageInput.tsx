import { Button, FileButton, Group, Stack, Text } from '@mantine/core';
import { IconPhotoPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { EntityImageController } from '../../hooks/useEntityImage';
import {
    ACCEPTED_IMAGE_ACCEPT_ATTR,
    IMAGE_HINT,
    validateImageFile
} from '../../utils/imageUtils';
import { Img } from '../atoms/Img';

export function EntityImageInput({
    image,
    placeholderSrc,
    alt,
    label = 'Image',
    disabled
}: {
    image: EntityImageController;
    placeholderSrc: string;
    alt: string;
    label?: string;
    disabled?: boolean;
}) {
    const [error, setError] = useState<string | undefined>(undefined);

    const onFileSelected = (file: File | null) => {
        if (!file) {
            return;
        }
        const validationError = validateImageFile(file);
        setError(validationError);
        if (!validationError) {
            image.selectFile(file);
        }
    };

    const onRemove = () => {
        setError(undefined);
        image.remove();
    };

    return (
        <Stack gap={'0.5rem'}>
            <Text size="sm" fw={500}>
                {label}
            </Text>
            <Group align="flex-start" gap={'1rem'} wrap="nowrap">
                <Img
                    src={image.previewSrc}
                    placeholder={placeholderSrc}
                    alt={alt}
                    
                    
                    w={'10rem'}
                    h={'7.5rem'}
                    
                    fit="cover"
                    radius="md"
                />
                <Stack gap={'0.5rem'} align="flex-start">
                    <FileButton
                        onChange={onFileSelected}
                        accept={ACCEPTED_IMAGE_ACCEPT_ATTR}
                        disabled={disabled}
                    >
                        {(props) => (
                            <Button
                                {...props}
                                size="xs"
                                variant="outline"
                                leftSection={<IconPhotoPlus size={'1rem'} />}
                            >
                                {image.previewSrc
                                    ? 'Change image'
                                    : 'Add image'}
                            </Button>
                        )}
                    </FileButton>
                    {image.previewSrc && (
                        <Button
                            size="xs"
                            variant="transparent"
                            color="error"
                            leftSection={<IconTrash size={'1rem'} />}
                            onClick={onRemove}
                            disabled={disabled}
                        >
                            Remove image
                        </Button>
                    )}
                    <Text size="xs" c="dimmed">
                        {IMAGE_HINT}
                    </Text>
                    {error && (
                        <Text size="xs" c="error">
                            {error}
                        </Text>
                    )}
                </Stack>
            </Group>
        </Stack>
    );
}
