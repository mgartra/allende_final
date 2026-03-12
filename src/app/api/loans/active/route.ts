// app/api/loans/active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/auth';
import { getUserActiveLoans } from '@/lib/data/loans';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromSession(req);

        if (!user || user.type !== 'user') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener préstamos activos del usuario
        const activeLoans = await getUserActiveLoans(user.id);

        // Separar préstamos físicos y digitales
        const physicalLoans = activeLoans
            .filter(loan => loan.loan_type === 'physical')
            .map(loan => ({
                book_id: loan.book_id,
                loan_id: loan.loan_id,
                return_date: loan.return_date
            }));

        const digitalLoans = activeLoans
            .filter(loan => loan.loan_type === 'digital')
            .map(loan => ({
                book_id: loan.book_id,
                loan_id: loan.loan_id,
                return_date: loan.return_date
            }));

        return NextResponse.json({
            physicalLoans,
            digitalLoans,
            allActiveLoans: activeLoans.map(loan => loan.book_id)
        });
    } catch (error) {
        console.error('Error al obtener préstamos activos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}