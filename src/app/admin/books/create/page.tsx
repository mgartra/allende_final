// app/admin/books/create/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth';
import { getAllAuthors } from '@/lib/data/authors';
import { getAllCategories } from '@/lib/data/categories';
import { cookies } from 'next/headers';
import Link from 'next/link';
import CreateBookForm from './CreateBookForm';
import styles from './CreateBookPage.module.css';
import { Grid, Typography } from '@mui/material';

export default async function CreateBookPage() {
    const cookieStore = await cookies();
    const user = await getUserFromCookies(cookieStore);
     const isRoot = user?.type === 'root';
    const isLibrarian = user?.type === 'user' && user.userType === 'librarian';

    if (!user || (!isRoot && !isLibrarian))  {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2'>No autorizado</Typography>
                <Typography variant='body1'>Solo el administrador o el personal de la biblioteca puede acceder a esta sección.</Typography>

            </div>
        );
    }

    const authors = await getAllAuthors();
    const categories = await getAllCategories();

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{ xs: 11, md: 10 }}>
                <header className={styles.header}>
                    <Link href="/admin/books" className={styles.backLink}>
                        <Typography variant='caption'>
                            Volver a la lista
                        </Typography>
                    </Link>
                    <Typography variant='h3'>Crear Nuevo Libro</Typography>

                </header>

                <div className={styles.content}>
                    <CreateBookForm authors={authors} categories={categories} />
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
        </Grid>
    );
}