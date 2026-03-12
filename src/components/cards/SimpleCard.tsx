import React from 'react';
import Icon from '../icons_ui/Icon';
import { Box, Typography, Card, CardContent } from '@mui/material';
import styles from './SimpleCard.module.css';
import Image from 'next/image';

interface SimpleCardProps {
    name?: string;
    color?: string;
    iconName?: string;
    iconSize?: number;
}
export default function SimpleCard({
    name = '',
    color = '',
    iconName,
    iconSize = 48
}: SimpleCardProps) {

    return (
        <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                {/* Icono (con número) */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2
                }}>
                    <Image
                        src={`/icons/${iconName}.svg`} // ✅ Usa el número directamente
                        alt={name}
                        width={iconSize}
                        height={iconSize}
                    />
                </Box>
                {/* ✅ Título: Visible SOLO en hover (desktop) */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        opacity: { xs: 1, md: 0 }, // ✅ En móvil: siempre visible, en desktop: oculto
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                            opacity: { xs: 1, md: 1 } // ✅ Al hacer hover: visible en todos los dispositivos
                        }
                    }}
                >
                    {name}
                </Typography>
            </CardContent>
        </Card>
    )
}
