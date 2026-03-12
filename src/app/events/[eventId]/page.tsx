import { notFound } from 'next/navigation';
import { getEventById, getUserReservationForEvent } from '@/lib/data/events';
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import EventActions from '@/components/eventItem/EventActions';
import Image from 'next/image';
import Link from 'next/link';
import {
    CalendarToday,
    AccessTime,
    LocationOn,
    Groups,
    ArrowBackIosNew,
    Person
} from '@mui/icons-material';
import { Container, Grid, Typography, Box, Chip, LinearProgress } from '@mui/material';
import styles from './EventDetailPage.module.css';

interface EventPageProps {
    params: Promise<{ eventId: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
    const { eventId } = await params;
    const eventIdNumber = parseInt(eventId, 10);

    if (isNaN(eventIdNumber)) notFound();

    const cookieStore = await cookies();
    const user = await getUserFromCookies(cookieStore);
    const event = await getEventById(eventIdNumber);

    if (!event) notFound();

    const availableSpots = event.capacity - event.participants;
    const isFull = availableSpots <= 0;
    const occupancy = event.capacity > 0 ? Math.round((event.participants / event.capacity) * 100) : 0;

    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const userReservation = user?.type === 'user' ? await getUserReservationForEvent(user.id, eventIdNumber) : null;

    return (
        <main className={styles.pageWrapper}>
            {/* Header / Hero Section */}
            <div className={styles.heroSection}>
                <Image
                    src={event.image ? `/images/events/${event.image}` : '/images/events/default-event.jpg'}
                    alt={event.name}
                    fill
                    className={styles.backgroundImage}
                    priority
                />
                <div className={styles.overlay}></div>

                <Container maxWidth="lg" className={styles.heroContainer}>
                    <Link href="/events" className={styles.backLink}>
                        <Typography variant='body2'>
                            <ArrowBackIosNew /> Volver a la agenda
                        </Typography>
                    </Link>

                    <div className={styles.heroContent}>
                        <div className={styles.badgeRow}>
                            {isFull ?
                                <Chip label="COMPLETO" color="error" className={styles.chip} /> :
                                <Chip
                                    label={`${availableSpots} plaza${availableSpots === 1 ? '' : 's'}`}
                                    color="success" className={styles.chip} />
                            }
                            {eventDate.toDateString() === new Date().toDateString() &&
                                <Chip label="¡HOY!" color="secondary" className={styles.chip} />
                            }
                        </div>
                        <Typography variant='h2' className={styles.title}>{event.name}</Typography>
                        <div className={styles.quickMeta}>
                            <span><Typography variant='body2'><CalendarToday /> {formattedDate}</Typography></span>
                            <span><Typography variant='body2'><AccessTime /> {formattedTime} h</Typography></span>
                        </div>
                    </div>
                </Container>
            </div>

            <Container maxWidth="lg" className={styles.mainContent}>
                <Grid container spacing={6}>
                    {/* Columna Izquierda: Descripción e Info */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <section className={styles.infoSection}>
                            <Typography variant="h3" className={styles.sectionTitle}>
                                Acerca del evento
                            </Typography>
                            <Typography variant='body2' className={styles.descriptionText}>
                                {event.description || 'Únete a nosotros para una velada cultural única en el corazón de Allende. Este evento forma parte de nuestra iniciativa para fomentar la lectura y el intercambio de ideas.'}
                            </Typography>

                            <div className={styles.detailsGrid}>
                                <div className={styles.detailCard}>
                                    <LocationOn className={styles.detailIcon} />
                                    <div>
                                        <Typography variant="subtitle2">Ubicación</Typography>
                                        <Typography variant="body2">Sala Principal - Biblioteca El Rincón</Typography>
                                    </div>
                                </div>
                                <div className={styles.detailCard}>
                                    <Person className={styles.detailIcon} />
                                    <div>
                                        <Typography variant="subtitle2">Organizador</Typography>
                                        <Typography variant="body2">
                                            {event.user
                                                ? `${event.user.name} ${event.user.last_name}`
                                                : 'Biblioteca Municipal'}
                                        </Typography>
                                    </div>
                                </div>
                                <div className={styles.detailCard}>
                                    <Groups className={styles.detailIcon} />
                                    <div>
                                        <Typography variant="subtitle2">Público</Typography>
                                        <Typography variant="body2">Todos los públicos</Typography>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Grid>

                    {/* Columna Derecha: Reserva y Estado */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <aside className={styles.sidebarSticky}>
                            <div className={styles.reservationCard}>
                                <Typography variant="h6" gutterBottom>Estado de inscripción</Typography>

                                <div className={styles.progressBox}>
                                    <div className={styles.progressLabels}>
                                        <span><Typography variant='body2'>{occupancy}% ocupado</Typography></span>
                                        <span><Typography variant='body2'>{event.participants}/{event.capacity}</Typography></span>
                                    </div>
                                    <LinearProgress
                                        variant="determinate"
                                        value={occupancy}
                                        className={styles.progressBar}
                                        color={occupancy > 85 ? "error" : "primary"}
                                    />
                                    <Typography variant='caption' className={styles.progressHint}>
                                        {isFull ? 'Lo sentimos, ya no quedan plazas.' : 'Te recomendamos reservar con antelación.'}
                                    </Typography>
                                </div>

                                <div className={styles.actionWrapper}>
                                    <EventActions
                                        eventId={event.event_id}
                                        isLoggedIn={!!user}
                                        userReservation={userReservation}
                                        showDetailsButton={false}
                                    />
                                </div>

                                <Typography variant='caption' className={styles.cancelPolicy}>
                                    * Puedes cancelar tu plaza hasta 24h antes del evento desde tu panel de usuario.
                                </Typography>
                            </div>
                        </aside>
                    </Grid>
                </Grid>
            </Container>
        </main>
    );
}