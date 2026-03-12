import { Grid, Typography } from '@mui/material';
import BookCard from '@/components/cards/BookCard';
import { getLatestBooks } from '@/lib/data/books';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SectionTitle from '@/components/sectionTitle/SectionTitle';
import styles from './LatestBooks.module.css';
import Link from 'next/link';

export default async function LatestBook() {
    const books = await getLatestBooks(4);

    if (books.length === 0) return null;

    return (
        <section className={styles.latestBook}>
            <Grid container spacing={2} className={styles.container}>
                {/* Columna izquierda de espaciado */}
                <Grid size={{ xs: 1 }} ></Grid>

                {/* Contenido principal */}
                <Grid size={{ xs: 10 }}>
                    <SectionTitle
                        icon="01"
                        iconSize={80}
                        title="Últimas publicaciones"
                        subtitle="Explora nuestros recién llegados"
                    />

                    {/* Cuadrícula de libros */}
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {books.map((book) => (
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 4,
                                    lg: 3
                                }}
                                key={book.book_id}

                            >
                                <BookCard {...book} />
                            </Grid>
                        ))}
                    </Grid>
                    <div className={styles.linkCategories}>
                        <Link href='/category'>
                            <Typography variant='caption'>
                                Ver todas las categorías
                            </Typography></Link>
                        <KeyboardArrowRightIcon fontSize='medium' />
                    </div>
                </Grid>

                {/* Columna derecha de espaciado */}
                <Grid size={{ xs: 1 }}></Grid>
            </Grid>
        </section>
    );
}