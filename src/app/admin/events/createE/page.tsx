// app/admin/events/createE/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getAllLibrarians } from '@/lib/data/users';
import CreateEventForm from './CreateEventForm';
import styles from './CreateEventPage.module.css';
import { Grid, Typography } from '@mui/material';

export default async function CreateEventPage() {
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

    //  Obtener librarians (solo para root; librarians usan su propio ID)
    const librarians = isRoot ? await getAllLibrarians() : [];

    //  Si es librarian, preseleccionar su propio ID
    const defaultLibrarianId = isLibrarian ? user.id : undefined;

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{ xs: 11, md: 10 }}>
                <header className={styles.header}>
                    <Link href="/admin/events" className={styles.backLink}>
                        <Typography variant='caption'>
                            Volver a la lista de eventos
                        </Typography>
                    </Link>
                    <Typography variant='h3' className={styles.title}>
                        Crear Nuevo Evento 
                    </Typography>
                </header>

                <div className={styles.content}>
                    <CreateEventForm
                        librarians={librarians}
                        defaultUserId={defaultLibrarianId}
                        isLibrarian={isLibrarian}
                    />
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
        </Grid>
    );
}