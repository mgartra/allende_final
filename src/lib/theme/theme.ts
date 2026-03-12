// src/theme/theme.ts
'use client';

import { createTheme } from '@mui/material/styles';


//SISTEMA DE COLOR 

const colors = {

    primary: {
        main: '#6d1e3a',
        light: '#ab466a',
        dark: ' #400d1f',
        hover: ' #400d1f',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#ECA121',
        light: '#eac689',
        dark: '#895804',
        hover: '#895804',
        contrastText: 'rgba(0,0,0,0.87)',
    },

    // Neutros 
    background: {
        default: '#f9dbbd',
        paper: '#FFFFFF',
    },
    text: {
        primary: '#120104',
        secondary: 'rgba(30,30,30,0.54)',
        disabled: 'rgba(125,125,125,0.41)',
        hint: 'rgba(10,10,10,0.38)',
    },

    // Semánticos 
    success: {
        main: '#014421',
        light: '#33694D',
        dark: '#002F17',
        contrastText: '#FFFFFF',
    },
    error: {
        main: '#B00020',
        light: '#BF334C',
        dark: '#7B0016',
        contrastText: '#FFFFFF',
    },
    warning: {
        main: '#FF9800',
        light: '#FFAC33',
        dark: '#B26A00',
        contrastText: 'rgba(0,0,0,0.87)',
    },
    info: {
        main: '#010244',
        light: '#333469',
        dark: '#00012F',
        contrastText: '#FFFFFF',
    },
    divider: '#6D1E3A',
};


// 2. BREAKPOINTS (Responsive)

const breakpoints = {
    values: {
        xs: 0,      // Mobile: todos los móviles
        sm: 600,    // Tablets pequeñas, móviles grandes
        md: 900,    // Laptops pequeñas, tablets grandes
        lg: 1200,   // Desktop estándar
        xl: 1536,   // Monitores grandes (1920px+)
    },
};


// 3. TIPOGRAFÍA (Escala responsive)

const typography = {
    fontFamily: 'var(--font-inter), sans-serif',
    htmlFontSize: 10, // 1rem = 10px 

    // Títulos (Lora - Serif para elegancia)
    h1: {
        fontFamily: 'var(--font-lora), serif',
        fontWeight: 600,
        fontSize: '2.4rem', // Base móvil
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        '@media (min-width:601px)': {
            fontSize: '3.2rem',
            lineHeight: 1.6,
        },
        '@media (min-width:901px)': {
            fontSize: '4rem',
            lineHeight: 2,
        },

    },
    h2: {
        fontFamily: 'var(--font-lora), serif',
        fontWeight: 500,
        fontSize: '2.0rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        '@media (min-width:601px)': {
            fontSize: '2.4rem',
            lineHeight: 1.7,
        },
        '@media (min-width:901px)': {
            fontSize: '3.2rem',
            lineHeight: 2.5,
        },
        '@media (min-width:1201px)': {
            fontSize: '4rem',
            lineHeight: 3.3,
        },
    },
    h3: {
        fontFamily: 'var(--font-lora), serif',
        fontWeight: 500,
        fontSize: '1.8rem',
        lineHeight: 1.3,
        '@media (min-width:601px)': {
            fontSize: '2rem',
            lineHeight: 1.5,
        },
        '@media (min-width:901px)': {
            fontSize: '2.4rem',
            lineHeight: 1.9,
        },
        '@media (min-width:1201px)': {
            fontSize: '3.2rem',
            lineHeight: 2.7,
        },
    },
    h4: {
        fontFamily: 'var(--font-lora), serif',
        fontWeight: 500,
        fontSize: '1.6rem',
        lineHeight: 1.4,
        '@media (min-width:601px)': {
            fontSize: '1.8rem',
            lineHeight: 1.6,
        },
        '@media (min-width:901px)': {
            fontSize: '2rem',
            lineHeight: 1.8,
        },
        '@media (min-width:1201px)': {
            fontSize: '2.4rem',
            lineHeight: 2.2,
        },
    },
    h5: {
        fontFamily: 'var(--font-lora), serif',
        fontWeight: 500,
        fontSize: '1.4rem',
        lineHeight: 1.4,
        '@media (min-width:601px)': {
            fontSize: '1.6rem',
            lineHeight: 1.6,
        },
        '@media (min-width:901px)': {
            fontSize: '1.8rem',
            lineHeight: 1.8,
        },

    },


    // Cuerpo de texto (Inter - Sans-serif para legibilidad)
    body1: {
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '1.6rem', // Mínimo accesible
        lineHeight: 1.6,    // Óptimo para lectura prolongada
        letterSpacing: '0.009em',

        '@media (min-width:901px)': {
            fontSize: '1.8rem',
            lineHeight: 1.8,
        },

    },
    body2: {
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '1.4rem',
        lineHeight: 1.5,
        letterSpacing: '0.011em',

        '@media (min-width:901px)': {
            fontSize: '1.6rem',
            lineHeight: 1.7,
        },

    },

    // Texto pequeño
    caption: {
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '1.2rem',
        lineHeight: 1.4,

        '@media (min-width:901px)': {
            fontSize: '1.4rem',
            lineHeight: 1.8,

        },

    },
    subtitle1: {
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '1.6rem',
        fontWeight: 500,
        lineHeight: 1.5,
        '@media (min-width:601px)': {
            fontSize: '1.8rem',
            lineHeight: 1.4,
        },
        '@media (min-width:901px)': {
            fontSize: '2rem',
            lineHeight: 1,
        },
        '@media (min-width:1201px)': {
            fontSize: '2rem',
            lineHeight: 1.2,
        },
    },
    subtitle2: {
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '1.4rem',
        fontWeight: 500,
        lineHeight: 1.4,
        '@media (min-width:601px)': {
            fontSize: '1.6rem',
            lineHeight: 1.6,
        },
        '@media (min-width:901px)': {
            fontSize: '1.8rem',
            lineHeight: 1.8,
        },
    },

    // Botones
    button: {
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '1.4rem',
        fontWeight: 500,
        textTransform: 'none' as const, // Evita mayúsculas forzadas
        lineHeight: 1.5,
    },
};


// 4. COMPONENTES (Overrides globales)

const components = {
    // Botones
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 500,
                transition: 'all 0.2s ease-in-out',
            },
            containedPrimary: {
                backgroundColor: colors.primary.main,
                '&:hover': {
                    backgroundColor: colors.primary.dark,
                },
            },
            containedSecondary: {
                backgroundColor: colors.secondary.main,
                color: colors.text.primary,
                '&:hover': {
                    backgroundColor: colors.secondary.dark,
                },
            },
            outlined: {
                borderWidth: '2px',
            },
        },
    },

    // Tarjetas
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e0d6c9',
                overflow: 'hidden',
            },
        },
    },

    // AppBar (Navegación)
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: colors.primary.main,
                color: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            },
        },
    },

    // Enlaces
    MuiLink: {
        styleOverrides: {
            root: {
                color: colors.primary.main,
                textDecoration: 'none',
                '&:hover': {
                    color: colors.primary.hover,
                    textDecoration: 'underline',
                },
            },
        },
    },

    // Inputs
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                },
            },
        },
    },

    // Chips (Badges, tags)
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: '6px',
                fontWeight: 500,
            },
        },
    },
};


// 5. CREACIÓN DEL TEMA

const theme = createTheme({
    breakpoints,
    palette: {
        mode: 'light',
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
        text: colors.text,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
    },
    typography,
    components,
    spacing: 8, // Sistema de 8 puntos para márgenes/padding
});

export default theme;