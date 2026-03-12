// /app/admin/books/create/CreateBookForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import AuthorModal from '@/components/adminComponents/AuthorModal';
import CategoryModal from '@/components/adminComponents/CategoryModal';
import { Category, Author } from '@/types';
import styles from './CreateBookPage.module.css';
import { Typography } from '@mui/material';

interface CreateBookFormProps {
    authors: Author[];
    categories: Category[];
}

export default function CreateBookForm({
    authors: initialAuthors,
    categories: initialCategories
}: CreateBookFormProps) {
    const router = useRouter();
    const [authors, setAuthors] = useState<Author[]>(initialAuthors);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        publication_year: '',
        reference: '0',
        total_copies: '0',
        available_copies: '0',
        image: '',
        author_id: '',
        category_id: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isNewAuthorModalOpen, setIsNewAuthorModalOpen] = useState(false);
    const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'author_id' && value === 'new') {
            setIsNewAuthorModalOpen(true);
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //  Validaciones antes de mostrar loading
        if (!formData.title.trim()) {
            toast.error('Título obligatorio', {
                description: 'El título del libro no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.isbn.trim()) {
            toast.error('ISBN obligatorio', {
                description: 'El ISBN del libro no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.author_id) {
            toast.error('Autor obligatorio', {
                description: 'Debes seleccionar un autor para el libro',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        const total = parseInt(formData.total_copies);
        const available = parseInt(formData.available_copies);
        if (available > total) {
            toast.error('Copias inválidas', {
                description: 'Las copias disponibles no pueden ser más que las totales',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        setIsLoading(true);

        try {

            const toastId = toast.loading('Creando libro...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch('/api/books/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {

                toast.error('Error al crear libro', {
                    id: toastId,
                    description: data.error || 'No se pudo crear el libro. Intenta nuevamente.',
                    duration: 5000,
                    icon: '❌',
                });
                return;
            }


            toast.success('Libro creado', {
                id: toastId,
                description: `✅ "${data.book.title}" añadido correctamente a la biblioteca`,
                duration: 3500,
                icon: '📚',
            });


            setTimeout(() => {
                router.push('/admin/books');
            }, 1500);
        } catch (err) {
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al crear libro:', err);
        } finally {
            setIsLoading(false);
        }
    };


    const handleAuthorCreated = (newAuthor: Author) => {
        setAuthors(prev => [...prev, newAuthor]);
        setFormData(prev => ({
            ...prev,
            author_id: newAuthor.author_id.toString(),
        }));
        setIsNewAuthorModalOpen(false);
    };

    const handleCategoryCreated = (newCategory: Category) => {
        setCategories(prev => [...prev, newCategory]);
        setFormData(prev => ({
            ...prev,
            category_id: newCategory.category_id.toString(),
        }));
        setIsNewCategoryModalOpen(false);
    };

    const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'author_id' && value === 'new') {
            setIsNewAuthorModalOpen(true);
            return;
        }


        if (name === 'category_id' && value === 'new') {
            setIsNewCategoryModalOpen(true);
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className={styles.form}>

                <div className={styles.formGroup}>
                    <label htmlFor="title">Título *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="Ej: 1984"
                        autoFocus
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="isbn">ISBN *</label>
                    <input
                        type="text"
                        id="isbn"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="Ej: 978-0451524935"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="publication_year">Año de publicación</label>
                    <input
                        type="number"
                        id="publication_year"
                        name="publication_year"
                        value={formData.publication_year}
                        onChange={handleChange}
                        min="1000"
                        max={new Date().getFullYear()}
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="Ej: 1949"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="reference">Recomendación (1-5)</label>
                    <input
                        type="number"
                        id="reference"
                        name="reference"
                        value={formData.reference}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="Ej: 5"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="total_copies">Copias totales *</label>
                    <input
                        type="number"
                        id="total_copies"
                        name="total_copies"
                        value={formData.total_copies}
                        onChange={handleChange}
                        min="0"
                        required
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="Ej: 10"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="available_copies">Copias disponibles *</label>
                    <input
                        type="number"
                        id="available_copies"
                        name="available_copies"
                        value={formData.available_copies}
                        onChange={handleChange}
                        min="0"
                        required
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="Ej: 8"
                    />
                </div>

                {/* Select de autores con opción "Nuevo autor" */}
                <div className={styles.formGroup}>
                    <label htmlFor="author_id">Autor *</label>
                    <select
                        id="author_id"
                        name="author_id"
                        value={formData.author_id}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        disabled={isLoading}
                    >
                        <option value="">Selecciona un autor</option>
                        <option value="new">+ Añadir nuevo autor</option>
                        <option value="" disabled>────────────</option>
                        {authors.map(author => (
                            <option key={author.author_id} value={author.author_id}>
                                {author.name} {author.last_name}{author.nationality ? ` (${author.nationality})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Select de categorías */}
                <div className={styles.formGroup}>
                    <label htmlFor="category_id">Categoría *</label>
                    <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id || ''}
                        onChange={handleChangeCategory}
                        required
                        className={styles.input}
                        disabled={isLoading}
                    >
                        <option value="">Selecciona una categoría</option>
                        <option value="new">+ Añadir nueva categoría</option>
                        <option value="" disabled>────────────</option>
                        {categories.map(category => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.icon ? `${category.icon} ` : ''}{category.name}
                                {category.description ? ` - ${category.description}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="image">URL de imagen</label>
                    <input
                        type="text"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="/images/books/1984.jpg"
                    />
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/books')}
                        className={styles.cancelButton}
                        disabled={isLoading}
                    >
                        <Typography variant='body2'>
                        Cancelar
                        </Typography>
                    </button>
                    <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isLoading}
                    > <Typography variant='body2'>
                        {isLoading ? 'Creando...' : 'Crear libro'}
                        </Typography>
                    </button>
                </div>
            </form>

            {/* Modal para nuevo autor */}
            <AuthorModal
                isOpen={isNewAuthorModalOpen}
                onClose={() => setIsNewAuthorModalOpen(false)}
                onAuthorCreated={handleAuthorCreated}
            />

            {/* Modal para nueva categoría */}
            <CategoryModal
                isOpen={isNewCategoryModalOpen}
                onClose={() => setIsNewCategoryModalOpen(false)}
                onCategoryCreated={handleCategoryCreated}
            />
        </div>
    );
}