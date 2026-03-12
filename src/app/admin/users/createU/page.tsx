// app/admin/users/create/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import CreateUserForm from './CreateUserForm';
import styles from './CreateUserPage.module.css';
import { Grid, Typography } from '@mui/material';

export default async function CreateUserPage() {
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

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{ xs: 11, md: 10 }}>
                <header className={styles.header}>

                    <Link href="/admin/users" className={styles.backLink}>
                        <Typography variant='caption'>
                            Volver a la lista
                        </Typography>
                    </Link>   
                    <Typography variant='h3'>Crear Nuevo Usuario</Typography>
                </header>

                <div className={styles.content}>
                    <CreateUserForm isRoot={isRoot}/>
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
        </Grid>
    );
}