import { useCallback, useEffect, useState } from 'react';

export interface EntityImageController {
    file: File | null;
    removed: boolean;
    previewSrc?: string;
    dirty: boolean;
    selectFile: (file: File) => void;
    remove: () => void;
    reset: () => void;
}

/**
 * Tracks the pending changes of an entity image (new file or removal) without
 * touching the API, so the form can apply them on submit.
 */
export const useEntityImage = (
    currentUrl?: string | null
): EntityImageController => {
    const [file, setFile] = useState<File | null>(null);
    const [removed, setRemoved] = useState(false);
    const [localUrl, setLocalUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!file) {
            setLocalUrl(undefined);
            return;
        }
        const url = URL.createObjectURL(file);
        setLocalUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const selectFile = useCallback((selected: File) => {
        setFile(selected);
        setRemoved(false);
    }, []);

    const remove = useCallback(() => {
        setFile(null);
        setRemoved(true);
    }, []);

    const reset = useCallback(() => {
        setFile(null);
        setRemoved(false);
    }, []);

    return {
        file,
        removed,
        previewSrc: removed ? undefined : localUrl ?? currentUrl ?? undefined,
        dirty: !!file || removed,
        selectFile,
        remove,
        reset
    };
};
