// /app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Register.module.css';
import { Typography } from '@mui/material';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        birth_date: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();


    //  Validación de edad mínima (16 años)
    const validateAge = (birthDate: string): string | null => {
        if (!birthDate) return null;

        const birth = new Date(birthDate);
        const today = new Date();

        //Edad mínima
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 16);

        //Edad máxima

        const maxAgeDate = new Date();
        maxAgeDate.setFullYear(today.getFullYear() - 90);

        if (isNaN(birth.getTime())) {
            return 'Fecha de nacimiento inválida';
        }

        if (birth > today) {
            return 'La fecha no puede ser futura';
        }

        //Validar edad mínima

        if (birth > minAgeDate) {
            const age = today.getFullYear() - birth.getFullYear() -
                (today.getMonth() < birth.getMonth() ||
                    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
                    ? 1 : 0);
            return `Debes tener al menos 16 años para registrarte (tienes ${age} años)`;
        }

        //Validar edad máxima
        if (birth < maxAgeDate) {
            const age = today.getFullYear() - birth.getFullYear() -
                (today.getMonth() < birth.getMonth() ||
                    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
                    ? 1 : 0);
            return `La edad máxima permitida es de 90 años (tienes aproximadamente ${age} años)`;
        }

        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));

        // Validación específica para fecha de nacimiento
        if (name === 'birth_date') {
            const ageError = validateAge(value);
            setErrors(prev => ({ ...prev, birth_date: ageError || '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        //  Validar coincidencia SOLO cuando sale del campo de confirmación
        if (name === 'confirmPassword') {
            if (value && formData.password && value !== formData.password) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Las contraseñas no coinciden'
                }));
            } else if (value && formData.password && value === formData.password) {
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
        }

        // Validar longitud de contraseña al salir del campo
        if (name === 'password' && value && value.length < 6) {
            setErrors(prev => ({
                ...prev,
                password: 'La contraseña debe tener al menos 6 caracteres'
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Verificar validaciones antes de enviar
        let hasErrors = false;
        const newErrors: Record<string, string> = {};

        // Validar contraseñas
        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
            hasErrors = true;
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Debes confirmar la contraseña';
            hasErrors = true;
        }

        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            hasErrors = true;
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
            hasErrors = true;
        }

        // Validar edad
        const ageError = validateAge(formData.birth_date);
        if (ageError) {
            newErrors.birth_date = ageError;
            hasErrors = true;
        }

        // Validar teléfono (9 dígitos)
        if (!/^\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'El teléfono debe tener exactamente 9 dígitos';
            hasErrors = true;
        }

        // Validar email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            // Eliminar confirmPassword antes de enviar (solo para validación)
            const { confirmPassword, ...dataToSend } = formData;

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                //  Manejar errores específicos del backend
                if (data.field) {
                    setErrors({ [data.field]: data.error });
                } else {
                    setErrors({ form: data.error || 'Error al registrar usuario' });
                }
            }
        } catch (err) {
            console.error('Error de red:', err);
            setErrors({ form: 'No se pudo conectar al servidor' });
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>✅</div>
                    <Typography variant='h2' className={styles.title}>¡Registro realizado!</Typography>
                    <Typography variant='body1' className={styles.message}>
                        Bienvenido a El Rincón de Allende. Serás redirigido al login en breve...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Crear cuenta</h2>
                <p className={styles.subtitle}>
                    Regístrate y disfruta de nuestros servicios
                </p>

                {errors.form && <div className={styles.error}>{errors.form}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name" className={styles.label}>
                            <Typography variant='body2'>Nombre *</Typography></label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            required
                            aria-describedby={errors.name ? "name-error" : undefined}
                        />
                        {errors.name && (
                            <Typography variant='body2' id="name-error" className={styles.errorMessage}>{errors.name}</Typography>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="last_name" className={styles.label}>
                            <Typography variant='body2'>Apellidos *</Typography>
                        </label>
                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
                            required
                            aria-describedby={errors.last_name ? "last-name-error" : undefined}
                        />
                        {errors.last_name && (
                            <p id="last-name-error" className={styles.errorMessage}>{errors.last_name}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            <Typography variant='body2'>Email *</Typography>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                            required
                            aria-describedby={errors.email ? "email-error" : undefined}
                        />
                        {errors.email && (
                            <Typography variant='body2' id="email-error" className={styles.errorMessage}>{errors.email}</Typography>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="phone" className={styles.label}>
                            <Typography variant='body2'>Teléfono (9 dígitos) *</Typography>
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                            pattern="[0-9]{9}"
                            maxLength={9}
                            required
                            aria-describedby={errors.phone ? "phone-error" : undefined}
                        />
                        {errors.phone && (
                            <Typography variant='body2' id="phone-error" className={styles.errorMessage}>{errors.phone}</Typography>
                        )}
                        <Typography variant='caption' className={styles.helperText}>Ejemplo: 612345678</Typography>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="birth_date" className={styles.label}>
                            <Typography variant='body2'>Fecha de nacimiento *</Typography>
                        </label>
                        <input
                            id="birth_date"
                            name="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.birth_date ? styles.inputError : ''}`}
                            required
                            aria-describedby={errors.birth_date ? "birth-date-error" : undefined}
                            max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                        />
                        {errors.birth_date ? (
                            <Typography variant='body2' id="birth-date-error" className={styles.error}>{errors.birth_date}</Typography>
                        ) : (
                            <Typography variant='caption' className={styles.helperText}>Debes tener al menos 16 años para registrarte</Typography>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            <Typography variant='body2'> Contraseña *</Typography>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                            minLength={6}
                            required
                            aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        {errors.password && (
                            <Typography variant='body2' id="password-error" className={styles.errorMessage}>{errors.password}</Typography>
                        )}
                        <Typography variant='caption' className={styles.helperText}>Mínimo 6 caracteres</Typography>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            <Typography variant='body2'> Confirmar contraseña *</Typography>
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                            minLength={6}
                            required
                            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                        />
                        {errors.confirmPassword ? (
                            <Typography variant='body2' id="confirm-password-error" className={styles.error}>{errors.confirmPassword}</Typography>
                        ) : formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? (
                            <Typography variant='body2' className={styles.successMessage}>✓ Las contraseñas coinciden</Typography>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                        aria-busy={isLoading}
                    ><Typography variant='body2'>
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner} />
                                    Registrando...
                                </>
                            ) : (
                                'Crear cuenta'
                            )}
                        </Typography>
                    </button>
                </form>

                <Typography variant='body2' className={styles.loginLink}>
                    ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
                </Typography>
            </div>
        </div>
    );
}