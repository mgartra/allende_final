// /app/api/loans/[id]/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const loanId = parseInt(resolvedParams.id, 10);

    if (isNaN(loanId)) {
      return NextResponse.json(
        { error: 'ID de préstamo inválido' },
        { status: 400 }
      );
    }

    // Obtener usuario autenticado
    const cookieStore = await cookies();
    const currentUser = await getUserFromCookies(cookieStore);
    const isRoot = currentUser?.type === 'root';
    const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

    if (!currentUser || (!isRoot && !isLibrarian)) {
      return NextResponse.json(  
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    //  Obtener préstamo
    const loan = await prisma.loan.findUnique({
      where: { loan_id: loanId },
      include: {
        book: {
          select: { title: true, isbn: true }
        },
        user: {
          select: { name: true, last_name: true }
        }
      }
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Préstamo no encontrado' },
        { status: 404 }
      );
    }

    // Validar permisos:
    
    if (!currentUser || (!isRoot && !isLibrarian)) {
      return NextResponse.json(
        { error: 'No autorizado para devolver este préstamo' },
        { status: 403 }
      );
    }

    //  Validar que el préstamo esté activo
    if (loan.status !== 'borrowed') {
      return NextResponse.json(
        { error: 'Este préstamo ya fue devuelto o está vencido' },
        { status: 400 }
      );
    }

    //  Actualizar estado a 'returned'
    const updatedLoan = await prisma.loan.update({
      where: { loan_id: loanId },
      data: {
        status: 'returned',
        return_date: new Date() // Fecha real de devolución
      }
    });


    return NextResponse.json(
      {
        success: true,
        message: `Libro "${loan.book.title}" devuelto correctamente`,
        loan: updatedLoan
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al devolver libro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}