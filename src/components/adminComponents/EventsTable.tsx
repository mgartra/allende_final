// src/components/admin/EventsTable.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PaginatedTable, { Column } from './PaginatedTable';
import ActionButtons from './ActionButtons';
import styles from '@/app/admin/users/UsersPage.module.css';

interface EventDisplay {
    event_id: number;
    name: string;
    date: string;
    capacity: number;
    participants: number;
    organizer: string;
}

interface EventsTableProps {
    events: EventDisplay[];
}

export default function EventsTable({ events }: EventsTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const columns: Column[] = [
        { header: 'ID', field: 'event_id' },
        { header: 'Evento', field: 'name' },
        { header: 'Fecha', field: 'date' },
        {
            header: 'Organizador',
            field: 'organizer',
        
        },
        {
            header: 'Plazas',
            field: 'capacity',
        },
    ];

   
    const renderActions = (event: EventDisplay) => (
        <div className={styles.actionButtonsContainer}>
            <ActionButtons
                id={event.event_id}
                editUrl={`/admin/events/editE?id=${event.event_id}`}
                entity="event"
                entityName={`el evento "${event.name}"`} 
                size="small"
            />
        </div>
    );


    return (
        <PaginatedTable<EventDisplay>
            data={events}
            columns={columns}
            itemsPerPage={8}
            keyField="event_id"
            emptyMessage="No hay eventos programados"
            entityName="eventos"
            actions={renderActions}
            actionsHeader="Acciones"
        />
    );
}