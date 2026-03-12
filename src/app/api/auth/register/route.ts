// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// Esquema de validación con Zod
const registerSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    last_name: z.string().min(1, 'Los apellidos son obligatorios'),
    email: z.string().email('Email inválido'),
    phone: z.string().regex(/^\d{9}$/, 'El teléfono debe tener 9 dígitos'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validación con Zod
        const validated = registerSchema.parse(body);

        const prisma = (await import('@/lib/prisma')).default;

        // Verificar si el email ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este email ya está registrado' }
            );
        }

        // Verificar si el teléfono ya existe
        const existingPhone = await prisma.user.findUnique({
            where: { phone: validated.phone }
        });

        if (existingPhone) {
            return NextResponse.json(
                { error: 'Este número de teléfono ya está registrado' }
            );
        }

        // Hashear contraseña
        const hashedPassword = await hash(validated.password, 10);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                name: validated.name,
                last_name: validated.last_name,
                email: validated.email,
                phone: validated.phone,
                password: hashedPassword,
                birth_date: new Date(validated.birth_date),
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Usuario registrado correctamente',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error en registro:', error);

        if (error === 'ZodError') {
            return NextResponse.json(
                { error: error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}