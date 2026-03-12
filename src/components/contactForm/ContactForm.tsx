// /app/component/contactForm/ContactForm.tsx
'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';
import { Typography } from '@mui/material';

interface FormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        if (formData.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(formData.phone)) {
            newErrors.phone = 'El teléfono no es válido';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'El asunto es obligatorio';
        } else if (formData.subject.trim().length < 5) {
            newErrors.subject = 'El asunto debe tener al menos 5 caracteres';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'El mensaje es obligatorio';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Limpiar error al escribir
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });

                // Limpiar errores
                setErrors({});

                // Resetear estado después de 5 segundos
                setTimeout(() => {
                    setSubmitStatus(null);
                }, 5000);
            } else {
                const data = await response.json();
                setSubmitStatus('error');
                alert(data.error || 'Error al enviar el mensaje. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            setSubmitStatus('error');
            alert('Error de conexión. Verifica tu conexión a internet.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                        Nombre completo *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Tu nombre completo"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                        <p id="name-error" className={styles.errorText}>
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                        Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        placeholder="tu@email.com"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className={styles.errorText}>
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>
                        Teléfono (opcional)
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                        placeholder="+34 123 456 789"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && (
                        <p id="phone-error" className={styles.errorText}>
                            {errors.phone}
                        </p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="subject" className={styles.label}>
                        Asunto *
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
                        placeholder="¿Sobre qué quieres contactarnos?"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                    />
                    {errors.subject && (
                        <p id="subject-error" className={styles.errorText}>
                            {errors.subject}
                        </p>
                    )}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                    Mensaje *
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && (
                    <p id="message-error" className={styles.errorText}>
                        {errors.message}
                    </p>
                )}
            </div>

            <div className={styles.submitContainer}>
                {submitStatus === 'success' && (
                    <div className={styles.successMessage}>
                        ✅ ¡Mensaje enviado correctamente! Te responderemos pronto.
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className={styles.errorMessage}>
                        ❌ Error al enviar el mensaje. Por favor, inténtalo de nuevo.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitButton}
                    aria-busy={isSubmitting}
                ><Typography variant='body2'>
                    {isSubmitting ? (
                        <>
                            <span className={styles.spinner} />
                            Enviando...
                        </>
                    ) : (
                        'Enviar mensaje'
                    )}
                    </Typography>
                </button>

                
            </div>
            <Typography variant='caption' className={styles.helperText}>
                    * Campos obligatorios. Tu información será tratada con confidencialidad.
                </Typography>
        </form>
    );
}