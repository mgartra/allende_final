// /lib/utils/imageUtils.ts

export const normalizeImageUrl = (
    image: string | null | undefined,
    basePath = '/images/events'
): string => {
    // Caso 1: null, undefined o vacío → usar placeholder
    if (!image || image.trim() === '') {
        return `${basePath}/placeholder-event.jpg`;
    }

    const trimmed = image.trim();

    // Caso 2: URL absoluta (http/https) → validar y usar directamente
    if (trimmed.startsWith('http')) {
        try {
            new URL(trimmed);
            return trimmed;
        } catch {
            return `${basePath}/placeholder-event.jpg`;
        }
    }

    //  Caso 3: Ruta absoluta relativa (/images/...) → usar directamente
    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    // Caso 4: Ruta relativa (firma-libros.jpg) → convertir a ruta absoluta
    return `${basePath}/${trimmed.replace(/^\/+/, '')}`;
};