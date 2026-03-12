// src/app/components/topButton/TopButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import styles from './TopButton.module.css';

export default function BackToTopBtn() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 100);
        };

        //  passive: true mejora rendimiento en móvil
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const backToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={backToTop}
            className={`${styles.backToTop} ${isVisible ? styles.active : ''}`}
            aria-label="Volver arriba"
            type="button"
        >
            <ArrowUpwardIcon className={styles.icon} />
        </button>
    );
}