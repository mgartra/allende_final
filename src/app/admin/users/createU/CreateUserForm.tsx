// /app/admin/users/create/CreateUserForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { UserType } from '@prisma/client';
import styles from './CreateUserPage.module.css';
import { Typography } from '@mui/material';
import { userAgent } from 'next/server';

interface User {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
    password: string,
    phone: string;
    birth_date: Date;
    registration_date: Date;
    blocked_until: Date | null;
    user_type: UserType;
}

interface CreateUserFormProps {
    user: User | null;
    isRoot: boolean;
}

export default function CreateUserForm({ user, isRoot }: CreateUserFormProps) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        last_name: user?.last_name || '',
        birth_date: user?.birth_date
            ? user.birth_date.toISOString().split('T')[0] // ✅ Solo la parte de fecha
            : '',
        email: user?.email || '',
        password: user?.password || '',
        phone: user?.phone || '',
        user_type: 'user',
        blocked_until: user?.blocked_until
        ? user.blocked_until.toISOString().split('T')[0]
        : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,

        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //  Validaciones antes de mostrar loading
        if (!formData.name.trim()) {
            toast.error('Nombre obligatorio', {
                description: 'El nombre del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.last_name.trim()) {
            toast.error('Apellido obligatorio', {
                description: 'El apellido del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.birth_date) {
            toast.error('Fecha de nacimiento obligatoria', {
                description: 'Debes seleccionar una fecha de nacimiento',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Email obligatorio', {
                description: 'El email del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        // Formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            toast.error('Email inválido', {
                description: 'El formato del email no es válido (ej: usuario@email.com)',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.password.trim()) {
            toast.error('Contraseña obligatoria', {
                description: 'La contraseña no puede estar vacía',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Contraseña demasiado corta', {
                description: 'La contraseña debe tener al menos 6 caracteres',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        if (!formData.phone.trim()) {
            toast.error('Teléfono obligatorio', {
                description: 'El teléfono del usuario no puede estar vacío',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        // Formato de teléfono (9 dígitos)
        const phoneRegex = /^\d{9}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
            toast.error('Teléfono inválido', {
                description: 'El teléfono debe tener exactamente 9 dígitos (sin espacios ni guiones)',
                duration: 4000,
                icon: '❌',
            });
            return;
        }

        setIsLoading(true);

        try {

            const toastId = toast.loading('Creando usuario...', {
                description: 'Procesando tu solicitud',
            });

            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {

                toast.success('Usuario creado', {
                    id: toastId,
                    description: `✅ "${data.user.name} ${data.user.last_name}" añadido correctamente`,
                    duration: 3500,
                    icon: '👤',
                });


                setTimeout(() => {
                    router.push('/admin/users');
                }, 1500);
            } else {

                toast.error('Error al crear usuario', {
                    id: toastId,
                    description: data.error || 'No se pudo crear el usuario. Intenta nuevamente.',
                    duration: 5000,
                    icon: '❌',
                });
            }
        } catch (err) {
            toast.error('Error de conexión', {
                description: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                duration: 5000,
                icon: '❌',
            });
            console.error('Error al crear usuario:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>

            <div className={styles.formGroup}>
                <label htmlFor="name">Nombre *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                    placeholder="Ej: Juan"
                    autoFocus
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="last_name">Apellido *</label>
                <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                    placeholder="Ej: Pérez"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="birth_date">Fecha de Nacimiento *</label>
                <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                    placeholder="ejemplo@email.com"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="password">Contraseña *</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="phone">Teléfono *</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                    placeholder="123456789"
                    pattern="\d{9}"
                />
            </div>
            {isRoot && (
                <div className={styles.formGroup}>
                    <div className={styles.optionUsers}>
                        {/* Opción:lector */}
                        <label className={styles.radioLabel}>
                            <input
                                type='radio'
                                name='user_type'
                                value='user'
                                checked={formData.user_type === 'user'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    user_type: e.target.value as 'user' | 'librarian'
                                }))}
                                required
                            />
                            <span className={styles.radioText}>¿Es usuaria o usuario? *</span>
                        </label>


                        {/* Opción: Bibliotecario */}

                        <label className={styles.radioLabel}>
                            <input
                                type='radio'
                                name='user_type'
                                value='librarian'
                                checked={formData.user_type === 'librarian'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    user_type: e.target.value as 'user' | 'librarian'
                                }))}
                                required
                            />

                            <span className={styles.radioText}>¿Es bibliotecaria o bibliotecario? *</span>
                        </label>

                    </div>
                </div>
            )}
            {/* Si no es root mostrar siempre fijo el valor de usuario lector */}
            {!isRoot && (
                <input type='hidden' name='user_type' value='user' />
            )}

            <div className={styles.formGroup}>
                <label htmlFor="blocked_until">Bloqueado hasta (opcional)</label>
                <input
                    type="datetime-local"
                    id="blocked_until"
                    name="blocked_until"
                    value={formData.blocked_until}
                    onChange={handleChange}
                    className={styles.input}
                    disabled={isLoading}
                />
                <small className={styles.helpText}>
                    Si se establece, el usuario no podrá iniciar sesión hasta esta fecha
                </small>
            </div>

            <div className={styles.formActions}>
                <button
                    type="button"
                    onClick={() => router.push('/admin/users')}
                    className={styles.cancelButton}
                    disabled={isLoading}
                ><Typography variant='body2'>
                        Cancelar
                    </Typography>
                </button>
                <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={isLoading}
                ><Typography variant='body2'>
                        {isLoading ? 'Creando...' : 'Crear usuario'}
                    </Typography>
                </button>
            </div>
        </form>
    );
}