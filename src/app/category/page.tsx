import CategoryGrid from '@/components/cards/CategoryGrid';
import { getAllCategories } from '@/lib/data/categories';
import styles from './CategoriesPage.module.css';
import { Divider, Grid, Typography } from '@mui/material';


export default async function CategoryPage() {
    const categories = await getAllCategories();

    return (
        <section className={styles.section} id="categories">
            {/* Contenedor principal con el fondo por defecto del tema */}
            <Grid container className={styles.container}>
                
                {/* Header de la página */}
                <Grid size={12} className={styles.header}>
                   <Divider sx={{ my: 2, borderColor: 'divider'}}> <Typography variant="h2"  className={styles.title}>
                        Explora nuestras <span className={styles.highlight}>categorías</span>
                    </Typography></Divider>
                    <Typography variant="subtitle1" className={styles.subtitle}>
                        Descubre libros organizados por temáticas para encontrar tu próxima lectura
                    </Typography>
                </Grid>

                {/* Contenido del Grid de Categorías */}
                <Grid container className={styles.contain}>
                    <Grid size={0.5}></Grid>
                    <Grid size={11}>
                        <main className={styles.mainContent}>
                            <CategoryGrid categories={categories} />
                        </main>
                    </Grid>
                    <Grid size={0.5}></Grid>
                </Grid>
            </Grid>
        </section>
    );
}