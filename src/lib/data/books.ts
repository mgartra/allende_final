import prisma from '@/lib/prisma';

/**
 * Obtener libros mejor valorados
 */
export async function getFeaturedBooks(limit: number = 4) {
    return await prisma.book.findMany({
        take: limit,
        where: {
            reference: { gte: 1 } // Solo libros con una recomendación
        },
        orderBy: {
            reference: 'desc' // Del mejor valorado al peor
        },
        include: {
            authors: true,
            categories: true
        }
    });
}



/**
 * Obtener últimas incorporaciones
 */
export async function getLatestBooks(limit: number = 4) {
    return await prisma.book.findMany({
        take: limit,
        orderBy: {
            book_id: 'desc' // Del más nuevo al más antiguo (por ID)
        },
        include: {
            authors: true,
            categories: true
        }
    });
}

/**
 * Obtener libros más prestados
 */
export async function getPopularBooks(limit: number = 4) {
    const books = await prisma.book.findMany({
        include: {
            authors: true,
            categories: true, 
            _count: {
                select: { loans: true }
            }
        },
        orderBy: {
            loans: { _count: 'desc' } //  Ordenar por número de préstamos
        },
        take: limit
    });

    return books;
}

/**
 * Obtener todos los libros 
 */
export async function getAllBooks() {
    return await prisma.book.findMany({
        include: {
            authors: true,
            categories: true
        },
        orderBy: {
            title: 'asc'
        }
    });
}

/**
 * Obtener un libro por su ID
 */
export async function getBookById(book_id: number) {
    // Validación adicional para garantizar que el Id es válido
    if (typeof book_id !== 'number' || isNaN(book_id) || !Number.isInteger(book_id)) {
        return null;
    }

    return await prisma.book.findUnique({
        where: { book_id }, 
        include: {
            authors: true,
            categories: true,
        },
    });
}

/**
 * Obtener libros por categoría
 */
export async function getBooksByCategory(category_id: number, limit?: number) {
    const books = await prisma.book.findMany({
        where: {
            categories: {
                some: {
                    category_id: category_id
                }
            }
        },
        include: {
            authors: true,
            categories: true
        },
        orderBy: {
            title: 'asc'
        }
    });

    return limit ? books.slice(0, limit) : books;
}

/**
 * Búsqueda de libros por título o autor
 */
export async function searchBooks(query: string, limit: number = 10) {
    // Limpiar y preparar la búsqueda
    const safeQuery = query.trim();

    if (safeQuery.length < 2) {
        return [];
    }

    return await prisma.book.findMany({
        take: limit,
        where: {
            OR: [
                {
                    title: {
                        contains: safeQuery,
                    }
                },
                {
                    authors: {
                        some: {
                            OR: [
                                { name: { contains: safeQuery } },
                                { last_name: { contains: safeQuery } }
                            ]
                        }
                    }
                }
            ]
        },
        include: {
            authors: true,
            categories: true
        },
        orderBy: {
            title: 'asc'
        }
    });
}

/**
 * Obtener libros disponibles
 */
export async function getAvailableBooks() {
    return await prisma.book.findMany({
        where: {
            available_copies: { gt: 1 } // Más de 1 copia disponible
        },
        include: {
            authors: true,
            categories: true
        },
        orderBy: {
            title: 'asc'
        }
    });
}

/**
 * Obtener libros por rango de recomendaciones
 */
export async function getBooksWithreferenceRange(min: number, max: number) {
    return await prisma.book.findMany({
        where: {
            reference: {
                gte: min,
                lte: max
            }
        },
        include: {
            authors: true,
            categories: true
        },
        orderBy: {
            reference: 'desc'
        }
    });
}