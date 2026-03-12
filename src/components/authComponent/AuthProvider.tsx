'use client';

import { AuthProvider as AuthContextProvider } from "@/lib/auth/AuthContext";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return <AuthContextProvider> {children}</AuthContextProvider>
}
