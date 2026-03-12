// app/api/books/create/route.ts
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
            category_id, // ✅ ID del autor seleccionado
        } = body;

        
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


        //  Verificar que el ISBN sea único
        const existingBook = await prisma.book.findUnique({
            where: { isbn: isbn.trim() },
        });

        if (existingBook) {
            return NextResponse.json({ error: 'El ISBN ya está en uso' }, { status: 400 });
        }

        //  Validar que copias disponibles no excedan totales
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

        //  Crear el libro conectando autor existente (relación directa)
        const newBook = await prisma.book.create({
            data: {
                title: title.trim(),
                isbn: isbn.trim(),
                publication_year: publication_year ? parseInt(publication_year) : null,
                reference: reference && !isNaN(parseInt(reference)) ? parseInt(reference) : 0,
                total_copies: totalCopies,
                available_copies: availableCopies,
                image: image?.trim() || null,
                pdf_url: pdf_url?.trim() || null,
                //  Conectar autor existente (relación directa muchos-a-muchos)
                authors: {
                    connect: [{ author_id: parseInt(author_id) }]
                },
                categories: {
                    connect: [{ category_id: parseInt(category_id) }]
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Libro creado correctamente',
            book: newBook,
        });
    } catch (error) {
        console.error('Error al crear libro:', error);

        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json({ error: 'El ISBN ya está en uso' }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}