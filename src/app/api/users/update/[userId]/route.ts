// app/api/users/update/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

// Tipos para el cuerpo de la petición (snake_case como llega del frontend)
interface UpdateUserRequestBody {
    name: string;
    last_name: string;
    birth_date: string; // ISO string
    email: string;
    password?: string; // Opcional
    phone: string;
    user_type?: 'user' | 'librarian'; // Opcional, solo root puede enviarlo
    blocked_until?: string | null; // ISO string o null
}

//  Tipos para los datos de actualización (snake_case para Prisma)
interface UpdateUserData {
    name: string;
    last_name: string;
    birth_date: Date;
    email: string;
    phone: string;
    blocked_until: Date | null;
    password?: string; // Solo si se proporciona
    user_type?: 'user' | 'librarian'; // Solo si root lo cambia
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
    try {
        //  Verificar autenticación y permisos
        const currentUser = await getUserFromSession(request);
        const isRoot = currentUser?.type === 'root';
        const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

        if (!currentUser || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        //  Obtener y validar ID del usuario
        const resolvedParams = await params;
        const userId = parseInt(resolvedParams.userId, 10);

        if (isNaN(userId) || userId <= 0) {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        //  Parsear y validar cuerpo de la petición
        const body: UpdateUserRequestBody = await request.json();
        const {
            name,
            last_name,
            birth_date,
            email,
            password,
            phone,
            user_type,
            blocked_until,
        } = body;

        //  Validaciones básicas
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        if (!last_name || last_name.trim() === '') {
            return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
        }

        if (!birth_date) {
            return NextResponse.json({ error: 'La fecha de nacimiento es obligatoria' }, { status: 400 });
        }

        if (!email || email.trim() === '') {
            return NextResponse.json({ error: 'El email es obligatorio' }, { status: 400 });
        }

        if (!phone || phone.trim() === '') {
            return NextResponse.json({ error: 'El teléfono es obligatorio' }, { status: 400 });
        }

        //  Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json({ error: 'El email no es válido' }, { status: 400 });
        }

        //  Validar formato de teléfono (9 dígitos)
        const phoneRegex = /^\d{9}$/;
        if (!phoneRegex.test(phone.trim())) {
            return NextResponse.json({ error: 'El teléfono debe tener 9 dígitos' }, { status: 400 });
        }

        //  Verificar que el usuario exista
        const existingUser = await prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                user_type: true,
                email: true,
                phone: true
            }
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        //  Verificar duplicados de email (excluyendo el propio usuario)
        const existingEmail = await prisma.user.findUnique({
            where: { email: email.trim() },
        });

        if (existingEmail && existingEmail.user_id !== userId) {
            return NextResponse.json({ error: 'Este email ya está en uso' }, { status: 400 });
        }

        //  Verificar duplicados de teléfono (excluyendo el propio usuario)
        const existingPhone = await prisma.user.findUnique({
            where: { phone: phone.trim() },
        });

        if (existingPhone && existingPhone.user_id !== userId) {
            return NextResponse.json({ error: 'Este teléfono ya está en uso' }, { status: 400 });
        }

        //  LÓGICA DE SEGURIDAD: Solo root puede cambiar el tipo de usuario
        let userTypeToSet: 'user' | 'librarian' | undefined = undefined;

        if (user_type !== undefined) {
            //  Validar valor permitido
            if (!['user', 'librarian'].includes(user_type)) {
                return NextResponse.json({ error: 'Tipo de usuario no válido' }, { status: 400 });
            }

            //  Solo root puede cambiar el tipo
            if (!isRoot) {
                return NextResponse.json({
                    error: 'Solo el superadministrador puede cambiar el tipo de usuario'
                }, { status: 403 });
            }

            //  Solo actualizar si hay cambio real
            if (user_type !== existingUser.user_type) {
                userTypeToSet = user_type;
            }
        }

        //  Preparar datos de actualización (100% tipado, sin any)
        const updateData: UpdateUserData = {
            name: name.trim(),
            last_name: last_name.trim(),
            birth_date: new Date(birth_date),
            email: email.trim(),
            phone: phone.trim(),
            blocked_until: blocked_until ? new Date(blocked_until) : null,
        };

        //  Añadir tipo de usuario si se va a cambiar
        if (userTypeToSet !== undefined) {
            updateData.user_type = userTypeToSet;
        }

        //  Añadir contraseña si se proporciona (con validación)
        if (password && password.trim() !== '') {
            if (password.trim().length < 6) {
                return NextResponse.json({
                    error: 'La contraseña debe tener al menos 6 caracteres'
                }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(password.trim(), 10);
        }

        //  Actualizar usuario en la base de datos
        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: updateData,
            select: {
                user_id: true,
                name: true,
                last_name: true,
                email: true,
                phone: true,
                birth_date: true,
                user_type: true,
                blocked_until: true,
                registration_date: true,
            },
        });

        //  Tipar respuesta para garantizar consistencia
        interface UpdateUserResponse {
            success: boolean;
            message: string;
            user: Pick<User,
                'user_id' | 'name' | 'last_name' | 'email' | 'phone' |
                'birth_date' | 'user_type' | 'blocked_until' | 'registration_date'
            >;
        }

        const responsePayload: UpdateUserResponse = {
            success: true,
            message: 'Usuario actualizado correctamente',
            user: updatedUser,
        };

        return NextResponse.json(responsePayload);

    } catch (error) {
        console.error('Error al actualizar usuario:', error);

        if (error instanceof Error) {
            if (error.message.includes('Record to update not found')) {
                return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
            }

            if (error.message.includes('Invalid `prisma.user.update()`')) {
                return NextResponse.json({
                    error: 'Datos inválidos para actualizar el usuario'
                }, { status: 400 });
            }
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}