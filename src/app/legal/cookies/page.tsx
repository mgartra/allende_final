import React from 'react';
import styles from '../privacy/PrivacyPage.module.css';
import { Grid, Typography, Box } from '@mui/material';

export default function CookiesPage() {
    const lastUpdate = new Date().toLocaleDateString();

    return (
        <Grid container spacing={2} className={styles.privacyWrapper}>
              <Grid size={0.5}></Grid>
            <Grid size={11}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Política de Cookies
                    </h2>
                    <Typography variant="caption" >
                        Última actualización: {lastUpdate}
                    </Typography>
                </div>

                <Box className={styles.contain} sx={{ mt: 4, pb: 8 }}>
                    <Typography variant='body1' paragraph>
                        En <strong>El Rincón de Allende</strong> utilizamos cookies para facilitar la navegación y mejorar tu experiencia como usuario. A continuación, te explicamos qué son, cuáles usamos y cómo puedes gestionarlas.
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        1. ¿Qué son las cookies?
                    </Typography>
                    <Typography variant='body1' paragraph>
                        Una cookie es un pequeño archivo de texto que un sitio web almacena en tu navegador. Sirven para recordar tus preferencias, como el idioma o tus datos de inicio de sesión, y para entender cómo interactúas con nuestra biblioteca digital.
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        2. Tipos de Cookies que utilizamos
                    </Typography>
                    <Typography variant='body1' component="div" paragraph>
                        <ul>
                            <li><strong>Cookies Técnicas (Necesarias):</strong> Son esenciales para que la web funcione. Permiten, por ejemplo, que te mantengas logueado en tu cuenta mientras navegas por las categorías.</li>
                            <li><strong>Cookies de Personalización:</strong> Permiten recordar información para que accedas al servicio con determinadas características (por ejemplo, el idioma o la apariencia del catálogo).</li>
                            <li><strong>Cookies de Análisis:</strong> Nos ayudan a saber qué libros o categorías son los más visitados para mejorar nuestra oferta bibliográfica.</li>
                        </ul>
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        3. Gestión de Cookies
                    </Typography>
                    <Typography variant='body1' paragraph>
                        Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador que utilices. Ten en cuenta que, si bloqueas las cookies técnicas, es posible que algunas funciones de la web no operen correctamente.
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        4. Cookies de Terceros
                    </Typography>
                    <Typography variant='body1' paragraph>
                        En algunos casos, utilizamos servicios de terceros (como Google Analytics) que también pueden instalar cookies en tu dispositivo para realizar mediciones estadísticas de nuestra audiencia.
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        5. Más información
                    </Typography>
                    <Typography variant='body1' paragraph>
                        Si tienes cualquier duda sobre nuestra política de cookies, puedes contactar con nosotros en soporte@elrincondeallende.com.
                    </Typography>
                </Box>
            </Grid>
              <Grid size={0.5}></Grid>
        </Grid>
    );
}