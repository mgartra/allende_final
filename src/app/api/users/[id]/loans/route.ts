// /app/api/users/[id]/loans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import { LoanType } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const userId = parseInt(resolvedParams.id, 10);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'ID de usuario inválido' },
                { status: 400 }
            );
        }

        // Obtener usuario autenticado
        const cookieStore = await cookies();
        const currentUser = await getUserFromCookies(cookieStore);
        const isRoot = currentUser?.type === 'root';
        const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

        if (!currentUser) {  
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // 
        if (!currentUser || (!isRoot && !isLibrarian)) {
            return NextResponse.json(
                { error: 'No autorizado para ver los préstamos de este usuario' },
                { status: 403 }
            );
        }

        //  Obtener préstamos activos
        const loans = await prisma.loan.findMany({
            where: {
                user_id: userId,
                status: 'borrowed',
                return_date: { gt: new Date() } // Solo préstamos no vencidos
            },
            select: {
                loan_id: true,
                book: {
                    select: {
                        title: true,
                        isbn: true,
                        pdf_url: true,
                        authors: {select: {name:true, last_name:true}}
                    }
                },
                loan_date: true,
                loan_type: true,
                return_date: true,
                status: true
            },
            orderBy: { loan_date: 'desc' }
        });

        return NextResponse.json({
            success: true,
            loans,
            count: loans.length
        }, { status: 200 });

    } catch (error) {
        console.error('Error al obtener préstamos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}