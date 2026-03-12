// /app/components/cards/BookGrid.tsx
import BookCard from './BookCard';
import styles from './BookGrid.module.css';
import { Book } from '@/types';

interface BookGridProps {
    books: Book[];
}

export default function BookGrid({ books }: BookGridProps) {
    return (
        <div className={styles.grid}>
            {books.map(book => (
                <BookCard
                    key={book.book_id}
                    book_id={book.book_id}
                    title={book.title}
                    image={book.image}
                    reference={book.reference}
                    authors={book.authors}
                    categories={book.categories}
                    publication_year={book.publication_year}
                />
            ))}
        </div>
    );
}