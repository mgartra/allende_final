// app/admin/events/editE/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth'; 
import { cookies } from 'next/headers';
import { getEventById } from '@/lib/data/events'; 
import { getAllLibrarians } from '@/lib/data/users'; 
import EditEventForm from './EditEventForm';
import Link from 'next/link';
import { Grid, Typography } from '@mui/material';
import styles from './EditEventPage.module.css'; 


export default async function EditEventPage({
    searchParams
}: {
    searchParams: Promise<{ id?: string }>
}) {
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

    if (!id || !/^\d+$/.test(id)) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>ID de libro inválido</Typography>
                <Typography variant='body1'>El ID debe ser un número entero positivo.</Typography>
                <Link href="/admin/events" className={styles.backLink}>
                    <Typography variant='caption'>
                        Volver a la lista
                    </Typography>
                </Link>
            </div>
        );
    }

    
    const eventId = parseInt(id, 10);

    if (eventId <= 0 || !Number.isInteger(eventId)) {
        return (
            <div className={styles.notFound}>
                <Typography variant='h2'>ID de libro inválido</Typography>
                <Typography variant='body1'>El ID debe ser un número entero positivo.</Typography>
                <Link href="/admin/events" className={styles.backLink}>
                    <Typography variant='caption'> Volver a la lista</Typography>

                </Link>
            </div>
        );

    }

   
    const event = await getEventById(eventId);

    if (!event) {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2' color="error">Evento no encontrado</Typography>
                <Typography variant='body1' sx={{ mt: 2 }}>
                    No existe un evento con el ID {eventId}.
                </Typography>
                <Link href="/admin/events" className={styles.backLink}>
                    <Typography variant='caption'> Volver a la lista</Typography>

                </Link>
            </div>
        );
    }

   
    if (isLibrarian && event.user_id !== user.id) {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2' color="error">Acción no permitida</Typography>
                <Typography variant='body1' sx={{ mt: 2 }}>
                    Solo puedes editar eventos que tú mismo has creado.
                </Typography>
                <Link href="/admin/events" className={styles.backHome} style={{ display: 'inline-block', marginTop: '16px' }}>
                    <Typography variant='body1' sx={{ color: '#6D1E3A', fontWeight: 'bold' }}>
                     Volver a eventos
                    </Typography>
                </Link>
            </div>
        );
    }

    
    const librarians = isRoot ? await getAllLibrarians() : [];

   
    const eventData = {
        event_id: event.event_id,
        name: event.name,
        description: event.description || '',
        image: event.image || 'default-event.jpg',
        event_date: event.event_date.toISOString().slice(0, 16), // Formato para datetime-local
        capacity: event.capacity.toString(),
        participants: event.participants,
        cancelations: event.cancelations,
        user_id: event.user_id.toString(),
        organizer_name: event.user ? `${event.user.name} ${event.user.last_name}` : 'Desconocido',
    };

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{ xs: 11, md: 10 }}>
                <header className={styles.header}>
                    <Link href="/admin/events" className={styles.backLink}>
                        <Typography variant='caption'>
                            Volver a la lista
                        </Typography>
                    </Link>
                    <Typography variant='h3' className={styles.title}>
                        Editar: {event.name}
                    </Typography>
                </header>

                <div className={styles.content}>
                    <EditEventForm
                        event={eventData}
                        librarians={librarians}
                        isRoot={isRoot}
                        isLibrarian={isLibrarian}
                    />
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
        </Grid>
    );
}