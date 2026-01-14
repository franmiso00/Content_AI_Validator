// src/lib/pdf/pdf-styles.ts

export const VALIO_COLORS = {
    // Colores principales
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    accent: '#06b6d4',

    // Colores de veredicto
    verdictCreate: '#10b981',
    verdictCreateBg: '#d1fae5',
    verdictPilot: '#f59e0b',
    verdictPilotBg: '#fef3c7',
    verdictReconsider: '#f43f5e',
    verdictReconsiderBg: '#ffe4e6',

    // Neutros
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    bgLight: '#f9fafb',
    border: '#e5e7eb',
    white: '#ffffff',
} as const;

export const VALIO_FONTS = {
    title: 28,
    heading1: 20,
    heading2: 16,
    heading3: 14,
    body: 11,
    small: 9,
    caption: 8,
} as const;

export const PDF_CONFIG = {
    margin: 20,
    headerHeight: 25,
    footerHeight: 15,
    lineHeight: 1.4,
    sectionSpacing: 15,
    cardPadding: 12,
    cardRadius: 4,
} as const;

export const VERDICT_CONFIG = {
    create: {
        label: 'Crear esta idea',
        color: VALIO_COLORS.verdictCreate,
        bgColor: VALIO_COLORS.verdictCreateBg,
        description: 'Señales claras de demanda y baja fricción de entrada.',
    },
    pilot: {
        label: 'Validar con piloto',
        color: VALIO_COLORS.verdictPilot,
        bgColor: VALIO_COLORS.verdictPilotBg,
        description: 'Existe interés pero requiere enfoque más específico o test previo.',
    },
    reconsider: {
        label: 'No priorizar ahora',
        color: VALIO_COLORS.verdictReconsider,
        bgColor: VALIO_COLORS.verdictReconsiderBg,
        description: 'Baja demanda detectada o mercado excesivamente saturado.',
    },
} as const;
