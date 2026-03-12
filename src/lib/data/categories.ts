import prisma from '@/lib/prisma';
import type { Category, BookWithRelations } from '@/types';

/**
 * Obtener una categoría por su id y sus libros
 */
export async function getCategoryById(categoryId: number) {
    return await prisma.category.findUnique({
        where: { category_id: categoryId },
        include: {
            books: {
                include: { authors: true, categories: true },
                orderBy: { title: 'asc' }
            }
        }
    });
}

/**
 * Obtener todas las categorías
 */
export async function getAllCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      category_id: true,
      name: true,
      icon: true,
      description: true,
    },
  });
}

/**
 *    Obtener TODAS las categorías activas (para el menú)
 * */
export async function getActiveCategories(): Promise<Category[]> {
    return await prisma.category.findMany({
        where: {
            books: {
                some: {} // Solo categorías con libros
            }
        },
        select: {
            category_id: true,
            name: true,
            icon:true,
            description:true,
    
        },
        orderBy: { name: 'asc' }
    });
}