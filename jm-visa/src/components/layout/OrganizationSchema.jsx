const OrganizationSchema = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization"],
    "@id": "https://www.jmvisaservices.com/#organization",
    "name": "JM Visa Services",
    "alternateName": "JM Visa",
    "description": "Professional visa and immigration services including study abroad, work visas, tourist visas, business visas, and comprehensive immigration guidance for your international journey.",
    "url": "https://www.jmvisaservices.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.jmvisaservices.com/logo/logo.png",
      "width": 600,
      "height": 60
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://www.jmvisaservices.com/images/jm-banner.jpg",
      "width": 1200,
      "height": 630
    },
    "telephone": ["+919321315524", "+918591070718"],
    "email": "info@jmvisaservices.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1, Kopar Khairane",
      "addressLocality": "Navi Mumbai",
      "addressRegion": "Maharashtra",
      "postalCode": "400709",
      "addressCountry": "IN"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "India"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "India"
      },
      {
        "@type": "Country", 
        "name": "United States"
      },
      {
        "@type": "Country",
        "name": "Canada"
      },
      {
        "@type": "Country",
        "name": "United Kingdom"
      },
      {
        "@type": "Country",
        "name": "Australia"
      },
      {
        "@type": "Country",
        "name": "New Zealand"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Visa Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Study Abroad Visa Services",
            "description": "Complete assistance for student visa applications and overseas education guidance"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Work Visa Services",
            "description": "Professional work visa consultation and application assistance"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Tourist Visa Services",
            "description": "Tourist and visitor visa processing for multiple countries"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Business Visa Services",
            "description": "Business visa consultation and application support"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Immigration Consultation",
            "description": "Expert immigration advice and documentation assistance"
          }
        }
      ]
    },
    "sameAs": [
        "https://www.instagram.com/jmvisaservices/",
        "https://www.facebook.com/jmvisaservices/", 
        "https://www.linkedin.com/company/jm-visa-services/"
      ],
    "founder": {
      "@type": "Person",
      "name": "JM Visa Services Team"
    },
    "foundingDate": "2010",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "25"
    },
    "knowsAbout": [
      "Visa Processing",
      "Immigration Law",
      "Study Abroad",
      "Work Permits",
      "Tourist Visas",
      "Business Visas",
      "Document Verification",
      "Embassy Procedures"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    }
    };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
};

export default OrganizationSchema;