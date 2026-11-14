import { Image, ImageProps } from '@mantine/core';

export function Img({
    src,
    placeholder,
    alt,
    ...imageProps
}: {
    src?: string | null;
    placeholder: string;
    alt: string;
} & Omit<ImageProps, 'src' | 'alt' | 'fallbackSrc'>) {
    return (
        <Image
            {...imageProps}
            src={src || placeholder}
            fallbackSrc={placeholder}
            alt={alt}
        />
    );
}
