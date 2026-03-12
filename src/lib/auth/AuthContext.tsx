'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/auth/auth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();


    const refreshUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user || null);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Cargar usuario al iniciar
    useEffect(() => {
        refreshUser();
    }, []);

    // Login
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                await refreshUser();
                return true;
            }

            // Obtener mensaje de error para mostrar al usuario
            const errorData = await res.json().catch(() => ({}));
            console.error('Error de login:', errorData.error || 'Credenciales incorrectas');
            return false;
        } catch (error) {
            console.error('Error en login:', error);
            return false;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Error en logout:', error);
            setUser(null);
            router.push('/');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                refreshUser,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook para usar el contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}