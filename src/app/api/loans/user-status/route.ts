// app/api/loans/user-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/auth';
import {
    hasOverdueLoans,
    isUserBlocked,
    getUserBlockExpiry,
    hasAvailableCopies
} from '@/lib/data/loans';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromSession(req);

        if (!user || user.type !== 'user') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Verificar préstamos vencidos
        const hasOverdue = await hasOverdueLoans(user.id);

        // Verificar si está bloqueado
        const blocked = await isUserBlocked(user.id);
        const blockExpiry = blocked ? await getUserBlockExpiry(user.id) : null;

        // Calcular días restantes de bloqueo
        let daysRemaining = 0;
        if (blockExpiry) {
            daysRemaining = Math.ceil(
                (blockExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
        }

        return NextResponse.json({
            hasOverdueLoans: hasOverdue,
            isBlocked: blocked,
            blockExpiry: blockExpiry,
            daysRemaining: daysRemaining,
            canBorrow: !blocked && !hasOverdue
        });
    } catch (error) {
        console.error('Error al obtener estado del usuario:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}