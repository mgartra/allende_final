'use client';
import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@mui/material';
import Link from 'next/link';

export default function AuthButton() {
    const { user, logout, loading } = useAuth();

    if (loading) return <Button disabled>Cargando...</Button>;
    if (!user) {
        return (
            <Link href="/login">
                <Button
                    variant='outlined'
                    sx={{
                        borderColor: '#6D1E3A',
                        color: '#6D1E3A',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: '#f0e9e1'
                        }
                    }}>

                </Button>
            </Link>
        )
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#6D1E3A', fontWeight: 500 }}>
                ¡Hola, {user.name}!
            </span>
            <Button
                variant="outlined"
                onClick={() => logout()}
                sx={{
                    borderColor: '#dc3545',
                    color: '#dc3545',
                    textTransform: 'none',
                    '&:hover': {
                        bgcolor: '#ffe6e6'
                    }
                }}
            >
                Cerrar sesión
            </Button>
        </div>
    )
}
