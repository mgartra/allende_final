// /app/components/eventItem/EventCard.tsx
import Image from 'next/image';
import EventActions from './EventActions';
import { normalizeImageUrl } from '@/lib/utils/imageUtils'; 
import styles from './EventCard.module.css';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Link from 'next/link';
import { Typography } from '@mui/material';

interface Event {
    event_id: number;
    name: string;
    date: Date | string;
    description: string | null;
    image: string | null;
    capacity: number;
    participants: number;
    availableSpots: number;
    isFull: boolean;
    userReservation: { status: string } | null;
}

interface User {
    id: number;
    name: string;
    type: string;
}

export default function EventCard({
    event,
    currentUser
}: {
    event: Event;
    currentUser: User | null;
}) {
    // Normaliza la URL de la imagen antes de usarla
    const imageUrl = normalizeImageUrl(event.image, '/images/events');

    const eventDate = new Date(event.date);
    const isValidDate = !isNaN(eventDate.getTime());
    const formattedDate = isValidDate
        ? eventDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'Fecha no disponible';

    const occupancy = event.capacity > 0
        ? Math.round((event.participants / event.capacity) * 100)
        : 0;

    return (
        <article className={styles.eventCard}>
            <div className={styles.cardImage}>
            
                <Image
                    src={imageUrl} 
                    alt={event.name || 'Evento cultural'}
                    width={400}
                    height={250}
                    className={styles.image}
                    unoptimized 
                    priority={false} 
                />
                {isValidDate && (
                    <div className={styles.dateBadge}>
                        <span className={styles.day}>
                            {eventDate.getDate()}
                        </span>
                        <span className={styles.month}>
                            {eventDate.toLocaleString('es-ES', { month: 'short' })}
                        </span>
                    </div>
                )}
            </div>

            <div className={styles.cardContent}>
                <Typography variant='h5' className={styles.cardTitle}>{event.name}</Typography>

                <div className={styles.cardMeta}>
                    <span className={styles.calendarIcon}>📅</span>
                    <span><Typography variant='caption'>{formattedDate}</Typography></span>
                </div>

              

                <div className={styles.availability}>
                    <div className={styles.availabilityLabel}>
                        <span>Disponibilidad:</span>
                        <span className={event.isFull ? styles.fullText : styles.availableText}>
                            {event.isFull ? 'COMPLETO' : `${event.availableSpots} plazas`}
                        </span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={`${styles.progressFill} ${occupancy > 80 ? styles.high : occupancy > 50 ? styles.medium : ''}`}
                            style={{ width: `${Math.min(occupancy, 100)}%` }}
                        ></div>
                    </div>
                    <div className={styles.progressStats}>
                        <span><Typography variant='caption'>{event.participants} inscritos</Typography></span>
                        <span><Typography variant='caption'>{event.capacity} total</Typography></span>
                    </div>
                </div>

                <EventActions
                    eventId={event.event_id}
                    isLoggedIn={!!currentUser}
                    userReservation={event.userReservation}
                />
            </div>
        </article>
    );
}