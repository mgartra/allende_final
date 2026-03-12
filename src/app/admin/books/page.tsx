// app/admin/books/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth'; 
import { cookies } from 'next/headers';
import { getAllBooks } from '@/lib/data/books';
import Link from 'next/link';
import { Grid, Typography } from '@mui/material';
import BooksTable from '@/components/adminComponents/BookTable'; 
import styles from '../users/UsersPage.module.css';

// Interfaces tipadas
interface Author {
    author_id: number;
    name: string;
    last_name: string;
    nationality: string | null;
}

interface Book {
    book_id: number;
    title: string;
    isbn: string | null;
    total_copies: number;
    available_copies: number;
    authors: Author[];
}

// Interfaz para mostrar en la tabla (con copias)
interface BookDisplay {
    book_id: number;
    title: string;
    author: string;
    isbn: string;
    total_copies: number;
    available_copies: number;
}

export default async function BooksPage() {
    const cookieStore = await cookies(); 
    const user = await getUserFromCookies(cookieStore);
    const isRoot = user?.type === 'root';
    const isLibrarian = user?.type === 'user' && user.userType === 'librarian';

    if (!user || (!isRoot && !isLibrarian)) {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2'>No autorizado</Typography>
                <Typography variant='body1'>
                    Solo el administrador o el personal de la biblioteca puede acceder a esta sección.
                </Typography>
            </div>
        );
    }

    // Obtener libros con TODOS los campos necesarios
    const books = await getAllBooks();

    // Preprocesar datos en el servidor (sin funciones en props)
    const booksDisplay: BookDisplay[] = books.map(book => ({
        book_id: book.book_id,
        title: book.title,
        author: book.authors?.map(a => `${a.name} ${a.last_name}`).join(', ') || '—',
        isbn: book.isbn || '—',
        total_copies: book.total_copies,
        available_copies: book.available_copies,
    }));

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{ xs: 11, md: 10 }}>
                <header className={styles.header}>
                    <Typography variant='h2'>Gestión de libros</Typography>
                    <div className={styles.headerActions}>
                        <Link href="/admin/books/create" className={styles.createButton}>
                            <Typography variant='body2'>+ Crear nuevo libro</Typography>
                        </Link>
                    </div>
                </header>

                <div className={styles.content}>
                    <BooksTable
                        books={booksDisplay}
                    />
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
        </Grid>
    );
}