

import { Lora, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Metadata } from 'next';
import ClientProviders from './ClientProviders';
import TopBar from "../components/topBar/TopBar";
import TopButton from "../components/topButton/TopButton"
import Footer from "../components/footer/Footer";
import CookieConsent from '../components/cookie-consent/CookieConsent';
import HeaderMenu from '../components/header/HeaderMenu';
import "./globals.css";


//Google Fonts

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: {
    template: '%s | El Rincón de Allende',
    default: 'El Rincón de Allende - Biblioteca comunitaria'
  },
  description: 'Descubre miles de libros, eventos culturales y servicios de préstamo en nuestra biblioteca digital.',
  keywords: [
    'biblioteca Allende',
    'préstamos libros',
    'eventos culturales',
    'lectura digital',
    'biblioteca pública',
  ],
  authors: [{ name: 'María Luisa García' }],
  creator: 'María Luisa García Trapero',

};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className}>
        <ClientProviders>
          <TopBar />
          <HeaderMenu />
          <main>
            {children}
          </main>
          <Footer />
          <TopButton />
          <CookieConsent />
          <Toaster
            position='top-center'
            richColors
            closeButton />
        </ClientProviders>
      </body>
    </html>
  );
}
