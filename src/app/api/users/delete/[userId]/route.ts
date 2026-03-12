// app/api/users/delete/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const currentUser = await getUserFromSession(request);
        const isRoot = currentUser?.type === 'root';
        const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

        if (!currentUser || (!isRoot && !isLibrarian)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }


        const resolvedParams = await params;
        const userId = parseInt(resolvedParams.userId, 10);

        if (isNaN(userId) || userId <= 0) {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        // Verifica que el usuario exista
        const existingUser = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                loans: true,
                event_reservations: true,
            },
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        //  Verifica que el usuario no tenga préstamos activos
        const activeLoans = existingUser.loans.filter(loan => loan.status === 'borrowed');

        if (activeLoans.length > 0) {
            return NextResponse.json({
                error: `No se puede eliminar el usuario "${existingUser.name} ${existingUser.last_name}" porque tiene ${activeLoans.length} préstamo(s) activo(s)`
            }, { status: 400 });
        }

        // Eliminar el usuario
        await prisma.user.delete({
            where: { user_id: userId },
        });

        return NextResponse.json({
            success: true,
            message: 'Usuario eliminado correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);

        if (error instanceof Error) {
            if (error.message.includes('Foreign key constraint')) {
                return NextResponse.json({
                    error: 'No se puede eliminar: el usuario tiene datos asociados (préstamos, reservas)'
                }, { status: 400 });
            }

            if (error.message.includes('Record to delete does not exist')) {
                return NextResponse.json({
                    error: 'Usuario no encontrado'
                }, { status: 404 });
            }
        }
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}