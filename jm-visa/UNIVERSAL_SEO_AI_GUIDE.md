# Universal SEO & AI Optimization Guide

> **Purpose**: Hand this file to any AI coding agent along with a website codebase. The agent should audit the site against every checklist item and implement all missing optimizations — **without changing any visible text or UI**.

---

## How to Use This Guide

1. **Audit first** — Go through each section's "What to Check" items
2. **Fix what's missing** — Follow the "What to Implement" instructions
3. **Verify** — Use the verification steps at the bottom
4. **Do NOT change** — Any visible text, design, layout, colors, or UI behavior

---

## 1. Robots & Crawl Access

### What to Check
- [ ] `robots.txt` exists in the public/root directory
- [ ] `robots.txt` does NOT block important pages
- [ ] AI bots are NOT blocked (GPTBot, Claude-Web, Google-Extended, etc.)
- [ ] Internal/utility paths ARE blocked (`/api/`, `/admin/`, `/studio/`, `/cms/`)
- [ ] Sitemap URL is referenced in `robots.txt`
- [ ] Check if `robots.txt` is managed by a tool/plugin (e.g., `next-sitemap`) and disable auto-generation if manual rules are needed.

### What to Implement

```txt
# robots.txt — TEMPLATE

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /studio/
Disallow: /cms/
Disallow: /thank-you
Disallow: /confirmation

# AI Bots - Explicitly Allowed
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Host: https://www.YOURDOMAIN.com
Sitemap: https://www.YOURDOMAIN.com/sitemap.xml
```

---

## 2. AI Discoverability (`llms.txt`)

### What to Check
- [ ] `llms.txt` exists in the public/root directory

### What to Implement

Create `public/llms.txt` — a plain-text file that AI models read to understand your site:

```txt
# [Company Name]

> [One-line description of what the company does]

## About
[2-3 sentences about the company, services, and target audience]

## Key Pages
- Home: https://www.YOURDOMAIN.com/
- About: https://www.YOURDOMAIN.com/about
- Services: https://www.YOURDOMAIN.com/services
- Contact: https://www.YOURDOMAIN.com/contact
- Blog: https://www.YOURDOMAIN.com/blog

## Services
- [Service 1]: [brief description]
- [Service 2]: [brief description]
- [Service 3]: [brief description]

## Contact
- Email: [email]
- Phone: [phone]
- Address: [address]
```

---

## 3. Meta Tags & Head Configuration

### What to Check
- [ ] Every page has a unique `<title>` tag (50–60 chars ideal)
- [ ] Every page has a unique `<meta name="description">` (120–155 chars ideal)
- [ ] `<meta name="robots" content="index, follow">` is present (or not blocking)
- [ ] `noimageindex` is NOT set (unless intentional for specific pages)
- [ ] `max-image-preview: large` is set (allows rich image snippets)
- [ ] `max-snippet: -1` is set (allows full text snippets)
- [ ] `max-video-preview: -1` is set (allows video previews)
- [ ] Canonical URL is set on every page (`<link rel="canonical">`)
- [ ] `<html lang="en">` (or correct language) is set
- [ ] Open Graph tags exist (og:title, og:description, og:image, og:url, og:type)
- [ ] Twitter Card tags exist (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] Favicon is configured (ico, png 16x16, png 32x32, apple-touch-icon)
- [ ] `viewport` meta tag is present

### What to Implement

#### For Next.js (App Router)
```js
// In layout.js or page.js
export const metadata = {
  metadataBase: new URL('https://www.YOURDOMAIN.com'),
  title: 'Page Title | Brand Name',
  description: 'Compelling description under 155 characters.',
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  alternates: {
    canonical: '/current-page-path',
  },
  openGraph: {
    title: 'Page Title | Brand Name',
    description: 'Description for social sharing.',
    url: 'https://www.YOURDOMAIN.com/current-page-path',
    siteName: 'Brand Name',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Description' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title | Brand Name',
    description: 'Description for Twitter.',
    images: ['/og-image.png'],
  },
};
```

#### For plain HTML
```html
<head>
  <title>Page Title | Brand Name</title>
  <meta name="description" content="Compelling description under 155 chars.">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://www.YOURDOMAIN.com/current-page">

  <!-- Open Graph -->
  <meta property="og:title" content="Page Title | Brand Name">
  <meta property="og:description" content="Description for social sharing.">
  <meta property="og:image" content="https://www.YOURDOMAIN.com/og-image.png">
  <meta property="og:url" content="https://www.YOURDOMAIN.com/current-page">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Brand Name">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title | Brand Name">
  <meta name="twitter:description" content="Description for Twitter.">
  <meta name="twitter:image" content="https://www.YOURDOMAIN.com/og-image.png">
</head>
```

### Pages That SHOULD Have `noindex`
- Thank-you / confirmation pages
- Paid ads landing pages (they shouldn't compete with organic)
- Internal admin/dashboard pages
- Search results pages
- Paginated filter results

---

## 4. Structured Data (JSON-LD Schemas)

### What to Check
- [ ] `Organization` or `LocalBusiness` schema exists (site-wide)
- [ ] `WebSite` schema with `SearchAction` exists (for sitelinks search box)
- [ ] `BreadcrumbList` schema exists on inner pages
- [ ] `FAQPage` schema exists if the page has an FAQ section
- [ ] `BlogPosting` / `Article` schema exists on blog posts
- [ ] `Service` schema exists on service pages
- [ ] No fake/random data in schemas (upvotes, review counts, dates)
- [ ] All schema validates on [Google Rich Results Test](https://search.google.com/test/rich-results)

### What to Implement

#### Organization / LocalBusiness (site-wide)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Company Name",
  "description": "What you do.",
  "url": "https://www.YOURDOMAIN.com",
  "logo": "https://www.YOURDOMAIN.com/logo.png",
  "telephone": "+91 XXXXXXXXXX",
  "email": "info@YOURDOMAIN.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Full Street Address",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "XXXXXX",
    "addressCountry": "IN"
  },
  "sameAs": ["https://instagram.com/handle", "https://linkedin.com/company/handle"],
  "openingHours": "Mo-Sa 09:00-18:00"
}
```

#### WebSite + SearchAction (site-wide)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Brand Name",
  "url": "https://www.YOURDOMAIN.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.YOURDOMAIN.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

> Remove SearchAction if the site has no search functionality.

#### BreadcrumbList (inner pages)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.YOURDOMAIN.com" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.YOURDOMAIN.com/services" }
  ]
}
```

#### Service (service pages)
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "description": "What this service does.",
  "provider": {
    "@type": "Organization",
    "name": "Company Name"
  },
  "serviceType": "Category of Service",
  "areaServed": { "@type": "Country", "name": "India" }
}
```

---

## 5. Technical SEO Checks

### What to Check
- [ ] No aggressive `Cache-Control: no-store, no-cache` on public pages
- [ ] HTTP response headers allow caching for static content
- [ ] No right-click blocking (`contextmenu` event `preventDefault`)
- [ ] No text selection blocking (`user-select: none` on body/content)
- [ ] No copy blocking (`copy` event `preventDefault`)
- [ ] `<html lang="xx">` attribute is set correctly
- [ ] All images have `alt` attributes
- [ ] Heading hierarchy is correct (single `<h1>` per page, then `<h2>`, `<h3>`)
- [ ] No orphan pages (every page is linked from at least one other page)
- [ ] 404 page exists and returns HTTP 404 status code
- [ ] No redirect chains (A → B → C should be A → C)
- [ ] HTTPS is enforced (HTTP → HTTPS redirect)

### What to Fix

#### Remove right-click / copy blocking
Search for and remove any of these patterns:
```js
// DELETE these if found:
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.onselectstart = () => false;
document.oncontextmenu = () => false;
```

Also remove from CSS:
```css
/* DELETE if applied to body or content areas: */
user-select: none;
-webkit-user-select: none;
-moz-user-select: none;
```

#### Fix Cache Headers
Allow crawlers to cache public pages:
```js
// GOOD - Only block caching on API/dynamic routes
// Let framework defaults handle static pages
// Or set explicit public cache:
// Cache-Control: public, max-age=3600, s-maxage=3600
```

---

## 6. Content & Accessibility (Audit Only — Don't Change Text)

### What to Check
- [ ] Pages have real HTML text content (not just images/canvas/animations)
- [ ] Important text is NOT rendered exclusively via JavaScript animations
- [ ] Text is in semantic HTML elements (`<h1>`, `<h2>`, `<p>`, `<ul>`, `<article>`, `<section>`, `<nav>`, `<footer>`)
- [ ] Content does NOT require login/authentication to view
- [ ] Key content is NOT hidden behind "click to expand" without being in the DOM
- [ ] `<img>` tags have meaningful `alt` text (not "image1.png")
- [ ] Links have descriptive anchor text (not "click here")
- [ ] `<a>` tags for external links have `rel="noopener noreferrer"` if `target="_blank"`

---

## 7. Sitemap

### What to Check
- [ ] `sitemap.xml` exists and is accessible at `/sitemap.xml`
- [ ] Sitemap includes ALL public pages
- [ ] Sitemap does NOT include utility pages (thank-you, admin, API)
- [ ] Sitemap includes dynamic pages (blog posts, country pages, etc.)
- [ ] `<lastmod>` dates are accurate (not all the same date)
- [ ] Sitemap is referenced in `robots.txt`
- [ ] Sitemap is submitted to Google Search Console

### What to Implement (Next.js)
```js
// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://www.YOURDOMAIN.com',
  generateRobotsTxt: false, // We manage robots.txt manually
  sitemapSize: 5000,
  exclude: ['/thank-you*', '/admin*', '/api*', '/studio*', '/confirmation*'],
};
```

---

## 8. Performance (SEO Impact)

### What to Check
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms / Interaction to Next Paint (INP) < 200ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Images are optimized (WebP/AVIF, lazy loaded, sized correctly)
- [ ] Third-party scripts load with `async` or `defer` or `afterInteractive`
- [ ] No render-blocking CSS/JS
- [ ] Fonts use `display: swap` or `display: optional`

### Quick Wins
- Use `next/image` (Next.js) or `<img loading="lazy">` for below-fold images
- Load analytics/pixels with `strategy="afterInteractive"` (Next.js) or `defer`
- Inline critical CSS, defer the rest
- Preload hero images: `<link rel="preload" as="image" href="/hero.webp">`

---

## 9. Avoiding Configuration Overwrites

Automated tools often manage SEO files and can overwrite manual changes during build or deployment.

### What to Check
- **Next.js**: Check `next-sitemap.config.js`. If `generateRobotsTxt: true`, it will overwrite your `public/robots.txt`.
- **Gatsby**: Check `gatsby-plugin-sitemap` in `gatsby-config.js`.
- **WordPress**: Check Yoast or Rank Math settings for robots.txt management.

### How to Fix
- Set `generateRobotsTxt: false` in the configuration file if you need custom AI bot rules.
- Manually place your enhanced `robots.txt` in the static/public folder.

---

## Priority Action Checklist (Start Here)

Execute in this order for maximum impact:

| Priority | Action | Impact |
|----------|--------|--------|
| 🔴 P0 | Fix `robots.txt` — don't block bots | Critical |
| 🔴 P0 | Remove right-click / selection / copy blocking | Critical |
| 🔴 P0 | Remove aggressive no-cache headers on public pages | Critical |
| 🟠 P1 | Add/fix `<meta name="robots">` on every page | High |
| 🟠 P1 | Add canonical URLs to every page | High |
| 🟠 P1 | Add `metadataBase` (Next.js) or full canonical URLs | High |
| 🟠 P1 | Remove `noimageindex` if present | High |
| 🟠 P1 | Add `max-image-preview: large` to robots meta | High |
| 🟡 P2 | Add/fix Open Graph tags on all pages | Medium |
| 🟡 P2 | Add/fix Twitter Card tags on all pages | Medium |
| 🟡 P2 | Add `Organization`/`LocalBusiness` schema | Medium |
| 🟡 P2 | Add `WebSite` schema | Medium |
| 🟡 P2 | Add `BreadcrumbList` schema on inner pages | Medium |
| 🟡 P2 | Noindex utility/thank-you/ads pages | Medium |
| 🟢 P3 | Create `llms.txt` | Low-Medium |
| 🟢 P3 | Add `Service` schema to service pages | Low-Medium |
| 🟢 P3 | Add `FAQPage` schema to FAQ sections | Low-Medium |
| 🟢 P3 | Verify sitemap completeness | Low |
| 🟢 P3 | Check all images have `alt` attributes | Low |
| 🟢 P3 | Remove any fake schema data (random numbers, etc.) | Low |

---

## Framework-Specific Notes

| Framework | Metadata Method | Sitemap | Structured Data |
|-----------|----------------|---------|-----------------|
| **Next.js App Router** | `export const metadata` / `generateMetadata()` in `layout.js`/`page.js` | `next-sitemap` or route handler at `/sitemap.xml/route.js` | `<Script type="application/ld+json">` |
| **Next.js Pages Router** | `next-seo` or `<Head>` component | `next-sitemap` | `<script type="application/ld+json">` in `<Head>` |
| **React (Vite/CRA)** | `react-helmet` or `react-helmet-async` | Manual or pre-render | `<script>` in `index.html` or via Helmet |
| **WordPress** | Yoast SEO / Rank Math plugin | Auto-generated by plugin | Plugin or custom `wp_head` action |
| **Static HTML** | Direct `<meta>` tags in `<head>` | Manual `sitemap.xml` file | `<script type="application/ld+json">` in `<head>` |
| **Framer** | Built-in SEO settings per page | Auto-generated | Custom code embed |

---

## Final Reminders

> [!IMPORTANT]
> - **Never use fake data in schemas** (random upvotes, fake review counts). Google penalizes this.
> - **Every page needs a unique title and description**. Duplicate meta across pages hurts rankings.
> - **Canonical URLs prevent duplicate content issues**. Always set them.
> - **AI bots respect `robots.txt`**. If you block them, your site won't appear in AI answers.
> - **Test everything** at [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema Validator](https://validator.schema.org/).
