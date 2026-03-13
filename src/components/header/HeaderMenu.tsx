// /app/components/header/HeaderMenu.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    AppBar,
    IconButton,
    CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EventIcon from '@mui/icons-material/Event';
import HeroBtn from '../buttons/HeroBtn';
import SearchModal from '@/components/search/SearchModal';
import AccountDrawer from '../account/AccountDrawer';
import logo from '../../../public/images/logo-white.png';
import styles from './HeaderMenu.module.css';
import { isRootUser } from '@/lib/auth/auth';

interface Category {
    category_id: number;
    name: string;
    description?: string;
    icon?: string;
}



export default function HeaderMenu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isMobileOpen, setMobileOpen] = useState(false);
    const [isCategoriesOpen, setCategoriesOpen] = useState(false);
    const [isAdminOpen, setAdminOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { user, loading: authLoading, logout } = useAuth();


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Error cargando categorías:", error);
            }
        };

        fetchCategories();
    }, []);

    const closeMobileMenu = () => {
        setMobileOpen(false);
        setCategoriesOpen(false);
        setAdminOpen(false);
    };

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    //Permisos de verificación
    const canAccessAdmin = () => {
        if (!user) return false;

        // Root siempre tiene acceso completo
        if (user.type === 'root') return true;

        // Los librarians (user.type === 'user' + userType === 'librarian') tienen acceso limitado
        if (user.type === 'user' && user.userType === 'librarian') return true;

        return false;
    };

    return (
        <AppBar
            position="sticky"
            className={styles.menu}
            color="transparent"
            elevation={0}
        >
            {/* Menú escritorio */}
            <nav className={styles.desktopNav}>
                <div className={styles.logo}>
                    <Image
                        src={logo}
                        alt='Logotipo del Rincón de Allende'
                        width={50}
                        height={50}
                    />
                    <Link href="/" className={styles.title}>
                        El Rincón de Allende
                    </Link>
                </div>

                <ul className={styles.navList}>
                    <li>
                        <Link href="/">
                            <HomeIcon fontSize="medium" />
                        </Link>
                    </li>
                    <li className={styles.hasDropdown}>
                        <button className={styles.dropdownToggle}>
                            <Link href="/category">Categorías</Link>
                        </button>
                        <ul className={styles.dropdownMenu}>
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <li key={cat.category_id}>
                                        <Link href={`/category/${cat.category_id}`} onClick={closeMobileMenu}>
                                            {cat.name}
                                        </Link>

                                    </li>
                                ))
                            ) : (
                                <li style={{ padding: '10px', color: '#ccc' }}>Cargando...</li>
                            )}
                        </ul>
                    </li>
                    <li><Link href="/our-services">Servicios</Link></li>
                    <li><Link href="/events">Eventos</Link></li>
                    <li><Link href="/contact">Contacto</Link></li>

                    {/* Enlace de administración solo para root o librarian */}
                    {canAccessAdmin() && (
                        <li className={styles.hasDropdown}>
                            <button className={styles.dropdownToggle}>
                                Administración
                            </button>
                            <ul className={styles.dropdownMenu}>

                                <li>
                                    <Link href="/admin/users" onClick={closeMobileMenu}>
                                        Gestión de usuarios
                                    </Link>
                                </li>

                                <li>
                                    <Link href="/admin/books" onClick={closeMobileMenu}>
                                        Gestión de libros
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/admin/events" onClick={closeMobileMenu}>
                                        Gestión de eventos
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/admin/analytics" onClick={closeMobileMenu}>
                                        Análisis e Informes
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    )}
                </ul>

                {/* Acciones del menú */}
                <div className={styles.navActions}>
                    {/* Icono de búsqueda */}
                    <IconButton
                        onClick={() => setSearchOpen(true)}
                        aria-label="Buscar libros"
                        sx={{ color: '#f2f0eb' }}
                    >
                        <SearchIcon fontSize="medium" />
                    </IconButton>

                    {/* Botón de cuenta */}
                    {authLoading ? (
                        <CircularProgress size={24} sx={{ color: '#f2f0eb' }} />
                    ) : user ? (
                        <IconButton
                            onClick={toggleDrawer(true)}
                            aria-label="Tu cuenta"
                            sx={{ color: '#f2f0eb' }}
                        >
                            <AccountCircleIcon fontSize="medium" />
                        </IconButton>
                    ) : (
                        <HeroBtn name="Iniciar sesión" link="/login" />
                    )}
                </div>
            </nav>

            {/* Menú móvil */}
            <nav className={styles.mobileNav}>
                <IconButton
                    onClick={() => setMobileOpen(!isMobileOpen)}
                    aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
                    sx={{ color: '#f2f0eb' }}
                >
                    {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>

                <Link href="/" className={styles.mobileTitle}>
                    El Rincón de Allende
                </Link>
                {/* Botón de búsqueda en móvil */}
                <IconButton
                    onClick={() => setSearchOpen(true)}
                    aria-label="Buscar libros"
                    sx={{ color: '#f2f0eb', ml: 'auto' }} // ml: 'auto' empuja los iconos a la derecha
                >
                    <SearchIcon fontSize="medium" />
                </IconButton>

                {/* Icono de cuenta en móvil */}
                {authLoading ? (
                    <CircularProgress size={24} sx={{ color: '#f2f0eb' }} />
                ) : user ? (
                    <IconButton
                        onClick={toggleDrawer(true)}
                        aria-label="Tu cuenta"
                        sx={{ color: '#f2f0eb' }}
                    >
                        <AccountCircleIcon fontSize="large" />
                    </IconButton>
                ) : (
                    <Link href="/login">
                        <AccountCircleIcon fontSize="large" sx={{ color: '#f2f0eb' }} />
                    </Link>
                )}


                {isMobileOpen && (
                    <div className={styles.mobileMenu}>
                        <ul>
                            <Link href="/"><HomeIcon fontSize="medium" /></Link>
                            <div className={styles.navMainMobile}>
                                <ul>
                                    <li className={styles.hasSubnav}>
                                        <button
                                            className={styles.mobileSubnavToggle}
                                            onClick={() => setCategoriesOpen(!isCategoriesOpen)}
                                            aria-expanded={isCategoriesOpen}
                                        >
                                            Categorias
                                            {!isCategoriesOpen ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                                        </button>

                                        {isCategoriesOpen && (
                                            <ul style={{ listStyle: 'none', paddingLeft: '1rem', margin: '1rem' }}>
                                                {categories.length > 0 ? (
                                                    categories.map((cat) => (
                                                        <li key={cat.category_id}>
                                                            <Link href={`/category/${cat.category_id}`} onClick={closeMobileMenu}>
                                                                {cat.name}
                                                            </Link>

                                                        </li>
                                                    ))
                                                ) : (
                                                    <li style={{ padding: '10px', color: '#ccc' }}>Cargando...</li>
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                    <li><Link href="/our-services">Servicios</Link></li>
                                    <li><Link href="/events">Eventos</Link></li>
                                    <li><Link href="/contact">Contacto</Link></li>
                                    {/* Enlace de administración en móvil */}
                                    {canAccessAdmin() && (
                                        <li className={styles.hasSubnav}>
                                            <button
                                                className={styles.mobileSubnavToggle}
                                                onClick={() => setAdminOpen(!isAdminOpen)}
                                                aria-expanded={isAdminOpen}
                                            >
                                                Administración
                                                {!isAdminOpen ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                                            </button>

                                            {isAdminOpen && (
                                                <div className={styles.mobileSubnavContainer}>
                                                    <ul >
                                                        <li>
                                                            <Link
                                                                href="/admin/books"
                                                                onClick={closeMobileMenu}
                                                            >
                                                                Gestión de libros
                                                            </Link>
                                                        </li>

                                                        <li>
                                                            <Link
                                                                href="/admin/users"
                                                                onClick={closeMobileMenu}
                                                            >
                                                                Gestión de usuarios
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                href="/admin/events"
                                                                onClick={closeMobileMenu}
                                                            >
                                                                Gestión de eventos
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                href="/admin/analytics"
                                                                onClick={closeMobileMenu}
                                                            >
                                                                Análisis e Informes
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </ul>
                    </div>
                )}
            </nav>


            <SearchModal
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
            />


            <AccountDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                user={user}
                onLogout={logout}
            />
        </AppBar>
    );
}
