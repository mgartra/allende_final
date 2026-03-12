// /app/api/users/blocked/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Obtiene los usuarios bloqueados (con fecha de desbloqueo en el futuro)
        const today = new Date();
        const blockedUsers = await prisma.user.findMany({
            where: {
                blocked_until: {
                    gt: today,
                },
            },
            select: {
                user_id: true,
                name: true,
                last_name: true,
                email: true,
                blocked_until: true,
            },
            orderBy: { blocked_until: 'asc' },
        });

        return NextResponse.json({
            users: blockedUsers,
        });
    } catch (error) {
        console.error('Error al obtener usuarios bloqueados:', error);
        return NextResponse.json(
            { error: 'Error al cargar usuarios bloqueados' },
            { status: 500 }
        );
    }
}