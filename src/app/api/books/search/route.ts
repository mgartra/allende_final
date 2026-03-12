// app/api/books/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/data/books';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q')?.trim() || '';
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!query || query.length < 2) {
            return NextResponse.json({ books: [] });
        }

        const books = await searchBooks(query, limit);

        return NextResponse.json({
            books: books.map(book => ({
                book_id: book.book_id,
                title: book.title,
                publication_year: book.publication_year,
                image: book.image
                    ? `/images/books/${book.image}`
                    : '/portada-no-disponible.jpg',
                isbn: book.isbn,
                total_copies: book.total_copies,
                available_copies: book.available_copies,
                reference: book.reference,
                created_at: book.created_at,
                // Transformando autores a string
                authors: book.authors.map(author =>
                    `${author.name} ${author.last_name}`
                ).join(', '),
                // Transformando categorías a string
                categories: book.categories.map(category =>
                    category.name
                ).join(', ')
            }))
        });
    } catch (error) {
        console.error('Error en búsqueda:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}