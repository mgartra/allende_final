// /app/sections/eventSection/EventSection.tsx
import { getUpcomingEvents, getUserReservationForEvent } from '@/lib/data/events';
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import EventCard from '@/components/eventItem/EventCard';
import styles from './EventSection.module.css';
import SectionTitle from '@/components/sectionTitle/SectionTitle';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Grid, Typography } from '@mui/material';
import Link from 'next/link';

export default async function EventsSection() {
  const cookieStore = await cookies();
  const user = await getUserFromCookies(cookieStore);
  const currentUser = user?.type === 'user' ? user : null;
  
  const events = await getUpcomingEvents(4); 

  if (events.length === 0) return null;

  //Transformar eventos (renombrar event_date → date)
  const eventsWithReservations = currentUser
    ? await Promise.all(
        events.map(async (event) => {
          const reservation = await getUserReservationForEvent(
            currentUser.id,
            event.event_id
          );
          const { event_date, ...rest } = event;
          return {
            ...rest,
            date: event_date,
            availableSpots: event.capacity - event.participants,
            isFull: event.participants >= event.capacity,
            userReservation: reservation
          };
        })
      )
    : events.map(event => {
        const { event_date, ...rest } = event;
        return {
          ...rest,
          date: event_date,
          availableSpots: event.capacity - event.participants,
          isFull: event.participants >= event.capacity,
          userReservation: null
        };
      });

  return (
    <section className={styles.eventsSection}>
      <Grid container spacing={2} className={styles.container}>
        {/* Título de la sección */}
        <Grid size={{ xs: 1 }}></Grid>
        <Grid size={{ xs: 10 }}  className={styles.intro}>
          <SectionTitle
            icon="01"
            iconSize={80}
            title="Próximos Eventos"
            subtitle="Descubre nuestras actividades culturales y únete a nuestra comunidad"
          />
      
       

       
        <Grid container spacing={3} sx={{ px: 2 }}>
          {eventsWithReservations.map((event) => (
            <Grid 
              key={event.event_id} 
              size={{ 
                xs: 12, 
                sm: 6, 
                md: 4, 
                lg: 3 
              }}
            >
              <EventCard
                event={event}
                currentUser={currentUser}
              />
            </Grid>
          ))}
     
        </Grid>
        <div className={styles.linkEvents}>
                <Link href='/events'>
                    <Typography variant='caption'>
                        Ver todos los eventos
                    </Typography></Link>
                <KeyboardArrowRightIcon fontSize='medium' />
            </div>
        
          </Grid>
       

      
        <Grid size={{ xs: 1 }}></Grid>
      </Grid>
        
    </section>
  );
}