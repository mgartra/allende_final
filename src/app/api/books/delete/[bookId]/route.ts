// app/api/books/delete/[bookId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const user = await getUserFromSession(req);
  const { bookId } = await params;
  const bookIdNum = parseInt(bookId, 10);

  // ✅ Verificar permisos (solo root/librarian)
  if (!user || !(user.type === 'root' || (user.type === 'user' && user.userType === 'librarian'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // ✅ Verificar que el libro exista y no tenga préstamos activos
  const book = await prisma.book.findUnique({
    where: { book_id: bookIdNum },
    include: { loans: { where: { status: 'borrowed' } } }
  });

  if (!book) {
    return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
  }

  if (book.loans.length > 0) {
    return NextResponse.json({ 
      error: `No se puede eliminar: hay ${book.loans.length} préstamo(s) activo(s)` 
    }, { status: 400 });
  }

  // ✅ Eliminar libro
  await prisma.book.delete({ where: { book_id: bookIdNum } });

  return NextResponse.json({ 
    success: true, 
    message: 'Libro eliminado correctamente' 
  });
}