// /app/api/events/reserve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
    try {

        const user = await getUserFromSession(request);

        if (!user || user.type !== 'user') {
            return NextResponse.json({
                error: 'Debes iniciar sesión como usuario para reservar'
            }, { status: 401 });
        }

        const body = await request.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 });
        }

        //  Verifica que el evento exista
        const event = await prisma.event.findUnique({
            where: { event_id: parseInt(eventId) },
        });

        if (!event) {
            return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
        }

        // Verifica disponibilidad del evento
        if (event.participants >= event.capacity) {
            return NextResponse.json({
                error: 'No hay plazas disponibles para este evento'
            }, { status: 400 });
        }

        //  Verifica si el usuario ya tiene reserva (activa o cancelada)
        const existingReservation = await prisma.eventReservation.findFirst({
            where: {
                user_id: user.id,
                event_id: event.event_id,
            },
            include: { event: true },
        });

        //  Controla diferentes escenarios
        await prisma.$transaction(async (tx) => {
            if (!existingReservation) {
                // Caso 1: No tiene reserva → Crear nueva
                await tx.eventReservation.create({
                    data: {
                        user_id: user.id,
                        event_id: event.event_id,
                        status: 'confirmed',
                        reservation_date: new Date(),
                    },
                });

                // Actualizar contador de participantes
                await tx.event.update({
                    where: { event_id: event.event_id },
                    data: { participants: event.participants + 1 },
                });
            } else if (existingReservation.status === 'cancelled') {
                // Caso 2: Tiene reserva cancelada → Reutilizar y actualizar
                await tx.eventReservation.update({
                    where: { reservation_id: existingReservation.reservation_id },
                    data: {
                        status: 'confirmed',
                        reservation_date: new Date(), // Actualizar fecha de reserva
                    },
                });

                // Actualizar contador de participantes
                await tx.event.update({
                    where: { event_id: event.event_id },
                    data: { participants: event.participants + 1 },
                });
            } else if (existingReservation.status === 'confirmed') {
                //  Caso 3: Ya tiene reserva confirmada → Error
                throw new Error('Ya tienes una reserva activa para este evento');
            } else if (existingReservation.status === 'unconfirmed') {
                //  Caso 4: Tiene reserva pendiente → Confirmar
                await tx.eventReservation.update({
                    where: { reservation_id: existingReservation.reservation_id },
                    data: {
                        status: 'confirmed',
                        reservation_date: new Date(),
                    },
                });

                // Actualizar contador de participantes (si no estaba contado)
                if (existingReservation.event.participants < event.participants + 1) {
                    await tx.event.update({
                        where: { event_id: event.event_id },
                        data: { participants: event.participants + 1 },
                    });
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: existingReservation?.status === 'cancelled'
                ? '¡Reserva reactivada! Has vuelto a apuntarte al evento'
                : 'Reserva realizada correctamente',
        });
    } catch (error) {
        console.error('Error al reservar evento:', error);

        if (error instanceof Error && error.message.includes('Ya tienes una reserva activa')) {
            return NextResponse.json({
                error: 'Ya tienes una reserva activa para este evento'
            }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Error al procesar la reserva' },
            { status: 500 }
        );
    }
}