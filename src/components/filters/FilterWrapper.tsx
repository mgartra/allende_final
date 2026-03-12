// /app/components/filters/FilterWrapper.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import BookFilter, { BookFilters } from './BookFilter';
import BookGrid from '../cards/BookGrid';
import { Book } from '@/types';
import Link from 'next/link';
import { Button, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

import styles from './FilterWrapper.module.css';

interface FilterWrapperProps {
    initialBooks: Book[];
    categoryId: number;
    categoryName?: string;
}

export default function FilterWrapper({
    initialBooks,
    categoryId,
    categoryName
}: FilterWrapperProps) {
    //  Estados para scroll infinito
    const [pageLimit, setPageLimit] = useState(5); // 5 en desktop por defecto
    const [itemsToDisplay, setItemsToDisplay] = useState(5); // Cuántos libros mostrar
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    //  Estados para filtros
    const [filteredBooks, setFilteredBooks] = useState<Book[]>(initialBooks);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //  Ref para el observador de scroll
    const sentinelRef = useRef<HTMLDivElement>(null);

    //  1. Calcular libros a mostrar durante el render
    const displayedBooks = useMemo(() => {
        return filteredBooks.slice(0, itemsToDisplay);
    }, [filteredBooks, itemsToDisplay]);

    const hasMore = itemsToDisplay < filteredBooks.length;

    //  2. Determinar límite según tamaño de pantalla
    useEffect(() => {
        const updatePageLimit = () => {
            const newLimit = window.innerWidth < 768 ? 3 : 5;
            setPageLimit(newLimit);


            setItemsToDisplay(newLimit);
        };

        updatePageLimit();
        window.addEventListener('resize', updatePageLimit);
        return () => window.removeEventListener('resize', updatePageLimit);
    }, []);

    // 3. Configurar scroll infinito
    useEffect(() => {
        if (!sentinelRef.current || isLoadingMore || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
                    //  Cargar más libros (simulado)
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setItemsToDisplay(prev => prev + pageLimit);
                        setIsLoadingMore(false);
                    }, 300);
                }
            },
            { threshold: 1.0 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [isLoadingMore, hasMore, pageLimit]);


    const handleFilterChange = (filters: BookFilters) => {
        setIsLoading(true);
        setError(null);

        try {
            const filtered = initialBooks.filter(book => {
                // Filtro por año
                if (filters.year && book.publication_year?.toString() !== filters.year) {
                    return false;
                }


                if (filters.minReference !== undefined && book.reference < filters.minReference) {
                    return false;
                }

                // Filtro por autora
                if (filters.author) {
                    const normalizedAuthor = filters.author.toLowerCase().trim();
                    const authorMatch = book.authors?.some(author =>
                        `${author.name} ${author.last_name}`
                            .toLowerCase()
                            .includes(normalizedAuthor)
                    );
                    if (!authorMatch) return false;
                }

                return true;
            });

            //  Resetear paginación con nuevos libros filtrados
            setFilteredBooks(filtered);
            setItemsToDisplay(pageLimit);
            setIsLoading(false);
        } catch (err) {
            setError('Error al aplicar filtros');
            console.error('Error al filtrar:', err);
            setIsLoading(false);
        }
    };

    //  Limpiar filtros
    const handleClearFilters = () => {
        setFilteredBooks(initialBooks);
        setItemsToDisplay(pageLimit);
    };

    return (
        <div className={styles.wrapper}>
            <Link href='/category'><Button className={styles.backButton}><ChevronLeftIcon fontSize='small' />Volver al catálogo</Button></Link>

            {/* Panel de filtros */}
            <BookFilter
                key={categoryId}
                onFilterChange={handleFilterChange}
                currentCategory={categoryName}
            />

            {/* Estado de carga de filtros */}
            {isLoading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Filtrando libros...</p>
                </div>
            )}

            {/* Error de filtros */}
            {error && (
                <div className={styles.error}>
                    <p>❌ {error}</p>
                </div>
            )}

            {/* Resultados */}
            {!isLoading && !error && (
                <div className={styles.results}>
                    <div className={styles.resultsHeader}>
                        <h2 className={styles.resultsTitle}>
                            {filteredBooks.length} libro{filteredBooks.length !== 1 ? 's' : ''} encontrados
                        </h2>
                        {filteredBooks.length === 0 && (
                            <button onClick={handleClearFilters} className={styles.clearButton}>
                                <Typography variant='body2'> Ver todos los libros</Typography>

                            </button>
                        )}
                    </div>

                    {/*  Grid con libros paginados */}
                    {displayedBooks.length > 0 ? (
                        <>
                            <BookGrid books={displayedBooks} />

                            {/*  Sentinel para scroll infinito */}
                            <div ref={sentinelRef} className={styles.sentinel} />

                            {/* Loading de scroll infinito */}
                            {isLoadingMore && (
                                <div className={styles.infiniteLoading}>
                                    <div className={styles.spinner}></div>
                                    <p>Cargando más libros...</p>
                                </div>
                            )}

                            {/*  Mensaje final 
                            {!hasMore && displayedBooks.length > 0 && (
                                <div className={styles.endMessage}>
                                    <p>🎉 ¡Has llegado al final de {categoryName}!</p>
                                    <p>{displayedBooks.length} de {filteredBooks.length} libros mostrados</p>
                                </div>
                            )}*/}
                        </>
                    ) : (
                        <div className={styles.noResults}>
                            <Typography variant='body2'><CloseIcon fontSize='medium' /> No se encontraron libros con los filtros aplicados. Prueba con otros criterios o limpia los filtros.</Typography>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}