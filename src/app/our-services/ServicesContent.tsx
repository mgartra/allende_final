// /app/services/ServicesContent.tsx
'use client';

import {
    Container,
    Grid,
    Typography,
    Paper,
    Box,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore,
    Stadium,
    AutoStories,
} from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PaletteIcon from '@mui/icons-material/Palette';
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import styles from './ServicesPage.module.css';

// Datos desde JSON (ruta relativa al proyecto)
import servicesData from '../../../data/services-content.json';
import Link from 'next/link';

// Mapea nombres de iconos a componentes MUI
const getLoanIcon = (iconName: string) => {
    switch (iconName) {
        case 'access_time':
            return <AccessTimeIcon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        case 'attach_money':
            return <AttachMoneyIcon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        case 'check_circle':
            return <CheckCircleIcon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        case 'warning':
            return <WarningIcon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        default:
            return null;
    }
};
const getEventIcon = (iconName: string) => {
    switch (iconName) {
        case 'menu':
            return <MenuBookIcon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        case 'palette':
            return <PaletteIcon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        case 'photo':
            return <PhotoFilterIcon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        case 'diversity':
            return <Diversity1Icon sx={{ fontSize: '3rem', color: '#6D1E3A' }} />;
        default:
            return null;
    }
}
const getRequirementIcon = (iconName: string) => {
    switch (iconName) {
        case 'calendar_today':
            return <CalendarMonthIcon sx={{ color: '#6D1E3A' }} />;
        case 'people':
            return <PeopleIcon sx={{ color: '#6D1E3A' }} />;
        case 'location_on':
            return <LocationOnIcon sx={{ color: '#6D1E3A' }} />;
        case 'local_library':
            return <LocalLibraryIcon sx={{ color: '#6D1E3A' }} />;
        default:
            return null;
    }
};

export default function ServicesContent() {
    // Uso de datos del JSON
    const loanRules = servicesData.loans.rules;
    const loanSteps = servicesData.loans.steps;
    const eventTypes = servicesData.events.types;
    const eventRequirements = servicesData.events.requirements;
    const faqs = servicesData.faqs;

    return (
        <main className={styles.mainWrapper}>
            {/* Header / Hero */}
            <header className={styles.heroSection}>

                <Divider sx={{ my: 2, borderColor: 'divider', }}><Typography variant='h2' className={styles.mainTitle}>
                    Nuestros <span className={styles.highlight}>servicios</span> disponibles</Typography></Divider>
                {/* <Divider sx={{  borderColor: '#d9921c', borderWidth: '2px', width: '120px', mx: 'auto', marginTop:'0' }} /> */}

                <Typography variant='subtitle1' className={styles.heroSubtitle}>
                    Tu puerta de acceso al conocimiento y la dinamización cultural en Allende.
                </Typography>

            </header>

            <Grid container>
                <Grid size={0.5}></Grid>
                <Grid size={11}>
                    <Grid container spacing={6}>


                        {/* SECCIÓN PRÉSTAMOS */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <section className={styles.serviceSection}>
                                <div className={styles.sectionHeader}>
                                    <AutoStories className={styles.sectionIcon} />
                                    <Typography variant="h3">Préstamos</Typography>
                                </div>
                                <Divider
                                    sx={{
                                        my: 3,
                                        height: '1px',
                                        backgroundColor: '#6D1E3A',
                                        borderRadius: '1px',
                                        opacity: 0.9
                                    }}
                                />
                                <Typography variant='subtitle1' className={styles.sectionDescription}>
                                    Disponemos de un fondo bibliográfico de más de 10.000 ejemplares a tu disposición.
                                </Typography>





                                <div className={styles.rulesGrid}>
                                    {loanRules.map((rule, i) => (
                                        <div key={i} className={styles.ruleCard}>
                                            <div className={styles.ruleIconWrapper}>
                                                {getLoanIcon(rule.icon)}
                                            </div>
                                            <Typography variant="h6">{rule.title}</Typography>
                                            <Typography variant="body2">{rule.description}</Typography>
                                        </div>
                                    ))}
                                </div>

                                <Typography variant="h6" className={styles.subTitleSmall}>El Proceso</Typography>
                                <div className={styles.timeline}>
                                    {loanSteps.map((step, i) => (
                                        <div key={i} className={styles.timelineItem}>
                                            <span className={styles.timelineNumber}>{step.step}</span>
                                            <div className={styles.timelineContent}>
                                                <Typography variant="h6" fontWeight="700">
                                                    {step.title}
                                                </Typography>
                                                <Typography variant="body2">{step.description}</Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </Grid>

                        {/* SECCIÓN EVENTOS */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <section className={styles.serviceSection}>
                                <div className={styles.sectionHeader}>
                                    <Stadium className={styles.sectionIcon} />
                                    <Typography variant="h3">Eventos</Typography>
                                </div>
                                <Divider
                                    sx={{
                                        my: 3,
                                        height: '1px',
                                        backgroundColor: '#6D1E3A',
                                        borderRadius: '1px',
                                        opacity: 0.9
                                    }}
                                />
                                <Typography variant='subtitle1' className={styles.sectionDescription}>
                                    Cede tu espacio o participa en las actividades culturales programadas mensualmente.
                                </Typography>
                                <div className={styles.rulesGrid}>
                                    {eventTypes.map((type, i) => (
                                        <div key={i} className={styles.ruleCard}>
                                            <div className={styles.ruleIconWrapper}>
                                                {getEventIcon(type.icon)}
                                            </div>
                                            <Typography variant="h6">{type.title}</Typography>
                                            <Typography variant="body2">{type.description}</Typography>
                                        </div>
                                    ))}
                                </div>

                                <Box className={styles.requirementsSection}>
                                    <Typography variant="h6" sx={{ mb: 2 }} className={styles.subTitleSmall}>
                                        Requisitos para organizar un evento
                                    </Typography>
                                    <List dense>
                                        {eventRequirements.map((req, i) => (
                                            <ListItem key={i} sx={{ py: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    {getRequirementIcon(req.icon)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="h6" fontWeight="600">
                                                            {req.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant='body2'> {req.description}</Typography>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>


                            </section>
                        </Grid>

                        {/* FAQ SECTION */}
                        <Grid size={12}>
                            <section className={styles.faqSection}>
                                <Typography variant="h3" align="center" sx={{ mb: 4 }}>
                                    <HelpOutlineIcon /> Preguntas frecuentes
                                </Typography>
                                <div className={styles.faqGrid}>
                                    {faqs.map((faq, i) => (
                                        <Accordion key={i} elevation={0} className={styles.customAccordion}>
                                            <AccordionSummary expandIcon={<ExpandMore />}>
                                                <Typography fontWeight="600">{faq.question}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography variant="body2" color="text.main">
                                                    {faq.answer}
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </div>
                            </section>
                        </Grid>

                    </Grid>
                    <Box className={styles.ctaBox}>
                        <Typography variant="h6">¿Tienes una propuesta?</Typography>
                        <Typography variant="body2">
                            Escríbemos cualquier duda o sugerencia y en menos de 24 horas te respónderemos
                        </Typography>
                        <Link href="/contact" className={styles.primaryBtn}>
                            Solicitar Consulta
                        </Link>
                    </Box>
                </Grid>
                <Grid size={0.5}></Grid>
            </Grid>
        </main>
    );
}