// app/admin/events/create/CreateEventForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
    Typography,
    Box,
    FormHelperText,
    CircularProgress
} from '@mui/material';
import { ChangeEvent } from 'react';
import styles from './CreateEventPage.module.css';

interface Librarian {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
}

interface CreateEventFormProps {
    librarians: Librarian[];
    defaultUserId?: number;
    isLibrarian: boolean;
}

export default function CreateEventForm({
    librarians,
    defaultUserId,
    isLibrarian
}: CreateEventFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: 'default-event.jpg',
        event_date: '',
        capacity: '',
        user_id: defaultUserId?.toString() || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    //  Validación del formulario
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!formData.event_date) {
            newErrors.event_date = 'La fecha es obligatoria';
        } else {
            const eventDate = new Date(formData.event_date);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (isNaN(eventDate.getTime())) {
                newErrors.event_date = 'Fecha inválida';
            } else if (eventDate < now) {
                newErrors.event_date = 'La fecha debe ser futura';
            }
        }

        if (!formData.capacity) {
            newErrors.capacity = 'La capacidad es obligatoria';
        } else {
            const capacity = parseInt(formData.capacity);
            if (isNaN(capacity) || capacity <= 0) {
                newErrors.capacity = 'La capacidad debe ser mayor que 0';
            } else if (capacity > 100) {
                newErrors.capacity = 'La capacidad máxima es 100 personas';
            }
        }

        if (!isLibrarian && !formData.user_id) {
            newErrors.user_id = 'Debes seleccionar un bibliotecario gestor';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //  Manejar cambio de input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Limpiar error al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    //  Manejar cambio de select
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };


    //  Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        const toastId = toast.loading('Creando evento...');

        try {
            const response = await fetch('/api/events/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    image: formData.image.trim() || 'default-event.jpg',
                    event_date: formData.event_date,
                    capacity: formData.capacity,
                    user_id: isLibrarian ? defaultUserId : parseInt(formData.user_id), 
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('✅ Evento creado correctamente', {
                    id: toastId,
                    description: `"${result.event.name}" ya está programado en el calendario`,
                    duration: 4000,
                });

                //  Redirigir a la lista de eventos tras 1.5 segundos
                setTimeout(() => {
                    router.push('/admin/events');
                }, 1500);
            } else {
                throw new Error(result.message || result.error || 'Error al crear el evento');
            }
        } catch (error) {
            toast.error('❌ Error al crear evento', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Intenta nuevamente',
                duration: 5000,
            });
            console.error('Error al crear evento:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <Typography variant="h6" className={styles.sectionTitle}>
                Información básica
            </Typography>

            <TextField
                fullWidth
                label="Nombre del evento *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
                placeholder="Ej: Club de Lectura: Cien años de soledad"
                disabled={isLoading}
            />

            <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                margin="normal"
                placeholder="Describe el evento, actividades previstas, etc."
                disabled={isLoading}
            />

            <TextField
                fullWidth
                label="Imagen (opcional)"
                name="image"
                value={formData.image}
                onChange={handleChange}
                margin="normal"
                placeholder="default-event.jpg"
                disabled={isLoading}
                helperText="Nombre del archivo en /public/images/events/"
            />

            <Typography variant="h6" className={styles.sectionTitle} sx={{ mt: 3 }}>
                Configuración
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                <TextField
                    fullWidth
                    label="Fecha y hora *"
                    name="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={handleChange}
                    error={!!errors.event_date}
                    helperText={errors.event_date || 'Fecha futura requerida'}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    disabled={isLoading}
                />

                <TextField
                    fullWidth
                    label="Capacidad máxima *"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    error={!!errors.capacity}
                    helperText={errors.capacity || 'Máximo 100 personas'}
                    margin="normal"
                    placeholder="Ej: 25"
                    disabled={isLoading}
                    inputProps={{ min: 1, max: 500 }}
                />
            </Box>

            {!isLibrarian && librarians.length > 0 && (
                <>
                    <Typography variant="h6" className={styles.sectionTitle} sx={{ mt: 3 }}>
                        Gestor del evento
                    </Typography>

                    <FormControl
                        fullWidth
                        margin="normal"
                        error={!!errors.user_id}
                        disabled={isLoading}
                    >
                        <InputLabel id="user-id-label">Bibliotecario gestor *</InputLabel>
                        <Select
                            labelId="user-id-label"
                            name="user_id"
                            value={formData.user_id}
                             onChange={handleSelectChange}
                            label="Bibliotecario gestor *"
                        >
                            <MenuItem value="">
                                <em>Selecciona un bibliotecario</em>
                            </MenuItem>
                            {librarians.map((lib) => (
                                <MenuItem key={lib.user_id} value={lib.user_id}>
                                    {lib.name} {lib.last_name} 
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.user_id && (
                            <FormHelperText error>{errors.user_id}</FormHelperText>
                        )}
                    </FormControl>
                </>
            )}

            {isLibrarian && defaultUserId && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="info.dark">
                        ✅ Este evento se asignará automáticamente a tu perfil como gestor:
                        <strong> {librarians.find(l => l.user_id === defaultUserId)?.name} {librarians.find(l => l.user_id === defaultUserId)?.last_name}</strong>
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                    type="button"
                    variant="outlined"
                    onClick={() => router.push('/admin/events')}
                    disabled={isLoading}
                    sx={{ flex: 1 }}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                        flex: 1,
                        bgcolor: '#6D1E3A',
                        '&:hover': { bgcolor: '#5a0f03' }
                    }}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isLoading ? 'Creando...' : 'Crear evento'}
                </Button>
            </Box>
        </form>
    );
}