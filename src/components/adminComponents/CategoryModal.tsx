// /app/components/adminComponents/CategoryModal.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import styles from './AuthorModal.module.css'; 
import { Category } from '@/types';
import { Typography } from '@mui/material';

/* interface Category {
    category_id: number;
    name: string;
    description: string | null;
    icon: string | null;
} */

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryCreated: (category: Category) => void;
}

export default function CategoryModal({ 
    isOpen, 
    onClose, 
    onCategoryCreated 
}: CategoryModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
    
        if (!formData.name.trim()) {
            toast.error('Nombre obligatorio', {
                description: 'El nombre de la categoría no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        setIsLoading(true);

        try {
        
            const toastId = toast.loading('Creando categoría...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch('/api/categories/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            
            if (!response.ok) {
            
                toast.error('Error al crear categoría', {
                    id: toastId,
                    description: data.error || 'No se pudo crear la categoría. Inténtalo nuevamente.',
                    duration: 5000,
                    icon: '❌',
                });
                return;
            }

        
            toast.success('Categoría creada', {
                id: toastId,
                description: `✅ ¡Todo listo! La categoría "${data.category.name}" ha sido añadida correctamente`,
                duration: 3000,
                icon: '📚',
            });

            //  Llamar al callback con los datos reales
            onCategoryCreated({
                category_id: data.category.category_id,
                name: data.category.name,
                description: data.category.description,
                icon: data.category.icon,
            });

            //  Cerrar modal después de éxito
            setTimeout(() => {
                setFormData({ name: '', description: '', icon: '' });
                onClose();
            }, 1000);

        } catch (err) {
            toast.error('Error de conexión', {
                description: 'Estamos teniendo problemas para conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al crear categoría:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className={styles.modalOverlay} 
            onClick={onClose}
        >
            <div 
                className={styles.modalContent} 
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <Typography variant='h4'>Añadir Nueva Categoría</Typography>
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
                        <label htmlFor="category_name">Nombre *</label>
                        <input
                            type="text"
                            id="category_name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            disabled={isLoading}
                            placeholder="Ej: Ciencia Ficción"
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category_icon">Icono (opcional)</label>
                        <input
                            type="text"
                            id="category_icon"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            className={styles.input}
                            disabled={isLoading}
                            placeholder="Ej: 📚"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category_description">Descripción</label>
                        <input
                            type="text"
                            id="category_description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.input}
                            disabled={isLoading}
                            placeholder="Ej: Libros de ciencia ficción"
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={isLoading}
                        >
                           <Typography variant='body2'>Cancelar</Typography>
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={isLoading}
                        ><Typography variant='body2'>
                            {isLoading ? 'Creando...' : 'Crear categoría'}
                            </Typography>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}