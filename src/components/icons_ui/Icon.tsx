import Image from 'next/image';
import React from 'react';

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
}

export default function Icon({
    name = '',
    size = 48,
    color = 'currentColor',
    className = ''
}: IconProps) {
    return (
        <Image
            src={`/icons/${name}.svg`}
            alt={name}
            width={size}
            height={size}
            className={className}
            style={{
                filter: color !== 'currentColor' ? `brightness(0) saturate(100%) invert(${color === '#000' ? '0' : '1'}) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)` : undefined,
                color: color
            }} />
    )
}
