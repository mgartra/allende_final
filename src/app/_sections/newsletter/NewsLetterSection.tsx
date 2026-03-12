// /app/sections/newsletter/NewsletterSection.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import styles from './NewsLetterSection.module.css';
import { Box, Grid, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SectionTitle from '@/components/sectionTitle/SectionTitle';

export default function NewsletterSection() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            toast.error('📧 Email obligatorio', {
                description: 'Por favor, introduce tu dirección de email',
                duration: 4000,
                icon: '✉️',
            });
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            toast.error('📧 Email inválido', {
                description: 'Formato incorrecto (ej: nombre@email.com)',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        setIsLoading(true);

        try {
            const toastId = toast.loading('Enviando suscripción...', {
                description: 'Preparando tu acceso a novedades exclusivas',
            });

            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: trimmedEmail.toLowerCase(),
                    source: 'homepage'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('✅ ¡Gracias por unirte!', {
                    id: toastId,
                    description: 'Recibirás nuestras novedades en tu bandeja de entrada',
                    duration: 5000,
                    icon: '📚',
                });

                setIsSubscribed(true);
                setEmail('');
            } else {
                toast.error(' Error al suscribirse', {
                    id: toastId,
                    description: data.error || 'Intenta nuevamente más tarde',
                    duration: 5000,
                    icon: '✉️',
                });
            }
        } catch (error) {
            toast.error(' Error de conexión', {
                description: 'No se pudo conectar con el servidor. Verifica tu conexión',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al suscribirse:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubscribed) {
        return (
            <section className={styles.successSection} aria-live="polite">
                <div className={styles.successContent}>
                    <Typography variant='h2' className={styles.successTitle}>¡Listo para descubrir nuevas lecturas!</Typography>
                    <Typography variant='body1' className={styles.successMessage}>
                        Hemos enviado un email de confirmación a tu bandeja de entrada.
                        <br />
                        <strong>Revisa también tu carpeta de spam</strong> si no lo encuentras en 5 minutos.
                    </Typography>
                    <button
                        onClick={() => setIsSubscribed(false)}
                        className={styles.backButton}
                        aria-label="Volver al formulario de suscripción"
                    >
                        Suscribir otro email
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.newsletterSection} aria-labelledby="newsletter-title">
            <Grid container spacing={2} className={styles.container}>
                <Grid size={{ xs: 0.5, md: 1 }}></Grid>
                <Grid size={{ xs: 11, md: 10 }} sx={{ position: 'relative' }}>
                    {/* Fondo decorativo */}
                    <Box className={styles.backgroundOverlay}/>
                    <SectionTitle title='Únete a nuestra comunidad de lectores' subtitle='Subscríbete a nuestra newsletter' icon='02' onImage={true}></SectionTitle>
                    <Grid container spacing={2} className={styles.content}>
                        <Grid size={{ xs: 12, md: 6 }}>

                            <div className={styles.badge}>
                                <span className={styles.badgeIcon}>✨</span>
                                <span><Typography variant='caption'>Exclusivo para lectores</Typography></span>
                            </div>

                            <Typography variant='body2' className={styles.subtitle}>
                                Recibe cada semana:
                                <br />
                                <span className={styles.benefit}>•</span> Recomendaciones personalizadas según tus gustos
                                <br />
                                <span className={styles.benefit}>•</span> Novedades editoriales antes que nadie
                                <br />
                                <span className={styles.benefit}>•</span> Invitaciones exclusivas a eventos culturales
                                <br />
                                <span className={styles.benefit}>•</span> Tips para sacar provecho a tus lecturas
                            </Typography>




                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <form onSubmit={handleSubmit} className={styles.form} aria-label="Formulario de suscripción a newsletter">
                                <div className={styles.inputGroup}>
                                    <input
                                        type="email"
                                        id="newsletter-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className={styles.input}
                                        disabled={isLoading}
                                        aria-required="true"
                                        aria-label="Tu dirección de email"
                                    />
                                    <button
                                        type="submit"
                                        className={styles.button}
                                        disabled={isLoading}
                                    ><Typography variant='body2'>
                                            {isLoading ? (
                                                <span className={styles.loadingSpinner}></span>
                                            ) : 'Suscribirse'}</Typography>
                                    </button>
                                </div>

                                <Typography variant='caption' className={styles.privacy}>
                                    <span className={styles.lockIcon}><LockIcon /></span>
                                    Tu email está seguro con nosotros. Nunca compartiremos tu información y podrás darte de baja en cualquier momento con un solo clic.
                                </Typography>
                            </form>

                        </Grid>
                    </Grid>

                </Grid>
                <Grid size={{ xs: 0.5, md: 1 }}></Grid>

            </Grid>
        </section>
    );
}