import { Grid, Typography } from '@mui/material';
import BookCard from '@/components/cards/BookCard';
import { getFeaturedBooks } from '@/lib/data/books';
import styles from './FeatureBooks.module.css';
import SectionTitle from '@/components/sectionTitle/SectionTitle';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Link from 'next/link';

export default async function FeatureBooks() {
    const books = await getFeaturedBooks(4);

    if (books.length === 0) return null;

    return (
        <section className={styles.featuredBooks}>
            <Grid container spacing={2} className={styles.container}>
                {/* Columna izquierda de espaciado */}
                <Grid size={{ xs: 1 }} ></Grid>

                {/* Contenido principal */}
                <Grid size={{ xs: 10 }}>
                    <SectionTitle
                        icon="01"
                        iconSize={80}
                        title="Libros recomendados"
                        subtitle="Explora nuestra selección"
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