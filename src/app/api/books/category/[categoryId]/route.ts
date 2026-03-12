// /app/api/books/category/[categoryId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const categoryIdNumber = parseInt(categoryId, 10);
        const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5');

        if (isNaN(categoryIdNumber)) {
            return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
        }

        const skip = (page - 1) * limit;

        // Obtener libros paginados con relaciones
        const [books, total] = await Promise.all([
            prisma.book.findMany({
                where: {
                    categories: {
                        some: { category_id: categoryIdNumber }
                    }
                },
                include: {
                    authors: {
                        select: {
                            author_id: true,
                            name: true,
                            last_name: true,
                            nationality: true,
                        },
                    },
                    categories: {
                        select: {
                            category_id: true,
                            name: true,
                            description: true,
                            icon: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma.book.count({
                where: {
                    categories: {
                        some: { category_id: categoryIdNumber }
                    }
                }
            })
        ]);

        return NextResponse.json({
            books,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + limit < total,
        });
    } catch (error) {
        console.error('Error al obtener libros paginados:', error);
        return NextResponse.json(
            { error: 'Error al cargar libros' },
            { status: 500 }
        );
    }
}