// /app/components/adminComponents/AuthorModal.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import styles from './AuthorModal.module.css';
import { Author } from '@/types';
import { Typography } from '@mui/material';

interface AuthorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthorCreated: (author: Author) => void;
}

export default function AuthorModal({ isOpen, onClose, onAuthorCreated }: AuthorModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        nationality: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //  Validaciones antes de mostrar loading
        if (!formData.name.trim()) {
            toast.error('Nombre obligatorio', {
                description: 'El nombre del autor no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.last_name.trim()) {
            toast.error('Apellido obligatorio', {
                description: 'El apellido del autor no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        setIsLoading(true);

        try {
    
            const toastId = toast.loading('Creando autor...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch('/api/authors/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
            
                toast.error('Error al crear autor', {
                    id: toastId,
                    description: data.error || 'No se pudo crear el autor. Inténtalo nuevamente.',
                    duration: 5000,
                    icon: '❌',
                });
                return;
            }

    
            onAuthorCreated({
                author_id: data.author.author_id,
                name: data.author.name,
                last_name: data.author.last_name,
                nationality: data.author.nationality,
            });


            toast.success('Autor creado', {
                id: toastId,
                description: `✅¡Todo listo! "${data.author.name} ${data.author.last_name}" ha sido añadido correctamente`,
                duration: 3000,
                icon: '✍️',
            });

            
            setTimeout(() => {
                setFormData({ name: '', last_name: '', nationality: '' });
                onClose();
            }, 1000);

        } catch (err) {
    
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al crear autor:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="author-modal-title"
        >
            <div
                className={styles.modalContent}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <Typography variant='h4' id="author-modal-title">Añadir Nuevo Autor</Typography>
                    <button
                        className={styles.modalClose}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        &times;
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={styles.modalBody}
                >
                    <div className={styles.formGroup}>
                        <label htmlFor="new_author_name">Nombre *</label>
                        <input
                            type="text"
                            id="new_author_name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            disabled={isLoading}
                            placeholder="Ej: George"
                            autoFocus 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="new_author_last_name">Apellido *</label>
                        <input
                            type="text"
                            id="new_author_last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            disabled={isLoading}
                            placeholder="Ej: Orwell"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="new_author_nationality">Nacionalidad</label>
                        <input
                            type="text"
                            id="new_author_nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            className={styles.input}
                            disabled={isLoading}
                            placeholder="Ej: Británico"
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={isLoading}
                        ><Typography variant='body2'>Cancelar</Typography>
                            
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={isLoading}
                        ><Typography variant='body2'>
                            {isLoading ? 'Creando...' : 'Crear autor'}
                            </Typography>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}