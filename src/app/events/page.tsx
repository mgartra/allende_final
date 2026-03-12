import { getAllEvents, getUserReservationForEvent } from '@/lib/data/events';
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import EventCard from '@/components/eventItem/EventCard';
import { Container, Grid, Typography, Box, Divider } from '@mui/material';
import { CalendarMonth, AutoAwesome, Celebration } from '@mui/icons-material';
import styles from './EventsPage.module.css';
import Link from 'next/link';

export default async function EventsContent() {
    const cookieStore = await cookies();
    const user = await getUserFromCookies(cookieStore);
    const currentUser = user?.type === 'user' ? user : null;

    const events = await getAllEvents();


    const processedEvents = await Promise.all(
        events.map(async (event) => {
            const reservation = currentUser ? await getUserReservationForEvent(currentUser.id, event.event_id) : null;
            return {
                ...event,
                date: event.event_date,
                availableSpots: event.capacity - event.participants,
                isFull: event.participants >= event.capacity,
                userReservation: reservation
            };
        })
    );

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const todayEvents = processedEvents.filter(e => new Date(e.date).setHours(0, 0, 0, 0) === now.getTime());
    const upcomingEvents = processedEvents.filter(e => new Date(e.date).setHours(0, 0, 0, 0) > now.getTime());


    if (events.length === 0) {
        return (
            <Container maxWidth="md" className={styles.emptyContainer}>
                <CalendarMonth className={styles.emptyIcon} />
                <Typography variant="h4">Nuevas historias se están preparando</Typography>
                <p>Estamos programando los eventos del próximo mes. ¡Vuelve pronto!</p>
            </Container>
        );
    }

    return (
        <main className={styles.mainWrapper}>

            <header className={styles.hero}>
                 <Divider sx={{ my: 2, borderColor: 'divider'}}><Typography variant='h2' className={styles.mainTitle}>
                    Explora nuestros <span className={styles.highlight}>eventos y talleres</span></Typography></Divider>
                <Typography variant='subtitle1' className={styles.heroSubtitle}>
                    Participa en la vida activa de la biblioteca. Encuentros con autores,
                    talleres creativos y clubes de lectura.
                </Typography>

            </header>

            <Grid container className={styles.contentContainer}>
                <Grid size={{ xs: 0.5, md: 1 }}></Grid>
                <Grid size={{ xs: 11, md: 10 }}>



                    {/* SECCIÓN HOY */}
                    {todayEvents.length > 0 && (
                        <section className={styles.sectionGroup}>
                            <div className={styles.sectionHeader}>
                                <Celebration className={styles.sectionIcon} />
                                <Typography variant="h3">Sucediendo Hoy</Typography>
                            </div>
                            <div className={styles.eventsGrid}>
                                {todayEvents.map(event => (
                                    <EventCard key={event.event_id} event={event} currentUser={currentUser} />
                                ))}
                            </div>
                            <Divider sx={{ my: 8, opacity: 0.6 }} />
                        </section>
                    )}

                    {/* SECCIÓN PRÓXIMOS */}
                    {upcomingEvents.length > 0 && (
                        <section className={styles.sectionGroup}>
                            <div className={styles.sectionHeader}>
                                <AutoAwesome className={styles.sectionIcon} />
                                <Typography variant="h3">Próximas Citas</Typography>
                            </div>
                            <div className={styles.eventsGrid}>
                                {upcomingEvents.map(event => (
                                    <EventCard key={event.event_id} event={event} currentUser={currentUser} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CTA Final */}
                    <Box className={styles.ctaWrapper}>
                        <div className={styles.ctaInner}>
                            <Typography variant="h3">¿Eres un dinamizador cultural?</Typography>
                            <Typography variant='subtitle1'>Buscamos propuestas que enriquezcan a nuestra comunidad en El Rincón de Allende.</Typography>
                            <Link href="/contact" className={styles.primaryBtn}>
                                Presentar mi propuesta
                            </Link>
                        </div>
                    </Box>
                </Grid>
                <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            </Grid>
        </main>
    );
}