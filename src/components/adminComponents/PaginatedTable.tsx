// src/components/admin/PaginatedTable.tsx
'use client';

import { useState } from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Pagination,
    Box
} from '@mui/material';
import styles from './PaginatedTable.module.css';

// Tipos del componente
export interface Column {
    header: string;
    field: string;
    render?: (value: unknown) => React.ReactNode;
}

export interface PaginatedTableProps<T> {
    data: T[];
    columns: Column[];
    itemsPerPage?: number;
    keyField: keyof T;
    emptyMessage?: string;
    entityName?: string;
    actions?: (item: T) => React.ReactNode;
    actionsHeader?: string;
}

export default function PaginatedTable<T>({
    data,
    columns,
    itemsPerPage = 10,
    keyField,
    emptyMessage = 'No hay datos para mostrar',
    entityName = 'elementos',
    actions,
    actionsHeader = 'Acciones',
}: PaginatedTableProps<T>) {
    // Estado para la página actual
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Calcular el número total de páginas
    const totalPages: number = Math.ceil(data.length / itemsPerPage);

    // Calcular los datos para la página actual
    const startIndex: number = (currentPage - 1) * itemsPerPage;
    const endIndex: number = startIndex + itemsPerPage;
    const dataToShow: T[] = data.slice(startIndex, endIndex);

    // Si no hay datos, mostrar mensaje
    if (data.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                </Typography>
            </div>
        );
    }

    // Función para renderizar una celda
    const renderCell = (item: T, col:Column): React.ReactNode => {
        const value = (item as Record<string, unknown>)[col.field];

        // Si es null o undefined, mostrar "—"
        if (value == null) {
            return '—';
        }

        if(col.render){
            return col.render(value);
        }

        // Si es fecha, formatear
        if (value instanceof Date) {
            return value.toLocaleDateString('es-ES');
        }

        // Si es array, unir con comas
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        // Por defecto, convertir a string
        return String(value);
    };

    return (
        <Box className={styles.container}>
            {/* Tabla para desktop */}
            <div className={`${styles.tableWrapper} ${styles.desktopOnly}`}>
                <Table className={styles.table}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col, index) => (
                                <TableCell key={`header-${index}`} className={styles.tableHeader}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {col.header}
                                    </Typography>
                                </TableCell>
                            ))}
                            {actions && (
                                <TableCell key="header-actions" className={styles.tableHeader} align="right">
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {actionsHeader}
                                    </Typography>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataToShow.map((item) => (
                            <TableRow
                                key={String(item[keyField])}
                                hover
                                sx={{ '&:last-child td': { border: 0 } }}
                            >
                                {columns.map((col, index) => (
                                    <TableCell key={`cell-${String(item[keyField])}-${index}`}>
                                        <Typography variant="body2">
                                            {renderCell(item, col)}
                                        </Typography>
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell align="right">
                                        {actions(item)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        color="primary"
                        size="medium"
                    />
                    <Typography variant="body2" className={styles.paginationInfo}>
                        Mostrando {startIndex + 1} - {Math.min(endIndex, data.length)} de {data.length} {entityName}
                    </Typography>
                </div>
            )}

            {/* Vista de tarjetas para móvil */}
            <div className={`${styles.cardGrid} ${styles.mobileOnly}`}>
                {dataToShow.map((item) => (
                    <div key={String(item[keyField])} className={styles.card}>
                        {columns.map((col, index) => (
                            <div key={`mobile-${String(item[keyField])}-${index}`} className={styles.cardRow}>
                                <Typography variant="subtitle2" className={styles.cardLabel}>
                                    {col.header}:
                                </Typography>
                                <Typography variant="body2">
                                    {renderCell(item, col)}
                                </Typography>
                            </div>
                        ))}
                        {actions && (
                            <div className={styles.cardActions}>
                                {actions(item)}
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </Box>
    );
}