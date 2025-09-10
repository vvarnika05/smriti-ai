    import type { Metadata } from "next";

    export interface PageMetadata {
    title: string;
    description?: string;
    keywords?: string[];
    url?: string; 
    image?: string; 
    }

    export function generateMetadataUtil(pageData: PageMetadata): Metadata {
    const baseTitle = "Smriti AI";
    const defaultDescription = "Smriti AI - Remember Smarter";
    const defaultImage = "/brain.png";
    const siteUrl = "https://www.smriti.live/";

    const fullTitle =
        pageData.title === baseTitle ? baseTitle : `${pageData.title} | ${baseTitle}`;

    const description = pageData.description || defaultDescription;
    const image = pageData.image || defaultImage;
    const url = pageData.url || siteUrl;

    return {
        title: fullTitle,
        description,
        keywords: pageData.keywords || ["Smriti AI", "AI Memory", "Productivity"],
        metadataBase: new URL(siteUrl),
        alternates: {
        canonical: url,
        },
        openGraph: {
        title: fullTitle,
        description,
        url,
        siteName: baseTitle,
        images: [
            {
            url: image,
            width: 1200,
            height: 630,
            alt: fullTitle,
            },
        ],
        locale: "en_US",
        type: "website",
        },
        twitter: {
        card: "summary_large_image",
        title: fullTitle,
        description,
        images: [image],
        creator: "@smriti_ai", 
        },
    };
    }