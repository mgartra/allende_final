'use client';

import ContactForm from '../../components/contactForm/ContactForm';
import styles from './ContactPage.module.css';
import Image from 'next/image';
import {
    LocationOn,
    Phone,
    Email,
    AccessTime,
    ArrowDownward
} from '@mui/icons-material';
import { Container, Grid, Typography, Box, Divider } from '@mui/material';

export default function ContactPage() {
    return (
        <main className={styles.mainWrapper}>
            {/* Hero Section Elegante */}
            <header className={styles.hero}>
                 <Divider sx={{ my: 2, borderColor: 'divider'}}><Typography variant='h2' className={styles.mainTitle}>
                    ¡Hola!, ¿Hablamos?</Typography></Divider>

                <Typography variant='subtitle1' className={styles.heroDescription}>
                    ¿Tienes una propuesta cultural o alguna duda sobre nuestros préstamos?
                </Typography>
                {/* <Typography variant='body2'> El equipo de <strong>El Rincón de Allende</strong> te responderá en menos de 24 horas.</Typography> */}

            </header>
 
            <Grid container>
                <Grid size={{ xs: 0.5, md: 1, lg:2 }}></Grid>
                <Grid size={{ xs: 11, md: 10, lg:8 }}>
                <Grid container spacing={8} className={styles.contentGrid}>
                    {/* Columna de Información */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <div className={styles.stickyInfo}>
                            <Typography variant="h3" className={styles.sectionTitle}>
                                Datos de contacto
                            </Typography>

                            <div className={styles.infoList}>
                                <div className={styles.infoItem}>
                                    <div className={styles.iconCircle}><LocationOn /></div>
                                    <div className={styles.infoText}>
                                        <Typography variant="h6">Dirección</Typography>
                                        <p>Calle Principal 123, CP 28001<br />Allende, España</p>
                                    </div>
                                </div>

                                <div className={styles.infoItem}>
                                    <div className={styles.iconCircle}><Phone /></div>
                                    <div className={styles.infoText}>
                                        <Typography variant="h6">Teléfono</Typography>
                                        <p>+34 666 777 888</p>
                                    </div>
                                </div>

                                <div className={styles.infoItem}>
                                    <div className={styles.iconCircle}><Email /></div>
                                    <div className={styles.infoText}>
                                        <Typography variant="h6">Email</Typography>
                                        <p>info@allendelibrary.com</p>
                                    </div>
                                </div>

                                <div className={styles.infoItem}>
                                    <div className={styles.iconCircle}><AccessTime /></div>
                                    <div className={styles.infoText}>
                                        <Typography variant="h6">Horario de atención</Typography>
                                        <p>Lun - Vie: 9:00 - 20:00<br />Sábados: 10:00 - 14:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid>

                    {/* Columna del Formulario */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <div className={styles.formCard}>
                            <Typography variant="overline" className={styles.label}>
                                Estamos aquí para ayudarte
                            </Typography>
                            <Typography variant="h4" gutterBottom fontWeight="700">
                                Envíanos un mensaje
                            </Typography>


                            <ContactForm />
                        </div>
                    </Grid>
                </Grid>
                </Grid>
                <Grid size={{ xs: 0.5, md: 1, lg:2 }}></Grid>
            </Grid>

            {/* Mapa Integrado con Estilo */}
            <section className={styles.mapContainer}>
                <div className={styles.mapOverlay}>
                    <Typography variant="h5">¿Cómo llegar?</Typography>
                </div>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.643809051!2d-3.70379!3d40.4167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDI1JzAwLjAiTiAzwrA0MicyMS43Ilc!5e0!3m2!1ses!2ses!4v1620000000000"
                    width="100%"
                    height="450"
                    style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                    allowFullScreen
                    loading="lazy"
                />
            </section>
        </main>
    );
}