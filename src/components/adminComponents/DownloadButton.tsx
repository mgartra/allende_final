// src/components/adminComponents/DownloadButton.tsx
'use client';

import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'sonner';
import { AnalyticsData } from '@/types';

// Formateo de nombres de métricas al español
const formatMetricName = (key: string): string => {
    const mappings: Record<string, string> = {
        totalBooks: 'Total de libros',
        totalUsers: 'Total de lectores',
        totalLibrarians: 'Total de bibliotecarios',
        totalLoans: 'Total de préstamos',
        totalEvents: 'Total de eventos',
        activeLoans: 'Préstamos activos',
        overdueLoans: 'Préstamos vencidos',
        blockedUsers: 'Usuarios bloqueados',
        upcomingEvents: 'Eventos próximos',
    };

    return mappings[key] ||
        key
            .replace(/([A-Z])/g, ' $1') // camelCase → Title Case
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase()) // Primera letra mayúscula
            .trim();
};

export default function DownloadButton({ data }: { data: AnalyticsData }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = () => {
        if (!data) return;

        setIsLoading(true);

        try {
            //  Formatear métricas con nombres en español
            const metricsRows = [
                ['Métrica', 'Valor'],
                ...Object.entries(data.metrics).map(([key, value]) => [
                    formatMetricName(key),
                    value.toString()
                ]),
            ];

            // Formatear libros populares
            const booksRows = [
                ['Posición', 'Título', 'Autor', 'Préstamos totales'],
                ...data.popularBooks.map((book, index) => [
                    (index + 1).toString(),
                    book.title,
                    book.author,
                    book.loans.toString()
                ]),
            ];

            // Formatear usuarios activos
            const usersRows = [
                ['Posición', 'Nombre completo', 'Email', 'Préstamos totales'],
                ...data.activeUsers.map((user, index) => [
                    (index + 1).toString(),
                    user.name,
                    user.email,
                    user.loans.toString()
                ]),
            ];

            //  Generar contenido CSV (texto plano)
            const csvContent = [
                ...metricsRows,
                [''],
                ['LIBROS MÁS POPULARES (Top 10)'],
                ...booksRows,
                [''],
                ['USUARIOS MÁS ACTIVOS (Top 10)'],
                ...usersRows,
                [''],
                ['Fecha de generación', new Date(data.generatedAt).toLocaleString('es-ES')],
                ['Nota', 'Datos históricos acumulados desde la creación del sistema']
            ]
                .map(row =>
                    row.map(field =>
                        // Comas o comillas para CSV válido
                        field.includes(',') || field.includes('"') || field.includes('\n')
                            ? `"${field.replace(/"/g, '""')}"`
                            : field
                    ).join(',')
                )
                .join('\n');

            // Crear Blob con BOM para Excel (soporte caracteres españoles)
            const bom = '\uFEFF'; // Byte Order Mark para UTF-8 en Excel
            const blob = new Blob([bom + csvContent], {
                type: 'text/csv;charset=utf-8;'
            });

            // Descargar archivo
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `analisis-biblioteca-${new Date().toISOString().slice(0, 10)}.csv`);

            // Trigger download con fallback para Safari
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            //  Limpiar recursos
            URL.revokeObjectURL(url);

            //  Notificación de éxito
            toast.success(' Informe descargado', {
                duration: 4000,
            });

        } catch (error) {
            console.error('Error generando CSV:', error);
            toast.error(' Error al generar informe', {
                description: 'No se pudo crear el archivo CSV. Intenta nuevamente.',
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outlined"
            color="primary"
            onClick={handleDownload}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{
                textTransform: 'none',
                px: 2,
                py: 1,
                '&:hover': {
                    backgroundColor: 'primary.main',
                    color:'white',
                
                },
                minWidth: '180px',
            }}
        >
            {isLoading ? 'Generando...' : 'Descargar informe'}
        </Button>
    );
}