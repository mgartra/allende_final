import  prisma  from '@/lib/prisma';

/** 
 * Función para obtener todos los autores
 */

export async function getAllAuthors() {
    return await prisma.author.findMany({
        select: {
            author_id: true,
            name: true,
            last_name: true,
            nationality: true
        },
        orderBy: { name: 'asc' }
    });
}