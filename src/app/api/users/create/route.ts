// app/api/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth'; 
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';


interface CreateUserRequestBody {
    name: string;
    last_name: string;
    birth_date: string; // ISO string
    email: string;
    password: string; // Obligatorio para creación
    phone: string;
    user_type?: 'user' | 'librarian'; // Opcional, solo root puede enviar 'librarian'
    blocked_until?: string | null; // ISO string o null
}


interface CreateUserData {
    name: string;
    last_name: string;
    birth_date: Date;
    email: string;
    password: string; // Hashed
    phone: string;
    user_type: 'user' | 'librarian'; // Siempre definido (default: 'user')
    blocked_until: Date | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> { 
    try {

        const currentUser = await getUserFromSession(request);
        const isRoot = currentUser?.type === 'root';
        const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

        if (!currentUser || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        //  Parsear y validar cuerpo de la petición
        const body: CreateUserRequestBody = await request.json();
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

        if (!password || password.trim() === '') {
            return NextResponse.json({ error: 'La contraseña es obligatoria' }, { status: 400 });
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

        //  Validar longitud de contraseña
        if (password.trim().length < 6) {
            return NextResponse.json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            }, { status: 400 });
        }

        //  Verificar que el email no exista
        const existingEmail = await prisma.user.findUnique({
            where: { email: email.trim() },
        });

        if (existingEmail) {
            return NextResponse.json({ error: 'Este email ya está en uso' }, { status: 400 });
        }

        //  Verificar que el teléfono no exista
        const existingPhone = await prisma.user.findUnique({
            where: { phone: phone.trim() },
        });

        if (existingPhone) {
            return NextResponse.json({ error: 'Este teléfono ya está en uso' }, { status: 400 });
        }

        //  LÓGICA DE SEGURIDAD CRÍTICA: Determinar user_type según permisos
        let userTypeToSet: 'user' | 'librarian' = 'user'; 

        if (user_type) {
            //  Validar valor permitido
            if (!['user', 'librarian'].includes(user_type)) {
                return NextResponse.json({ error: 'Tipo de usuario no válido' }, { status: 400 });
            }

            //  Solo root puede crear bibliotecarios
            if (user_type === 'librarian' && !isRoot) {
                return NextResponse.json({
                    error: 'Solo el superadministrador puede crear bibliotecarios'
                }, { status: 403 });
            }

            userTypeToSet = user_type;
        } else {
            //  Si no se especifica, los librarians solo pueden crear lectores
            if (!isRoot && isLibrarian) {
                userTypeToSet = 'user';
            }
            //  Si es root y no especifica, usamos 'user' por defecto (seguro)
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        // Preparar datos de creación (100% tipado, sin any)
        const createData: CreateUserData = {
            name: name.trim(),
            last_name: last_name.trim(),
            birth_date: new Date(birth_date),
            email: email.trim(),
            password: hashedPassword,
            phone: phone.trim(),
            user_type: userTypeToSet, // ✅ Siempre definido
            blocked_until: blocked_until ? new Date(blocked_until) : null,
        };

        //  Crear usuario en la base de datos
        const newUser = await prisma.user.create({
            data: createData,
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
        interface CreateUserResponse {
            success: boolean;
            message: string;
            user: Pick<User,
                'user_id' | 'name' | 'last_name' | 'email' | 'phone' |
                'birth_date' | 'user_type' | 'blocked_until' | 'registration_date'
            >;
        }

        const responsePayload: CreateUserResponse = {
            success: true,
            message: 'Usuario creado correctamente',
            user: newUser,
        };

        return NextResponse.json(responsePayload, { status: 201 });

    } catch (error) {
        console.error('Error al crear usuario:', error);

        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                return NextResponse.json({
                    error: 'Este usuario ya existe (restricción única violada)'
                }, { status: 400 });
            }

            if (error.message.includes('Invalid `prisma.user.create()`')) {
                return NextResponse.json({
                    error: 'Datos inválidos para crear el usuario'
                }, { status: 400 });
            }
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}