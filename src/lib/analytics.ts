import { sendGAEvent } from '@next/third-parties/google';

type EventType =
    | 'validate_idea_attempt'
    | 'validate_idea_result'
    | 'verdict_viewed'
    | 'lead_captured'
    | 'pdf_downloaded'
    | 'error_occurred';

interface AnalyticsEvent {
    action: EventType;
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
}

export const trackEvent = ({ action, category, label, value, ...customProps }: AnalyticsEvent) => {
    // Log to console in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', { action, category, label, value, ...customProps });
    }

    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
        sendGAEvent('event', action, {
            category,
            label,
            value,
            ...customProps,
        });
    }
};
