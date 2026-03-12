import React from 'react';
import Image from 'next/image';
import styles from './SectionTitle.module.css';

interface SectionTitleProps {
    icon: string;
    iconSize?: number;
    title?: string;
    subtitle?: string;
    onImage?: boolean; // opcional, no obligatorio
}

export default function SectionTitle({
    icon = '',
    iconSize = 50,
    title,
    subtitle,
    onImage = false,
}: SectionTitleProps) {
    return (
        <div className={`${styles['section-title']} ${onImage ? styles['section-title--on-image'] : ''}`}>
            <Image
                src={`/icons/${icon}.svg`}
                alt={title || 'Icon'}
                width={iconSize}
                height={iconSize}
                className={styles.icon}
            />
            <div className={styles.contain}>
                {title && <h2>{title}</h2>}
                {subtitle && <p>{subtitle}</p>}
            </div>
        </div>
    );
}