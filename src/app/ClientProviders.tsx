'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AuthProvider from "../components/authComponent/AuthProvider";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "./createEmotionCache";
import theme from '@/lib/theme/theme';


const clientSideEmotionCache = createEmotionCache();

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CacheProvider value={clientSideEmotionCache}>
            <AppRouterCacheProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </AppRouterCacheProvider>
        </CacheProvider>
    );
}