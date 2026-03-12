// /app/api/events/canceled/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Obtiene los eventos cancelados
        const canceledEvents = await prisma.event.findMany({
            where: {
                cancelations: {
                    gt: 0,
                },
            },
            select: {
                event_id: true,
                name: true,
                cancelations: true,
                capacity: true,
            },
            orderBy: { cancelations: 'desc' },
        });

        return NextResponse.json({
            events: canceledEvents,
        });
    } catch (error) {
        console.error('Error al obtener eventos cancelados:', error);
        return NextResponse.json(
            { error: 'Error al cargar eventos cancelados' },
            { status: 500 }
        );
    }
}