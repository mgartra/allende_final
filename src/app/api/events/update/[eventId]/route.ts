// app/api/events/update/[eventId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth'; // ✅ Ruta corregida

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        // ✅ Verificar autenticación y permisos
        const user = await getUserFromSession(request);
        const isRoot = user?.type === 'root';
        const isLibrarian = user?.type === 'user' && user.userType === 'librarian';

        if (!user || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // ✅ Obtener y validar ID del evento
        const resolvedParams = await params;
        const eventId = parseInt(resolvedParams.eventId, 10);

        if (isNaN(eventId) || eventId <= 0) {
            return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
        }

        // ✅ Obtener evento existente CON su gestor
        const existingEvent = await prisma.event.findUnique({
            where: { event_id: eventId },
            include: {
                user: {
                    select: {
                        user_id: true,
                        user_type: true,
                        name: true,
                        last_name: true
                    }
                }
            }
        });

        if (!existingEvent) {
            return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
        }

        // ✅ ¡CRÍTICO! Verificar que el evento tenga un gestor asignado
        if (!existingEvent.user) {
            return NextResponse.json(
                {
                    error: 'El evento no tiene un gestor asignado',
                    details: 'Contacta con el superadministrador para reparar este evento'
                },
                { status: 500 }
            );
        }

        // ✅ Verificación de permisos: librarians solo pueden editar sus propios eventos
        if (isLibrarian && existingEvent.user_id !== user.id) {
            return NextResponse.json(
                {
                    error: 'No tienes permisos para actualizar este evento',
                    details: 'Solo puedes editar eventos que tú mismo has creado'
                },
                { status: 403 }
            );
        }

        // ✅ Parsear cuerpo de la petición
        const body = await request.json();
        const {
            name,
            description,
            image,
            event_date,
            capacity,
            participants,
            cancelations,
            user_id: assignedUserId, // ✅ user_id en lugar de librarian_id
        } = body;

        // ✅ Validaciones básicas
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        if (!event_date) {
            return NextResponse.json({ error: 'La fecha del evento es obligatoria' }, { status: 400 });
        }

        // ✅ Validar fecha futura
        const eventDate = new Date(event_date);
        if (isNaN(eventDate.getTime())) {
            return NextResponse.json({ error: 'Fecha del evento inválida' }, { status: 400 });
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const eventDateWithoutTime = new Date(eventDate);
        eventDateWithoutTime.setHours(0, 0, 0, 0);

        if (eventDateWithoutTime < now) {
            return NextResponse.json({
                error: 'La fecha del evento no puede ser en el pasado'
            }, { status: 400 });
        }

        if (!capacity || parseInt(capacity) <= 0) {
            return NextResponse.json({ error: 'La capacidad debe ser mayor que 0' }, { status: 400 });
        }

        const capacityNum = parseInt(capacity);
        if (capacityNum > 500) {
            return NextResponse.json({ error: 'La capacidad máxima es de 500 personas' }, { status: 400 });
        }

        // ✅ Validar participantes y cancelaciones
        const participantsNum = participants ? parseInt(participants) : existingEvent.participants;
        const cancelationsNum = cancelations ? parseInt(cancelations) : existingEvent.cancelations;

        if (participantsNum < 0) {
            return NextResponse.json({ error: 'Los participantes no pueden ser negativos' }, { status: 400 });
        }

        if (cancelationsNum < 0) {
            return NextResponse.json({ error: 'Las cancelaciones no pueden ser negativas' }, { status: 400 });
        }

        if (participantsNum + cancelationsNum > capacityNum) {
            return NextResponse.json({
                error: `La suma de participantes (${participantsNum}) y cancelaciones (${cancelationsNum}) no puede exceder la capacidad (${capacityNum})`
            }, { status: 400 });
        }

        // ✅ Determinar el gestor final del evento
        let finalAssignedUser = existingEvent.user; // ✅ Tipo garantizado: no es null aquí

        if (assignedUserId) {
            const newUserId = parseInt(assignedUserId, 10);

            // ✅ Solo root puede cambiar el gestor
            if (newUserId !== existingEvent.user_id) {
                if (!isRoot) {
                    return NextResponse.json(
                        {
                            error: 'No tienes permisos para cambiar el gestor del evento',
                            details: 'Solo el superadministrador puede reasignar eventos'
                        },
                        { status: 403 }
                    );
                }

                // ✅ Buscar el nuevo gestor
                const newUser = await prisma.user.findUnique({
                    where: { user_id: newUserId },
                    select: {
                        user_id: true,
                        user_type: true,
                        name: true,
                        last_name: true
                    }
                });

                if (!newUser) {
                    return NextResponse.json({ error: 'Bibliotecario no encontrado' }, { status: 404 });
                }

                if (newUser.user_type !== 'librarian') {
                    return NextResponse.json({
                        error: 'El usuario seleccionado no es un bibliotecario'
                    }, { status: 400 });
                }

                finalAssignedUser = newUser; // ✅ newUser es no-null aquí (ya validado)
            }
        }

        // ✅ Actualizar evento (finalAssignedUser es 100% no-null)
        const updatedEvent = await prisma.event.update({
            where: { event_id: eventId },
            data: {
                name: name.trim(),
                description: description?.trim() || existingEvent.description || null,
                image: image?.trim() || existingEvent.image || 'default-event.jpg',
                event_date: eventDate,
                capacity: capacityNum,
                participants: participantsNum,
                cancelations: cancelationsNum,
                user_id: finalAssignedUser.user_id, // ✅ ¡Seguro! TypeScript sabe que no es null
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Evento actualizado correctamente',
            event: {
                event_id: updatedEvent.event_id,
                name: updatedEvent.name,
                event_date: updatedEvent.event_date.toISOString(),
                capacity: updatedEvent.capacity,
                participants: updatedEvent.participants,
                cancelations: updatedEvent.cancelations,
                user: {
                    user_id: finalAssignedUser.user_id,
                    name: finalAssignedUser.name,
                    last_name: finalAssignedUser.last_name,
                },
            },
        });

    } catch (error) {
        console.error('Error al actualizar evento:', error);

        if (error instanceof Error) {
            if (error.message.includes('Record to update not found')) {
                return NextResponse.json({
                    error: 'Evento no encontrado'
                }, { status: 404 });
            }

            if (error.message.includes('Foreign key constraint')) {
                return NextResponse.json({
                    error: 'Error de integridad: el bibliotecario asignado no existe'
                }, { status: 400 });
            }
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}