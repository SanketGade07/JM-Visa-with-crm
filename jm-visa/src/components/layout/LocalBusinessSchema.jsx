const LocalBusinessSchema = () => {
  const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.jmvisaservices.com/#localbusiness",
      "name": "JM Visa Services",
      "alternateName": "JM Visa",
      "description": "Professional visa and immigration services including study abroad, work visas, tourist visas, business visas, and comprehensive immigration guidance for your international journey.",
      "url": "https://www.jmvisaservices.com",
      "image": "https://www.jmvisaservices.com/images/jm-banner.jpg",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.jmvisaservices.com/logo/logo.png",
        "width": 600,
        "height": 60
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1, Kopar Khairane",
        "addressLocality": "Navi Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400709",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 19.1107866,
        "longitude": 73.006725
      },
      "telephone": ["+919321315524", "+918591070718"],
      "email": "info@jmvisaservices.com",
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
          "closes": "17:00"
        }
      ],
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
      "sameAs": [
        "https://www.linkedin.com/company/jm-visa-services/",
        "https://www.facebook.com/jmvisaservices/",
        "https://www.instagram.com/jmvisaservices/",
        "https://twitter.com/jmvisaservices/"
      ],
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
      "currenciesAccepted": "INR",
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
              "description": "Tourist and visitor visa processing for leisure and family visits"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Business Visa Services",
              "description": "Business visa assistance for meetings, conferences, and trade activities"
            }
          }
        ]
      },
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
    />
  );
};

export default LocalBusinessSchema;