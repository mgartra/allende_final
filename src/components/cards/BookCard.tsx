// /app/components/cards/BookCard.tsx
'use client';

import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { Author, Category } from '@/types';
import Link from 'next/link';
import styles from './BookCard.module.css';

interface BookCardProps {
    book_id: number;
    title: string;
    image: string | null;
    reference: number;
    authors: Author[];
    categories: Category[];
    publication_year: number | null;
}

export default function BookCard({
    book_id,
    title,
    image,
    reference,
    authors,
    categories,
    publication_year
}: BookCardProps) {

    const authorName = authors.map(author => `${author.name} ${author.last_name}`).join(', ');
    const categoryNames = categories.map(category => category.name).join(', ');


    const currentYear = new Date().getFullYear();
    const isRecent = publication_year &&
        (publication_year === currentYear ||
            publication_year === currentYear - 1);

    let badgeType: 'top' | 'new' | null = null;
    let badgeText = '';


    if (isRecent) {
        badgeType = 'new';
        badgeText = 'NEW';
    } else if (reference === 5) {
        badgeType = 'top';
        badgeText = 'TOP';
    }
    /*     if (reference === 5) {
           badgeType = 'top';
           badgeText = 'TOP';
       } else if (isRecent) {
           badgeType = 'new';
           badgeText = 'NEW';
       } */

    return (
        <Card className={styles.bookCard}>
            {/* Contenedor relativo para el marcador */}
            <div className={styles.imageContainer}>

                {badgeType && (
                    <div className={`${styles.marcapaginas} ${styles[badgeType]}`}>
                        <span className={styles.badgeText}>{badgeText}</span>
                    </div>
                )}
                <Link href={`/books/${book_id}`} passHref style={{ textDecoration: 'none' }}>
                    <CardMedia
                        component="img"
                        image={image ? `/images/books/${image}` : '/images/books/default-book.jpg'}
                        alt={title}
                        className={styles.bookImage}
                    /></Link>
            </div>

            <CardContent className={styles.bookContent}>
                <div  className={styles.bookTitle}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        minHeight: '3rem',
                        fontFamily: '"Lora", serif',
                        color: 'primary.main'
                    }}
                >
                    {title}
                </Typography>
                </div>
                <div className={styles.bookAuthor}>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.primary',
                        marginBottom: '0.5rem',
                        fontFamily: '"Inter", sans-serif'
                    }}
                >
                    {authorName}
                </Typography>
                </div>
                <div className={styles.bookCategory}>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'info.main',
                        marginBottom: '1rem',
                        fontFamily: '"Inter", sans-serif',
                        display: 'block',
                    }}
                >
                    {categoryNames}
                </Typography>
                </div>
                <div className={styles.bookReference}>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'primary.main',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        fontFamily: '"Inter", sans-serif'
                    }}
                >
                    ⭐ {reference}/5
                </Typography>
                </div>

                <Link href={`/books/${book_id}`} passHref style={{ textDecoration: 'none' }}>
                    <Button
                        variant="contained"
                        size="small"
                        className={styles.viewButton}
                        sx={{
                            borderColor: 'primary.main',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            width: '100%',
                            fontFamily: '"Inter", sans-serif'
                        }}
                    >
                        Ver detalles
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}