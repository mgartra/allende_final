// app/admin/books/edit/page.tsx
import { getBookById } from '@/lib/data/books';
import { getAllAuthors } from '@/lib/data/authors';
import { getAllCategories } from '@/lib/data/categories';
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import EditBookForm from './EditBookForm';
import styles from './EditBookPage.module.css';
import { Grid, Typography } from '@mui/material';

export default async function EditBookPage({
    searchParams
}: {
    searchParams: Promise<{ id?: string }>
}) {
    // Await para obtener los parámetros
    const params = await searchParams;
    const id = params.id;

    const cookieStore = await cookies();
    const user = await getUserFromCookies(cookieStore);
     const isRoot = user?.type === 'root';
    const isLibrarian = user?.type === 'user' && user.userType === 'librarian';

    if (!user || (!isRoot && !isLibrarian)) {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2'>No autorizado</Typography>
                <Typography variant='body1'>Solo el administrador o el personal de la biblioteca puede acceder a esta sección.</Typography>

            </div>
        );
    }

    //  Validación robusta
    if (!id || !/^\d+$/.test(id)) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>ID de libro inválido</Typography>
                <Typography variant='body1'>El ID debe ser un número entero positivo.</Typography>
                <Link href="/admin/books" className={styles.backLink}>
                    <Typography variant='caption'>
                        Volver a la lista
                    </Typography>
                </Link>
            </div>
        );
    }

    const bookId = parseInt(id, 10);

    if (bookId <= 0 || !Number.isInteger(bookId)) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>ID de libro inválido</Typography>
                <Typography variant='body1'>El ID debe ser un número entero positivo.</Typography>
                <Link href="/admin/books" className={styles.backLink}>
                    <Typography variant='caption'> Volver a la lista</Typography>

                </Link>
            </div>
        );
    }

    const book = await getBookById(bookId);
    const allAuthors = await getAllAuthors();
    const allCategories = await getAllCategories();

    if (!book) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>Libro no encontrado</Typography>
                <Typography variant='body1'>El libro con ID {bookId} no existe en la base de datos.</Typography>
                <Link href="/admin/books" className={styles.backLink}>
                    <Typography variant='caption'> Volver a la lista</Typography>

                </Link>
            </div>
        );
    }

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{xs:11, md:10}}>

                <header className={styles.header}>
                    <Link href="/admin/books" className={styles.backLink}>
                        <Typography variant='caption'> Volver a la lista</Typography>

                    </Link>
                    <Typography variant='h3'>Editar Libro: {book.title}</Typography>

                </header>

                <div className={styles.content}>
                    <EditBookForm book={book} authors={allAuthors} categories={allCategories} />
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>

        </Grid>
    );
}