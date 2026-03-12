// app/admin/events/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth'; 
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getAllEvents } from '@/lib/data/events'; 
import { Grid, Typography } from '@mui/material';
import EventsTable from '@/components/adminComponents/EventsTable';
import styles from './EventPage.module.css'; 


interface User {
  user_id: number;
  name: string;
  last_name: string;
  user_type: 'librarian' | 'user';
}

interface Event {
  event_id: number;
  name: string;
  event_date: Date;
  capacity: number;
  participants: number;
  cancelations: number;
  user_id: number;
  user?: User | null; 
}

//  Interfaz para mostrar en la tabla
interface EventDisplay {
  event_id: number;
  name: string;
  date: string; 
  capacity: number;
  participants: number;
  organizer: string; 
}

export default async function EventsPage() {
  const cookieStore = await cookies();
  const user = await getUserFromCookies(cookieStore);
  
  //  Verificación de autenticación y permisos
  const isRoot = user?.type === 'root';
  const isLibrarian = user?.type === 'user' && user.userType === 'librarian';
  
  if (!user || (!isRoot && !isLibrarian)) {
    return (
      <div className={styles.unauthorized}>
        <Typography variant="h2" color="error">Acceso denegado</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Solo el personal autorizado puede acceder a la gestión de eventos.
        </Typography>
      
      </div>
    );
  }

  //  Obtener eventos
  const events = await getAllEvents();
  
  //  Filtrar según rol (librarians solo ven sus propios eventos)
  const eventsToShow = isRoot 
    ? events 
    : events.filter(e => e.user_id === user.id);

  //  Transformar datos para la tabla (preprocesamiento en servidor)
  const eventsDisplay: EventDisplay[] = eventsToShow.map(event => ({
    event_id: event.event_id,
    name: event.name,
    date: new Date(event.event_date).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    capacity: event.capacity,
    participants: event.participants,
    organizer: event.user 
      ? `${event.user.name} ${event.user.last_name}`
      : 'Biblioteca Municipal',
  }));

  return (
    <Grid container className={styles.container}>
      <Grid size={{ xs: 0.5, md: 1 }}></Grid>
      <Grid size={{ xs: 11, md: 10 }}>
        <header className={styles.header}>
          <div>
            <Typography variant="h2">Gestión de Eventos</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {isRoot 
                ? 'Eventos culturales programados por todos los bibliotecarios'
                : 'Eventos que tú has creado y gestionado'}
            </Typography>
          </div>
          <div className={styles.headerActions}>
              <Link href="/admin/events/createE" className={styles.createButton}>
                <Typography variant="body2">
                  + Crear nuevo evento
                </Typography>
              </Link>
            
          </div>
        </header>

        <div className={styles.content}>
          {eventsDisplay.length > 0 ? (
            <EventsTable 
              events={eventsDisplay} 
            />
          ) : (
            <div className={styles.emptyState}>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                {isRoot 
                  ? 'No hay eventos programados en el sistema'
                  : 'Aún no has creado ningún evento'}
              </Typography>
              
                <Link href="/admin/events/createE" className={styles.createButton} style={{ marginTop: '16px' }}>
                  <Typography variant="body1">
                    + Crear primer evento
                  </Typography>
                </Link>
              
            </div>
          )}
        </div>
      </Grid>
      <Grid size={{ xs: 0.5, md: 1 }}></Grid>
    </Grid>
  );
}