// src/components/admin/BooksTable.tsx
'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PaginatedTable, { Column } from './PaginatedTable';
import ActionButtons from './ActionButtons';
import SearchBar from './SearchBar';
import styles from '@/app/admin/users/UsersPage.module.css';

interface BookDisplay {
    book_id: number;
    title: string;
    author: string;
    isbn: string;
    total_copies: number;
    available_copies: number;
}

interface BooksTableProps {
    books: BookDisplay[];
}

export default function BooksTable({ books }: BooksTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [filteredBooks, setFilteredBooks] = useState<BookDisplay[]>(books);

      useEffect(() => {
        setFilteredBooks(books);
    }, [books])

    const handleDelete = async (bookId: number, bookTitle: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${bookTitle}"? Esta acción no se puede deshacer.`)) {
            return;
        }


        const toastId = toast.loading(`Eliminando "${bookTitle}"...`);

        try {
            const response = await fetch(`/api/books/delete/${bookId}`, {
                method: 'POST',
            });

            if (response.ok) {

                toast.success(`✅ Libro eliminado correctamente`, {
                    id: toastId,
                    description: `"${bookTitle}" ha sido eliminado de la biblioteca`,
                    duration: 4000,
                });

                // Recargar la página
                startTransition(() => {
                    router.refresh();
                });
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar el libro');
            }
        } catch (error) {

            toast.error(`❌ Error al eliminar el libro`, {
                id: toastId,
                description: error instanceof Error ? error.message : 'Intenta nuevamente',
                duration: 5000,
            });
            console.error('Error al eliminar libro:', error);
        }
    };


    const columns: Column[] = [
        { header: 'ID', field: 'book_id' },
        { header: 'Título', field: 'title' },
        { header: 'Autor', field: 'author' },
        { header: 'ISBN', field: 'isbn' },
        {
            header: 'Copias totales',
            field: 'total_copies',
        },
        {
            header: 'Copias Disponibles',
            field: 'available_copies',
        }

    ];

    //  Renderizar acciones
    const renderActions = (book: BookDisplay) => (
        <div className={styles.actionButtonsContainer}>
            <ActionButtons
                id={book.book_id}
                editUrl={`/admin/books/edit?id=${book.book_id}`}

                editLabel="Editar"

                size="small"
            />
        </div>
    );

    return (
        <>
            <SearchBar<BookDisplay>
                data={books}
                onSearch={setFilteredBooks}
                searchFields={['title', 'author', 'isbn']} 
                placeholder="Buscar libros por título, autor o ISBN..."
                size="medium"
                autoFocus={false}
                className={styles.searchBar}
            />
            <PaginatedTable<BookDisplay>
                data={filteredBooks}
                columns={columns}
                itemsPerPage={5}
                keyField="book_id"
                emptyMessage="No hay libros en la base de datos"
                entityName="libros"
                actions={renderActions}
                actionsHeader="Acciones"
            />
        </>
    );
}