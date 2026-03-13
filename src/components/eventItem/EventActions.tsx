// /app/components/eventItem/EventActions.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import styles from './EventActions.module.css';
import { Typography } from '@mui/material';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import LogoutIcon from '@mui/icons-material/Logout';

interface EventActionsProps {
    eventId: number;
    isLoggedIn: boolean;
    userReservation: { status: string } | null;
    showDetailsButton?: boolean;
}

export default function EventActions({
    eventId,
    isLoggedIn,
    userReservation,
    showDetailsButton = true
}: EventActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);


    const handleViewDetails = () => {
        router.push(`/events/${eventId}`);
    };

    const handleReserve = async () => {
        if (!isLoggedIn) {
            toast.warning('Inicia sesión para reservar', {
                description: 'Debes estar registrado para reservar plazas en eventos',
                duration: 4000,
                icon: '🎫',
            });
            return;
        }

        setIsLoading(true);

        try {
            const toastId = toast.loading('Reservando plaza...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch('/api/events/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('¡Reserva confirmada!', {
                    id: toastId,
                    description: data.message || 'Tu plaza ha sido reservada correctamente',
                    duration: 3500,
                    icon: '✅',
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error('Error al reservar', {
                    id: toastId,
                    description: data.error || 'No se pudo completar la reserva. Intenta nuevamente.',
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
            console.error('Error al reservar evento:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        toast.custom((id: string | number) => (
            <div className={styles.confirmationToast}>
                <p>¿Estás seguro de que quieres cancelar tu reserva?</p>
                <p>Puedes volver a apuntarte más tarde si hay plazas disponibles.</p>
                <div className={styles.toastActions}>
                    <button
                        className={styles.cancelBtn}
                        onClick={() => toast.dismiss(id)}
                    >
                        Cancelar
                    </button>
                    <button
                        className={styles.confirmBtn}
                        onClick={async () => {
                            toast.dismiss(id);
                            await handleCancelReservation();
                        }}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        ));
    };

    const handleCancelReservation = async () => {
        setIsLoading(true);

        try {
            const toastId = toast.loading('Cancelando reserva...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch('/api/events/cancel-reservation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Reserva cancelada', {
                    id: toastId,
                    description: data.message || 'Tu reserva ha sido cancelada correctamente',
                    duration: 3500,
                    icon: '✅',
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error('Error al cancelar', {
                    id: toastId,
                    description: data.error || 'No se pudo cancelar la reserva. Intenta nuevamente.',
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
            console.error('Error al cancelar reserva:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const hasActiveReservation = userReservation &&
        ['confirmed', 'unconfirmed'].includes(userReservation.status);

    const hasCancelledReservation = userReservation?.status === 'cancelled';

    return (
        <div className={styles.actionsContainer}>

            {showDetailsButton && (
                <button
                    onClick={handleViewDetails}
                    className={`${styles.actionButton} ${styles.detailsButton}`}
                    disabled={isLoading}
                >
                    {/* <Typography variant='body2'>
                        Ver detalles
                    </Typography> */}
                    <PlaylistAddIcon fontSize='large'/>
                </button>
            )}

            {/* Botones de reserva/cancelación */}
            {!isLoggedIn ? (
                <button
                    onClick={handleReserve}
                    className={`${styles.actionButton} ${styles.loginButton}`}
                    disabled={isLoading}
                >
                    {/* <Typography variant='body2'>
                        Inicia sesión 
                    </Typography> */}
                    <LogoutIcon fontSize='large'/>
                </button>
            ) : hasActiveReservation ? (
                <button
                    onClick={handleCancel}
                    className={`${styles.actionButton} ${styles.cancelButton}`}
                    disabled={isLoading}
                > <Typography variant='body2'>
                        {isLoading ? 'Cancelando...' : (
                            <>

                                Cancelar plaza
                            </>
                        )}</Typography>
                </button>
            ) : hasCancelledReservation ? (
                <button
                    onClick={handleReserve}
                    className={`${styles.actionButton} ${styles.reserveButton}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Reservando...' : (
                        <>
                            <span className={styles.buttonIcon}>🔄</span>
                            Volver a apuntarse
                        </>
                    )}
                </button>
            ) : (
                <button
                    onClick={handleReserve}
                    className={`${styles.actionButton} ${styles.reserveButton}`}
                    disabled={isLoading}
                ><Typography variant='body2'>
                        {isLoading ? 'Reservando...' : (
                            <>

                                Me apunto
                            </>
                        )}</Typography>
                </button>
            )}
        </div>
    );
}