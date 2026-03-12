// /app/components/filters/BookFilter.tsx
'use client';

import { useState } from 'react';
import styles from './BookFilter.module.css';
import { Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';

// exportar interfaz para usar en FilterWrapper
export interface BookFilters {
    year?: string;
    minReference?: number;
    author?: string;
}

interface BookFilterProps {
    onFilterChange: (filters: BookFilters) => void;
    currentCategory?: string;
}

export default function BookFilter({
    onFilterChange,
    currentCategory
}: BookFilterProps) {
    const [filters, setFilters] = useState<BookFilters>({});
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (newFilters: BookFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const handleClearFilters = () => {
        setFilters({});
        onFilterChange({});
        setIsExpanded(false);
    };

    const toggleFilters = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={styles.filterContainer} aria-label="Filtros de búsqueda">
            {/* Botón toggle para móvil */}
            <button
                onClick={toggleFilters}
                className={styles.toggleButton}
                aria-expanded={isExpanded}
                aria-controls="book-filters"
            >
                <span><SearchIcon fontSize='medium' /></span>
                {isExpanded ? 'Ocultar filtros' : 'Filtrar resultados'}
                {Object.values(filters).filter(Boolean).length > 0 && (
                    <span className={styles.activeFiltersCount}>
                        {Object.values(filters).filter(Boolean).length}
                    </span>
                )}
            </button>

            {/* Panel de filtros */}
            <div
                id="book-filters"
                className={`${styles.filterPanel} ${isExpanded ? styles.expanded : ''}`}
            >
                <div className={styles.filterHeader}>
                    <Typography variant='h4' className={styles.filterTitle}>
                        <SearchIcon fontSize='medium' />Filtrar por:
                        {currentCategory && (
                            <span className={styles.categoryBadge}>
                                <Typography variant='h4'>
                                    {currentCategory}
                                </Typography>
                            </span>
                        )}
                    </Typography>
                    <button
                        onClick={handleClearFilters}
                        className={styles.clearButton}
                        disabled={Object.keys(filters).length === 0}
                        aria-label="Limpiar todos los filtros"
                    >
                        <Typography variant='body2'>
                            Limpiar filtros
                        </Typography>

                    </button>
                </div>

                <div className={styles.filterGrid}>
                    {/* Filtro por año */}
                    <div className={styles.filterGroup}>
                        <label htmlFor="filter-year" className={styles.filterLabel}>
                            <Typography variant='body2'>
                                📅 Año de publicación
                            </Typography>

                        </label>
                        <input
                            type="number"
                            id="filter-year"
                            value={filters.year || ''}
                            onChange={(e) => handleFilterChange({ year: e.target.value })}
                            placeholder="Ej: 2023"
                            min="1000"
                            max={new Date().getFullYear()}
                            className={styles.filterInput}
                            aria-label="Filtrar por año de publicación"
                        />
                        <Typography variant='caption' className={styles.filterHint}>Introduce un año específico</Typography>
                    </div>

                    {/* Filtro por recomendación */}
                    <div className={styles.filterGroup}>
                        <label htmlFor="filter-reference" className={styles.filterLabel}>
                            <Typography variant='body2'>
                                ⭐ Recomendación mínima
                            </Typography>

                        </label>
                        <select
                            id="filter-reference"
                            value={filters.minReference?.toString() || '0'}
                            onChange={(e) => handleFilterChange({
                                minReference: e.target.value === '0' ? undefined : Number(e.target.value)
                            })}
                            className={styles.filterSelect}
                            aria-label="Filtrar por puntuación mínima"
                        >
                            <option value="0">Cualquier puntuación</option>
                            <option value="5">5 estrellas ⭐⭐⭐⭐⭐</option>
                            <option value="4">4+ estrellas ⭐⭐⭐⭐</option>
                            <option value="3">3+ estrellas ⭐⭐⭐</option>
                            <option value="2">2+ estrellas ⭐⭐</option>
                            <option value="1">1+ estrella ⭐</option>
                        </select>
                        <Typography variant='caption' className={styles.filterHint}>Basado en reseñas de lectores</Typography>
                    </div>

                    {/* Filtro por autora */}
                    <div className={styles.filterGroup}>
                        <label htmlFor="filter-author" className={styles.filterLabel}>
                            <Typography variant='body2'>
                                ✍️ Autora o autor
                            </Typography>

                        </label>
                        <input
                            type="text"
                            id="filter-author"
                            value={filters.author || ''}
                            onChange={(e) => handleFilterChange({ author: e.target.value })}
                            placeholder="Ej: Isabel Allende"
                            className={styles.filterInput}
                            aria-label="Filtrar por nombre de autora o autor"
                        />
                        <Typography variant='caption' className={styles.filterHint}>Busca por nombre o apellido</Typography>
                    </div>
                </div>

                {/* Resumen de filtros activos */}
                {Object.values(filters).filter(Boolean).length > 0 && (
                    <div className={styles.activeFilters}>
                        <Typography variant='caption' className={styles.activeFiltersLabel}>Filtros activos:</Typography>
                        <div className={styles.filtersChips}>
                            {filters.year && (
                                <span className={styles.filterChip}>
                                    <Typography variant='body2'> 📅 {filters.year}</Typography>
                                   
                                    <button
                                        onClick={() => handleFilterChange({ year: undefined })}
                                        className={styles.removeChip}
                                        aria-label={`Eliminar filtro de año ${filters.year}`}
                                    >
                                        <CloseIcon fontSize='small'/>
                                    </button>
                                </span>
                            )}
                            {filters.minReference && filters.minReference > 0 && (
                                <span className={styles.filterChip}>
                                    ⭐ {filters.minReference}+
                                    <button
                                        onClick={() => handleFilterChange({ minReference: undefined })}
                                        className={styles.removeChip}
                                        aria-label={`Eliminar filtro de ${filters.minReference} estrellas`}
                                    >
                                        <CloseIcon fontSize='small'/>
                                    </button>
                                </span>
                            )}
                            {filters.author && (
                                <span className={styles.filterChip}>
                                    ✍️ {filters.author}
                                    <button
                                        onClick={() => handleFilterChange({ author: undefined })}
                                        className={styles.removeChip}
                                        aria-label={`Eliminar filtro de autora ${filters.author}`}
                                    >
                                        <CloseIcon fontSize='small'/>
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}