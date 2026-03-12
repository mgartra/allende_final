// src/types/index.ts

import type { LoanType } from "@prisma/client";

// === ENUMS ===
export enum ReservationStatus {
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  unconfirmed = 'unconfirmed'
}

export enum LoanStatus {
  borrowed = 'borrowed',
  returned = 'returned',
  overdue = 'overdue'
}



export enum UserType {
  librarian = 'librarian',
  user = 'user'
}

// === INTERFACES PRINCIPALES ===

// Superadministrador (tabla root - separada para máxima seguridad)
export interface Root {
  root_id: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
}

// Usuario (tabla users - puede ser librarian o user común)
export interface User {
  user_id: number;
  name: string;
  last_name: string;
  birth_date: Date;
  email: string;
  phone: string;
  registration_date: Date;
  blocked_until: Date | null;
  user_type: UserType; // 'librarian' | 'user'
}

// Autores de libros
export interface Author {
  author_id: number;
  name: string;
  last_name: string;
  nationality: string | null;
}

// Categorías de libros
export interface Category {
  category_id: number;
  icon: string | null;
  name: string;
  description: string | null;
}

// Libros
export interface Book {
  book_id: number;
  title: string;
  isbn: string;
  summary: string | null;
  publication_year: number | null;
  reference: number;
  total_copies: number;
  available_copies: number;
  image: string | null;
  pdf_url: string | null
  created_at: Date;
}

// Eventos culturales (gestionados por usuarios con user_type='librarian')
export interface Event {
  event_id: number;
  name: string;
  description: string | null;
  image: string | null;
  event_date: Date;
  capacity: number;
  participants: number;
  cancelations: number;
  user_id: number; // ← Relación con User (no con Librarian)
}

// Reservas de eventos
export interface EventReservation {
  reservation_id: number;
  reservation_date: Date;
  status: ReservationStatus;
  user_id: number;
  event_id: number;
}

// Préstamos de libros
export interface Loan {
  loan_id: number;
  loan_date: Date;
  return_date: Date;
  status: LoanStatus;
  loan_type: LoanType;
  user_id: number;
  book_id: number;
}

// Newsletter
export interface NewsletterSubscriber {
  newsletter_id: number;
  email: string;
  is_subscribed: boolean;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
  created_at: Date;
}

// === INTERFACES CON RELACIONES (para queries con include) ===

// Libro con autores y categorías
export interface BookWithRelations extends Book {
  authors: Author[];
  categories: Category[];
}

// Libro con autores, categorías y préstamos
export interface BookWithFullRelations extends BookWithRelations {
  loans: Loan[];
}

// Usuario con préstamos y reservas
export interface UserWithRelations extends User {
  loans: Loan[];
  event_reservations: EventReservation[];
}

// Evento con reservas y gestor
export interface EventWithRelations extends Event {
  reservations: EventReservation[];
  user: User; // El librarian que gestiona el evento
}

// Préstamo con libro y usuario
export interface LoanWithRelations extends Loan {
  book: Book;
  user: User;
}

// === TIPOS PARA ANÁLISIS ===

// src/types/index.ts

export interface AnalyticsMetrics {
  totalBooks: number;
  totalUsers: number;
  totalLibrarians: number; 
  totalLoans: number;
  totalEvents: number;
  activeLoans: number;
  overdueLoans: number;
  blockedUsers: number;
  upcomingEvents: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  popularBooks: Array<{ 
    title: string; 
    author: string; 
    loans: number 
  }>;
  activeUsers: Array<{ 
    name: string; 
    email: string; 
    loans: number 
  }>;
  generatedAt: string;
}

// === TIPOS PARA FORMULARIOS ===

export interface ContactMessage {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
}

// === TIPOS DE SESIÓN (para AuthContext) ===

export type SessionUser = 
  | (Root & { type: 'root' })
  | (User & { type: 'user' });