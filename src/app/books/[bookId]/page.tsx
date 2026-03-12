// app/books/[bookId]/page.tsx
import { notFound } from 'next/navigation';
import { getBookById } from '@/lib/data/books';
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import styles from './BookDetail.module.css';
import DetailsBook from '@/components/details/DetailsBook';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Button } from '@mui/material';

interface BookDetailPageProps {
    params: Promise<{ bookId: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
    const { bookId } = await params;
    const bookIdNum = parseInt(bookId);

    // Validando que el ID sea un número válido
    if (isNaN(bookIdNum)) {
        notFound();
    }

    // Obteniendo el libro
    const book = await getBookById(bookIdNum);

    if (!book) {
        notFound();
    }

    // Obteniendo información del usuario (para verificar si puede prestar)
    const cookieStore = await cookies();
    const user = await getUserFromCookies(cookieStore);

    return (
        <div className={styles.container}>
        {book.categories && book.categories.length > 0 && (
                <Link 
                    href={`/category/${book.categories[0].category_id}`} 
                    className={styles.backButton}
                >
                    <Button variant='outlined'><ChevronLeftIcon/>Volver a {book.categories[0].name}</Button>
                </Link>
            )}


            <div className={styles.content}>
                <DetailsBook book={book} user={user} />
            </div>

            
        </div>
    );
}