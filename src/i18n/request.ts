import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const headersList = await headers();

    // 1. Intentar obtener de cookie
    let locale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined;

    // 2. Si no hay cookie, detectar del navegador
    if (!locale || !locales.includes(locale)) {
        const acceptLanguage = headersList.get('accept-language') || '';
        const browserLocale = acceptLanguage.split(',')[0]?.split('-')[0];
        locale = locales.includes(browserLocale as Locale)
            ? (browserLocale as Locale)
            : defaultLocale;
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
