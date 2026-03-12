// src/app/api/auth/me/route.ts
//Obtener el usuario actual

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, isUserBlocked } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromSession(req);

        // Usuario no autenticado
        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Usuario bloqueado (solo aplica a usuarios regulares)
        if (isUserBlocked(user)) {
            
            if (user.type === 'user' && user.blockedUntil) {
                return NextResponse.json(
                    {
                        user: null,
                        error: 'USER_BLOCKED',
                        blockedUntil: user.blockedUntil 
                    },
                    { status: 403 } 
                );
            }
            
            return NextResponse.json(
                { user: null, error: 'USER_BLOCKED' },
                { status: 403 }
            );
        }
        // Usuario autenticado y no bloqueado
        return NextResponse.json({ user });
    } catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'Error desconocido en /api/auth/me';

        console.error('Error en /api/auth/me:', errorMessage);

        return NextResponse.json(
            { user: null, error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}