# SEO Schema Troubleshooting Guide: Organization & Local Business

## Overview
This guide helps you implement and troubleshoot Organization and Local Business schemas to ensure proper crawling and rich snippet display in search engines.

## Problem Statement
If your website's schema markup is not being crawled properly or rich snippets aren't showing up, follow this systematic approach to identify and fix the issues.

## 1. Organization Schema Implementation

### Basic Organization Schema Structure
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://yourwebsite.com",
  "logo": "https://yourwebsite.com/logo.png",
  "description": "Brief description of your organization",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "City Name",
    "addressRegion": "State/Province",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-123-4567",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://facebook.com/yourcompany",
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany"
  ]
}
```

### Implementation Methods
1. **JSON-LD (Recommended)**
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "Organization",
     // ... schema data
   }
   </script>
   ```

2. **Microdata**
   ```html
   <div itemscope itemtype="https://schema.org/Organization">
     <span itemprop="name">Company Name</span>
     <span itemprop="url">https://example.com</span>
   </div>
   ```

## 2. Local Business Schema Implementation

### Basic Local Business Schema Structure
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Your Business Name",
  "image": "https://yourwebsite.com/business-image.jpg",
  "url": "https://yourwebsite.com",
  "telephone": "+1-555-123-4567",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "456 Business Ave",
    "addressLocality": "City Name",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.7128",
    "longitude": "-74.0060"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "priceRange": "$$"
}
```

## 3. Combining Organization and Local Business Schemas

### Method 1: Separate Schemas
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  // Organization data
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  // Local business data
}
</script>
```

### Method 2: Combined Schema Array
```html
<script type="application/ld+json">
[
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    // Organization data
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // Local business data
  }
]
</script>
```

## 4. Testing and Validation Steps

### Step 1: Schema Markup Validator
1. Go to [Google's Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your URL or paste your schema code
3. Check for errors and warnings

### Step 2: Google Search Console
1. Submit your sitemap
2. Check "Enhancements" section for schema-related issues
3. Monitor "Coverage" for indexing problems

### Step 3: Schema.org Validator
1. Visit [Schema.org Validator](https://validator.schema.org/)
2. Test your markup for compliance

### Step 4: Manual Testing
```bash
# Check if schema is present in HTML
curl -s "https://yourwebsite.com" | grep -i "application/ld+json"

# Validate JSON structure
cat your-schema.json | python -m json.tool
```

## 5. Common Issues and Solutions

### Issue 1: Schema Not Being Crawled
**Symptoms:**
- Rich snippets not appearing
- Google Search Console shows no structured data

**Solutions:**
1. Ensure schema is in `<head>` or `<body>` section
2. Validate JSON syntax (no trailing commas, proper quotes)
3. Check robots.txt isn't blocking crawlers
4. Verify schema is server-side rendered, not client-side only

### Issue 2: Local Business Not Showing with Organization
**Symptoms:**
- Only organization data appears in rich snippets
- Local business information missing

**Solutions:**
1. Use separate schema blocks for each type
2. Ensure LocalBusiness has all required properties
3. Add geo coordinates for better local recognition
4. Include opening hours and contact information

### Issue 3: Rich Editor Not Displaying All Schema
**Symptoms:**
- Some schema properties missing in rich snippets
- Incomplete business information

**Solutions:**
1. Check required vs optional properties
2. Ensure all URLs are absolute and accessible
3. Validate image URLs and dimensions
4. Test with different schema types (Restaurant, Store, etc.)

## 6. Implementation Checklist

### Organization Schema
- [ ] Name and URL present
- [ ] Logo URL valid and accessible
- [ ] Address complete and formatted correctly
- [ ] Contact information included
- [ ] Social media links added (sameAs)
- [ ] Description under 160 characters

### Local Business Schema
- [ ] Business name matches Google My Business
- [ ] Complete address with postal code
- [ ] Phone number in international format
- [ ] Geo coordinates accurate
- [ ] Opening hours specified
- [ ] Business category/type appropriate
- [ ] Price range indicated (if applicable)

### Technical Implementation
- [ ] JSON-LD format used
- [ ] Valid JSON syntax
- [ ] Schema placed in HTML head or body
- [ ] No duplicate schemas on same page
- [ ] Server-side rendering confirmed
- [ ] Mobile-friendly implementation

## 7. Monitoring and Maintenance

### Regular Checks
1. **Monthly:** Google Search Console for new issues
2. **Quarterly:** Re-validate schema markup
3. **When updating:** Test schema after site changes
4. **New features:** Update schema when adding services/locations

### Tools for Monitoring
- Google Search Console
- Google Rich Results Test
- Schema.org Validator
- Screaming Frog SEO Spider
- SEMrush or Ahrefs schema tracking

## 8. Advanced Troubleshooting

### Debug Steps for Non-Working Schema
1. **View Page Source:** Ensure schema is present in HTML
2. **Network Tab:** Check if JavaScript is loading schema dynamically
3. **Fetch as Google:** Use Search Console's URL inspection tool
4. **Compare Working Examples:** Find similar sites with working schema
5. **Gradual Implementation:** Start with minimal schema, add properties incrementally

### Common Validation Errors
```
Error: Missing required property "address"
Solution: Add complete PostalAddress object

Error: Invalid URL format
Solution: Use absolute URLs (https://example.com/image.jpg)

Error: Unexpected token in JSON
Solution: Remove trailing commas, check quote marks

Warning: Recommended property missing
Solution: Add optional but recommended properties for better results
```

## Conclusion
Proper implementation of Organization and Local Business schemas requires attention to detail and regular testing. Follow this guide systematically to ensure your schemas are crawled correctly and display rich snippets in search results.

Remember: Schema markup is a long-term SEO strategy. Results may take weeks to appear in search results, so be patient and consistent with your implementation.