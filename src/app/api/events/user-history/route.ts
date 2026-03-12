// /app/api/events/user-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromSession(request);
        
        if (!user || user.type !== 'user') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Reservas confirmadas del usuario
        const reservations = await prisma.eventReservation.findMany({
            where: {
                user_id: user.id,
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

        return NextResponse.json({
            success: true,
            events: reservations,
        });
    } catch (error) {
        console.error('Error al obtener historial de eventos:', error);
        return NextResponse.json(
            { error: 'Error al cargar el historial de eventos' },
            { status: 500 }
        );
    }
}