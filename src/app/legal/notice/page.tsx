import React from 'react';
import styles from '../privacy/PrivacyPage.module.css'; 
import { Grid, Typography, Box } from '@mui/material';

export default function LegalNoticePage() {
    const lastUpdate = new Date().toLocaleDateString();

    return (
        <Grid container spacing={2} className={styles.privacyWrapper}>
             <Grid size={0.5}></Grid>
             <Grid size={11}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Aviso Legal
                    </h2>
                    <Typography variant="caption" >
                        Última actualización: {lastUpdate}
                    </Typography>
                </div>

                <Box className={styles.contain} sx={{ mt: 4, pb: 8 }}>
                    <Typography variant='body1' paragraph>
                        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los datos identificativos del titular:
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        1. Datos Identificativos
                    </Typography>
                    <Typography variant='body1' component="div" paragraph>
                        <ul>
                            <li><strong>Denominación Social:</strong> [Tu Nombre o Nombre de Empresa]</li>
                            <li><strong>CIF / NIF:</strong> [Tu número de identificación]</li>
                            <li><strong>Domicilio Social:</strong> [Dirección completa]</li>
                            <li><strong>Email de contacto:</strong> contacto@elrincondeallende.com</li>
                        </ul>
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        2. Propiedad Intelectual e Industrial
                    </Typography>
                    <Typography variant='body1' paragraph>
                        El diseño del portal y sus códigos fuente, así como los logos, marcas y demás signos distintivos que aparecen en el mismo, pertenecen a <strong>El Rincón de Allende</strong> y están protegidos por los correspondientes derechos de propiedad intelectual e industrial.
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        3. Responsabilidad de los Contenidos
                    </Typography>
                    <Typography variant='body1' paragraph>
                        No nos hacemos responsables de la legalidad de otros sitios web de terceros desde los que pueda accederse al portal. Tampoco respondemos por la legalidad de otros sitios web de terceros, que pudieran estar vinculados o enlazados desde este portal.
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        4. Ley Aplicable
                    </Typography>
                    <Typography variant='body1' paragraph>
                        La ley aplicable en caso de disputa o conflicto de interpretación de los términos que conforman este aviso legal, así como cualquier cuestión relacionada con los servicios del presente portal, será la ley española.
                    </Typography>

                    <Typography variant="h5" gutterBottom>
                        5. Uso del Portal
                    </Typography>
                    <Typography variant='body1' paragraph>
                        El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que se ofrecen a través de la web, no empleándolos para incurrir en actividades ilícitas o contrarias a la buena fe y al ordenamiento legal.
                    </Typography>
                </Box>
            </Grid>
            <Grid size={0.5}></Grid>
        </Grid>
    );
}