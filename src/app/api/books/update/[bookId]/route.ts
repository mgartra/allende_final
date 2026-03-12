// app/api/books/update/[bookId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ bookId: string }> }
) {
    try {
        const user = await getUserFromSession(request);
        if (!user || !(user.type === 'root' || (user.type === 'user' && user.userType === 'librarian'))) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const resolvedParams = await params;
        const bookId = parseInt(resolvedParams.bookId, 10);

        if (isNaN(bookId) || bookId <= 0) {
            return NextResponse.json({ error: 'ID de libro inválido' }, { status: 400 });
        }

        const body = await request.json();
        const {
            title,
            isbn,
            publication_year,
            reference,
            total_copies,
            available_copies,
            image,
            pdf_url,
            author_id,
            category_id,
        } = body;

        //  Validaciones 
        if (!title || title.trim() === '') {
            return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });
        }

        if (!isbn || isbn.trim() === '') {
            return NextResponse.json({ error: 'El ISBN es obligatorio' }, { status: 400 });
        }

        if (!author_id || author_id === '') {
            return NextResponse.json({ error: 'Debes seleccionar un autor' }, { status: 400 });
        }

        if (!category_id || category_id === '') {
    return NextResponse.json({ error: 'Debes seleccionar una categoría' }, { status: 400 });
}

        // Verificar que el ISBN sea único
        const existingBookWithSameISBN = await prisma.book.findUnique({
            where: { isbn: isbn.trim() },
        });

        if (existingBookWithSameISBN && existingBookWithSameISBN.book_id !== bookId) {
            return NextResponse.json({ error: 'El ISBN ya está en uso' }, { status: 400 });
        }

        // Validar que copias disponibles no excedan totales
        const totalCopies = parseInt(total_copies);
        const availableCopies = parseInt(available_copies);

        if (isNaN(totalCopies) || isNaN(availableCopies)) {
            return NextResponse.json({ error: 'Copias inválidas' }, { status: 400 });
        }

        if (availableCopies > totalCopies) {
            return NextResponse.json({
                error: 'Las copias disponibles no pueden ser más que las totales'
            }, { status: 400 });
        }

        const updatedBook = await prisma.book.update({
            where: { book_id: bookId },
            data: { 
                title: title.trim(),
                isbn: isbn.trim(),
                publication_year: publication_year ? parseInt(publication_year) : null,
                reference: reference && !isNaN(parseInt(reference)) ? parseInt(reference) : 0,
                total_copies: totalCopies,
                available_copies: availableCopies,
                image: image?.trim() || null,
                pdf_url: pdf_url?.trim() || null,
                authors: {
                    set: [{ author_id: parseInt(author_id) }] 
                },
                categories: {
            set: [{ category_id: parseInt(category_id) }]
        },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Libro actualizado correctamente',
            book: updatedBook,
        });
    } catch (error) {
        console.error('Error al actualizar libro:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}