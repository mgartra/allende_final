'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import styles from './Login.module.css';
import Link from 'next/link';
import { Typography } from '@mui/material';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const success = await login(email, password);

            if (success) {
                router.push('/');
            } else {
                setError('Email o contraseña incorrecta');
            }
        } catch (err) {
            console.error('Error de login:', err);
            setError('Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Typography variant='h2' className={styles.title}>Iniciar sesión</Typography>
                <Typography variant='subtitle1' className={styles.subtitle}>Accede a nuestra biblioteca y descubre nuestro contenido</Typography>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            <Typography variant='body1'>Email</Typography></label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            <Typography variant='body1'>Contraseña</Typography></label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando...' : 'Entrar'}
                    </button>
                    <Link href="/register" className={styles.register}>Regístrate</Link>
                </form>
            </div>

        </div>
    );
}
