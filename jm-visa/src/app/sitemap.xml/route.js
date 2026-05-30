import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Sanity client configuration
const sanityClient = createClient({
  projectId: 'gdey5o8v',
  dataset: 'production',
  apiVersion: '2024-03-13',
  useCdn: false,
});

// Configuration
const CONFIG = {
  baseUrl: 'https://www.jmvisaservices.com',
};

// Function to fetch blog posts from Sanity
async function fetchBlogPosts() {
  try {
    const posts = await sanityClient.fetch(`
      *[_type == "post"] {
        "slug": slug.current,
        _updatedAt,
        publishedAt
      }
    `);
    
    return posts.map(post => ({
      url: `${CONFIG.baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post._updatedAt || post.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7
    }));
  } catch (error) {
    console.error(`Error fetching blog posts: ${error.message}`);
    return [];
  }
}

// Function to fetch categories from Sanity
async function fetchCategories() {
  try {
    const categories = await sanityClient.fetch(`
      *[_type == "category"] {
        "slug": slug.current,
        _updatedAt
      }
    `);
    
    return categories.map(category => ({
      url: `${CONFIG.baseUrl}/blog/category/${category.slug}`,
      lastModified: new Date(category._updatedAt),
      changeFrequency: 'weekly',
      priority: 0.6
    }));
  } catch (error) {
    console.error(`Error fetching categories: ${error.message}`);
    return [];
  }
}

// Static URLs configuration
function getStaticUrls() {
  return [
    {
      url: CONFIG.baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${CONFIG.baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/study-abroad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/work-visa`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/tourist-visa`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/business-visa`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/residence-visa`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/overseas-education`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/dummy-ticket-booking`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/english-proficiency-test`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/foreign-exchange`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/passport-services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/services/us-interview-dates`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Country pages
    {
      url: `${CONFIG.baseUrl}/country/Oceania/Australia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Oceania/New%20Zealand`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/NorthAmerica/United%20States`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/NorthAmerica/Canada`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/United%20Kingdom`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/Ireland`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/Austria`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/Belgium`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/Denmark`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/Finland`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/France`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/Germany`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/country/Europe/Greece`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/franchise`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${CONFIG.baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${CONFIG.baseUrl}/terms-and-condition`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${CONFIG.baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}

// Function to generate sitemap XML content
function generateSitemapXML(urls) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urlEntries = urls.map(url => {
    const lastmod = url.lastModified ? url.lastModified.toISOString() : new Date().toISOString();
    const changefreq = url.changeFrequency || 'monthly';
    const priority = url.priority || 0.5;
    
    return `  <url>
    <loc>${url.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');
  
  return `${xmlHeader}
${urlsetOpen}
${urlEntries}
${urlsetClose}`;
}

// API Route Handler for sitemap.xml
export async function GET() {
  try {
    // Get static URLs
    const staticUrls = getStaticUrls();
    
    // Fetch dynamic content from Sanity
    const [blogPosts, categories] = await Promise.all([
      fetchBlogPosts(),
      fetchCategories()
    ]);
    
    // Combine all URLs
    const allUrls = [...staticUrls, ...blogPosts, ...categories];
    
    // Generate XML content
    const sitemapXML = generateSitemapXML(allUrls);
    
    // Return XML response with proper headers
    return new NextResponse(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error(`Error generating sitemap: ${error.message}`);
    
    // Return a basic sitemap with just the homepage if there's an error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CONFIG.baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes on error
      },
    });
  }
}