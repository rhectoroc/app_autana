import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    keywords?: string;
    type?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    image = '/hero/hero-bg.jpg',
    keywords = 'Autana Group, Real Estate, Punta Cana, Luxury Properties, Dominican Republic',
    type = 'website'
}) => {
    const { pathname } = useLocation();
    const siteUrl = 'https://autanagroup.com'; // Replace with actual domain
    const fullUrl = `${siteUrl}${pathname}`;
    const fullTitle = title.includes('Autana Group') ? title : `${title} | Autana Group`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />
        </Helmet>
    );
};
