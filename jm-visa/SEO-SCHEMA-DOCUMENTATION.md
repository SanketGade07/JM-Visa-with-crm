# SEO Schema Documentation

## Overview

This document provides a comprehensive overview of all SEO schema implementations in the JM Visa Services website. The website uses JSON-LD structured data to enhance search engine visibility and provide rich snippets.

## Schema Types Implemented

### 1. Organization Schema
- **Type**: Organization, TravelAgency
- **Purpose**: Defines business information and services
- **Location**: `src/components/layout/OrganizationSchema.jsx`
- **Usage**: Global (site-wide)

### 2. BlogPosting Schema
- **Type**: BlogPosting
- **Purpose**: Structured data for blog posts
- **Location**: `src/components/layout/BlogSchema.jsx`
- **Usage**: Blog post pages

### 3. FAQPage Schema
- **Type**: FAQPage
- **Purpose**: FAQ structured data for blog posts
- **Location**: `src/components/layout/FAQSchema.jsx`
- **Usage**: Blog post pages with FAQ data

### 4. BreadcrumbList Schema
- **Type**: BreadcrumbList
- **Purpose**: Navigation breadcrumbs
- **Location**: `src/components/layout/BreadcrumbJsonLd.jsx`
- **Usage**: All pages except homepage

### 5. HomePage Schema (Multi-type)
- **Types**: Organization, TravelAgency, LocalBusiness, WebSite, BreadcrumbList
- **Purpose**: Comprehensive homepage structured data
- **Location**: `src/components/layout/HomePageSchema.jsx`
- **Usage**: Homepage only

## Global Schemas (Site-wide)

### OrganizationSchema
**File**: `src/components/layout/OrganizationSchema.jsx`
**Used in**: `src/app/layout.js` (line 87)
**Renders on**: All pages

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "TravelAgency"],
  "@id": "https://www.jmvisaservices.com/#organization",
  "name": "JM Visa Services",
  "alternateName": "JM Visa",
  "url": "https://www.jmvisaservices.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.jmvisaservices.com/logo/logo.png",
    "width": 300,
    "height": 100
  },
  "description": "JM Visa Services provides professional visa and immigration services for travel, education, and work. Expert guidance for student visas, work permits, tourist visas, business visas, and immigration consulting across 40+ countries including US, UK, Canada, Australia, Germany, and Europe.",
  "telephone": ["+91 9321315524", "+91 8591070718"],
  "email": "info@jmvisaservices.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1",
    "addressLocality": "Kopar Khairane",
    "addressRegion": "Navi Mumbai, Maharashtra",
    "postalCode": "400709",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "19.1107866",
    "longitude": "73.006725"
  },
  "areaServed": [
    {
      "@type": "Country",
      "name": "India"
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
          "name": "Student Visa Services",
          "description": "Complete student visa application support and guidance"
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
    "https://www.instagram.com/jmvisaservices",
    "https://www.facebook.com/p/JM-Visa-Services",
    "https://www.linkedin.com/company/jmvisa-services/"
  ],
  "founder": {
    "@type": "Person",
    "name": "Founder Name"
  },
  "foundingDate": "2020",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "minValue": 10,
    "maxValue": 50
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
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sample Customer"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Excellent visa services with professional guidance throughout the process."
    }
  ]
}
```

### BreadcrumbJsonLd
**File**: `src/components/layout/BreadcrumbJsonLd.jsx`
**Used in**: `src/app/layout.js` (line 88)
**Renders on**: All pages except homepage

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://www.jmvisaservices.com/[pathname]#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": {
        "@type": "WebPage",
        "@id": "https://www.jmvisaservices.com",
        "url": "https://www.jmvisaservices.com",
        "name": "Home"
      }
    }
  ]
}
```

## Page-Specific Schemas

### HomePageSchema
**File**: `src/components/layout/HomePageSchema.jsx`
**Used in**: `src/app/page.js` (line 17)
**Renders on**: Homepage only

```json
{
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
        "width": 300,
        "height": 100
      },
      "description": "JM Visa Services provides professional visa and immigration services for travel, education, and work. Expert guidance for student visas, work permits, tourist visas, business visas, and immigration consulting across 40+ countries including US, UK, Canada, Australia, Germany, and Europe.",
      "telephone": ["+91 9321315524", "+91 8591070718"],
      "email": "info@jmvisaservices.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1",
        "addressLocality": "Kopar Khairane",
        "addressRegion": "Navi Mumbai, Maharashtra",
        "postalCode": "400709",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "19.1107866",
        "longitude": "73.006725"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "India"
        }
      ],
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
              }
            ]
          }
        ]
      },
      "sameAs": [
        "https://www.instagram.com/jmvisaservices",
        "https://www.facebook.com/p/JM-Visa-Services",
        "https://www.linkedin.com/company/jmvisa-services/"
      ]
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.jmvisaservices.com/#localbusiness",
      "name": "JM Visa Services",
      "image": "https://www.jmvisaservices.com/images/office-location.jpg",
      "priceRange": "₹₹",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1",
        "addressLocality": "Kopar Khairane",
        "addressRegion": "Navi Mumbai, Maharashtra",
        "postalCode": "400709",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "19.1107866",
        "longitude": "73.006725"
      },
      "url": "https://www.jmvisaservices.com",
      "telephone": ["+91 9321315524", "+91 8591070718"],
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
        }
      ],
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
      "currenciesAccepted": "INR"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.jmvisaservices.com/#website",
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
}
```

### BlogSchema
**File**: `src/components/layout/BlogSchema.jsx`
**Used in**: `src/app/(home)/blog/[slug]/page.js` (line 234)
**Renders on**: Individual blog post pages

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "https://www.jmvisaservices.com/blog/[slug]#blogposting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.jmvisaservices.com/blog/[slug]",
    "url": "https://www.jmvisaservices.com/blog/[slug]"
  },
  "headline": "[Post Title]",
  "name": "[Post Title]",
  "description": "[Post Description]",
  "image": {
    "@type": "ImageObject",
    "url": "[Main Image URL]",
    "width": 1200,
    "height": 630,
    "caption": "[Image Alt Text]"
  },
  "author": {
    "@type": "Person",
    "@id": "https://www.jmvisaservices.com/author/[author-slug]#person",
    "name": "[Author Name]",
    "description": "[Author Bio]",
    "image": {
      "@type": "ImageObject",
      "url": "[Author Image URL]",
      "caption": "[Author Name]"
    },
    "sameAs": [
      "https://www.linkedin.com/company/jm-visa-services",
      "https://www.facebook.com/jmvisaservices"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://www.jmvisaservices.com#organization",
    "name": "JM Visa Services",
    "description": "Leading visa and immigration consultancy services",
    "url": "https://www.jmvisaservices.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.jmvisaservices.com/images/jm-visa-logo.png",
      "width": 300,
      "height": 100,
      "caption": "JM Visa Services Logo"
    },
    "sameAs": [
      "https://www.linkedin.com/company/jm-visa-services",
      "https://www.facebook.com/jmvisaservices",
      "https://www.instagram.com/jmvisaservices",
      "https://twitter.com/jmvisaservices"
    ]
  },
  "datePublished": "[Publication Date]",
  "dateModified": "[Last Modified Date]",
  "dateCreated": "[Creation Date]",
  "inLanguage": "en-US",
  "isFamilyFriendly": true,
  "copyrightYear": "[Year]",
  "copyrightHolder": {
    "@type": "Organization",
    "@id": "https://www.jmvisaservices.com#organization",
    "name": "JM Visa Services"
  },
  "keywords": [
    "visa services",
    "immigration",
    "visa consultation",
    "work visa",
    "study visa",
    "tourist visa",
    "business visa",
    "visa application",
    "immigration services"
  ],
  "about": [
    {
      "@type": "Thing",
      "name": "Visa Services",
      "description": "Professional visa and immigration consultation services"
    },
    {
      "@type": "Thing",
      "name": "Immigration",
      "description": "Immigration guidance and application assistance"
    }
  ],
  "articleSection": "Visa & Immigration",
  "wordCount": "[Word Count]",
  "timeRequired": "PT[X]M",
  "url": "https://www.jmvisaservices.com/blog/[slug]",
  "isPartOf": {
    "@type": "Blog",
    "@id": "https://www.jmvisaservices.com/blog#blog",
    "name": "JM Visa Services Blog",
    "description": "Expert insights on visa applications, immigration processes, and travel documentation",
    "url": "https://www.jmvisaservices.com/blog",
    "publisher": {
      "@type": "Organization",
      "@id": "https://www.jmvisaservices.com#organization"
    }
  },
  "potentialAction": {
    "@type": "ReadAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.jmvisaservices.com/blog/[slug]",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    }
  }
}
```

### FAQSchema
**File**: `src/components/layout/FAQSchema.jsx`
**Used in**: `src/app/(home)/blog/[slug]/page.js` (line 235)
**Renders on**: Blog post pages with FAQ data

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[FAQ Question]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[FAQ Answer]"
      }
    }
  ]
}
```

## File Locations Summary

| Component | File Path | Usage Location | Scope |
|-----------|-----------|----------------|-------|
| OrganizationSchema | `src/components/layout/OrganizationSchema.jsx` | `src/app/layout.js` | Global |
| BreadcrumbJsonLd | `src/components/layout/BreadcrumbJsonLd.jsx` | `src/app/layout.js` | Global (except homepage) |
| HomePageSchema | `src/components/layout/HomePageSchema.jsx` | `src/app/page.js` | Homepage only |
| BlogSchema | `src/components/layout/BlogSchema.jsx` | `src/app/(home)/blog/[slug]/page.js` | Blog posts |
| FAQSchema | `src/components/layout/FAQSchema.jsx` | `src/app/(home)/blog/[slug]/page.js` | Blog posts with FAQs |

## Schema Implementation Details

### Dynamic Data Sources
- **BlogSchema**: Uses Sanity CMS data (`post` object)
- **FAQSchema**: Uses Sanity CMS FAQ data (`blog.faqs`)
- **BreadcrumbJsonLd**: Uses Next.js `usePathname()` hook
- **OrganizationSchema**: Static data
- **HomePageSchema**: Static data

### Key Features
- All schemas use proper `@id` references for entity linking
- Image URLs are dynamically generated from Sanity CDN
- Reading time calculation for blog posts
- Automatic breadcrumb generation based on URL path
- Comprehensive service catalogs with detailed descriptions
- Local business information with opening hours and payment methods