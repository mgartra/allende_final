import React from 'react';
import { useRouter } from 'next/navigation';

import styles from './HeroBtn.module.css';





export default function HeroBtn({ name, link }: { name: string, link: string }) {
    const router = useRouter();

    return (
        <button
            type="button"
            className={styles.btn}
            onClick={() => router.push(link)}
        >
            {name}
        </button>
    );
}
