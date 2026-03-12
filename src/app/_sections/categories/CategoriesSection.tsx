// CategoriesSection.tsx
import React from 'react';
import { getAllCategories } from '@/lib/data/categories';
import Image from 'next/image';
import styles from './CategoriesSection.module.css';
import SectionTitle from '@/components/sectionTitle/SectionTitle';
import type { Category } from '@/types';
import { Grid } from '@mui/material';


export default async function CategoriesSection() {
    const categories: Category[] = await getAllCategories();
    const displayedCategories = categories.slice(0, 10);

    if (displayedCategories.length === 0) return null;

    return (
        <section className={styles.categoriesSection}>
            <Grid container spacing={2} className={styles.container}>
                <Grid size={{xs:1}}></Grid>
                <Grid size={{xs:10}}>
                    {/* 👇 MISMO ESTILO QUE FeatureBooks: sin mt extra aquí */}
                    <SectionTitle
                        icon="01"
                        iconSize={80}
                        title="Categorías"
                        subtitle="Explora nuestros temas"
                    />
                    <Grid container spacing={2} className={styles.container}>
                        
                          <Grid size={{xs:10}}>
                               {/* Grid 2x5 */}
                    <div className={styles.grid2x5}>
                        {displayedCategories.map((category) => (
                            <CategoryTile key={`c-${category.category_id}`} category={category} />
                        ))}
                    </div>
                          </Grid>
                          <Grid size={{xs:2}}></Grid>
                    </Grid>

                 
                </Grid>
                <Grid size={{xs:1}}></Grid>
            </Grid>
        </section>
    );
}

function CategoryTile({ category }: { category: Category }) {
    const iconSrc = category.icon ? `/icons/${category.icon}.svg` : '/icons/02.svg';
    return (
        <div className={styles.categoryTile}>
            <Image src={iconSrc} alt={category.name} width={64} height={64} unoptimized />
            <span className={styles.categoryName}>{category.name}</span>
        </div>
    );
}