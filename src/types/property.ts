export interface Property {
    id: string | number;
    title: string;
    location: string;
    price: number;
    type: 'sale' | 'rent_short' | 'rent_long';
    status?: 'available' | 'sold' | 'rented';
    bedrooms: number;
    bathrooms: number;
    description: string;
    amenities: string[];
    features?: string[];
    media: {
        id: string | number;
        type: 'image' | 'video';
        url: string;
    }[];
    area_sqm: number;
    parking_spots?: number;
    images?: { id: number; image_url: string; is_main: boolean }[];
}
