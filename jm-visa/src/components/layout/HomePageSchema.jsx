import React from 'react';

const HomePageSchema = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "TravelAgency"],
        "@id": "https://www.jmvisaservices.com/#organization",
        "name": "JM Visa Services",
        "alternateName": "JM Visa",
        "url": "https://www.jmvisaservices.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.jmvisaservices.com/logo/logo.png",
          "width": 600,
          "height": 60
        },
        "image": "https://www.jmvisaservices.com/images/jm-banner.jpg",
        "description": "JM Visa Services provides professional visa and immigration services for travel, education, and work. Expert guidance for student visas, work permits, tourist visas, business visas, and immigration consulting across 40+ countries including US, UK, Canada, Australia, Germany, and Europe.",
        "telephone": ["+91-9321315524", "+91-8591070718"],
        "email": "info@jmvisaservices.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1, Kopar Khairane",
          "addressLocality": "Navi Mumbai",
          "addressRegion": "Maharashtra",
          "postalCode": "400709",
          "addressCountry": "IN"
        },
        "areaServed": [
          {
            "@type": "Country",
            "name": "India"
          },
          {
            "@type": "City",
            "name": "Delhi"
          },
          {
            "@type": "City",
            "name": "Mumbai"
          },
          {
            "@type": "City",
            "name": "Bangalore"
          },
          {
            "@type": "City",
            "name": "Chennai"
          },
          {
            "@type": "City",
            "name": "Kolkata"
          },
          {
            "@type": "City",
            "name": "Pune"
          }
        ],
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
            "opens": "10:00",
            "closes": "20:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "10:00",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Sunday",
            "opens": "10:00",
            "closes": "17:00",
            "description": "By appointment only"
          }
        ],
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
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "500",
          "bestRating": "5",
          "worstRating": "1"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Visa Services",
          "itemListElement": [
            {
              "@type": "OfferCatalog",
              "name": "Student Visa Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "UK Student Visa",
                    "description": "Complete UK student visa application support including eVisa processing, document verification, and interview preparation for Indian students"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "US Student Visa (F-1)",
                    "description": "F-1 student visa assistance for US universities with complete documentation and interview coaching"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Canada Study Permit",
                    "description": "Canadian study permit guidance with SDS and non-SDS application support"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Australia Student Visa",
                    "description": "Australian student visa processing with GTE statement preparation and health insurance guidance"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Germany Student Visa",
                    "description": "German student visa and residence permit assistance for Indian students"
                  }
                }
              ]
            },
            {
              "@type": "OfferCatalog",
              "name": "Work Visa Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Germany Work Visa",
                    "description": "Germany job seeker visa and skilled worker visa processing with EU Blue Card assistance"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "UK Skilled Worker Visa",
                    "description": "UK work permit application support for Indian professionals with sponsorship guidance"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Canada Work Permit",
                    "description": "Canadian work permit processing including LMIA support and Express Entry guidance"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Australia Work Visa",
                    "description": "Australian work visa subclasses 482, 186, 189 with skills assessment support"
                  }
                }
              ]
            },
            {
              "@type": "OfferCatalog",
              "name": "Tourist Visa Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Schengen Visa",
                    "description": "Schengen tourist visa for 26 European countries with travel itinerary planning"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "US B1/B2 Visa",
                    "description": "US tourist and business visa appointment booking with interview preparation and document support"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "UK Tourist Visa",
                    "description": "UK visitor visa processing with travel documentation and financial proof assistance"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Canada Tourist Visa",
                    "description": "Canadian visitor visa with invitation letter support and travel planning"
                  }
                }
              ]
            },
            {
              "@type": "OfferCatalog",
              "name": "Business Visa Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "China M-Visa",
                    "description": "China business visa for trade fairs, meetings, and commercial activities with fast 4-5 day processing"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Dubai Business Visa",
                    "description": "UAE business visa processing for conferences, meetings, and trade activities"
                  }
                }
              ]
            }
          ]
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://www.jmvisaservices.com/#localbusiness",
        "name": "JM Visa Services",
        "image": "https://www.jmvisaservices.com/images/jm-banner.jpg",
        "priceRange": "₹₹",
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
        "url": "https://www.jmvisaservices.com",
        "telephone": ["+919321315524", "+918591070718"],
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
            "opens": "10:00",
            "closes": "20:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "10:00",
            "closes": "17:00"
          }
        ],
        "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking, Online Payment",
        "currenciesAccepted": "INR"
      },
      {
        "@type": "WebPage",
        "@id": "https://www.jmvisaservices.com/#webpage",
        "url": "https://www.jmvisaservices.com",
        "name": "JM Visa Services",
        "description": "Professional visa and immigration services for travel, education, and work across 40+ countries",
        "publisher": {
          "@id": "https://www.jmvisaservices.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.jmvisaservices.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.jmvisaservices.com/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.jmvisaservices.com"
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default HomePageSchema;