import prisma from '@/lib/prisma';


/** 
 * Función para obtener todos los usuarios (lectores y bibliotecarios)
 */
export async function getAllUsers() {
    return await prisma.user.findMany({
        select: {
            user_id: true,
            name: true,
            last_name: true,
            email: true,
            phone: true,
            birth_date: true,
            registration_date: true,
            blocked_until: true,
            user_type: true
        },
        orderBy: { name: 'asc' }
    });
}

/** 
 * Función para obtener solo usuarios lectores
 */

export async function getAllRegularUsers() {
  return await prisma.user.findMany({
    where: { user_type: 'user' }, 
    select: {
      user_id: true,
      name: true,
      last_name: true,
      email: true,
      phone: true,
      birth_date: true,
      registration_date: true,
      blocked_until: true,
      user_type: true,
    },
    orderBy: { name: 'asc' },
  });
}

/** 
 * Función para obtener solo bibliotecarios
 */
export async function getAllLibrarians() {
  return await prisma.user.findMany({
    where: { user_type: 'librarian' }, 
    select: {
      user_id: true,
      name: true,
      last_name: true,
      email: true,
      phone: true,
      birth_date: true,
      registration_date: true,
      blocked_until: true,
      user_type: true,
    },
    orderBy: { name: 'asc' },
  });
}


/** 
 * Función para obtener usuario por id
 */

export async function getUserById(userId: number) {
    return await prisma.user.findUnique({
        where: { user_id: userId },
        select: {
            user_id: true,
            name: true,
            last_name: true,
            email: true,
            phone: true,
            birth_date: true, 
            registration_date: true,
            blocked_until: true,
            user_type: true
        },
    });
}



/** 
 * Función para obtener usuarios con sus préstamos activos
 */
export async function getAllUsersWithLoans() {
  return await prisma.user.findMany({
    select: {
      user_id: true,
      name: true,
      last_name: true,
      email: true,
      phone: true,
      birth_date: true,
      registration_date: true,
      blocked_until: true,
      user_type: true,

      loans: {
        where: { 
          status: 'borrowed',
          return_date: { gt: new Date() } // Solo préstamos no vencidos
        },
        select: {
          loan_id: true,
          book: {
            select: {
              title: true,
              isbn: true
            }
          },
          loan_date: true,
          return_date: true,
          loan_type: true,
          status:true,
        },
        orderBy: { loan_date: 'desc' }
      }
    },
    orderBy: { registration_date: 'desc' }
  });
}

