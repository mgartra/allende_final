// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        const user = await validateCredentials(email, password);
        if (!user) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Siempre redirigir a homepage
        const response = NextResponse.json({
            success: true,
            redirect: '/', // ← Siempre a homepage
            user: {
                type: user.type,
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

        createSession(response, user);
        return response;
    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}