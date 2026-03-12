// app/admin/analytics/page.tsx
import { getUserFromCookies } from '@/lib/auth/auth';
import { cookies } from 'next/headers';
import { getAnalyticsData } from '@/lib/data/analytics'; 
import { Grid, Typography, Box, Chip, LinearProgress, Divider } from '@mui/material';
import DownloadButton from '@/components/adminComponents/DownloadButton';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import LockIcon from '@mui/icons-material/Lock';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WorkIcon from '@mui/icons-material/Work';

import styles from './AnalyticsPage.module.css';

export default async function AnalyticsPage() {
    const cookieStore = await cookies();
    const user = await getUserFromCookies(cookieStore);


    const isRoot = user?.type === 'root';
    const isLibrarian = user?.type === 'user' && user.userType === 'librarian';

    if (!user || (!isRoot && !isLibrarian)) {
        return (
            <div className={styles.unauthorized}>
                <Typography variant='h2' color="error">Acceso denegado</Typography>
                <Typography variant='body1' sx={{ mt: 2 }}>
                    Solo el personal autorizado puede acceder a los análisis e informes.
                </Typography>
            </div>
        );
    }

    let data = null;
    try {
        data = await getAnalyticsData();
    } catch (error) {
        console.error('Error al cargar análisis:', error);
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <Typography variant="h2"> Análisis y Estadísticas</Typography>
                </header>
                <div className={styles.errorState}>
                    <Typography variant="h5" color="error" gutterBottom>
                        ❌ Error al cargar los datos de análisis
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        Por favor, intenta nuevamente más tarde.
                    </Typography>
                </div>
            </div>
        );
    }


    const loanUtilization = data.metrics.totalLoans > 0
        ? Math.min(100, Math.round((data.metrics.activeLoans / data.metrics.totalLoans) * 100))
        : 0;

    const overduePercentage = data.metrics.activeLoans > 0
        ? Math.round((data.metrics.overdueLoans / data.metrics.activeLoans) * 100)
        : 0;

    return (
        <Grid container className={styles.container}>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
            <Grid size={{ xs: 11, md: 10 }}>
                <header className={styles.header}>
                    <div>
                         <Divider sx={{ my: 2, borderColor: 'divider'}}>
                            <Typography variant="h2">Análisis y Estadísticas</Typography>
                            </Divider>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                            {isRoot
                                ? 'Métricas completas del sistema bibliotecario'
                                : 'Resumen de actividad y estadísticas generales'}
                        </Typography>
                    </div>
                    
                </header>

                <div className={styles.content}>
                    {/* Métricas generales con barras de progreso */}
                    <section className={styles.section}>
                        <div className={styles.sectionTitle}>
                        <Typography variant="h3">
                            Métricas Generales
                        </Typography>
                        {isRoot && (
                    <div className={styles.headerActions}>
                        <DownloadButton data={data} />
                    </div>
                    )}</div>

                        {/* Resumen ejecutivo */}
                        <Box className={styles.executiveSummary}>
                            <Box className={styles.summaryItem}>
                                <Typography variant="body2" color="text.main">Préstamos activos</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    {data.metrics.activeLoans}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={loanUtilization}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        mt: 1,
                                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: loanUtilization > 80 ? 'success.main' :
                                                loanUtilization > 50 ? 'warning.main' : 'error.main'
                                        }
                                    }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.main' }}>
                                    {loanUtilization}% de la capacidad total
                                </Typography>
                            </Box>

                            <Box className={styles.summaryItem}>
                                <Typography variant="body2" color="text.main">Préstamos vencidos</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    {data.metrics.overdueLoans}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={overduePercentage}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        mt: 1,
                                        bgcolor: 'rgba(211, 47, 47, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: overduePercentage > 30 ? '#B00020' : '#ed6c02'
                                        }
                                    }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.main' }}>
                                    {overduePercentage}% de préstamos activos
                                </Typography>
                            </Box>

                            <Box className={styles.summaryItem}>
                                <Typography variant="body2" color="text.main">Total de préstamos</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    {data.metrics.totalLoans}
                                </Typography>
                                <Typography variant="caption" sx={{ mt: 1, color: 'text.main' }}>
                                    {data.metrics.blockedUsers === 0
                                        ? ' Sin bloqueos activos'
                                        : ` ${data.metrics.blockedUsers} usuario(s) restringidos`}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Cuadrícula de métricas */}
                        <div className={styles.metricsGrid}>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}><MenuBookIcon fontSize='large'/></div>
                                <div className={styles.metricValue}>{data.metrics.totalBooks}</div>
                                <div className={styles.metricLabel}>
                                    <Typography variant="body2">Total de Libros</Typography>
                                </div>
                            </div>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}><PeopleAltIcon fontSize='large'/></div>
                                <div className={styles.metricValue}>{data.metrics.totalUsers}</div>
                                <div className={styles.metricLabel}>
                                    <Typography variant="body2">Total de Lectores</Typography>
                                </div>
                            </div>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}><LockIcon fontSize='large'/></div>
                                <div className={styles.metricValue}>{data.metrics.blockedUsers}</div>
                                <div className={styles.metricLabel}>
                                    <Typography variant="body2">Usuarios Bloqueados</Typography>
                                </div>
                            </div>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}><WorkIcon fontSize='large'/></div>
                                <div className={styles.metricValue}>{data.metrics.totalLibrarians}</div>
                                <div className={styles.metricLabel}>
                                    <Typography variant="body2">Bibliotecarios</Typography>
                                </div>
                            </div>
                           
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}><ConfirmationNumberIcon fontSize='large'/></div>
                                <div className={styles.metricValue}>{data.metrics.totalEvents}</div>
                                <div className={styles.metricLabel}>
                                    <Typography variant="body2">Total de Eventos</Typography>
                                </div>
                            </div>
                            
                            
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}><CalendarMonthIcon fontSize='large'/></div>
                                <div className={styles.metricValue}>{data.metrics.upcomingEvents}</div>
                                <div className={styles.metricLabel}>
                                    <Typography variant="body2">Eventos Próximos</Typography>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Libros más populares */}
                    <section className={styles.section}>
                        <Typography variant="h3" className={styles.sectionTitle}>
                            Libros Más Populares (Top 10)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Basado en el total histórico de préstamos
                        </Typography>

                        {/* Tabla para desktop */}
                        <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th><Typography variant="h5">Posición</Typography></th>
                                        <th><Typography variant="h5">Título</Typography></th>
                                        <th><Typography variant="h5">Autor</Typography></th>
                                        <th><Typography variant="h5">Préstamos</Typography></th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.popularBooks.map((book, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Chip
                                                    label={index + 1}
                                                    size="small"
                                                    color={index < 3 ? "primary" : "default"}
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        width: '32px',
                                                        height: '32px',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                            </td>
                                            <td><Typography variant="body2" fontWeight="medium">{book.title}</Typography></td>
                                            <td><Typography variant="body2">{book.author}</Typography></td>
                                            <td><Typography variant="body2" fontWeight="bold" color="primary">{book.loans}</Typography></td>
                                           
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tarjetas para móvil/tablet */}
                        <div className={`${styles.cardGrid} ${styles.mobileOnly}`}>
                            {data.popularBooks.map((book, index) => (
                                <div key={index} className={styles.statCard}>
                                    <div className={styles.rankBadge}>
                                        <Chip
                                            label={index + 1}
                                            size="small"
                                            color={index < 3 ? "primary" : "default"}
                                            sx={{
                                                fontWeight: 'bold',
                                                width: '28px',
                                                height: '28px',
                                                fontSize: '12px',
                                                minWidth: '28px'
                                            }}
                                        />
                                    </div>
                                    <h4 className={styles.cardTitle}>{book.title}</h4>
                                    <p className={styles.cardAuthor}>{book.author}</p>
                                    <div className={styles.cardMetric}>
                                        <span className={styles.metricLabel}>Préstamos:</span>
                                        <span className={styles.metricValue} style={{ color: '#1976d2' }}>{book.loans}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Usuarios más activos */}
                    <section className={styles.section}>
                        <Typography variant="h3" className={styles.sectionTitle}>
                            Usuarios Más Activos (Top 10)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Basado en el total histórico de préstamos realizados
                        </Typography>

                        {/* Tabla para desktop */}
                        <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th><Typography variant="h5">Posición</Typography></th>
                                        <th><Typography variant="h5">Nombre</Typography></th>
                                        <th><Typography variant="h5">Email</Typography></th>
                                        <th><Typography variant="h5">Préstamos</Typography></th>
                                       
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.activeUsers.map((user, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Chip
                                                    label={index + 1}
                                                    size="small"
                                                    color={index < 3 ? "primary" : "default"}
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        width: '32px',
                                                        height: '32px',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                            </td>
                                            <td><Typography variant="body2" fontWeight="medium">{user.name}</Typography></td>
                                            <td><Typography variant="body2" sx={{ fontSize: '13px', color: '#333' }}>{user.email}</Typography></td>
                                            <td><Typography variant="body2" fontWeight="bold" color="primary">{user.loans}</Typography></td>
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tarjetas para móvil/tablet */}
                        <div className={`${styles.cardGrid} ${styles.mobileOnly}`}>
                            {data.activeUsers.map((user, index) => (
                                <div key={index} className={styles.statCard}>
                                    <div className={styles.rankBadge}>
                                        <Chip
                                            label={index + 1}
                                            size="small"
                                            color={index < 3 ? "secondary" : "default"}
                                            sx={{
                                                fontWeight: 'bold',
                                                width: '28px',
                                                height: '28px',
                                                fontSize: '12px',
                                                minWidth: '28px',
                                                bgcolor: index < 3 ? '#6D1E3A' : undefined,
                                                color: index < 3 ? 'white' : undefined
                                            }}
                                        />
                                    </div>
                                    <h4 className={styles.cardTitle}>{user.name}</h4>
                                    <p className={styles.cardEmail}>{user.email}</p>
                                    <div className={styles.cardMetric}>
                                        <span className={styles.metricLabel}>Préstamos:</span>
                                        <span className={styles.metricValue} style={{ color: '#6D1E3A' }}>{user.loans}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <footer className={styles.footer}>
                    <Typography variant="caption" sx={{ color: '#333' }}>
                        📅 Informe generado el: {new Date(data.generatedAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>
                </footer>
            </Grid>
            <Grid size={{ xs: 0.5, md: 1 }}></Grid>
        </Grid>
    );
}