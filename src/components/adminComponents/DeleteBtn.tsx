// src/components/adminComponents/DeleteBtn.tsx
'use client';

import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DeleteBtnProps {
    bookId?: number;
    userId?: number;
    eventId?: number;
    entityName?: string;
    size?: 'small' | 'medium';
}

export default function DeleteBtn({
    bookId,
    userId,
    eventId,
    entityName = 'este elemento',
    size = 'medium',
}: DeleteBtnProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);


    const entityTypes = [bookId && 'book', userId && 'user', eventId && 'event'].filter(Boolean);
    if (entityTypes.length === 0) {
        console.error('DeleteBtn: Debes proporcionar exactamente una entidad (bookId, userId o eventId)');
        return null;
    }
    if (entityTypes.length > 1) {
        console.warn(`DeleteBtn: Múltiples entidades detectadas (${entityTypes.join(', ')}). Usando la primera: ${entityTypes[0]}`);
    }


    let endpoint = null;
    if (bookId) endpoint = `/api/books/delete/${bookId}`;
    else if (userId) endpoint = `/api/users/delete/${userId}`;
    else if (eventId) endpoint = `/api/events/delete/${eventId}`;

    if (!endpoint) {
        console.error('DeleteBtn: No se pudo determinar el endpoint de eliminación');
        return null;
    }


    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };


    const handleConfirm = async () => {
        setOpenDialog(false);
        setIsLoading(true);

        const toastId = toast.loading(`Eliminando ${entityName}...`, {
            duration: 5000,
        });

        try {
            const response = await fetch(endpoint!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });



            if (response.ok) {
                toast.success(` ${entityName} eliminado correctamente`, {
                    id: toastId,
                    duration: 3000,
                });

                startTransition(() => {
                    router.refresh();
                });

            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar el elemento');
            }
        } catch (error) {
            toast.error(`❌ Error al eliminar`, {
                id: toastId,
                description: error instanceof Error ? error.message : 'Oh! Inténtalo de nuevo más tarde',
                duration: 5000,
            });
            console.error('Error al eliminar:', error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleClickOpen}
                disabled={isLoading}
                size={size}
                variant="text"
                color="error"
                sx={{
                    minWidth: 'auto',
                    p: size === 'small' ? '4px 8px' : '6px 12px',
                    '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.08)',
                        transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s',
                }}
            >
                <DeleteIcon sx={{
                    fontSize: size === 'small' ? '16px' : '18px',
                    mr: size === 'small' ? 0.5 : 1
                }} />
                <span style={{
                    fontWeight: 500,
                    fontSize: size === 'small' ? '12px' : '14px',
                    textTransform: 'none'
                }}>
                    Eliminar
                </span>
            </Button>


            <Dialog
                open={openDialog}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="alert-dialog-title" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#B00020',
                    pb: 1
                }}>
                    <WarningAmberIcon sx={{ fontSize: 28 }} />
                    <span>Eliminar {entityName}</span>
                </DialogTitle>

                <DialogContent sx={{ pt: 1 }}>
                    <DialogContentText id="alert-dialog-description" sx={{ color: '#555' }}>
                        ¿Estás seguro de que quieres eliminar <strong>{entityName}</strong>?
                        Esta acción es permanente y no se puede deshacer.
                    </DialogContentText>

                    <Typography variant="caption" color="error" sx={{
                        display: 'block',
                        mt: 2,
                        fontStyle: 'bold'
                    }}>
                        Los datos eliminados no podrán ser recuperados
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        disabled={isLoading}
                        sx={{
                            color: '#333',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        variant="contained"
                        color="error"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        sx={{
                            minWidth: 120,
                            fontWeight: 'bold'
                        }}
                    >
                        {isLoading ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}