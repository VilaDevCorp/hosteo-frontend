import { Image, ImageProps } from '@mantine/core';

export function EntityImage({
    src,
    placeholder,
    alt,
    ...imageProps
}: {
    src?: string | null;
    placeholder: string;
    alt: string;
} & Omit<ImageProps, 'src' | 'alt'>) {
    return (
        <Image
            {...imageProps}
            src={src || placeholder}
            fallbackSrc={placeholder}
            alt={alt}
        />
    );
}
