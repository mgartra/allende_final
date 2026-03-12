// /app/components/loans/LoanTypeModal.tsx
'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Alert,
    Box,
} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LaptopIcon from '@mui/icons-material/Laptop';


interface LoanTypeModalProps {
    open: boolean;
    onClose: () => void;
    onPhysicalLoan: () => void;
    onDigitalLoan: () => void;
    bookTitle: string;
}

export default function LoanTypeModal({
    open,
    onClose,
    onPhysicalLoan,
    onDigitalLoan,
    bookTitle,
}: LoanTypeModalProps) {
    const [selectedType, setSelectedType] = useState<'physical' | 'digital' | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const handlePhysicalClick = () => {
        setSelectedType('physical');
        setShowInfo(true);
    };

    const handleDigitalClick = () => {
        setSelectedType('digital');
        setShowInfo(true);
    };

    const handleConfirm = () => {
        if (selectedType === 'physical') {
            onPhysicalLoan(); // El padre (DetailsBook) ya maneja los toasts
        } else if (selectedType === 'digital') {
            onDigitalLoan(); // El padre (DetailsBook) ya maneja los toasts
        }
        handleClose();
    };

    const handleClose = () => {
        setSelectedType(null);
        setShowInfo(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="loan-type-dialog-title"
        >
            <DialogTitle 
                id="loan-type-dialog-title"
                sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    p: 3.5,
                    marginBottom:2.5
                }}
            >
                <Typography variant="h6" fontWeight="bold" component="h2">
                    Seleccionar tipo de préstamo
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                    Libro: {bookTitle}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ py: 3, px: 3 }}>
                {!showInfo ? (
                    // Selección de tipo
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={handlePhysicalClick}
                            aria-label="Seleccionar préstamo en físico"
                            sx={{
                                border: '2px solid #ECA121',
                                borderRadius: 2,
                                p: 2.5,
                                justifyContent: 'flex-start',
                                gap: 2.5,
                                '&:hover': {
                                    bgcolor: '#e3f2fd',
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                },
                                '&:focus-visible': {
                                    outline: '2px solid #ECA121',
                                    outlineOffset: '2px',
                                }
                            }}
                        >
                            <LibraryBooksIcon sx={{ fontSize: 36, color: '#6D1E3A' }} />
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Préstamo en físico
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Recoge el libro en la biblioteca
                                </Typography>
                            </Box>
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            onClick={handleDigitalClick}
                            aria-label="Seleccionar préstamo digital"
                            sx={{
                                border: '2px solid #010244',
                                borderRadius: 2,
                                p: 2.5,
                                justifyContent: 'flex-start',
                                gap: 2.5,
                                '&:hover': {
                                    bgcolor: '#e8f5e9',
                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                                },
                                '&:focus-visible': {
                                    outline: '2px solid #010244',
                                    outlineOffset: '2px',
                                }
                            }}
                        >
                            <LaptopIcon sx={{ fontSize: 36, color: '#6D1E3A' }} />
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Préstamo digital
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Accede al libro digitalmente
                                </Typography>
                            </Box>
                        </Button>
                    </Box>
                ) : (
                    // Información del tipo seleccionado
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {selectedType === 'physical' ? (
                            <>
                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        bgcolor: '#e3f2fd',
                                        borderLeft: '4px solid #010244',
                                        '& .MuiAlert-icon': {
                                            color: '#010244',
                                        }
                                    }}
                                    aria-live="polite"
                                >
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                         Horario de la biblioteca
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Lunes - Viernes:</strong> 9:00 - 18:00<br />
                                        <strong>Sábado:</strong> 10:00 - 14:00<br />
                                        <strong>Domingo:</strong> Cerrado
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic', backgroundColor:'info.main', color:'#fff', p:2}}>
                                        Por favor, acude a la biblioteca con tu carné para recoger tu libro.
                                    </Typography>
                                </Alert>

                                <Alert 
                                    severity="warning" 
                                    sx={{ 
                                        bgcolor: '#fff3e0',
                                        borderLeft: '4px solid #ed6c02',
                                        '& .MuiAlert-icon': {
                                            color: '#ed6c02',
                                        }
                                    }}
                                    aria-live="polite"
                                >
                                    <Typography variant="body2" fontWeight="bold" color="#ed6c02">
                                         Recuerda traer tu carné de biblioteca para recoger el libro
                                    </Typography>
                                </Alert>
                            </>
                        ) : (
                            <>
                                <Alert 
                                    severity="success" 
                                    sx={{ 
                                        bgcolor: '#e8f5e9',
                                        borderLeft: '4px solid #014421',
                                        '& .MuiAlert-icon': {
                                            color: '#014421',
                                        }
                                    }}
                                    aria-live="polite"
                                >
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                         Préstamo digital
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Duración:</strong> 21 días desde la fecha de préstamo
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1.5 }}>
                                        Tendrás acceso al libro digital durante 21 días. Podrás:
                                    </Typography>
                                    <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                                        <li style={{ marginBottom: '4px' }}>✓ Leer online desde tu cuenta</li>
                                        <li style={{ marginBottom: '4px' }}>✓ Descargar para leer offline</li>
                                        <li>✓ Sincronizar progreso entre dispositivos</li>
                                    </ul>
                                </Alert>

                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        bgcolor: '#e3f2fd',
                                        borderLeft: '4px solid #010244',
                                        '& .MuiAlert-icon': {
                                            color: '#010244',
                                        }
                                    }}
                                    aria-live="polite"
                                >
                                    <Typography variant="body2" fontWeight="bold" color="#010244">
                                         El préstamo se renovará automáticamente si no hay reservas pendientes
                                    </Typography>
                                </Alert>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                <Button 
                    onClick={handleClose} 
                    variant="outlined" 
                    sx={{ 
                        px: 3,
                        py: 1,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                    aria-label={showInfo ? 'Volver a selección de tipo' : 'Cancelar préstamo'}
                >
                    {showInfo ? 'Atrás' : 'Cancelar'}
                </Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    color="primary"
                    disabled={!selectedType}
                    sx={{ 
                        px: 3,
                        py: 1,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                        }
                    }}
                    aria-label={showInfo ? 'Confirmar préstamo seleccionado' : 'Seleccionar tipo de préstamo'}
                >
                    {showInfo ? 'Confirmar préstamo' : 'Seleccionar tipo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}