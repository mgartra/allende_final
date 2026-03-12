// src/app/components/homepage/Hero.tsx
'use client';

import { Grid,Button, Box, Typography } from '@mui/material';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function HeroSection() {
    return (
        <Box className={styles.hero}>
            <Grid
                container
                className={styles.gridContainer}
                spacing={2}
            >
                {/* Columna izquierda: Contenido principal */}
                <Grid
                    size={{ xs: 12, md: 6, lg: 6 }}
                    className={styles.contentColumn}
                >
                    <Typography variant='h1' className={styles.title}>
                        Bienvenido a{' '}
                        <span className={styles.highlight}><Typography variant='h1'>El Rincón de Allende</Typography></span>
                    </Typography>

                    <Typography variant='subtitle2' className={styles.subtitle}>
                        Un espacio donde las historias cobran vida
                    </Typography>

                </Grid>

                <Grid
                    size={{ xs: 12, md: 6, lg: 6 }} className={styles.contentColumnB}>
                    <Box className={styles.buttonContainer}>
                        <Link href="/category" className={styles.link}>
                            <Button
                                className={styles.primaryBtn}
                                variant="contained"
                                aria-label="Explora nuestro catálogo de libros"
                            >
                                Explorar catálogo
                            </Button>
                        </Link>

                        <Link href="/events" className={styles.link}>
                            <Button
                                variant="outlined"
                                className={styles.secondaryBtn}
                                aria-label="Ver próximos eventos"
                            >
                                Próximos eventos
                            </Button>
                        </Link>
                    </Box>
                </Grid>
            </Grid>

            {/* Fondo decorativo */}
            <Box className={styles.backgroundOverlay} />
        </Box>
    );
}