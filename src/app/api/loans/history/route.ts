// app/api/loans/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/auth';
import  prisma  from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromSession(req);

        if (!user || user.type !== 'user') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener todos los préstamos del usuario con detalles del libro
        const loans = await prisma.loan.findMany({
            where: { 
                user_id: user.id,
                status: { in: ['borrowed', 'returned', 'overdue'] }
             },
            include: {
                book: {
                    select: { 
                        title: true,
                        pdf_url:true,
                        authors: { select: { name: true, last_name: true } }
                     }
                }
            },
            orderBy: { loan_date: 'desc' }
        });

        // Formatear para el frontend
        const formattedLoans = loans.map(loan => ({
            loan_id: loan.loan_id,
            book_title: loan.book.title,
            loan_date: loan.loan_date.toISOString(),
            return_date: loan.return_date.toISOString(),
            status: loan.status,
            loan_type: loan.loan_type,
            pdf_url:loan.book.pdf_url || null,
        }));

        return NextResponse.json({ loans: formattedLoans });
    } catch (error) {
        console.error('Error al obtener historial de préstamos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}