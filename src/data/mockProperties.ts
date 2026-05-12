import type { Property } from '../types/property';

export const mockProperties: Property[] = [
    // SALES
    {
        id: 's1',
        title: 'Modern Villa in Eden Tropical',
        description: 'A stunning luxury villa featuring panoramic views, private pool, and modern architecture.',
        price: 450000,
        type: 'sale',
        location: 'Punta Cana, Dominican Republic',
        bedrooms: 4,
        bathrooms: 4.5,
        area_sqm: 350,
        parking_spots: 2,
        media: [
            { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop' },
            { id: 'm2', type: 'image', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1600&auto=format&fit=crop' },
        ],
        amenities: ['Pool', 'Security', 'Gym']
    },
    {
        id: 's2',
        title: 'Exclusive Condo in Cap Cana',
        description: 'Elegant condo located in the heart of Cap Cana with access to private beach club.',
        price: 320000,
        type: 'sale',
        location: 'Cap Cana, Dominican Republic',
        bedrooms: 2,
        bathrooms: 2.5,
        area_sqm: 145,
        parking_spots: 1,
        media: [
            { id: 'm3', type: 'image', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop' },
            { id: 'm3b', type: 'image', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop' }, // Duplicate for slider demo
        ],
        amenities: ['Golf Course', 'Beach Club', 'Concierge']
    },
    {
        id: 's3',
        title: 'Minimalist Ocean Villa',
        description: 'Contemporary design meets tropical luxury. Floor-to-ceiling windows with ocean views.',
        price: 850000,
        type: 'sale',
        location: 'Bavaro, Dominican Republic',
        bedrooms: 5,
        bathrooms: 6,
        area_sqm: 500,
        parking_spots: 3,
        media: [
            { id: 'm4', type: 'image', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop' },
        ],
        amenities: ['Ocean View', 'Infinity Pool', 'Smart Home']
    },

    // RENT LONG TERM
    {
        id: 'rl1',
        title: 'Oceanfront Luxury Apartment',
        description: 'Exclusive apartment with direct beach access in Aquamar.',
        price: 3500,
        type: 'rent_long',
        location: 'Cap Cana, Dominican Republic',
        bedrooms: 2,
        bathrooms: 2,
        area_sqm: 120,
        parking_spots: 1,
        media: [
            { id: 'm5', type: 'image', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop' },
            { id: 'm6', type: 'image', url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=1600&auto=format&fit=crop' },
        ],
        amenities: ['Beach Access', 'Concierge']
    },
    {
        id: 'rl2',
        title: 'Spacious Family Townhouse',
        description: 'Perfect for families, located in a secure community with parks and schools nearby.',
        price: 2200,
        type: 'rent_long',
        location: 'Punta Cana Village, Dominican Republic',
        bedrooms: 3,
        bathrooms: 3,
        area_sqm: 180,
        parking_spots: 2,
        media: [
            { id: 'm7', type: 'image', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop' },
        ],
        amenities: ['Gated Community', 'Playground', 'Pet Friendly']
    },

    // RENT SHORT TERM (Vacational)
    {
        id: 'rs1',
        title: 'Penthouse with Private Rooftop',
        description: 'Top floor penthouse offering exclusivity and breathtaking sunsets.',
        price: 250,
        type: 'rent_short',
        location: 'Bavaro, Dominican Republic',
        bedrooms: 3,
        bathrooms: 3,
        area_sqm: 200,
        parking_spots: 2,
        media: [
            { id: 'm8', type: 'image', url: 'https://images.unsplash.com/photo-1600596542815-22502315554a?q=80&w=1600&auto=format&fit=crop' },
            { id: 'm9', type: 'video', url: 'https://cdn.coverr.co/videos/coverr-luxury-house-2688/1080p.mp4' },
        ],
        amenities: ['Rooftop', 'BBQ', 'Jacuzzi']
    },
    {
        id: 'rs2',
        title: 'Tropical Garden Bungalow',
        description: 'A cozy getaway surrounded by lush tropical gardens, steps from the pool.',
        price: 150,
        type: 'rent_short',
        location: 'Cocotal, Dominican Republic',
        bedrooms: 1,
        bathrooms: 1,
        area_sqm: 80,
        parking_spots: 1,
        media: [
            { id: 'm10', type: 'image', url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1600&auto=format&fit=crop' },
        ],
        amenities: ['Garden', 'Shared Pool', 'WiFi']
    },
    {
        id: 'rs3',
        title: 'Marina View Suite',
        description: 'Wake up to the view of luxury yachts and the Caribbean Sea.',
        price: 400,
        type: 'rent_short',
        location: 'Cap Cana Marina, Dominican Republic',
        bedrooms: 2,
        bathrooms: 2,
        area_sqm: 130,
        parking_spots: 1,
        media: [
            { id: 'm11', type: 'image', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1600&auto=format&fit=crop' },
        ],
        amenities: ['Marina View', 'Walk to Restaurants', 'AC']
    }
];
