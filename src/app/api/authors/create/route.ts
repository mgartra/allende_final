// app/api/authors/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromSession(request);

        if (!user || !(user.type === 'root' || (user.type === 'user' && user.userType === 'librarian'))) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { name, last_name, nationality } = body;

        //  Validaciones
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        if (!last_name || last_name.trim() === '') {
            return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
        }

        //  Verificar que el autor no exista
        const existingAuthor = await prisma.author.findFirst({
            where: {
                name: name.trim(),
                last_name: last_name.trim(),
            },
        });

        if (existingAuthor) {
            return NextResponse.json({ error: 'Este autor ya existe' }, { status: 400 });
        }

        //  Crear el autor
        const newAuthor = await prisma.author.create({
            data: {
                name: name.trim(),
                last_name: last_name.trim(),
                nationality: nationality?.trim() || null,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Autor creado correctamente',
            author: newAuthor,
        });
    } catch (error) {
        console.error('Error al crear autor:', error);

        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json({ error: 'Este autor ya existe' }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}