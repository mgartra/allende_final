// src/lib/auth.ts
import prisma from '@/lib/prisma';
import { serialize } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Nombre de la sesión
const SESSION_COOKIE = 'allende_session';

// Duración de la sesión: 7 días (en segundos)
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

// Tipos de personas autenticadas (2 actores)
export type AuthUser =

    | {
        type: 'root';
        id: number;
        name: string;
        lastName: string;
        email: string;
    }
    | {
        type: 'user';
        id: number;
        name: string;
        lastName: string;
        email: string;
        userType: 'librarian' | 'user';
        blockedUntil?: Date | null;
    };

// Type guards para seguridad de tipos
export function isRootUser(user: AuthUser | null): user is Extract<AuthUser, { type: 'root' }> {
    return user?.type === 'root';
}

export function isRegularUser(user: AuthUser | null): user is Extract<AuthUser, { type: 'user' }> {
    return user?.type === 'user';
}

// Crea una sesión para guardar los datos del usuario en una cookie segura
export function createSession(res: NextResponse, user: AuthUser) {
    const sessionData = JSON.stringify({
        ...user,
        createdAt: Date.now(),
    });

    const cookie = serialize(SESSION_COOKIE, sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
    });

    res.headers.set('Set-Cookie', cookie);
}

// Obtiene la información del usuario desde la cookie (para API Routes)
export async function getUserFromSession(req: NextRequest) {
    const cookie = req.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie) return null;

    try {
        const session = JSON.parse(cookie);
        if (Date.now() - session.createdAt > SESSION_MAX_AGE * 1000) {
            return null;
        }
        return session as AuthUser;
    } catch {
        return null;
    }
}

// Obtiene la información del usuario desde la cookie (para Server Components)
export async function getUserFromCookies(cookieStore: ReadonlyRequestCookies) {
    const cookie = cookieStore.get(SESSION_COOKIE)?.value;
    if (!cookie) return null;

    try {
        const session = JSON.parse(cookie);

        // Verificar expiración
        if (Date.now() - session.createdAt > SESSION_MAX_AGE * 1000) {
            return null;
        }

        return session as AuthUser;
    } catch {
        return null;
    }
}

// Verificar credenciales 
export async function validateCredentials(email: string, password: string) {
    try {
        // 1. Buscar en Root (máxima prioridad)
        const root = await prisma.root.findUnique({ where: { email } });
        if (root) {
            const isValid = await compare(password, root.password);
            if (isValid) {
                return {
                    type: 'root' as const,
                    id: root.root_id,
                    name: root.name,
                    lastName: root.last_name,
                    email: root.email,
                };
            }
            return null;
        }

        // 2. Buscar en User (usuarios registrados, puede ser librarian o user )
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                user_id: true,
                name: true,
                last_name: true,
                email: true,
                password: true,
                user_type: true,
                blocked_until: true,
            }
        });

        if (!user || !user.password) {
            return null;
        }

        // Verificar si está bloqueado ANTES de validar contraseña
        if (user.blocked_until && new Date(user.blocked_until) > new Date()) {
            return {
                type: 'user' as const,
                id: user.user_id,
                name: user.name,
                lastName: user.last_name,
                email: user.email,
                userType: user.user_type,
                blockedUntil: user.blocked_until,
            };
        }

        const isValid = await compare(password, user.password);
        if (isValid) {
            return {
                type: 'user' as const,
                id: user.user_id,
                name: user.name,
                lastName: user.last_name,
                email: user.email,
                userType: user.user_type,
                blockedUntil: user.blocked_until || undefined,
            };
        }

        return null;
    } catch (error) {
        console.error('Error en validación de credenciales:', error);
        throw error;
    }
}

// Eliminar sesión (logout)
export function clearSession(res: NextResponse) {
    const cookie = serialize(SESSION_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
    });
    res.headers.set('Set-Cookie', cookie);
}

// ==================== SISTEMA DE PERMISOS ====================

// Verificar si usuario tiene permisos
export function hasPermission(
    user: AuthUser | null,
    requiredRoles: ('root' | 'librarian' | 'user')[]
): boolean {
    if (!user) return false;

    // Para root: siempre tiene todos los permisos
    if (user.type === 'root') {
        return true;
    }

    // Para usuarios: verificar userType
    const actualRole = user.userType; // TypeScript sabe que es 'librarian' | 'user'
    return requiredRoles.includes(actualRole);
}


export const isRoot = (user: AuthUser | null): boolean =>
    user?.type === 'root';

export const isLibrarian = (user: AuthUser | null): boolean =>
    isRegularUser(user) && user.userType === 'librarian';

export const isRegularUserOnly = (user: AuthUser | null): boolean =>
    isRegularUser(user) && user.userType === 'user';

// Verificar si usuario está bloqueado
export function isUserBlocked(user: AuthUser | null): boolean {
    if (!isRegularUser(user)) return false;

    if (user.blockedUntil) {
        return new Date(user.blockedUntil) > new Date();
    }

    return false;
}

// Verificar si usuario puede realizar préstamos (no bloqueado + es user común)
export function canBorrowBooks(user: AuthUser | null): boolean {
    return isRegularUserOnly(user) && !isUserBlocked(user);
}