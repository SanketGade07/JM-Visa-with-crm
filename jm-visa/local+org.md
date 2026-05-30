"use client";

import { useEffect } from 'react';

const LocalBusinessSchema = () => {
  useEffect(() => {
    // Remove any existing local business schema to avoid duplicates
    const existingScript = document.querySelector('script[data-schema="local-business"]');
    if (existingScript) {
      existingScript.remove();
    }

    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://aneeverse.com/#localbusiness",
      "name": "Aneeverse",
      "alternateName": "Aneeverse Creative Solutions",
      "description": "Digital Marketing, Web Development, SEO Optimization, and Creative Design Services",
      "url": "https://aneeverse.com",
      "image": "https://aneeverse.com/logo.png",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aneeverse.com/logo.png",
        "width": 200,
        "height": 60
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Office No. 03, Plot No. 45, near HP Petrol Pump, Seawoods West, Sector 44",
        "addressLocality": "Seawoods, Navi Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400706",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 19.0155818,
        "longitude": 73.005389
      },
      "telephone": "+91-91527-55529",
      "email": "team@aneeverse.com",
      "priceRange": "₹₹",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday", 
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "10:00",
          "closes": "15:00"
        }
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 19.0155818,
          "longitude": 73.005389
        },
        "geoRadius": "50000"
      },
      "sameAs": [
        "https://www.instagram.com/aneeverse/",
        "https://www.linkedin.com/company/aneeverse",
        "https://www.youtube.com/@AneeVerse"
      ],
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
      "currenciesAccepted": "INR",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Local Business Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Website Design & Development",
              "description": "Custom website design and development services for local businesses"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Local SEO",
              "description": "Local search optimization to help businesses rank higher in local search results"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Google My Business Optimization",
              "description": "GMB profile optimization for improved local visibility"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Digital Marketing",
              "description": "Local digital marketing services including Google Ads and social media marketing"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "50",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    // Create and append the script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'local-business');
    script.textContent = JSON.stringify(localBusinessSchema);
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      const scriptToRemove = document.querySelector('script[data-schema="local-business"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default LocalBusinessSchema;

"use client";

import { useEffect } from 'react';

const OrganizationSchema = () => {
  useEffect(() => {
    // Remove any existing organization schema to avoid duplicates
    const existingScript = document.querySelector('script[data-schema="organization"]');
    if (existingScript) {
      existingScript.remove();
    }

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Aneeverse",
      "alternateName": "Aneeverse Creative Solutions",
      "description": "Digital Marketing, Web Development, SEO Optimization, and Creative Design Services",
      "url": "https://aneeverse.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aneeverse.com/logo.png",
        "width": 200,
        "height": 60
      },
      "image": "https://aneeverse.com/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Office No. 03, Plot No. 45, near HP Petrol Pump, Seawoods West, Sector 44",
        "addressLocality": "Seawoods, Navi Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400706",
        "addressCountry": "IN"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-91527-55529",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"],
          "areaServed": "IN"
        },
        {
          "@type": "ContactPoint",
          "email": "team@aneeverse.com",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"],
          "areaServed": "IN"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/aneeverse/",
        "https://www.linkedin.com/company/aneeverse",
        "https://www.youtube.com/@AneeVerse"
      ],
      "foundingDate": "2020",
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "minValue": 10,
        "maxValue": 50
      },
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 19.0155818,
          "longitude": 73.005389
        },
        "geoRadius": "50000"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Digital Marketing Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Website Design & Development",
              "description": "Custom website design and development services"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "SEO Optimization",
              "description": "Search engine optimization and local SEO services"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Digital Marketing",
              "description": "Google Ads, Meta Ads, and social media marketing"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Content Creation",
              "description": "Blog writing, social media content, and creative design"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "50",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    // Create and append the script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'organization');
    script.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      const scriptToRemove = document.querySelector('script[data-schema="organization"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default OrganizationSchema;