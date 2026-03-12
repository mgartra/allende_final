// app/api/events/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth'; 

export async function POST(request: NextRequest) {
    try {
       
        const user = await getUserFromSession(request);
        const isRoot = user?.type === 'root';
        const isLibrarian = user?.type === 'user' && user.userType === 'librarian';

        if (!user || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        
        const body = await request.json();
        const {
            name,
            description,
            image,
            event_date,
            capacity,
            user_id: assignedUserId, 
        } = body;

        //  Validaciones básicas
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        if (!event_date) {
            return NextResponse.json({ error: 'La fecha del evento es obligatoria' }, { status: 400 });
        }

        //  Validar fecha futura
        const eventDate = new Date(event_date);
        if (isNaN(eventDate.getTime())) {
            return NextResponse.json({ error: 'Fecha del evento inválida' }, { status: 400 });
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const eventDateWithoutTime = new Date(eventDate);
        eventDateWithoutTime.setHours(0, 0, 0, 0);

        if (eventDateWithoutTime < now) {
            return NextResponse.json({ error: 'La fecha del evento debe ser futura' }, { status: 400 });
        }

        if (!capacity || parseInt(capacity) <= 0) {
            return NextResponse.json({ error: 'La capacidad debe ser mayor que 0' }, { status: 400 });
        }

        const capacityNum = parseInt(capacity);
        if (capacityNum > 500) {
            return NextResponse.json({ error: 'La capacidad máxima es de 500 personas' }, { status: 400 });
        }

        //  Validar que el usuario asignado exista y sea bibliotecario
        if (!assignedUserId) {
            return NextResponse.json({ error: 'Debes seleccionar un bibliotecario gestor' }, { status: 400 });
        }

        const assignedUser = await prisma.user.findUnique({
            where: { user_id: parseInt(assignedUserId) },
            select: { user_id: true, user_type: true, name: true, last_name: true }
        });

        if (!assignedUser) {
            return NextResponse.json({ error: 'Bibliotecario no encontrado' }, { status: 404 });
        }

        if (assignedUser.user_type !== 'librarian') {
            return NextResponse.json({
                error: 'El usuario seleccionado no es un bibliotecario'
            }, { status: 400 });
        }

        // ✅ Regla de seguridad: Los librarians solo pueden asignar eventos a sí mismos o a otros librarians
        if (isLibrarian && assignedUser.user_id !== user.id) {
            // ✅ Permitir asignación a otros librarians (opcional, según política de tu biblioteca)
            // Si quieres restringir a solo sí mismos, descomenta la siguiente línea:
            // return NextResponse.json({ error: 'Solo puedes crear eventos asignados a ti mismo' }, { status: 403 });
        }

        // ✅ Crear evento (participantes y cancelaciones empiezan en 0)
        const newEvent = await prisma.event.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                image: image?.trim() || 'default-event.jpg', // ✅ Imagen por defecto
                event_date: eventDate,
                capacity: capacityNum,
                participants: 0, // ✅ Siempre 0 al crear
                cancelations: 0, // ✅ Siempre 0 al crear
                user_id: assignedUser.user_id, // ✅ Relación con User (no librarian)
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Evento creado correctamente',
            event: {
                event_id: newEvent.event_id,
                name: newEvent.name,
                event_date: newEvent.event_date.toISOString(),
                capacity: newEvent.capacity,
                participants: newEvent.participants,
                cancelations: newEvent.cancelations,
                user: {
                    user_id: assignedUser.user_id,
                    name: assignedUser.name,
                    last_name: assignedUser.last_name,
                },
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Error al crear evento:', error);

        // ✅ Manejo específico de errores de Prisma
        if (error instanceof Error) {
            if (error.message.includes('Foreign key constraint')) {
                return NextResponse.json({
                    error: 'Error de integridad: el bibliotecario asignado no existe'
                }, { status: 400 });
            }

            if (error.message.includes('Invalid `prisma.event.create()`')) {
                return NextResponse.json({
                    error: 'Datos inválidos para crear el evento'
                }, { status: 400 });
            }
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}