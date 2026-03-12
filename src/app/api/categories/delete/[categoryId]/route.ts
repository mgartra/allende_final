// app/api/categories/delete/[categoryId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
       const currentUser = await getUserFromSession(request);
        const isRoot = currentUser?.type === 'root';
        const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';
        
        if (!currentUser || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const resolvedParams = await params;
        const categoryId = parseInt(resolvedParams.categoryId, 10);

        if (isNaN(categoryId) || categoryId <= 0) {
            return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
        }

        // Verifica que la categoría exista
        const category = await prisma.category.findUnique({
            where: { category_id: categoryId },
            include: { books: true },
        });

        if (!category) {
            return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
        }

        // Verifica que la categoría no tenga libros asociados
        if (category.books && category.books.length > 0) {
            return NextResponse.json({ 
                error: `No se puede eliminar la categoría "${category.name}" porque tiene ${category.books.length} libro(s) asociado(s)` 
            }, { status: 400 });
        }

        //  Elimina la categoría
        await prisma.category.delete({
            where: { category_id: categoryId },
        });

        return NextResponse.json({
            success: true,
            message: 'Categoría eliminada correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        
        if (error instanceof Error && error.message.includes('Foreign key constraint')) {
            return NextResponse.json({ 
                error: 'No se puede eliminar esta categoría porque está asociada a libros' 
            }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}