// src/app/components/topBar/TopBar.tsx
'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';

export default function TopBar() {
    return (
        <Box
            component="header"
            role="banner"
            sx={{
                width: '100%',
                minHeight: '4.8rem',
                backgroundColor: 'background.default',
                color: 'primary.main', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Container
                maxWidth="xl"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'space-between' },
                    gap: { xs: 1, md: 2 },
                    px: 2,
                    py: 0.5,
                }}
            >
                {/* Teléfono - Clicable */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    <PhoneAndroidIcon
                        sx={{ fontSize: '1.2rem', opacity: 0.9 }}
                        aria-hidden="true"
                    />
                    <Typography
                        variant="body2"
                        component="a"
                        href="tel:+34666777888"
                        sx={{
                            color: 'inherit',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: { xs: '1.2rem', md: '1.4rem' },
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        +34 666 777 888
                    </Typography>
                </Box>

                {/* Horario - Visible solo en desktop */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    <QueryBuilderIcon
                        sx={{ fontSize: '1.2rem', opacity: 0.9 }}
                        aria-hidden="true"
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            fontSize: { xs: '1.2rem', md: '1.4rem' },
                        }}
                    >
                        Lun - Vie: 9:00 - 20:00
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}