"use client";

import { useMemo } from "react";

/**
 * BlogSchema Component - Generates Article structured data for blog posts
 * Follows Google's 2025 best practices for Article schema
 * 
 * @param {Object} post - Blog post data from Sanity
 * @param {string} post.title - Blog post title
 * @param {Object} post.slug - Blog post slug object
 * @param {string} post.slug.current - Blog post slug current value
 * @param {string} post.metaDescription - Blog post meta description
 * @param {Object} post.author - Author information
 * @param {string} post.author.name - Author name
 * @param {Object} post.author.image - Author image object
 * @param {string} post.author.bio - Author bio
 * @param {Object} post.mainImage - Main blog image object
 * @param {string} post.publishedAt - Publication date (ISO string)
 * @param {string} post._updatedAt - Last updated date (ISO string)
 * @param {Array} post.body - Blog content body (Sanity blocks)
 * @param {string} baseUrl - Base URL of the website
 */
export default function BlogSchema({ 
  post, 
  baseUrl = "https://www.jmvisaservices.com" 
}) {
  const blogSchema = useMemo(() => {
    if (!post) return null;

    // Calculate reading time (approximate)
    const wordsPerMinute = 200;
    const wordCount = post.body?.reduce((count, block) => {
      if (block._type === 'block' && block.children) {
        return count + block.children.reduce((childCount, child) => {
          return childCount + (child.text?.split(' ').length || 0);
        }, 0);
      }
      return count;
    }, 0) || 0;
    
    const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

    // Build image URL for main image
    const mainImageUrl = post.mainImage?.asset?._ref 
      ? `https://cdn.sanity.io/images/gdey5o8v/production/${post.mainImage.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`
      : `${baseUrl}/images/default-blog-image.jpg`;

    // Build author image URL
    const authorImageUrl = post.author?.image?.asset?._ref
      ? `https://cdn.sanity.io/images/gdey5o8v/production/${post.author.image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`
      : `${baseUrl}/images/default-author.jpg`;

    // Extract text content for description
    const textContent = post.body?.reduce((text, block) => {
      if (block._type === 'block' && block.children) {
        const blockText = block.children.map(child => child.text || '').join(' ');
        return text + blockText + ' ';
      }
      return text;
    }, '').trim() || '';

    const description = post.metaDescription || 
      (textContent.length > 160 ? textContent.substring(0, 157) + '...' : textContent) ||
      `Read about ${post.title} - Expert visa and immigration guidance from JM Visa Services.`;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${baseUrl}/blog/${post.slug.current}#article`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${post.slug.current}`,
        "url": `${baseUrl}/blog/${post.slug.current}`
      },
      "headline": post.title,
      "name": post.title,
      "description": description,
      "image": {
        "@type": "ImageObject",
        "url": mainImageUrl,
        "width": 1200,
        "height": 630,
        "caption": post.mainImage?.alt || post.title
      },
      "author": {
        "@type": "Person",
        "@id": `${baseUrl}/author/${post.author?.slug?.current || 'jm-visa-team'}#person`,
        "name": post.author?.name || "JM Visa Services Team",
        "description": post.author?.bio || "Expert visa and immigration consultants",
        "image": {
          "@type": "ImageObject",
          "url": authorImageUrl,
          "caption": post.author?.name || "JM Visa Services Team"
        },
        "sameAs": [
          "https://www.linkedin.com/company/jm-visa-services",
          "https://www.facebook.com/jmvisaservices"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
        "name": "JM Visa Services",
        "description": "Leading visa and immigration consultancy services",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/images/jm-visa-logo.png`,
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
      "datePublished": post.publishedAt,
      "dateModified": post._updatedAt || post.publishedAt,
      "dateCreated": post.publishedAt,
      "inLanguage": "en-US",
      "isFamilyFriendly": true,
      "copyrightYear": new Date(post.publishedAt).getFullYear(),
      "copyrightHolder": {
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
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
      "wordCount": wordCount,
      "timeRequired": `PT${readingTime}M`,
      "url": `${baseUrl}/blog/${post.slug.current}`,
      "isPartOf": {
        "@type": "Blog",
        "@id": `${baseUrl}/blog#blog`,
        "name": "JM Visa Services Blog",
        "description": "Expert insights on visa applications, immigration processes, and travel documentation",
        "url": `${baseUrl}/blog`,
        "publisher": {
          "@type": "Organization",
          "@id": `${baseUrl}#organization`
        }
      },
      "potentialAction": {
        "@type": "ReadAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/blog/${post.slug.current}`,
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform"
          ]
        }
      }
    };
  }, [post, baseUrl]);

  if (!blogSchema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
    />
  );
}