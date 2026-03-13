// /app/components/account/AccountDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    CircularProgress,
    ListItemButton,

} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HeroBtn from '../buttons/HeroBtn';
import type { AuthUser } from '@/lib/auth/auth';
import styles from './AccountDrawer.module.css';
import Link from 'next/link';


interface UserLoan {
    loan_id: number;
    book_title: string;
    loan_date: string;
    return_date: string;
    status: 'borrowed' | 'returned' | 'overdue';
    loan_type: 'physical' | 'digital';
    pdf_url?: string;
}



interface BlockedUser {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
    blocked_until: Date;
}

interface CanceledEvent {
    event_id: number;
    name: string;
    cancelations: number;
    capacity: number;
}



interface AccountDrawerProps {
    open: boolean;
    onClose: () => void;
    user: AuthUser | null;
    onLogout: () => Promise<void>;
}

export default function AccountDrawer({
    open,
    onClose,
    user,
    onLogout
}: AccountDrawerProps) {
    //  Estados para préstamos (solo para usuarios lectores)
    const [userLoans, setUserLoans] = useState<UserLoan[]>([]);
    const [loadingLoans, setLoadingLoans] = useState(false);

    // Estados para secciones de administración (solo para root/librarian)
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [canceledEvents, setCanceledEvents] = useState<CanceledEvent[]>([]);
    const [loadingBlocked, setLoadingBlocked] = useState(false);
    const [loadingCanceled, setLoadingCanceled] = useState(false);

    //Comprobar que es un usuario lector
    const isRegularUser = (user: AuthUser | null): boolean => {
        return user?.type === 'user' && user.userType === 'user';
    };

    //Comprobar si tiene acceso de administración

    const canAccessAdmin = (user: AuthUser | null): boolean => {
        if (!user) return false;
        return user.type === 'root' ||
            (user.type === 'user' && user.userType === 'librarian');
    };

    //Etiqueta de usuario
    const getUserTypeLabel = (user: AuthUser | null): string => {
        if (!user) return 'Invitada';
        if (user.type === 'root') return 'Administradora';
        if (user.type === 'user') {
            return user.userType === 'librarian' ? 'Bibliotecaria' : 'Lector';
        }
        return 'Usuario';
    };


    //  Cargar préstamos SOLO si es usuario lector
    useEffect(() => {
        if (open && isRegularUser(user)) {
            fetchUserLoans();
        }
    }, [open, user]);

    //  Cargar datos de administración SOLO si es root o bibliotecario
    useEffect(() => {
        if (open && canAccessAdmin(user)) {
            fetchBlockedUsers();
            fetchCanceledEvents();
        }
    }, [open, user]);

    const fetchUserLoans = async () => {
        setLoadingLoans(true);
        try {
            const res = await fetch('/api/loans/history');
            if (res.ok) {
                const { loans } = await res.json();
                setUserLoans(loans);
            }
        } catch (error) {
            console.error('Error al obtener historial de préstamos:', error);
        } finally {
            setLoadingLoans(false);
        }
    };

    const fetchBlockedUsers = async () => {
        setLoadingBlocked(true);
        try {
            const res = await fetch('/api/users/blocked');
            if (res.ok) {
                const { users } = await res.json();
                setBlockedUsers(users);
            }
        } catch (error) {
            console.error('Error al obtener usuarios bloqueados:', error);
        } finally {
            setLoadingBlocked(false);
        }
    };

    const fetchCanceledEvents = async () => {
        setLoadingCanceled(true);
        try {
            const res = await fetch('/api/events/canceled');
            if (res.ok) {
                const { events } = await res.json();
                setCanceledEvents(events);
            }
        } catch (error) {
            console.error('Error al obtener eventos cancelados:', error);
        } finally {
            setLoadingCanceled(false);
        }
    };

    //  Clasifica préstamos por estado (solo para usuarios lectores)
    const activeLoans = userLoans.filter(l => l.status === 'borrowed');
    const returnedLoans = userLoans.filter(l => l.status === 'returned');
    const overdueLoans = userLoans.filter(l => l.status === 'overdue');

    const handleLogout = async () => {
        await onLogout();
        onClose();
    };


    //Scroll Reutilizable
    const scrollableSectionStyles = {
        maxHeight: '200px',
        overflowY: 'auto',
        pr: 1,
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f5f5f5',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '3px',
            '&:hover': {
                background: '#a8a8a8',
            },
        },
        '&::-webkit-scrollbar-thumb:active': {
            background: '#6D1E3A',
        },
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: 'calc(100% -32px)', md: '600px' },
                    bgcolor: 'background.default',
                    margin:{ xs:'0 16px', md:'0'}
                }
            }}
        >
            <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', maxWidth:'100%', overflowX:'hidden' }}>
                {/* Header del Drawer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" className={styles.drawerTitle}>
                        {user
                            ? (canAccessAdmin(user)
                                ? 'Panel de Administración'
                                : `¡Hola, ${user.name}!`)
                            : 'Tu Cuenta'}

                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Datos básicos del usuario */}
                {user ? (
                    <Box sx={{ mb: 3 }} className={styles.userInfo}>
                        <Typography variant="h6" className={styles.userName}>
                            {`${user.name} ${user.lastName}`}
                        </Typography>
                        <Typography color="text.secondary" className={styles.userEmail}>
                            {user.email}
                        </Typography>
                        <Chip
                            label={getUserTypeLabel(user)}
                            size="small"
                            sx={{ mt: 1 }}
                            color={user.type ? 'primary' : 'default'}
                            className={styles.userTypeChip}
                        />
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Inicia sesión para ver tu información
                        </Typography>
                        <HeroBtn name="Iniciar sesión" link="/login" />
                    </Box>
                )}

                {user && (
                    <>
                        {/*  Solo usuarios lectores */}
                        {isRegularUser(user) && (
                            <>
                                <Divider sx={{ my: 2 }} />

                                {/* Préstamos activos */}
                                <Box sx={{ mb: 3 }} className={styles.section}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <BookIcon sx={{ mr: 1, color: '#1976d2' }} />
                                        <Typography variant="subtitle1" fontWeight="bold" className={styles.sectionTitle}>
                                            Préstamos activos ({activeLoans.length})
                                        </Typography>
                                    </Box>
                                    {/*  DEBUG TEMPORAL 
                                    <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                        <Typography variant="caption" color="warning.dark">
                                            {activeLoans.map(l =>
                                                `ID: ${l.loan_id} | Tipo: ${l.loan_type} | PDF: ${l.pdf_url ? '✅' : '❌'}\n`
                                            )}
                                        </Typography>
                                    </Box>*/}

                                    {loadingLoans ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : activeLoans.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" className={styles.emptyText}>
                                            No tienes préstamos activos
                                        </Typography>
                                    ) : (
                                        <Box sx={scrollableSectionStyles}>
                                            <List dense disablePadding>
                                                {activeLoans.map((loan) => (
                                                    <ListItem
                                                        key={loan.loan_id}
                                                        sx={{
                                                            py: 1,
                                                            borderBottom: '1px solid #f0f0f0',
                                                            '&:last-child': { borderBottom: 'none' }
                                                        }}
                                                        className={styles.loanItem}
                                                        /*Botón descarga */
                                                        secondaryAction={ 
                                                            loan.loan_type === 'digital' && loan.pdf_url ? (
                                                                <Link
                                                                    href={`bookspdf/${loan.pdf_url}`}
                                                                    download={loan.book_title}
                                                                    className={styles.readButton}
                                                                    aria-label={`Descargar ${loan.book_title}`}
                                                                >Descargar</Link>

                                                            ) : null}


                                                    >
                                                        <ListItemIcon sx={{ minWidth: 40, py: 2, marginY: 1, marginRight: 2 }}>
                                                            <Chip
                                                                label={loan.loan_type === 'physical' ? 'Físico' : 'Digital'}
                                                                size="small"
                                                                color={loan.loan_type === 'physical' ? 'warning' : 'info'}
                                                                className={styles.loanTypeChip}
                                                            />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={loan.book_title}
                                                            secondary={`Devolver antes: ${new Date(loan.return_date).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}`}
                                                            primaryTypographyProps={{ className: styles.loanTitle }}
                                                            secondaryTypographyProps={{ className: styles.loanDate }}

                                                        />


                                                    </ListItem>

                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Libros devueltos */}
                                <Box sx={{ mb: 3 }} className={styles.section}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CheckCircleIcon sx={{ mr: 1, color: '#014421' }} />
                                        <Typography variant="subtitle1" fontWeight="bold" className={styles.sectionTitle}>
                                            Libros devueltos ({returnedLoans.length})
                                        </Typography>
                                    </Box>
                                    {returnedLoans.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" className={styles.emptyText}>
                                            No tienes libros devueltos
                                        </Typography>
                                    ) : (
                                        <Box sx={{ ...scrollableSectionStyles, maxHeight: '180px' }}>
                                            <List dense disablePadding>
                                                {returnedLoans.map((loan) => (
                                                    <ListItem
                                                        key={loan.loan_id}
                                                        sx={{
                                                            py: 1,
                                                            borderBottom: '1px solid #f0f0f0',
                                                            '&:last-child': { borderBottom: 'none' }
                                                        }}
                                                        className={styles.loanItem}
                                                    >
                                                        <ListItemText
                                                            primary={loan.book_title}
                                                            secondary={`Devuelto el: ${new Date(loan.return_date).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}`}
                                                            primaryTypographyProps={{ className: styles.loanTitle }}
                                                            secondaryTypographyProps={{ className: styles.loanDate }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Box>

                                {overdueLoans.length > 0 && (
                                    <>
                                        <Divider sx={{ my: 2 }} />

                                        {/* Libros vencidos */}
                                        <Box sx={{ mb: 3 }} className={styles.section}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <ErrorIcon sx={{ mr: 1, color: '#B00020' }} />
                                                <Typography variant="subtitle1" fontWeight="bold" color="error" className={styles.sectionTitle}>
                                                    Libros vencidos ({overdueLoans.length})
                                                </Typography>
                                            </Box>
                                            <Box sx={{ ...scrollableSectionStyles, maxHeight: '180px' }}>
                                                <List dense disablePadding>
                                                    {overdueLoans.map((loan) => (
                                                        <ListItem
                                                            key={loan.loan_id}
                                                            sx={{
                                                                py: 1,
                                                                borderBottom: '1px solid #ffebee',
                                                                bgcolor: 'rgba(211, 47, 47, 0.03)',
                                                                '&:last-child': { borderBottom: 'none' }
                                                            }}
                                                            className={styles.loanItem}
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                                <Chip
                                                                    label="Vencido"
                                                                    size="small"
                                                                    color="error"
                                                                    className={styles.overdueChip}
                                                                />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={loan.book_title}
                                                                secondary={`Vencido desde: ${new Date(loan.return_date).toLocaleDateString('es-ES', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}`}
                                                                primaryTypographyProps={{ className: styles.loanTitle }}
                                                                secondaryTypographyProps={{ className: styles.loanDate, color: 'error.main' }}
                                                            />

                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Box>

                                    </>
                                )}

                                <Divider sx={{ my: 2 }} />

                                {/* Historial de eventos */}
                                <Box sx={{ mb: 3 }} className={styles.section}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <EventIcon sx={{ mr: 1, color: '#7b1fa2' }} />
                                        <Typography variant="subtitle1" fontWeight="bold" className={styles.sectionTitle}>
                                            Historial de eventos
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" className={styles.emptyText}>
                                        Próximamente disponible
                                    </Typography>
                                </Box>
                            </>
                        )}

                        {/* Solo para administradores y bibliotecarios*/}
                        {canAccessAdmin(user) && (
                            <>
                                {/*  Solo mostrar si hay usuarios bloqueados */}
                                {blockedUsers.length > 0 && (
                                    <Box sx={{ mb: 3 }} className={styles.section}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <PersonIcon sx={{ mr: 1, color: '#B00020' }} />
                                            <Typography variant="subtitle1" fontWeight="bold" className={styles.sectionTitle}>
                                                Usuarios bloqueados ({blockedUsers.length})
                                            </Typography>
                                        </Box>
                                        <Box sx={{ ...scrollableSectionStyles, maxHeight: '220px' }}>
                                            <List dense disablePadding>
                                                {blockedUsers.map((blockedUser) => (
                                                    <ListItem
                                                        key={blockedUser.user_id}
                                                        sx={{
                                                            py: 1,
                                                            borderBottom: '1px solid #ffebee',
                                                            '&:last-child': { borderBottom: 'none' }
                                                        }}
                                                        className={styles.userItem}
                                                    >
                                                        <ListItemText
                                                            primary={`${blockedUser.name} ${blockedUser.last_name}`}
                                                            secondary={`Bloqueado hasta: ${new Date(blockedUser.blocked_until!).toLocaleDateString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}`}
                                                            primaryTypographyProps={{ className: styles.userName }}
                                                            secondaryTypographyProps={{ className: styles.userDate }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    </Box>
                                )}

                                {/* Solo mostrar si hay eventos cancelados */}
                                {canceledEvents.length > 0 && (
                                    <Box sx={{ mb: 3 }} className={styles.section}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <EventIcon sx={{ mr: 1, color: '#B00020' }} />
                                            <Typography variant="subtitle1" fontWeight="bold" className={styles.sectionTitle}>
                                                Eventos cancelados ({canceledEvents.length})
                                            </Typography>
                                        </Box>
                                        <Box sx={{ ...scrollableSectionStyles, maxHeight: '220px' }}>
                                            <List dense disablePadding>
                                                {canceledEvents.map((event) => (
                                                    <ListItem
                                                        key={event.event_id}
                                                        sx={{
                                                            py: 1,
                                                            borderBottom: '1px solid #f0f0f0',
                                                            '&:last-child': { borderBottom: 'none' }
                                                        }}
                                                        className={styles.eventItem}
                                                    >
                                                        <ListItemText
                                                            primary={event.name}
                                                            secondary={`Cancelado por: ${event.cancelations} de ${event.capacity} plazas`}
                                                            primaryTypographyProps={{ className: styles.eventName }}
                                                            secondaryTypographyProps={{ className: styles.eventStats }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    </Box>
                                )}

                                {/*  Si no hay datos, mostrar mensaje */}
                                {blockedUsers.length === 0 && canceledEvents.length === 0 && (
                                    <Box sx={{ mb: 3 }} className={styles.section}>
                                        <Typography variant="body2" color="text.secondary" className={styles.emptyText}>
                                            No hay usuarios bloqueados ni eventos cancelados
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}

                        <Divider sx={{ mt: 'auto', mb: 2 }} />

                        {/* Botón de cerrar sesión */}
                        <Box className={styles.logoutSection}>
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{ borderRadius: 1 }}
                                className={styles.logoutButton}
                            >
                                <ListItemIcon>
                                    <LogoutIcon color="error" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Cerrar sesión"
                                    primaryTypographyProps={{
                                        color: 'error',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </ListItemButton>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer >
    );
}