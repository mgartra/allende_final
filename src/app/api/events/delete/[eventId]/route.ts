// app/api/events/delete/[eventId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const user = await getUserFromSession(request);
        const isRoot = user?.type === 'root';
        const isLibrarian = user?.type === 'user' && user.userType === 'librarian';

        if (!user || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const resolvedParams = await params;
        const eventId = parseInt(resolvedParams.eventId, 10);

        if (isNaN(eventId) || eventId <= 0) {
            return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
        }

        //  Verifica que el evento exista
        const event = await prisma.event.findUnique({
            where: { event_id: eventId },
            include: {
                reservations: true,
            },
        });

        if (!event) {
            return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
        }

        //  Verifica que el evento no tenga reservas
        const confirmedReservations = event.reservations.filter(
            r => r.status === 'confirmed'
        );

        if (confirmedReservations.length > 0) {
            return NextResponse.json({
                error: `No se puede eliminar el evento "${event.name}" porque tiene ${confirmedReservations.length} reserva(s) confirmada(s)`
            }, { status: 400 });
        }

        // Elimina el evento
        await prisma.event.delete({
            where: { event_id: eventId },
        });

        return NextResponse.json({
            success: true,
            message: 'Evento eliminado correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar evento:', error);

        if (error instanceof Error && error.message.includes('Foreign key constraint')) {
            return NextResponse.json({
                error: 'No se puede eliminar este evento porque está asociado a reservas'
            }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}