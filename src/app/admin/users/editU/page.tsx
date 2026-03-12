// app/admin/users/edit/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getUserById } from '@/lib/data/users';
import EditUserForm from './EditUserForm';
import { Grid, Typography } from '@mui/material';



import styles from './EditUserPage.module.css';

export default async function EditUserPage({
    searchParams
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const params = await searchParams;
    const id = params.id;

    const cookieStore = await cookies();
     const currentUser = await getUserFromCookies(cookieStore);
    const isRoot = currentUser?.type === 'root';
    const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

    if (!currentUser || (!isRoot && !isLibrarian)) {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2'>No autorizado</Typography>
                <Typography variant='body1'>Solo el administrador o el personal de la biblioteca puede acceder a esta sección.</Typography>
            </div>
        );
    }

    if (!id || !/^\d+$/.test(id)) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>ID de usuario inválido</Typography>
                <Link href="/admin/users" className={styles.backLink}>
                    Volver a la lista
                </Link>
            </div>
        );
    }

    const userId = parseInt(id, 10);

    if (userId <= 0 || !Number.isInteger(userId)) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>ID de usuario inválido</Typography>
                <Typography variant='body1'>El ID debe ser un número entero positivo.</Typography>
                <Link href="/admin/users" className={styles.backLink}>
                    <Typography variant='caption'>
                        Volver a la lista
                    </Typography>
                </Link>
            </div>
        );
    }

    const userToEdit = await getUserById(userId);

    if (!userToEdit) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>Usuario no encontrado</Typography>
                <Typography variant='body1'>El usuario con ID {userId} no existe en la base de datos.</Typography>
                <Link href="/admin/users" className={styles.backLink}>
                    <Typography variant='caption'>
                        Volver a la lista
                    </Typography>
                </Link>
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

                    <Typography variant='h3'>Editar Usuario: {userToEdit.name} {userToEdit.last_name}</Typography>


                </header>

                <div className={styles.content}>
                    <EditUserForm user={userToEdit} isRoot={isRoot} />
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>

        </Grid>
    );
}