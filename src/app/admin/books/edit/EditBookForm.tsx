// /app/admin/books/edit/EditBookForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import AuthorModal from '@/components/adminComponents/AuthorModal';
import CategoryModal from '@/components/adminComponents/CategoryModal';
import { Category, Author } from '@/types';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './EditBookPage.module.css';
import { Typography } from '@mui/material';

interface Book {
    book_id: number;
    title: string;
    isbn: string | null;
    publication_year: number | null;
    reference: number | null;
    total_copies: number;
    available_copies: number;
    image: string | null;
    authors: {
        author_id: number;
        name: string;
        last_name: string;
        nationality: string | null
    }[];
    categories: {
        category_id: number;
        name: string;
        description: string | null;
        icon: string | null;
    }[];
}

interface EditBookFormProps {
    book: Book;
    authors: Author[];
    categories: Category[];
}

export default function EditBookForm({
    book,
    authors: allAuthors,
    categories: allCategories
}: EditBookFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [authors, setAuthors] = useState<Author[]>(allAuthors);
    const [categories, setCategories] = useState<Category[]>(allCategories);
    const [isNewAuthorModalOpen, setIsNewAuthorModalOpen] = useState(false);
    const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);

    // Obtiene el autor actual del libro
    const currentAuthor = book.authors && book.authors.length > 0
        ? book.authors[0]
        : null;

    // Obtiene la categoría actual del libro
    const currentCategory = book.categories && book.categories.length > 0
        ? book.categories[0]
        : null;

    // Estado inicial con valores del libro
    const [formData, setFormData] = useState({
        title: book.title || '',
        isbn: book.isbn || '',
        publication_year: book.publication_year?.toString() || '',
        reference: book.reference?.toString() || '',
        total_copies: book.total_copies.toString(),
        available_copies: book.available_copies.toString(),
        image: book.image || '',
        author_id: currentAuthor ? currentAuthor.author_id.toString() : '',
        category_id: currentCategory ? currentCategory.category_id.toString() : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones antes de mostrar loading
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

        if (parseInt(formData.total_copies) < parseInt(formData.available_copies)) {
            toast.error('Copias inválidas', {
                description: 'Las copias disponibles no pueden ser más que las totales',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        setIsLoading(true);

        try {

            const toastId = toast.loading('Actualizando libro...', {
                description: 'Procesando tus cambios',
            });

            const response = await fetch(`/api/books/update/${book.book_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {

                toast.success('Libro actualizado', {
                    id: toastId,
                    description: `✅ "${data.book.title}" actualizado correctamente`,
                    duration: 3500,
                    icon: '📚',
                });

                setTimeout(() => {
                    router.push('/admin/books');
                }, 1500);
            } else {

                toast.error('Error al actualizar', {
                    id: toastId,
                    description: data.error || 'No se pudo actualizar el libro. Intenta nuevamente.',
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
            console.error('Error al actualizar libro:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Controla el autor creado desde el modal
    const handleAuthorCreated = (newAuthor: Author) => {
        setAuthors(prev => [...prev, newAuthor]);
        setFormData(prev => ({
            ...prev,
            author_id: newAuthor.author_id.toString(),
        }));
        setIsNewAuthorModalOpen(false);
    };

    // Elimina el autor con toast de confirmación
    const handleDeleteAuthor = () => {
        if (!formData.author_id) return;

        const author = authors.find(a => a.author_id.toString() === formData.author_id);
        if (!author) return;

        const authorName = `${author.name} ${author.last_name}`;

        // Toast de confirmación personalizado
        toast.custom((id) => (
            <div className={styles.confirmationToast}>
                <p>¿Estás seguro de que quieres eliminar al autor `${authorName}`?</p>
                <p>Esta acción no se puede deshacer.</p>
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
                            await confirmDeleteAuthor(author);
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ));
    };

    const confirmDeleteAuthor = async (author: Author) => {
        try {
            const toastId = toast.loading('Eliminando autor...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch(`/api/authors/delete/${author.author_id}`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Autor eliminado', {
                    id: toastId,
                    description: data.message || 'El autor ha sido eliminado correctamente',
                    duration: 3500,
                    icon: '🗑️',
                });

                // Elimina autor de la lista local
                setAuthors(prev => prev.filter(a => a.author_id !== author.author_id));
                setFormData(prev => ({ ...prev, author_id: '' }));
            } else {
                toast.error('Error al eliminar', {
                    id: toastId,
                    description: data.error || 'No se pudo eliminar el autor. Intenta nuevamente.',
                    duration: 5000,
                    icon: '❌',
                });
            }
        } catch (error) {
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al eliminar autor:', error);
        }
    };


    const handleCategoryCreated = (newCategory: Category) => {
        setCategories(prev => [...prev, newCategory]);
        setFormData(prev => ({
            ...prev,
            category_id: newCategory.category_id.toString(),
        }));
        setIsNewCategoryModalOpen(false);
    };


    const handleDeleteCategory = () => {
        if (!formData.category_id) return;

        const category = categories.find(c => c.category_id.toString() === formData.category_id);
        if (!category) return;


        toast.custom((id) => (
            <div className={styles.confirmationToast}>
                <p>¿Estás seguro de que quieres eliminar la categoría `${category.name}`?</p>
                <p>Esta acción no se puede deshacer.</p>
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
                            await confirmDeleteCategory(category);
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ));
    };

    const confirmDeleteCategory = async (category: Category) => {
        try {
            const toastId = toast.loading('Eliminando categoría...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch(`/api/categories/delete/${category.category_id}`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Categoría eliminada', {
                    id: toastId,
                    description: data.message || 'La categoría ha sido eliminada correctamente',
                    duration: 3500,
                    icon: '🗑️',
                });

                setCategories(prev => prev.filter(c => c.category_id !== category.category_id));
                setFormData(prev => ({ ...prev, category_id: '' }));
            } else {
                toast.error('Error al eliminar', {
                    id: toastId,
                    description: data.error || 'No se pudo eliminar la categoría. Intenta nuevamente.',
                    duration: 5000,
                    icon: '❌',
                });
            }
        } catch (error) {
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al eliminar categoría:', error);
        }
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
                        placeholder="Ej: Cien años de soledad"
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
                        placeholder="Ej: 978-0307474728"
                    />
                </div>

                {/* Autor (select) */}
                <div className={styles.formGroup}>
                    <label htmlFor="author_id">Autor *</label>
                    <div className={styles.authorSelectContainer}>
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
                        {formData.author_id && formData.author_id !== 'new' && (
                            <button
                                type="button"
                                onClick={handleDeleteAuthor}
                                className={styles.deleteAuthorButton}
                                disabled={isLoading}
                                title="Eliminar autor"
                            ><Typography variant='body2'> Eliminar</Typography>

                            </button>
                        )}
                    </div>
                </div>

                {/* Categoría (select) */}
                <div className={styles.formGroup}>
                    <label htmlFor="category_id">Categoría *</label>
                    <div className={styles.authorSelectContainer}>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            disabled={isLoading}
                        >
                            <option value="">Selecciona una categoría</option>
                            <option value="new">+ Añadir nueva categoría</option>
                            <option value="" disabled>────────────</option>
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.name}

                                </option>
                            ))}
                        </select>

                        {formData.category_id && formData.category_id !== 'new' && (
                            <button
                                type="button"
                                onClick={handleDeleteCategory}
                                className={styles.deleteAuthorButton}
                                disabled={isLoading}
                                title="Eliminar categoría"
                            >
                                <Typography variant='body2'> Eliminar</Typography>
                            </button>
                        )}
                    </div>
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
                        placeholder="Ej: 1967"
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
                        min="1"
                        max="5"
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="Ej: 4"
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
                        placeholder="/images/books/portada.jpg"
                    />
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/books')}
                        className={styles.cancelButton}
                        disabled={isLoading}
                    ><Typography variant='body2'> Cancelar</Typography>

                    </button>
                    <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isLoading}
                    ><Typography variant='body2'>
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar cambios'
                            )}</Typography>
                    </button>
                </div>
            </form>

            {/* Modales */}
            <AuthorModal
                isOpen={isNewAuthorModalOpen}
                onClose={() => setIsNewAuthorModalOpen(false)}
                onAuthorCreated={handleAuthorCreated}
            />
            <CategoryModal
                isOpen={isNewCategoryModalOpen}
                onClose={() => setIsNewCategoryModalOpen(false)}
                onCategoryCreated={handleCategoryCreated}
            />
        </div>
    );
}