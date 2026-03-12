// app/categorias/[categoryId]/page.tsx
import { notFound } from 'next/navigation';
import { getCategoryById } from '@/lib/data/categories';
import { getBooksByCategory } from '@/lib/data/books';
import Icon from '@/components/icons_ui/Icon';
import FilterWrapper from '@/components/filters/FilterWrapper';
import styles from './CategoryPage.module.css';
import { Button, Grid, Typography } from '@mui/material';
import Link from 'next/link';


interface CategoryPageProps {
    params: Promise<{ categoryId: string }>;
}
//Función para obtener libros iniciales
async function getInitialBooks(categoryId: number) {
    const limit = 5; // Cantidad inicial para desktop
    const prisma = (await import('@/lib/prisma')).default;

    const books = await prisma.book.findMany({
        where: {
            categories: {
                some: { category_id: categoryId }
            }
        },
        include: {
            authors: {
                select: {
                    author_id: true,
                    name: true,
                    last_name: true,
                    nationality: true,
                },
            },
            categories: {
                select: {
                    category_id: true,
                    name: true,
                    description: true,
                    icon: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
    });

    // ELIMINA DUPLICADOS 
    return Array.from(
        new Map(books.map(book => [book.book_id, book])).values()
    );
}
export default async function CategoryPage({ params }: CategoryPageProps) {
    const { categoryId } = await params;
    const categoryIdNumber = parseInt(categoryId, 10);

    // Validando que el ID sea un número válido
    if (isNaN(categoryIdNumber)) {
        notFound();
    }


    const category = await getCategoryById(categoryIdNumber);
    const books = await getBooksByCategory(categoryIdNumber);


    if (!category) {
        notFound();
    }

    // Filtrar libros válidos (con autores y categorías)
    const validBooks = books.filter(book =>
        book.authors && book.authors.length > 0 &&
        book.categories && book.categories.length > 0
    );

    return (
        <Grid container className={styles.container}>
            {/* Header de categoría */}
            <Grid size={0.5}></Grid>
            <Grid size={11} >
                <header className={styles.header}>
                    <div className={styles.headerContent}>

                        <Typography variant='h3' className={styles.categoryTitle}>{category.name}</Typography>
                        <Typography variant='body2' className={styles.subtitle}>{category.description}</Typography>


                    </div>

                </header>
                {/* Sistema de filtrado completo */}
                <FilterWrapper
                    initialBooks={validBooks}
                    categoryId={categoryIdNumber}
                    categoryName={category.name}

                />
            </Grid>




            <Grid size={0.5}></Grid>
        </Grid>
    );
}