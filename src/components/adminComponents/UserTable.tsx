// src/components/admin/UsersTable.tsx
'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PaginatedTable, { Column } from './PaginatedTable';
import SearchBar from './SearchBar';
import ActionButtons from './ActionButtons';
import styles from '@/app/admin/users/UsersPage.module.css';

interface UserDisplay {
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    user_type: string;
    birth_date: string;
    registration_date: string;
    active_loans: number;
    is_blocked: boolean;
}

interface UsersTableProps {
    users: UserDisplay[];
    currentUserIsRoot: boolean;
}

export default function UsersTable({ users, currentUserIsRoot }: UsersTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [filteredUsers, setFilteredUsers] = useState<UserDisplay[]>(users);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users])


    const columns: Column[] = [
        { header: 'Nombre', field: 'full_name' },
        { header: 'Email', field: 'email' },
        { header: 'Télefono', field: 'phone' },

        {
            header: 'Tipo',
            field: 'user_type',
        },
        {
            header: 'Préstamos',
            field: 'active_loans',
        },
        {
            header: 'Estado',
            field: 'is_blocked',
        },
    ];


    const renderActions = (user: UserDisplay) => {
        // Solo root puede gestionar bibliotecarios
        const canManage = currentUserIsRoot || user.user_type === 'Lector';

        if (!canManage) {
            return (
                <span
                    style={{
                        color: '#f57c00',
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '4px'
                    }}
                >
                    Sin acceso
                </span>
            );
        }

        return (
            <div className={styles.actionButtonsContainer}>
                <ActionButtons
                    id={user.user_id}
                    editUrl={`/admin/users/editU?id=${user.user_id}`}
                    entity="user"
                    entityName={`al usuario ${user.full_name}`}
                    size="small"
                />
            </div>
        );
    };

    return (
        <>
            <SearchBar<UserDisplay>
                data={users}
                onSearch={setFilteredUsers}
                searchFields={['full_name', 'email', 'phone']}
                placeholder="Buscar usuarios por nombre, email o teléfono..."
                size="medium"
                autoFocus={true}
                className={styles.searchBar}
            />

            <PaginatedTable<UserDisplay>
                data={filteredUsers}
                columns={columns}
                itemsPerPage={10}
                keyField="user_id"
                emptyMessage="No hay usuarios para mostrar"
                entityName="usuarios"
                actions={renderActions}
                actionsHeader="Acciones"
            />
        </>
    );
}