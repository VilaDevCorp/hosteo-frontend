export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

export const ACCEPTED_IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(',');

export const IMAGE_HINT = 'PNG or JPEG, up to 5 MB.';

export const validateImageFile = (file: File): string | undefined => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return 'Use a PNG or JPEG image';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return 'File is too large (max 5 MB)';
    }
    return undefined;
};
