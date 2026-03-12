// app/api/authors/delete/[authorId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ authorId: string }> }
) {
    try {
        const user = await getUserFromSession(request);
        
        if (!user || !(user.type === 'root' || (user.type === 'user' && user.userType === 'librarian'))) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const resolvedParams = await params;
        const authorId = parseInt(resolvedParams.authorId, 10);

        if (isNaN(authorId) || authorId <= 0) {
            return NextResponse.json({ error: 'ID de autor inválido' }, { status: 400 });
        }

        // ✅ Verificar que el autor exista
        const author = await prisma.author.findUnique({
            where: { author_id: authorId },
            include: { books: true }, // Incluir libros para verificar
        });

        if (!author) {
            return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 });
        }

        // ✅ Verificar que el autor no tenga libros asociados
        if (author.books && author.books.length > 0) {
            return NextResponse.json({ 
                error: `No se puede eliminar el autor "${author.name} ${author.last_name}" porque tiene ${author.books.length} libro(s) asociado(s)` 
            }, { status: 400 });
        }

        // ✅ Eliminar el autor
        await prisma.author.delete({
            where: { author_id: authorId },
        });

        return NextResponse.json({
            success: true,
            message: 'Autor eliminado correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar autor:', error);
        
        if (error instanceof Error && error.message.includes('Foreign key constraint')) {
            return NextResponse.json({ 
                error: 'No se puede eliminar este autor porque está asociado a libros' 
            }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}