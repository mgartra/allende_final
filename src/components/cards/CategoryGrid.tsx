'use client';


import { Category } from '@/types';
import Icon from '@/components/icons_ui/Icon';
import styles from './CategoryGrid.module.css';
import { Button, Typography } from '@mui/material';

interface CategoryGridProps {
    categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
    if (categories.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Icon name="02" size={80} color="#333" />
                <p>No hay categorías disponibles</p>
            </div>
        );
    }

    return (

        <div className={styles.card}>
            {categories.map(category => {
                // Limpiamos el nombre para que el componente Icon no duplique .svg
                const iconName = category.icon?.replace('.svg', '') || '02';

                return (
                    <div className={styles.iconWrapper} key={category.category_id}>
                        <div className={styles.mainIcon}>
                            <Icon
                                name={iconName}
                                size={64}
                                color="#f2f0eb" 
                            />
                        </div>
                        <div className={styles.contain}>
                            <Typography  className={styles.categoryName}>{category.name}</Typography>
                            <p className={styles.categoryDescription}>
                                {category.description || 'Explorar esta temática'}
                            </p>
                        </div>
                        <Button
                            variant='outlined'
                            key={category.category_id}
                            href={`/category/${category.category_id}`}

                        >Explorar esta temática</Button>


                    </div>
                )
            })}
        </div>
    );
}