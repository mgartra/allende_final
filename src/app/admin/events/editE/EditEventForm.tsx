// app/admin/events/edit/[eventId]/EditEventForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    FormHelperText,
    CircularProgress,
    Alert
} from '@mui/material';
import { ChangeEvent } from 'react';
import styles from './EditEventPage.module.css';

interface Librarian {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
}

interface EventData {
    event_id: number;
    name: string;
    description: string;
    image: string;
    event_date: string;
    capacity: string;
    participants: number;
    cancelations: number;
    user_id: string;
    organizer_name: string;
}

interface EditEventFormProps {
    event: EventData;
    librarians: Librarian[];
    isRoot: boolean;
    isLibrarian: boolean;
}

export default function EditEventForm({
    event,
    librarians,
    isRoot,
    isLibrarian
}: EditEventFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: event.name,
        description: event.description,
        image: event.image,
        event_date: event.event_date,
        capacity: event.capacity,
        user_id: event.user_id,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string>('');

    // Efecto para resetear errores cuando cambian los datos
    useEffect(() => {
        setErrors({});
        setServerError('');
    }, [formData]);

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
                newErrors.event_date = 'La fecha debe ser futura o hoy';
            }
        }

        if (!formData.capacity) {
            newErrors.capacity = 'La capacidad es obligatoria';
        } else {
            const capacity = parseInt(formData.capacity);
            const participants = event.participants;
            const cancelations = event.cancelations;

            if (isNaN(capacity) || capacity <= 0) {
                newErrors.capacity = 'La capacidad debe ser mayor que 0';
            } else if (capacity > 500) {
                newErrors.capacity = 'La capacidad máxima es 500 personas';
            } else if (capacity < participants + cancelations) {
                newErrors.capacity = `La capacidad no puede ser menor que la suma de participantes (${participants}) y cancelaciones (${cancelations})`;
            }
        }

        if (isRoot && !formData.user_id) {
            newErrors.user_id = 'Debes seleccionar un bibliotecario gestor';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //  CORRECCIÓN 1: Tipar evento de input correctamente
   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

   
   const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

   
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        const toastId = toast.loading('Actualizando evento...');

        try {
            const response = await fetch(`/api/events/update/${event.event_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    image: formData.image.trim() || 'default-event.jpg',
                    event_date: formData.event_date,
                    capacity: formData.capacity,
                    participants: event.participants,
                    cancelations: event.cancelations,
                    user_id: isRoot ? parseInt(formData.user_id) : event.user_id,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('✅ Evento actualizado correctamente', {
                    id: toastId,
                    description: `"${result.event.name}" ha sido modificado`,
                    duration: 4000,
                });

                setTimeout(() => {
                    router.push('/admin/events');
                }, 1500);
            } else {
                setServerError(result.message || result.error || 'Error al actualizar el evento');
                throw new Error(result.message || result.error || 'Error al actualizar el evento');
            }
        } catch (error) {
            toast.error('❌ Error al actualizar evento', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Intenta nuevamente',
                duration: 5000,
            });
            console.error('Error al actualizar evento:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                </Alert>
            )}

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
                    helperText={errors.capacity || `Actualmente: ${event.participants} participantes + ${event.cancelations} cancelaciones`}
                    margin="normal"
                    placeholder="Ej: 25"
                    disabled={isLoading}
                    inputProps={{ min: 1, max: 500 }}
                />
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <Typography variant="body2" color="warning.dark">
                    ⚠️ <strong>Participantes actuales:</strong> {event.participants} inscritos, {event.cancelations} cancelados
                </Typography>
            </Box>

            {isRoot && librarians.length > 0 && (
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
                            label="Bibliotecario gestor *"
                        >
                            <MenuItem value="">
                                <em>Selecciona un bibliotecario</em>
                            </MenuItem>
                            {librarians.map((lib) => (
                                <MenuItem
                                    key={lib.user_id}
                                    value={lib.user_id}
                                
                                >
                                    {lib.name} {lib.last_name} ({lib.email})
                                    
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.user_id && (
                            <FormHelperText error>{errors.user_id}</FormHelperText>
                        )}
                    </FormControl>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Actualmente gestionado por: <strong>{event.organizer_name}</strong>
                    </Typography>
                </>
            )}

            {!isRoot && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="info.dark">
                        ✅ Este evento está asignado a: <strong>{event.organizer_name}</strong>
                        <br />
                        Como bibliotecario, no puedes cambiar el gestor del evento. Solo el administrador puede hacerlo.
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
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </Box>
        </form>
    );
}