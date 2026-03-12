import prisma from '@/lib/prisma';
import type { LoanType } from '@prisma/client';

// Tipos para respuestas estructuradas
interface ActiveLoan {
    loan_id: number;
    book_id: number;
    loan_type: LoanType;
    return_date: Date;
}

interface LoanCreationResult {
    success: true;
    message: string;
    loan: {
        loan_id: number;
        loan_type: LoanType;
        return_date: Date;
    };
}

/**
 * Verificar si el usuario tiene préstamos vencidos
 */
export async function hasOverdueLoans(userId: number): Promise<boolean> {
    const overdueLoans = await prisma.loan.findMany({
        where: {
            user_id: userId,
            status: 'overdue',
        },
    });

    return overdueLoans.length > 0;
}

/**
 * Verificar si el usuario ya tiene un préstamo activo de un libro específico
 */
export async function hasActiveLoanForBook(
    userId: number,
    bookId: number
): Promise<boolean> {
    const activeLoan = await prisma.loan.findFirst({
        where: {
            user_id: userId,
            book_id: bookId,
            status: 'borrowed',
        },
    });

    return activeLoan !== null;
}

/**
 * Obtener todos los préstamos activos del usuario con detalles mínimos
 */
export async function getUserActiveLoans(userId: number): Promise<ActiveLoan[]> {
    return await prisma.loan.findMany({
        where: {
            user_id: userId,
            status: 'borrowed',
        },
        select: {
            loan_id: true,
            book_id: true,
            loan_type: true,
            return_date: true,
        },
        orderBy: { loan_date: 'desc' },
    });
}

/**
 * Verificar si el usuario está bloqueado
 */
export async function isUserBlocked(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { blocked_until: true },
    });

    if (!user || !user.blocked_until) {
        return false;
    }

    return new Date() < user.blocked_until;
}

/**
 * Obtener la fecha de desbloqueo del usuario
 */
export async function getUserBlockExpiry(
    userId: number
): Promise<Date | null> {
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { blocked_until: true },
    });

    return user?.blocked_until || null;
}

/**
 * Bloquear usuario por préstamos vencidos
 * @param userId ID del usuario
 * @param days Días de bloqueo (por defecto 7)
 */
export async function blockUserForOverdue(
    userId: number,
    days: number = 7
): Promise<Date> {
    const blockUntil = new Date();
    blockUntil.setDate(blockUntil.getDate() + days);

    await prisma.user.update({
        where: { user_id: userId },
        data: { blocked_until: blockUntil },
    });

    return blockUntil;
}

/**
 * Desbloquear usuario
 */
export async function unblockUser(userId: number): Promise<void> {
    await prisma.user.update({
        where: { user_id: userId },
    data: { blocked_until: null },
  });
}

/**
 * Verificar si el libro tiene copias disponibles
 */
export async function hasAvailableCopies(bookId: number): Promise<boolean> {
    const book = await prisma.book.findUnique({
        where: { book_id: bookId },
        select: { available_copies: true },
    });

    return (book?.available_copies ?? 0) > 0;
}

/**
 * Obtener detalles completos de un préstamo con información del libro y usuario
 */
export async function getLoanWithDetails(loanId: number) {
    return await prisma.loan.findUnique({
        where: { loan_id: loanId },
        include: {
            book: {
                select: {
                    book_id: true,
                    title: true,
                    isbn: true,
                    image: true,
                    authors: {
                        select: { author_id: true, name: true, last_name: true },
                    },
                },
            },
            user: {
                select: {
                    user_id: true,
                    name: true,
                    last_name: true,
                    email: true,
                    user_type: true,
                },
            },
        },
    });
}

/**
 * Crear un préstamo con validaciones completas
 */
export async function createLoanWithValidation(
    userId: number,
    bookId: number,
    loanType: LoanType
): Promise<LoanCreationResult> {
    // Validación 1: Verificar si el usuario está bloqueado
    const isBlocked = await isUserBlocked(userId);
    if (isBlocked) {
        const blockExpiry = await getUserBlockExpiry(userId);
        if (blockExpiry) {
            const daysRemaining = Math.ceil(
                (blockExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            throw new Error(
                `Tu cuenta está bloqueada temporalmente por préstamos vencidos. ` +
                `Podrás solicitar nuevos préstamos en ${daysRemaining} día(s).`
            );
        }
        throw new Error('Tu cuenta está bloqueada temporalmente.');
    }

    // Validación 2: Verificar si tiene préstamos vencidos
    const hasOverdue = await hasOverdueLoans(userId);
    if (hasOverdue) {
        // Bloquear usuario por 7 días
        await blockUserForOverdue(userId, 7);
        throw new Error(
            'Tienes préstamos vencidos pendientes. ' +
            'Tu cuenta ha sido bloqueada temporalmente por 7 días.'
        );
    }

    // Validación 3: Verificar si ya tiene un préstamo activo del mismo libro
    const hasActiveLoan = await hasActiveLoanForBook(userId, bookId);
    if (hasActiveLoan) {
        throw new Error(
            'Ya tienes un préstamo activo de este libro. ' +
            'No puedes solicitar otro hasta que lo devuelvas.'
        );
    }

    // Validación 4: Verificar copias disponibles (solo para préstamos físicos)
    if (loanType === 'physical') {
        const hasCopies = await hasAvailableCopies(bookId);
        if (!hasCopies) {
            throw new Error('No hay copias físicas disponibles de este libro');
        }
    }

    // Calcular fechas de préstamo
    const loanDate = new Date();
    const returnDate = new Date(loanDate);

    // Reglas de negocio: 
    // - Préstamos digitales: 21 días
    // - Préstamos físicos: 14 días
    const daysToAdd = loanType === 'digital' ? 21 : 14;
    returnDate.setDate(returnDate.getDate() + daysToAdd);

    // Crear el préstamo
    const loan = await prisma.loan.create({
        data: {
            user_id: userId,
            book_id: bookId,
            loan_date: loanDate,
            return_date: returnDate,
            status: 'borrowed',
            loan_type: loanType,
        },
    });

    // Actualizar copias disponibles (solo para préstamos físicos)
    if (loanType === 'physical') {
        await prisma.book.update({
            where: { book_id: bookId },
            data: {
                available_copies: {
                    decrement: 1,
                },
            },
        });
    }

    return {
        success: true,
        message:
            loanType === 'digital'
                ? 'Préstamo digital realizado correctamente. Tienes 21 días para devolverlo.'
                : 'Préstamo físico realizado correctamente. Recoge el libro en la biblioteca.',
        loan: {
            loan_id: loan.loan_id,
            loan_type: loan.loan_type,
            return_date: loan.return_date,
        },
    };
}

/**
 * Registrar devolución de un préstamo
 */
export async function returnLoan(loanId: number): Promise<void> {
    // Obtener el préstamo actual
    const loan = await prisma.loan.findUnique({
        where: { loan_id: loanId },
        select: {
            loan_id: true,
            book_id: true,
            loan_type: true,
            status: true,
        },
    });

    if (!loan) {
        throw new Error('Préstamo no encontrado');
    }

    if (loan.status === 'returned') {
        throw new Error('Este préstamo ya ha sido devuelto');
    }

    // Actualizar estado del préstamo
    await prisma.loan.update({
        where: { loan_id: loanId },
        data: {
            status: 'returned',
            return_date: new Date(), // Actualizar fecha de devolución real
        },
    });

    // Incrementar copias disponibles (solo para préstamos físicos)
    if (loan.loan_type === 'physical') {
        await prisma.book.update({
            where: { book_id: loan.book_id },
            data: {
                available_copies: {
                    increment: 1,
                },
            },
        });
    }
}

/**
 * Marcar préstamos vencidos automáticamente
 * (Ejecutar periódicamente mediante cron job o API route)
 */
export async function markOverdueLoans(): Promise<number> {
    const today = new Date();

    const result = await prisma.loan.updateMany({
        where: {
            status: 'borrowed',
            return_date: { lt: today },
        },
        data: {
            status: 'overdue',
        },
    });

    return result.count;
}