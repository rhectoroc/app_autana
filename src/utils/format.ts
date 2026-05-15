export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatArea = (sqm: number): string => {
    return `${sqm} m²`;
};

export const getMediaUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Base URL points to the app_autana backend deployment
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://autana-app.91xjh2.easypanel.host';
    return `${baseUrl}${url}`;
};
