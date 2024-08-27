// analytics.ts

interface AnalyticsService {
    trackEvent: (event: string, properties: Record<string, any>) => void;
}

const analytics: AnalyticsService = {
    trackEvent: (event, properties) => {
        console.log(`Tracking event: ${event}`, properties);
        // Implement your tracking logic here (e.g., send data to an analytics server)
    },
};

export default analytics;
