import React from 'react';
import styles from './PrivacyPage.module.css';
import { Grid, Typography, Box } from '@mui/material';

export default function PrivacyPage() {
    const lastUpdate = new Date().toLocaleDateString();
    return (
        <Grid container spacing={2} >
            <Grid size={0.5}></Grid>
            <Grid size={11}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Política de privacidad
                    </h2>
                    <Typography variant="caption" >
                        Última actualización: {lastUpdate}
                    </Typography>
                </div>
                <Box className={styles.contain} sx={{ mt: 4, pb: 8 }}>
                    <Typography variant='body1' paragraph>
                        En <strong>El Rincón de Allende</strong>, accesible desde nuestra plataforma, una de nuestras principales prioridades es la privacidad de nuestros visitantes y usuarios. Este documento de Política de Privacidad describe los tipos de información que recopilamos y cómo la utilizamos.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#f2f0eb' }}>
                        1. Información que Recopilamos
                    </Typography>
                    <Typography variant='body1' component="div" paragraph>
                        Para el correcto funcionamiento de nuestra plataforma, podemos solicitarte los siguientes datos:
                        <ul>
                            <li><strong>Información de Registro:</strong> Nombre, dirección de correo electrónico y credenciales de acceso.</li>
                            <li><strong>Datos de Préstamos:</strong> Historial de libros solicitados, fechas de devolución y preferencias literarias.</li>
                            <li><strong>Datos de Navegación:</strong> Dirección IP, tipo de navegador y páginas visitadas (recopilados de forma anónima para análisis).</li>
                        </ul>
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#f2f0eb' }}>
                        2. Uso de la Información
                    </Typography>
                    <Typography variant='body1' component="div" paragraph>
                        Utilizamos la información recopilada para:
                        <ul>
                            <li>Gestionar tu cuenta de usuario y tus préstamos de libros.</li>
                            <li>Personalizar tu experiencia de lectura y recomendaciones.</li>
                            <li>Enviarte notificaciones importantes sobre devoluciones o eventos de la biblioteca.</li>
                            <li>Mantener la seguridad de nuestra plataforma y prevenir fraudes.</li>
                        </ul>
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#f2f0eb' }}>
                        3. Almacenamiento y Protección de Datos
                    </Typography>
                    <Typography variant='body1' paragraph>
                        Adoptamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra accesos no autorizados o alteraciones. Sin embargo, recuerda que ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#f2f0eb' }}>
                        4. Derechos de los Usuarios
                    </Typography>
                    <Typography variant='body1' component="div" paragraph>
                        Como usuario, tienes derecho a:
                        <ul>
                            <li><strong>Acceder</strong> a los datos personales que tenemos sobre ti.</li>
                            <li><strong>Rectificar</strong> cualquier información que consideres inexacta.</li>
                            <li><strong>Solicitar la eliminación</strong> de tus datos de nuestros registros (Derecho al olvido).</li>
                            <li><strong>Oponerte</strong> al procesamiento de tus datos para fines informativos.</li>
                        </ul>
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#f2f0eb' }}>
                        5. Cookies
                    </Typography>
                    <Typography variant='body1' paragraph>
                        Utilizamos cookies esenciales para almacenar información sobre las preferencias de los visitantes y optimizar la experiencia de navegación. Puedes desactivar las cookies a través de la configuración de tu navegador, aunque algunas funciones del sitio podrían dejar de estar disponibles.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#f2f0eb' }}>
                        6. Contacto
                    </Typography>
                    <Typography variant='body1' paragraph>
                        Si tiene preguntas adicionales o requiere más información sobre nuestra Política de Privacidad, no dude en contactarnos a través de nuestra sección de contacto o directamente por correo electrónico a info@allende.com.
                    </Typography>
                </Box>
            </Grid>
            <Grid size={0.5}></Grid>

        </Grid>
    )
}
