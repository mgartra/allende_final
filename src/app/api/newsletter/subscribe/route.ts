// src/app/api/newsletter/subscribe/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {

        const { email, source } = await request.json();


        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: 'Email obligatorio' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }


        console.log('📧 Nuevo suscriptor:', {
            email: email.trim().toLowerCase(),
            source
        });


        return NextResponse.json({
            success: true,
            message: '¡Suscripción exitosa! Revisa tu email de confirmación',
            email: email.trim().toLowerCase()
        });

    } catch (error) {
        console.error('Error en suscripción:', error);


        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development'
                    ? (error instanceof Error ? error.message : 'Error desconocido')
                    : undefined
            },
            { status: 500 }
        );
    }
}