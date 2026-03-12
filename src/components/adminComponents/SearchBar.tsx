// src/components/admin/SearchBar.tsx
'use client';

import { useState } from 'react';
import {
    TextField,
    InputAdornment,
    IconButton,
    Box,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import styles from './SearchBar.module.css';

// Tipos genéricos para máxima reutilización
export interface SearchBarProps<T> {
    data: T[];                          // Datos originales (sin filtrar)
    onSearch: (filteredData: T[]) => void; // Callback con datos filtrados
    searchFields: (keyof T)[];          // Campos donde buscar (ej: ['name', 'email'])
    placeholder?: string;               // Placeholder personalizable
    size?: 'small' | 'medium';          // Tamaño del input
    autoFocus?: boolean;                // Enfocar al montar
    className?: string;                 // Clase CSS adicional
}

export default function SearchBar<T>({
    data,
    onSearch,
    searchFields,
    placeholder = 'Buscar...',
    size = 'medium',
    autoFocus = false,
    className = '',
}: SearchBarProps<T>) {
    const [searchTerm, setSearchTerm] = useState<string>('');


    const handleSearch = (value: string) => {
        setSearchTerm(value);

        if (value.trim() === ''){
            onSearch(data);
            return
        }

        const filtered = data.filter(item =>
            searchFields.some(field => {
                const fieldValue = item[field];

                if (fieldValue == null) return false;

                if (typeof fieldValue === 'string') {
                    return fieldValue.toLowerCase().includes(value.toLowerCase());
                }

                if (typeof fieldValue === 'number') {
                    return fieldValue.toString().includes(value);
                }

            
                if (typeof fieldValue === 'object' && fieldValue !== null) {
                    return JSON.stringify(fieldValue).toLowerCase().includes(value.toLowerCase());
                }

                return false;
            })
        );

        onSearch(filtered);
    };

    //  Limpiar búsqueda
    const handleClear = () => {
        handleSearch('');
    };

    return (
        <Box className={`${styles.container} ${className}`}>
            <TextField
                id='search-bar-input'
                fullWidth
                variant="outlined"
                size={size}
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus={autoFocus}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={handleClear}
                                edge="end"
                                aria-label="Limpiar búsqueda"
                            >
                                <ClearIcon sx={{ color: 'text.secondary', fontSize: '16px' }} />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                            borderColor: 'divider',
                        },
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                        },
                    },
                }}
            />

            {/* Mostrar resultados en tiempo real */}
            {searchTerm && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    className={styles.resultsCount}
                >
                    {data.length === 0
                        ? 'Sin resultados'
                        : `${data.length} resultado${data.length !== 1 ? 's' : ''} encontrado${data.length !== 1 ? 's' : ''}`}
                </Typography>
            )}
        </Box>
    );
}