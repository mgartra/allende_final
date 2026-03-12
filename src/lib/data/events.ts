import prisma from '@/lib/prisma';

/** 
 * Función para obtener todos los eventos con su gestor
 */
export async function getAllEvents() {
    return await prisma.event.findMany({
        select: {
            event_id: true,
            name: true,
            description: true,
            image: true,
            event_date: true,
            capacity: true,
            participants: true,
            cancelations: true,
            user_id: true,
            user: {
                select: {
                    name: true,
                    last_name: true,
                    user_type: true
                },
            },
        },
        orderBy: { event_date: 'desc' }
    });
}

/** 
 * Función para obtener un evento por su id
 */
export async function getEventById(eventId: number) {
    return await prisma.event.findUnique({
        where: { event_id: eventId },
        select: {
            event_id: true,
            name: true,
            description: true,
            image: true,
            event_date: true,
            capacity: true,
            participants: true,
            cancelations: true,
            user_id: true,
            user: {
                select: {
                    name: true,
                    last_name: true,
                    user_type: true
                },
            },
        },
    });
}

/** 
 * Función para obtener todos los bibliotecarios
 */

export async function getAllLibrarians() {
    return await prisma.user.findMany({
        where: { user_type: 'librarian' }, 
        select: {
            user_id: true, 
            name: true,
            last_name: true,
            email: true,
        },
        orderBy: { name: 'asc' },
    });
}

/** 
 * Función para obtener los próximos eventos con limitador
 */
export async function getUpcomingEvents(limit: number = 6) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await prisma.event.findMany({
        where: {
            event_date: {
                gte: today,
            },
        },
        select: {
            event_id: true,
            name: true,
            description: true,
            image: true,
            event_date: true,
            capacity: true,
            participants: true,
            cancelations: true,
        },
        orderBy: { event_date: 'asc' },
        take: limit,
    });

    return events.map(event => ({
        ...event,
        availableSpots: event.capacity - event.participants,
        isFull: event.participants >= event.capacity,
    }));
}

/** 
 * Función para saber si un usuario tiene reserva en un evento
 */
export async function getUserReservationForEvent(userId: number, eventId: number) {
    return await prisma.eventReservation.findFirst({
        where: {
            user_id: userId,
            event_id: eventId,
            status: { in: ['confirmed', 'unconfirmed'] },
        },
        select: {
            reservation_id: true,
            status: true,
            reservation_date: true,
        },
    });
}

/** 
 * Función para obtener todas las reservas por usuario
 */
export async function getUserEvents(userId: number) {
    return await prisma.eventReservation.findMany({
        where: {
            user_id: userId,
            status: 'confirmed',
        },
        include: {
            event: {
                select: {
                    event_id: true,
                    name: true,
                    event_date: true,
                    image: true,
                },
            },
        },
        orderBy: {
            reservation_date: 'desc',
        },
    });
}