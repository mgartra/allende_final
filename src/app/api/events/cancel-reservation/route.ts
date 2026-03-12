// /app/api/events/cancel-reservation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
    try {
        //  Verifica autenticación
        const user = await getUserFromSession(request);

        if (!user || user.type !== 'user') {
            return NextResponse.json({
                error: 'Debes iniciar sesión para cancelar una reserva'
            }, { status: 401 });
        }

        const body = await request.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 });
        }

        //  Buscar reserva del usuario
        const reservation = await prisma.eventReservation.findFirst({
            where: {
                user_id: user.id,
                event_id: parseInt(eventId),
                status: { in: ['confirmed', 'unconfirmed'] }, 
            },
            include: { event: true },
        });

        if (!reservation) {
            return NextResponse.json({
                error: 'No tienes una reserva activa para este evento'
            }, { status: 404 });
        }

        // Cancela reserva y actualizar contadores
        await prisma.$transaction(async (tx) => {
            // Actualiza estado de la reserva a 'cancelled'
            await tx.eventReservation.update({
                where: { reservation_id: reservation.reservation_id },
                data: { status: 'cancelled' },
            });

            //  Actualiza contadores del evento
            await tx.event.update({
                where: { event_id: reservation.event.event_id },
                data: {
                    participants: Math.max(0, reservation.event.participants - 1),
                    cancelations: reservation.event.cancelations + 1,
                },
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Reserva cancelada correctamente. Puedes volver a apuntarte si hay plazas disponibles.',
        });
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        return NextResponse.json(
            { error: 'Error al procesar la cancelación' },
            { status: 500 }
        );
    }
}