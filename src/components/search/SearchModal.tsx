// /app/components/search/SearchModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import LoanTypeModal from '../loans/LoanTypeModal';
import { 
    Modal, 
    Box, 
    TextField, 
    Grid, 
    Card, 
    CardMedia, 
    CardContent, 
    Typography, 
    CircularProgress, 
    Alert, 
    Button, 
    IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './SearchModal.module.css';

interface BookLocal {
    book_id: number;
    title: string;
    publication_year: number | null;
    image: string;
    isbn: string;
    total_copies: number;
    available_copies: number;
    reference: number;
    created_at: Date;
    authors: string;
    categories: string;
}

interface ActiveLoan {
    book_id: number;
    loan_id: number;
    return_date: string;
    loan_type: 'physical' | 'digital';
}

interface ActiveLoansResponse {
    physicalLoans: ActiveLoan[];
    digitalLoans: ActiveLoan[];
    allActiveLoans: number[];
}

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState<BookLocal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loanModalOpen, setLoanModalOpen] = useState(false);
    const [selectedBookForLoan, setSelectedBookForLoan] = useState<BookLocal | null>(null);
    const [processingLoan, setProcessingLoan] = useState<number | null>(null);
    const [borrowedBooks, setBorrowedBooks] = useState<number[]>([]);
    const [physicalLoans, setPhysicalLoans] = useState<number[]>([]);
    const [allActiveLoans, setAllActiveLoans] = useState<number[]>([]);
    const lastQueryRef = useRef<string>('');
    const [userStatus, setUserStatus] = useState({
        hasOverdueLoans: false,
        isBlocked: false,
        daysRemaining: 0,
        canBorrow: true
    });

    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Obtener estado del usuario y préstamos activos cuando el modal se abre
    useEffect(() => {
        if (open && user) {
            fetchUserStatus();
            fetchActiveLoans();
        }
    }, [open, user]);

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

    const fetchActiveLoans = async () => {
        try {
            const res = await fetch('/api/loans/active');
            if (res.ok) {
                const data: ActiveLoansResponse = await res.json();
                setPhysicalLoans(data.physicalLoans.map(l => l.book_id));
                setBorrowedBooks(data.digitalLoans.map(l => l.book_id));
                setAllActiveLoans(data.allActiveLoans);
            }
        } catch (err) {
            console.error('Error al obtener préstamos activos:', err);
            toast.error('Error al cargar préstamos', {
                description: 'No se pudieron obtener tus préstamos activos',
                duration: 4000,
                icon: '❌',
            });
        }
    };

    const handleViewDetail = (bookId: number) => {
        onClose();
        setTimeout(() => {
            router.push(`/books/${bookId}`);
        }, 200);
    };

    const handleLoanClick = (book: BookLocal) => {
        if (!user) {
            toast.warning('Inicia sesión para solicitar préstamos', {
                description: 'Debes estar registrado para poder solicitar libros',
                duration: 4000,
                icon: '⚠️',
            });
            return;
        }

        if (userStatus.isBlocked) {
            toast.error('Cuenta bloqueada', {
                description: `Podrás solicitar préstamos en ${userStatus.daysRemaining} día(s)`,
                duration: 5000,
                icon: '🔒',
            });
            return;
        }

        if (userStatus.hasOverdueLoans) {
            toast.error('Préstamos vencidos', {
                description: 'Tienes préstamos pendientes. Regulariza tu situación primero',
                duration: 5000,
                icon: '⚠️',
            });
            return;
        }

        if (allActiveLoans.includes(book.book_id)) {
            toast.warning('Libro ya prestado', {
                description: 'Ya tienes este libro en préstamo. Devuélvelo para solicitar otro',
                duration: 4000,
                icon: '📚',
            });
            return;
        }

        setSelectedBookForLoan(book);
        setLoanModalOpen(true);
    };

    const handlePhysicalLoan = async () => {
        if (!selectedBookForLoan) return;

        try {
            const toastId = toast.loading('Solicitando préstamo físico...', {
                description: 'Preparando tu libro para recoger en biblioteca',
            });

            const res = await fetch('/api/loans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: selectedBookForLoan.book_id,
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

                setProcessingLoan(selectedBookForLoan.book_id);
                setPhysicalLoans(prev => [...prev, selectedBookForLoan.book_id]);

                setTimeout(() => {
                    setLoanModalOpen(false);
                    onClose();
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
        }
    };

    const handleDigitalLoan = async () => {
        if (!selectedBookForLoan) return;

        try {
            const toastId = toast.loading('Solicitando préstamo digital...', {
                description: 'Preparando tu libro para lectura online',
            });

            const res = await fetch('/api/loans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: selectedBookForLoan.book_id,
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

                setBorrowedBooks(prev => [...prev, selectedBookForLoan.book_id]);

                setTimeout(() => {
                    setLoanModalOpen(false);
                    onClose();
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

    const performSearch = async (q: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
            if (!res.ok) throw new Error('Error al buscar libros');
            const data = await res.json();
            setBooks(data.books);
        } catch (err) {
            setError('No se pudieron cargar los libros. Inténtalo de nuevo.');
            setBooks([]);
            toast.error('Error en la búsqueda', {
                description: 'No se pudieron encontrar libros. Verifica tu conexión',
                duration: 4000,
                icon: '❌',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim() === '') {
                setBooks([]);
                return;
            }
            if (query === lastQueryRef.current) return;
            lastQueryRef.current = query;
            performSearch(query);
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="search-modal-title"
                aria-describedby="search-modal-description"
            >
                <Box className={styles.modalStyle}>
                    {/* Botón para cerrar */}
                    <IconButton
                        aria-label="Cerrar búsqueda"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 9,
                            top: 8,
                            color: '#333',
                            '&:hover': {
                                backgroundColor: '#6D1E3A',
                                color: '#f2f0eb',
                            },
                        }}
                    >
                        <CloseIcon fontSize="large" />
                    </IconButton>

                    {/* Input de búsqueda */}
                    <TextField
                        fullWidth
                        label="Buscar libro"
                        variant="outlined"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        placeholder="Escribe el título, autor o categoría..."
                        sx={{ mb: 3 }}
                        aria-label="Buscar libros"
                    />

                    {/* Mensaje de error */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} aria-live="polite">
                            {error}
                        </Alert>
                    )}

                    {/* Estado de carga */}
                    {loading && (
                        <Box className={styles.loadingStyle} aria-live="polite">
                            <CircularProgress aria-label="Cargando libros" />
                            <Typography sx={{ mt: 2, color: '#333' }}>
                                Buscando libros...
                            </Typography>
                        </Box>
                    )}

                    {/* Sin resultados */}
                    {!loading && books.length === 0 && query.trim() !== '' && (
                        <Box className={styles.noResultsStyle} aria-live="polite">
                            <Typography color="#333">
                                No se encontraron libros que coincidan con `${query}`
                            </Typography>
                        </Box>
                    )}

                    {/* Grid de libros */}
                    {books.length > 0 && (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {books.map((book) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.book_id}>
                                    <Card 
                                        className={styles.cardStyle}
                                        sx={{ 
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={book.image || '/images/books/placeholder-book.jpg'}
                                            alt={book.title}
                                            sx={{ objectFit: 'cover' }}
                                            loading="lazy"
                                        />
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                component="h3" 
                                                sx={{ fontWeight: 600, mb: 1, minHeight: '2.5rem' }}
                                            >
                                                {book.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {book.authors}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {book.categories}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                                {book.publication_year || 'N/A'}
                                            </Typography>
                                            <div className={styles.buttonsBanner}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleViewDetail(book.book_id)}
                                                    fullWidth
                                                    sx={{ mr: 1 }}
                                                    aria-label={`Ver detalles de ${book.title}`}
                                                >
                                                    Ver detalle
                                                </Button>
                                                <Button
                                                    variant={user ? 'contained' : 'outlined'}
                                                    color={user ? 'success' : 'secondary'}
                                                    onClick={() => handleLoanClick(book)}
                                                    fullWidth
                                                    disabled={
                                                        userStatus.isBlocked ||
                                                        userStatus.hasOverdueLoans ||
                                                        allActiveLoans.includes(book.book_id) ||
                                                        processingLoan === book.book_id
                                                    }
                                                    aria-label={
                                                        !user ? 'Iniciar sesión para prestar'
                                                        : userStatus.isBlocked ? 'Cuenta bloqueada'
                                                        : userStatus.hasOverdueLoans ? 'Tienes préstamos vencidos'
                                                        : allActiveLoans.includes(book.book_id) ? 'Libro ya prestado'
                                                        : processingLoan === book.book_id ? 'Préstamo en proceso'
                                                        : `Pedir préstamo de ${book.title}`
                                                    }
                                                    sx={{
                                                        ...(userStatus.isBlocked && {
                                                            bgcolor: '#f44336',
                                                            '&:hover': { bgcolor: '#f44336' }
                                                        }),
                                                        ...(userStatus.hasOverdueLoans && {
                                                            bgcolor: '#ff9800',
                                                            '&:hover': { bgcolor: '#ff9800' }
                                                        }),
                                                        ...(allActiveLoans.includes(book.book_id) && {
                                                            bgcolor: '#2196f3',
                                                            '&:hover': { bgcolor: '#2196f3' }
                                                        }),
                                                        ...(processingLoan === book.book_id && {
                                                            bgcolor: '#ff9800',
                                                            '&:hover': { bgcolor: '#ff9800' }
                                                        })
                                                    }}
                                                >
                                                    {authLoading ? (
                                                        'Cargando...'
                                                    ) : !user ? (
                                                        'Iniciar sesión'
                                                    ) : userStatus.isBlocked ? (
                                                        'Bloqueado'
                                                    ) : userStatus.hasOverdueLoans ? (
                                                        'Vencido'
                                                    ) : allActiveLoans.includes(book.book_id) ? (
                                                        'Prestado'
                                                    ) : processingLoan === book.book_id ? (
                                                        'En proceso'
                                                    ) : (
                                                        'Prestar'
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Modal>

            {/* Modal para elegir tipo de préstamo */}
            {selectedBookForLoan && (
                <LoanTypeModal
                    open={loanModalOpen}
                    onClose={() => {
                        setLoanModalOpen(false);
                        setSelectedBookForLoan(null);
                    }}
                    onPhysicalLoan={handlePhysicalLoan}
                    onDigitalLoan={handleDigitalLoan}
                    bookTitle={selectedBookForLoan.title}
                />
            )}
        </>
    );
}