// src/app/components/footer/Footer.tsx
'use client';

import { Grid, Typography, Box } from '@mui/material';
import { Facebook, Instagram, Twitter } from '@mui/icons-material';
import Image from 'next/image';
import logo from '../../../public/images/logo-white.png';
import styles from './Footer.module.css';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className={styles.footer}>
      <Grid container spacing={3} className={styles.footerGrid}>
        {/* Columna 1: Logo y Marca */}
        <Grid size={{ xs: 12, md: 4 }} className={styles.brandColumn}>
          <Box className={styles.logo}>
            <Image
              src={logo}
              alt="Logotipo del Rincón de Allende"
              width={80}
              height={80}
            />
            <Typography variant="h5" className={styles.title}>
              El Rincón de Allende
            </Typography>
          </Box>
        </Grid>

        {/* Columna 2: Enlaces rápidos */}
        <Grid size={{ xs: 12, sm: 4, md: 2 }} className={styles.linksColumn}>
          <Typography variant="subtitle1" className={styles.columnTitle}>
            Legal
          </Typography>
          <Link href="/legal/privacy" className={styles.footerLink}>
            Política de privacidad
          </Link>
          <Link href="/legal/notice" className={styles.footerLink}>
            Aviso legal
          </Link>
          <Link href="/legal/cookies" className={styles.footerLink}>
            Cookies
          </Link>
        </Grid>

        {/* Columna 3: Redes sociales */}
        <Grid size={{ xs: 12, sm: 4, md: 2 }} className={styles.socialColumn}>
          <Typography variant="subtitle1" className={styles.columnTitle}>
            Síguenos
          </Typography>
          <Box className={styles.socialLinks}>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Síguenos en Facebook"
            >
              <Facebook />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Síguenos en Instagram"
            >
              <Instagram />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Síguenos en Twitter"
            >
              <Twitter />
            </Link>
          </Box>
        </Grid>

        {/* Columna 4: Contacto */}
        <Grid size={{ xs: 12, sm: 4, md: 4 }} className={styles.contactColumn}>
          <Typography variant="subtitle1" className={styles.columnTitle}>
            Contacto
          </Typography>
          <Box className={styles.contactInfo}>
            <Typography variant="body2" className={styles.contactItem}>
              <PhoneAndroidIcon className={styles.contactIcon} />
              <Link href="tel:+34666777888" className={styles.phoneLink}>
                +34 666 777 888
              </Link>
            </Typography>
            <Typography variant="body2" className={styles.contactItem}>
              <MailOutlineIcon className={styles.contactIcon} />
              <Link href="mailto:info@allende.com" className={styles.emailLink}>
                info@rincondeallende.com
              </Link>
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Línea divisoria y copyright */}
      <Box className={styles.copyrightBar}>
        <Typography variant="body2" className={styles.copyright}>
          © {currentYear} El Rincón de Allende. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
}