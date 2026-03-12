// /app/components/details/DetailsBook.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import type { AuthUser } from '@/lib/auth/auth';
import type { Book } from '@prisma/client';
import LoanTypeModal from '@/components/loans/LoanTypeModal';
import { Grid, Box, Typography, Button, Card, CardContent, CardMedia, Alert, CircularProgress, Chip, Divider } from '@mui/material';
import styles from './DetailsBook.module.css';
import Image from 'next/image';

// Definir tipos para las relaciones
interface BookWithRelations extends Book {
    authors: { name: string; last_name: string }[];
    categories: { name: string }[];
}

interface BookDetailClientProps {
    book: BookWithRelations;
    user: AuthUser | null;
}

export default function DetailsBook({ book, user: initialUser }: BookDetailClientProps) {
    const [loanModalOpen, setLoanModalOpen] = useState(false);
    const [processingLoan, setProcessingLoan] = useState(false);
    const [hasActiveLoan, setHasActiveLoan] = useState(false);
    const { user: currentUser, loading: authLoading } = useAuth();
    const [userStatus, setUserStatus] = useState({
        hasOverdueLoans: false,
        isBlocked: false,
        daysRemaining: 0,
        canBorrow: true
    });

    // Verificar el estado del usuario al montar y si tiene un préstamo activo
    useEffect(() => {
        if (currentUser) {
            fetchUserStatus();
            checkActiveLoan();
        }
    }, [currentUser, book.book_id]);

    const fetchUserStatus = async () => {
        try {
            const res = await fetch('/api/loans/user-status');
            if (res.ok) {
                const data = await res.json();
                setUserStatus(data);
            }
        } catch (err) {
            console.error('Error al obtener estado del usuario:', err);
            toast.error('Error al cargar tu estado', {
                description: 'No se pudo verificar tu situación de préstamos',
                duration: 4000,
                icon: '❌',
            });
        }
    };

    const checkActiveLoan = async () => {
        try {
            const res = await fetch('/api/loans/active');
            if (res.ok) {
                const data = await res.json();
                // Verificar si este libro está en los préstamos activos
                const isActive = data.allActiveLoans.includes(book.book_id);
                setHasActiveLoan(isActive);
            }
        } catch (err) {
            console.error('Error al verificar préstamo activo:', err);
        }
    };

    const handleLoanClick = () => {
        if (!currentUser) {
            toast.warning('Inicia sesión para solicitar préstamos', {
                description: 'Debes estar registrado para poder solicitar libros',
                duration: 4000,
                icon: '⚠️',
            });
            return;
        }

        // Verificar si el usuario está bloqueado
        if (userStatus.isBlocked) {
            toast.error('Cuenta bloqueada', {
                description: `Podrás solicitar préstamos en ${userStatus.daysRemaining} día(s)`,
                duration: 5000,
                icon: '🔒',
            });
            return;
        }

        // Verificar si tiene préstamos vencidos
        if (userStatus.hasOverdueLoans) {
            toast.error('Préstamos vencidos', {
                description: 'Tienes préstamos pendientes. Regulariza tu situación primero',
                duration: 5000,
                icon: '⚠️',
            });
            return;
        }

        // Verificar si ya tiene este libro prestado
        if (hasActiveLoan) {
            toast.warning('Libro ya prestado', {
                description: 'Ya tienes este libro en préstamo. Devuélvelo para solicitar otro',
                duration: 4000,
                icon: '📚',
            });
            return;
        }

        setLoanModalOpen(true);
    };

    const handlePhysicalLoan = async () => {
        try {
            setProcessingLoan(true);

            const toastId = toast.loading('Solicitando préstamo físico...', {
                description: 'Preparando tu libro para recoger en biblioteca',
            });

            const res = await fetch('/api/loans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: book.book_id,
                    loanType: 'physical'
                })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('¡Préstamo confirmado!', {
                    id: toastId,
                    description: data.message || 'Puedes recoger tu libro en la biblioteca',
                    duration: 4000,
                    icon: '✅',
                });

                // Actualiza el estado local
                setHasActiveLoan(true);

                setTimeout(() => {
                    setLoanModalOpen(false);
                }, 2000);
            } else {
                toast.error('Error en el préstamo', {
                    id: toastId,
                    description: data.error || 'No se pudo procesar tu solicitud',
                    duration: 5000,
                    icon: '❌',
                });
            }
        } catch (err) {
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Intenta nuevamente',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al realizar préstamo físico:', err);
        } finally {
            setProcessingLoan(false);
        }
    };

    const handleDigitalLoan = async () => {
        try {
            const toastId = toast.loading('Solicitando préstamo digital...', {
                description: 'Preparando tu libro para lectura online',
            });

            const res = await fetch('/api/loans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: book.book_id,
                    loanType: 'digital'
                })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('¡Libro digital listo!', {
                    id: toastId,
                    description: data.message || 'Puedes leer tu libro en la sección "Mis préstamos"',
                    duration: 4000,
                    icon: '📖',
                });

                setHasActiveLoan(true);

                setTimeout(() => {
                    setLoanModalOpen(false);
                }, 2000);
            } else {
                toast.error('Error en el préstamo', {
                    id: toastId,
                    description: data.error || 'No se pudo procesar tu solicitud',
                    duration: 5000,
                    icon: '❌',
                });
            }
        } catch (err) {
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Intenta nuevamente',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al realizar préstamo digital:', err);
        }
    };

    return (
        <Grid container spacing={2} >
            <Grid size={0.5}></Grid>
            <Grid size={11}>
                <Grid container spacing={6} className={styles.mainGrid}>
                    {/* Portada del libro */}

                    <Grid size={{ xs: 12, md: 4, lg: 3.5 }} >
                        <Box className={styles.stickyContainer}>
                            <Box className={styles.imageWrapper}>
                                <Image src={book.image ? `/images/books/${book.image}` : '/placeholder-book.jpg'}
                                    alt={book.title}
                                    width={320}
                                    height={480}
                                    className={styles.bookImage}
                                ></Image>
                            </Box>
                            <Box className={styles.availabilityBadge}>
                                {book.available_copies > 0 ? (
                                    <Chip label={`${book.available_copies} Disponibles`} className={styles.chipAvailable} />
                                ) : (
                                    <Chip label="Agotado" className={styles.chipEmpty} />
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Información del libro */}
                    <Grid size={{ xs: 12, md: 8, lg: 8.5 }} >
                        <Box className={styles.infoContent}>
                            {/* Título */}
                            <Typography variant="h2" className={styles.title}>
                                {book.title}
                            </Typography>
                            {/* Autor */}
                            <Box className={styles.authorList}>
                                {book.authors.map((a, i) => (
                                    <Typography key={i} variant="h6" className={styles.authorName}>
                                        {a.name} {a.last_name}
                                    </Typography>
                                ))}
                            </Box>
                            <Box className={styles.tagCloud}>
                                {book.categories.map((c, i) => (
                                    <Chip key={i} label={c.name} variant="outlined" className={styles.categoryTag} />
                                ))}
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            {/* Detalles */}
                            <Typography variant="body1" className={styles.synopsis}>
                                {/* Aquí iría la descripción real del libro */}
                                Esta obra maestra de la literatura nos sumerge en una narrativa profunda y cautivadora. {book.title} representa un pilar fundamental en su temática, ofreciendo al lector una perspectiva única y enriquecedora.
                            </Typography>
                            <Box className={styles.specsGrid}>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>ISBN</span>
                                    <span className={styles.specValue}>{book.isbn}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>Publicación</span>
                                    <span className={styles.specValue}>{book.publication_year || 'N/A'}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>Referencia</span>
                                    <span className={styles.specValue}>{book.reference} ⭐</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>Colección</span>
                                    <span className={styles.specValue}>{book.total_copies} ejem.</span>
                                </div>
                            </Box>
                            {/* Alertas de Estado */}
                            <Box sx={{ mt: 4 }}>
                                {userStatus.isBlocked && (
                                    <Alert severity="error" variant="outlined" className={styles.customAlert}>
                                        Cuenta bloqueada. Disponible en {userStatus.daysRemaining} días.
                                    </Alert>
                                )}
                                {hasActiveLoan && (
                                    <Alert severity="info" variant="outlined" className={styles.customAlert}>
                                        Ya posees un ejemplar de esta obra.
                                    </Alert>
                                )}
                            </Box>
                            {/* Botón de Acción */}
                            <Box sx={{ mt: 6 }}>
                                <Button
                                    variant="contained"
                                    className={styles.actionButton}
                                    onClick={handleLoanClick}
                                    disabled={processingLoan || !userStatus.canBorrow || hasActiveLoan || book.available_copies === 0}
                                >
                                    {processingLoan ? <CircularProgress size={24} color="inherit" /> : 'Solicitar Lectura'}
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Modal para elegir el tipo de préstamo */}
                    <LoanTypeModal
                        open={loanModalOpen}
                        onClose={() => setLoanModalOpen(false)}
                        onPhysicalLoan={handlePhysicalLoan}
                        onDigitalLoan={handleDigitalLoan}
                        bookTitle={book.title}
                    />

                </Grid>
            </Grid>
            <Grid size={0.5}></Grid>

        </Grid>
    );
}