// /app/admin/users/edit/EditUserForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Grid, Typography } from '@mui/material';
import type { UserType } from '@prisma/client';
import InfoIcon from '@mui/icons-material/Info';

import styles from './EditUserPage.module.css';

interface User {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: Date;
    registration_date: Date;
    blocked_until: Date | null;
    user_type: UserType;
}

interface Loan {
    loan_id: number;
    book: {
        title: string;
        isbn: string;

    };
    return_date: Date;
    status: 'borrowed' | 'returned' | 'overdue';
    loan_type: 'physical' | 'digital';
}

interface EditUserFormProps {
    user: User;
    isRoot: boolean;
}

export default function EditUserForm({ user, isRoot }: EditUserFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loansLoading, setLoansLoading] = useState(true);
    const [loansError, setLoansError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user.name || '',
        last_name: user.last_name || '',
        birth_date: user.birth_date ? user.birth_date.toISOString().split('T')[0] : '',
        email: user.email || '',
        password: '', // Dejar vacío para no cambiar la contraseña
        phone: user.phone || '',
        user_type: user.user_type,
        blocked_until: user.blocked_until ? user.blocked_until.toISOString().slice(0, 16) : '',
    });

    //  Cargar los préstamos activos al iniciar el componente
    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const res = await fetch(`/api/users/${user.user_id}/loans?status=borrowed`);
                if (!res.ok) throw new Error('Error al cargar préstamos');
                const data = await res.json();
                setLoans(data.loans || []);
            } catch (err) {
                setLoansError(err instanceof Error ? err.message : 'Error desconocido al cargar préstamos');
                toast.error('Error al cargar préstamos', {
                    description: 'No se pudieron obtener los libros prestados del usuario',
                    duration: 4000,
                    icon: '📚',
                });
            } finally {
                setLoansLoading(false);
            }
        };

        fetchLoans();
    }, [user.user_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,

        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Validaciones

        if (!formData.name.trim()) {
            toast.error('Nombre obligatorio', {
                description: 'El nombre del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.last_name.trim()) {
            toast.error('Apellido obligatorio', {
                description: 'El apellido del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.birth_date) {
            toast.error('Fecha de nacimiento obligatoria', {
                description: 'Debes seleccionar una fecha de nacimiento',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Email obligatorio', {
                description: 'El email del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        //  Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            toast.error('Email inválido', {
                description: 'El formato del email no es válido (ej: usuario@email.com)',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.phone.trim()) {
            toast.error('Teléfono obligatorio', {
                description: 'El teléfono del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        //  Validar formato de teléfono (9 dígitos)
        const phoneRegex = /^\d{9}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
            toast.error('Teléfono inválido', {
                description: 'El teléfono debe tener exactamente 9 dígitos (sin espacios ni guiones)',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        //  Validar contraseña 
        if (formData.password && formData.password.length < 6) {
            toast.error('Contraseña demasiado corta', {
                description: 'La contraseña debe tener al menos 6 caracteres',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        setIsLoading(true);

        try {

            const toastId = toast.loading('Actualizando usuario...', {
                description: 'Procesando tus cambios',
            });

            const response = await fetch(`/api/users/update/${user.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {

                toast.success('Usuario actualizado', {
                    id: toastId,
                    description: `✅ "${data.user.name} ${data.user.last_name}" actualizado correctamente`,
                    duration: 3500,
                    icon: '👤',
                });


                setTimeout(() => {
                    router.push('/admin/users');
                }, 1500);
            } else {

                toast.error('Error al actualizar', {
                    id: toastId,
                    description: data.error || 'No se pudo actualizar el usuario. Intenta nuevamente.',
                    duration: 5000,
                    icon: '❌',
                });
            }
        } catch (err) {
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al actualizar usuario:', err);
        } finally {
            setIsLoading(false);
        }
    };

    //Función para devolver el libro
    const handleReturnBook = async (loanId: number, bookTitle: string) => {
        if (!confirm(`¿Estás seguro de que quieres marcar "${bookTitle}" como devuelto?`)) {
            return;
        }
        try {
            const toastId = toast.loading('Procesando devolución...', {
                description: `Marcando "${bookTitle}" como devuelto`,
            });

            const response = await fetch(`/api/loans/${loanId}/return`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al procesar la devolución');
            }

            //  Actualizar estado local: eliminar préstamo de la lista
            setLoans(prev => prev.filter(loan => loan.loan_id !== loanId));

            toast.success('Libro devuelto', {
                id: toastId,
                description: `✅ "${bookTitle}" marcado como devuelto correctamente`,
                duration: 3500,
                icon: '📚',
            });
        } catch (err) {
            toast.error('Error al devolver libro', {
                description: err instanceof Error ? err.message : 'Intenta nuevamente',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al devolver libro:', err);
        }
    }


    return (
        <Grid container >

            <Grid size={12}>
                <Grid container className={styles.container}>
                    <Grid size={{ xs: 0.5, md: 1 }}></Grid>
                    <Grid size={{ xs: 11, md: 10 }} >
                        <form onSubmit={handleSubmit} className={styles.form}>


                            <div className={styles.formGroup}>
                                <label htmlFor="name">Nombre *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    placeholder="Ej: Juan"
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="last_name">Apellido *</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    placeholder="Ej: Pérez"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="birth_date">Fecha de Nacimiento *</label>
                                <input
                                    type="date"
                                    id="birth_date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    placeholder="ejemplo@email.com"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password">Nueva Contraseña (opcional)</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                    disabled={isLoading}
                                    placeholder="Dejar vacío para no cambiar"
                                    minLength={6}
                                />
                                <Typography variant='caption' className={styles.helpText}>Solo rellena si quieres cambiar la contraseña</Typography>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Teléfono *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    placeholder="123456789"
                                    pattern="\d{9}"
                                />
                            </div>
                            {isRoot && (
                                <div className={styles.formGroup}>
                                    <div className={styles.optionUsers}>
                                        {/* Opción:lector */}
                                        <label className={styles.radioLabel}>
                                            <input
                                                type='radio'
                                                name='user_type'
                                                value='user'
                                                checked={formData.user_type === 'user'}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    user_type: e.target.value as 'user' | 'librarian'
                                                }))}
                                                required
                                            />
                                            <span className={styles.radioText}>¿Es usuaria o usuario? *</span>
                                        </label>


                                        {/* Opción: Bibliotecario */}

                                        <label className={styles.radioLabel}>
                                            <input
                                                type='radio'
                                                name='user_type'
                                                value='librarian'
                                                checked={formData.user_type === 'librarian'}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    user_type: e.target.value as 'user' | 'librarian'
                                                }))}
                                                required
                                            />

                                            <span className={styles.radioText}>¿Es bibliotecaria o bibliotecario? *</span>
                                        </label>

                                    </div>
                                </div>
                            )}
                            {/* Si no es root mostrar siempre fijo el valor de usuario lector */}
                            {!isRoot && (
                                <input type='hidden' name='user_type' value='user' />
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="blocked_until">Bloqueado hasta (opcional)</label>
                                <input
                                    type="datetime-local"
                                    id="blocked_until"
                                    name="blocked_until"
                                    value={formData.blocked_until}
                                    onChange={handleChange}
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                                <Typography variant='caption' className={styles.helpText}>
                                    {formData.blocked_until
                                        ? 'El usuario está bloqueado hasta esta fecha'
                                        : 'Dejar vacío para desbloquear al usuario'}
                                </Typography>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/users')}
                                    className={styles.cancelButton}
                                    disabled={isLoading}
                                ><Typography variant='body2'>  Cancelar</Typography>

                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={isLoading}
                                ><Typography variant='body2'>  {isLoading ? 'Guardando...' : 'Guardar cambios'} </Typography>

                                </button>
                            </div>
                        </form>
                    </Grid>
                    <Grid size={11} className={styles.loansSection}>

                        {/* Tabla de libros físicos prestados */}

                        <Typography variant='h3' className={styles.sectionTitle}>Libros prestados actualmente</Typography>

                        {loansLoading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.spinner}></div>
                                <Typography variant='body2'>Cargando préstamos activos...</Typography>
                            </div>
                        ) : loansError ? (
                            <div className={styles.errorState}>
                                <Typography variant='body2'>❌ {loansError}</Typography>
                                <button
                                    onClick={() => window.location.reload()}
                                    className={styles.retryButton}
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : loans.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Typography variant='body2'>Este usuario no tiene libros físicos prestados actualmente</Typography>
                            </div>
                        ) : (
                            <div className={styles.tableContainer}>
                                <table className={styles.loansTable}>
                                    <thead>
                                        <tr>
                                        
                                            <th><Typography variant='h5'>Título del libro</Typography></th>
                                            <th><Typography variant='h5'>Tipo</Typography></th>
                                            <th><Typography variant='h5'>Fecha devolución</Typography></th>
                                            <th><Typography variant='h5'>Acciones</Typography></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loans.map((loan) => (
                                            <tr key={loan.loan_id}>
    
                                                <td><Typography variant='body2'>{loan.book?.title}</Typography></td>
                                                <td>

                                                    <span className={
                                                        loan.loan_type === 'physical'
                                                            ? styles.physicalBadge
                                                            : styles.digitalBadge
                                                    }> <Typography variant='body2'>
                                                            {loan.loan_type === 'physical' ? 'Físico' : 'Digital'}
                                                        </Typography></span>
                                                </td>
                                                <td><Typography variant='body2'>
                                                    {new Date(loan.return_date).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}</Typography>
                                                </td>
                                                <td className={styles.actionsCell}>
                                                    <button
                                                        onClick={() => handleReturnBook(loan.loan_id, loan.book?.title)}
                                                        className={styles.returnButton}
                                                        aria-label={`Devolver ${loan.book?.title}`}
                                                    ><Typography variant='body2'>
                                                            Devolver
                                                        </Typography>
                                                    </button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={styles.infoNote}>
                                    <div><InfoIcon /></div>
                                    <div><Typography variant='caption'>Los libros digitales se bloquean automáticamente al expirar el préstamo. Solo los préstamos físicos requieren devolución manual.</Typography></div>

                                </div>
                            </div>
                        )}
                    </Grid>
                    <Grid size={{ xs: 0.5, md: 1 }}></Grid>
                </Grid>

            </Grid>

        </Grid>
    );
} 