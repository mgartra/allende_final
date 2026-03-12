// app/api/loans/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/auth';
import { createLoanWithValidation } from '@/lib/data/loans';

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromSession(req);

        //Validar si el usuario está autenticado

        if (!user || user.type !== 'user') {
            return NextResponse.json(
                { error: 'Debes iniciar sesión para hacer un préstamo' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { bookId, loanType } = body;

        //  Validar parámetros
        if (!bookId || !loanType) {
            return NextResponse.json(
                { error: 'ID del libro y tipo de préstamo son requeridos' },
                { status: 400 }
            );
        }

        //  Validar loanType
        if (loanType !== 'physical' && loanType !== 'digital') {
            return NextResponse.json(
                { error: 'Tipo de préstamo inválido. Debe ser "physical" o "digital"' },
                { status: 400 }
            );
        }

        // Función para crear un préstamo con todas las validaciones
        const result = await createLoanWithValidation(
            user.id,
            bookId,
            loanType as 'physical' | 'digital'
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error al crear préstamo:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}