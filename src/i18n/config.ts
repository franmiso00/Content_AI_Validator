export const locales = ['es', 'en', 'fr'] as const;
export const defaultLocale = 'es' as const;
export type Locale = (typeof locales)[number];
