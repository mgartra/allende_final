// src/components/admin/ActionButtons.tsx
'use client';

import Link from 'next/link';
import { Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteBtn from '@/components/adminComponents/DeleteBtn';
import styles from './ActionButton.module.css'; 

// Tipos para las props
export interface ActionButtonsProps {
    id: number;                    
    editUrl?: string;              
    entity?: 'book' | 'user' | 'event'; 
    entityName?: string;          
    showEdit?: boolean;            
    showDelete?: boolean;          
    editLabel?: string;            
    size?: 'small' | 'medium';     
}

export default function ActionButtons({
    id,
    editUrl,
    entity = 'book',
    entityName, 
    showEdit = true,
    showDelete = true,
    editLabel = 'Editar',
    size = 'medium',
}: ActionButtonsProps) {
    
    const defaultEntityName =
        entity === 'book' ? 'este libro' :
            entity === 'user' ? 'este usuario' :
                entity === 'event' ? 'este evento' : 'este elemento';

    const deleteEntityName = entityName || defaultEntityName;

    return (
        <div className={styles.actionButtonsContainer}>
            {showEdit && editUrl && (
                <Link href={editUrl} className={styles.editButton}>
                    <EditIcon
                        sx={{
                            fontSize: size === 'small' ? '16px' : '18px',
                            mr: size === 'small' ? 0.5 : 1
                        }}
                    />
                    <Typography
                        variant={size === 'small' ? 'caption' : 'body2'}
                        sx={{ fontWeight: 'medium' }}
                    >
                        {editLabel}
                    </Typography>
                </Link>
            )}

            {showDelete && (
                <>
                    {entity === 'book' && (
                        <DeleteBtn
                            bookId={id}
                            entityName={deleteEntityName}
                            size={size}
                        />
                    )}
                    {entity === 'user' && (
                        <DeleteBtn
                            userId={id}
                            entityName={deleteEntityName}
                            size={size}
                        />
                    )}
                    {entity === 'event' && (
                        <DeleteBtn
                            eventId={id}
                            entityName={deleteEntityName}
                            size={size}
                        />
                    )}
                </>
            )}
        </div>
    );
}