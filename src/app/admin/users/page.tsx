// app/admin/users/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth'; 
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getAllUsersWithLoans } from '@/lib/data/users'; 
import { Grid, Typography } from '@mui/material';
import UsersTable from '@/components/adminComponents/UserTable'; 
import styles from './UsersPage.module.css';


interface Author {
    author_id: number;
    name: string;
    last_name: string;
    nationality: string | null;
}

interface Book {
    book_id: number;
    title: string;
    isbn: string | null;
    authors: Author[];
}

interface Loan {
    loan_id: number;
    book: Book;
    return_date: Date;
    status: 'borrowed' | 'returned' | 'overdue';
    loan_type: 'physical' | 'digital';
}

interface User {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: Date;
    registration_date: Date;
    blocked_until: Date | null;
    user_type: 'librarian' | 'user';
    loans: Loan[];
}

// Interfaz para mostrar en la tabla
interface UserDisplay {
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    user_type: string; // 'Bibliotecario' o 'Lector'
    birth_date: string; 
    registration_date: string; 
    active_loans: number;
    is_blocked: boolean;
}

export default async function UsersPage() {
    const cookieStore = await cookies();
    const currentUser = await getUserFromCookies(cookieStore);
    const isRoot = currentUser?.type === 'root';
    const isLibrarian = currentUser?.type === 'user' && currentUser.userType === 'librarian';

 
    if (!currentUser || (!isRoot && !isLibrarian)) {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2' color="error">Acceso denegado</Typography>
                <Typography variant='body1' sx={{ mt: 2 }}>
                    Solo el personal autorizado puede acceder a la gestión de usuarios.
                </Typography>
            </div>
        );
    }

    //  Obtener los usuarios con sus  préstamos
    const users = await getAllUsersWithLoans();

    //  Filtrar según rol (librarians solo ven lectores)
    const usersToShow = isRoot
        ? users
        : users.filter(u => u.user_type === 'user');

    // Transformar datos para la tabla (preprocesamiento en servidor)
    const usersDisplay: UserDisplay[] = usersToShow.map(user => ({
        user_id: user.user_id,
        full_name: `${user.name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type === 'librarian' ? 'Bibliotecario' : 'Lector',
        birth_date: new Date(user.birth_date).toLocaleDateString('es-ES'),
        registration_date: new Date(user.registration_date).toLocaleDateString('es-ES'),
        active_loans: user.loans?.filter(loan => loan.status === 'borrowed').length || 0,
        is_blocked: user.blocked_until ? new Date(user.blocked_until) > new Date() : false,
    }));

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{ xs: 11, md: 10 }}>
                <header className={styles.header}>
                    <div>
                        <Typography variant='h2'>Gestión de Usuarios</Typography>
                        <Typography variant='body1' color="text.secondary" sx={{ mt: 1 }}>
                            {isRoot
                                ? 'Usuarios lectores y bibliotecarios registrados en el sistema'
                                : 'Usuarios lectores registrados (los bibliotecarios solo pueden gestionar lectores)'
                            }
                        </Typography>
                    </div>
                    <div className={styles.headerActions}>
                       
                            <Link href="/admin/users/createU" className={styles.createButton}>
                                <Typography variant='body2'>
                                    + Crear nuevo usuario
                                </Typography>
                            </Link>
                        
                    </div>
                </header>

                <div className={styles.content}>
        
                    <UsersTable
                        users={usersDisplay}
                        currentUserIsRoot={isRoot} 
                    />
                </div>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
        </Grid>
    );
}