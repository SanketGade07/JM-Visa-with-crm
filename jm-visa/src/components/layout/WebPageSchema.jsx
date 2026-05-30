"use client";

import { usePathname } from "next/navigation";

export default function WebPageSchema({ title, description }) {
  const pathname = usePathname();

  const currentUrl = `https://www.jmvisaservices.com${pathname}`;
  
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${currentUrl}#webpage`,
    "url": currentUrl,
    "name": title || "JM Visa Services",
    "description": description || "Professional visa and immigration services for travel, education, and work across 40+ countries",
    "publisher": {
      "@id": "https://www.jmvisaservices.com/#organization"
    },
    "isPartOf": {
      "@id": "https://www.jmvisaservices.com/#website"
    },
    "inLanguage": "en-US"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
    />
  );
}