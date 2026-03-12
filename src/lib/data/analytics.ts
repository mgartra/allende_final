// src/lib/data/analytics.ts
import prisma from '@/lib/prisma';
import { AnalyticsData, AnalyticsMetrics } from '@/types';

/**
 * Obtiene todos los datos de análisis del sistema bibliotecario
 * @returns Promise<AnalyticsData> - Datos estructurados para el dashboard de análisis
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
    try {
        // ✅ Ejecutar todas las queries en paralelo para máxima eficiencia
        const [
            totalBooks,
            totalUsers,
            totalLibrarians,
            totalLoans,
            totalEvents,
            activeLoans,
            overdueLoans,
            blockedUsers,
            upcomingEvents,
            popularBooks,
            activeUsers
        ] = await Promise.all([
            // Conteos básicos
            prisma.book.count(),
            prisma.user.count({ where: { user_type: 'user' } }), // Solo lectores
            prisma.user.count({ where: { user_type: 'librarian' } }), // Solo bibliotecarios
            prisma.loan.count(),
            prisma.event.count(),

            // Préstamos activos y vencidos
            prisma.loan.count({ where: { status: 'borrowed' } }),
            prisma.loan.count({ where: { status: 'overdue' } }),

            // Usuarios bloqueados
            prisma.user.count({
                where: {
                    blocked_until: {
                        gt: new Date() // Solo usuarios bloqueados actualmente
                    }
                }
            }),

            // Eventos próximos
            prisma.event.count({
                where: {
                    event_date: {
                        gte: new Date() // Eventos hoy o en el futuro
                    }
                }
            }),

            // ✅ Libros más populares (TOP 10)
            prisma.book.findMany({
                take: 10,
                include: {
                    authors: {
                        select: {
                            name: true,
                            last_name: true
                        },
                    },
                    _count: {
                        select: { loans: true } // Contar préstamos históricos
                    }
                },
                orderBy: {
                    loans: { _count: 'desc' }, // Ordenar por cantidad de préstamos
                },
            }).then(books =>
                books.map(book => ({
                    title: book.title,
                    author: book.authors?.[0]
                        ? `${book.authors[0].name} ${book.authors[0].last_name}`
                        : 'Sin autor',
                    loans: book._count.loans,
                }))
            ),

            // ✅ Usuarios más activos (TOP 10)
            prisma.user.findMany({
                take: 10,
                include: {
                    _count: {
                        select: { loans: true } // Contar préstamos históricos
                    }
                },
                orderBy: {
                    loans: { _count: 'desc' }, // Ordenar por cantidad de préstamos
                },
            }).then(users =>
                users.map(user => ({
                    name: `${user.name} ${user.last_name}`,
                    email: user.email,
                    loans: user._count.loans,
                }))
            ),
        ]);

        // ✅ Construir objeto de métricas
        const metrics: AnalyticsMetrics = {
            totalBooks,
            totalUsers,
            totalLibrarians,
            totalLoans,
            totalEvents,
            activeLoans,
            overdueLoans,
            blockedUsers,
            upcomingEvents,
        };

        // ✅ Retornar datos estructurados
        return {
            metrics,
            popularBooks,
            activeUsers,
            generatedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('Error en getAnalyticsData:', error);

        // ✅ Lanzar error tipado para que el caller lo maneje
        throw new Error(
            error instanceof Error
                ? `Error al obtener datos de análisis: ${error.message}`
                : 'Error desconocido al obtener datos de análisis'
        );
    }
}