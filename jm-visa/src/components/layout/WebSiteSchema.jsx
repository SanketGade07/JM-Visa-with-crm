"use client";

export default function WebSiteSchema() {
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.jmvisaservices.com/#website",
    "url": "https://www.jmvisaservices.com",
    "name": "JM Visa Services",
    "description": "Professional visa and immigration services for travel, education, and work across 40+ countries including US, UK, Canada, Australia, Germany, and Europe.",
    "publisher": {
      "@id": "https://www.jmvisaservices.com/#organization"
    },
    "inLanguage": "en-US"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
    />
  );
}