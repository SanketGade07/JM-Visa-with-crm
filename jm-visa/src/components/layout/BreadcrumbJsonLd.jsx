"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Enhanced title case conversion with better handling for visa-related terms
function toTitleCase(segment) {
  const decoded = decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  // Special cases for common visa/immigration terms
  const specialCases = {
    'usa': 'USA',
    'uk': 'UK',
    'uae': 'UAE',
    'visa': 'Visa',
    'visas': 'Visas',
    'blog': 'Blog',
    'about': 'About Us',
    'contact': 'Contact Us',
    'services': 'Our Services',
    'country': 'Countries',
    'franchise': 'Franchise',
    'study-abroad': 'Study Abroad',
    'work-visa': 'Work Visa',
    'tourist-visa': 'Tourist Visa',
    'business-visa': 'Business Visa',
    'residence-visa': 'Residence Visa'
  };

  const lowerSegment = decoded.toLowerCase();
  if (specialCases[lowerSegment]) {
    return specialCases[lowerSegment];
  }

  return decoded.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BreadcrumbJsonLdDynamic({
  baseUrl = "https://www.jmvisaservices.com",
  rootName = "Home",
}) {
  const pathname = usePathname() || "/";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render on homepage as it would only have one item
  if (pathname === "/" || !pathname) return null;

  const segments = pathname
    .split("/")
    .filter(Boolean);

  // Don't render if no meaningful breadcrumb path
  if (segments.length === 0) return null;

  const itemListElements = [
    {
      position: 1,
      name: rootName,
      item: baseUrl,
    },
  ];

  let cumulativePath = "";
  segments.forEach((segment, index) => {
    cumulativePath += `/${segment}`;
    itemListElements.push({
      position: index + 2,
      name: toTitleCase(segment),
      item: `${baseUrl}${cumulativePath}`,
    });
  });

  // Avoid rendering during prerender/build
  if (!isMounted) return null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}${pathname}#breadcrumb`,
    itemListElement: itemListElements.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: item.item
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}


