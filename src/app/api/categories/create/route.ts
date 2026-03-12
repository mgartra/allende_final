// app/api/categories/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getUserFromSession(request);
        const isRoot = currentUser?.type === 'root';
        const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

        if (!currentUser || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, icon } = body;

        // Validaciones
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        //  Verifica que la categoría no exista
        const existingCategory = await prisma.category.findUnique({
            where: { name: name.trim() },
        });

        if (existingCategory) {
            return NextResponse.json({ error: 'Esta categoría ya existe' }, { status: 400 });
        }

        //  Crea la categoría
        const newCategory = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                icon: icon?.trim() || null,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Categoría creada correctamente',
            category: newCategory,
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);

        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json({ error: 'Esta categoría ya existe' }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}