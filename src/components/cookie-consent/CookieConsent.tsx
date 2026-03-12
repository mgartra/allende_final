// /app/components/cookie-consent/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Link,
    IconButton,
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CookieIcon from '@mui/icons-material/Cookie';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
    const [open, setOpen] = useState(false);
    const [animation, setAnimation] = useState(false);

    useEffect(() => {
        // Verificar si ya existe consentimiento en localStorage
        const consent = localStorage.getItem('cookieConsent');

        if (!consent) {
            // Mostrar banner después de 2 segundos (mejor UX)
            const timer = setTimeout(() => {
                setOpen(true);
                setAnimation(true);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setAnimation(false);
        setTimeout(() => setOpen(false), 300);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setAnimation(false);
        setTimeout(() => setOpen(false), 300);
    };

    const handleClose = () => {
        // Si cierran sin elegir, asumimos "rejected" por GDPR
        localStorage.setItem('cookieConsent', 'rejected');
        setAnimation(false);
        setTimeout(() => setOpen(false), 300);
    };

    if (!open) return null;

    return (
        <Fade in={animation} timeout={300}>
            <Box className={styles.banner} role="alertdialog" aria-labelledby="cookie-consent-title">
                <IconButton
                    onClick={handleClose}
                    className={styles.closeButton}
                    aria-label="Cerrar aviso de cookies"
                >
                    <CloseIcon sx={{ color: 'white' }} />
                </IconButton>

                <Box className={styles.content}>
                    <Typography
                        id="cookie-consent-title"
                        variant="h6"
                        className={styles.title}
                    >
                        <CookieIcon fontSize='medium' /> Política de Cookies
                    </Typography>

                    <Typography variant="body2" className={styles.message}>
                        Utilizamos cookies para mejorar tu experiencia en nuestra biblioteca digital.
                        Algunas son esenciales para el funcionamiento del sitio, mientras que otras
                        nos ayudan a entender cómo interactúas con nosotros.

                    </Typography>
                    <Link
                        href="/legal/privacy"
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver detalles en nuestra Política de Privacidad
                    </Link>

                    <Box className={styles.actions}>
                       
                        <Button
                            onClick={handleAccept}
                            variant="contained"
                            className={styles.acceptButton}
                            aria-label="Aceptar todas las cookies"
                        >
                            Aceptar todas
                        </Button>
                         <Button
                            onClick={handleReject}
                            variant="outlined"
                            className={styles.rejectButton}
                            aria-label="Rechazar cookies no esenciales"
                        >
                            Rechazar
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
}