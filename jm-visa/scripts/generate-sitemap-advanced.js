const fs = require('fs');
const path = require('path');

// Base URL for your website
const baseUrl = 'https://www.jmvisaservices.com';

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

// Function to fetch dynamic content from Sanity (optional)
async function fetchDynamicContent() {
  try {
    // You can uncomment and modify this section if you want to fetch dynamic content
    // const { createClient } = require('@sanity/client');
    // const client = createClient({
    //   projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    //   dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    //   apiVersion: '2024-01-01',
    //   useCdn: false,
    // });
    
    // const posts = await client.fetch(`*[_type == "post"] { slug, _updatedAt }`);
    // const categories = await client.fetch(`*[_type == "category"] { slug, _updatedAt }`);
    
    // return { posts, categories };
    return { posts: [], categories: [] };
  } catch (error) {
    console.log('⚠️  Could not fetch dynamic content from Sanity, using static sitemap only');
    return { posts: [], categories: [] };
  }
}

// Main function to generate sitemap
async function generateSitemap() {
  try {
    // Fetch dynamic content if available
    const dynamicContent = await fetchDynamicContent();
    
    // Define all your static URLs
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/study-abroad`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/work-visa`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/tourist-visa`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/business-visa`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/residence-visa`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/overseas-education`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/dummy-ticket-booking`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/english-proficiency-test`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/foreign-exchange`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/passport-services`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services/us-interview-dates`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Oceania/Australia`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Oceania/New%20Zealand`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/NorthAmerica/United%20States`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/NorthAmerica/Canada`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/United%20Kingdom`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/Ireland`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/Austria`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/Belgium`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/Denmark`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/Finland`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/France`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/Germany`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/country/Europe/Greece`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/franchise`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms-and-condition`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/testimonials`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/franchise`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms-and-condition`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
    ];

    // Add dynamic blog posts if available
    const dynamicUrls = [];
    if (dynamicContent.posts && dynamicContent.posts.length > 0) {
      dynamicContent.posts.forEach(post => {
        dynamicUrls.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post._updatedAt || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    // Add dynamic categories if available
    if (dynamicContent.categories && dynamicContent.categories.length > 0) {
      dynamicContent.categories.forEach(category => {
        dynamicUrls.push({
          url: `${baseUrl}/blog/category/${category.slug}`,
          lastModified: new Date(category._updatedAt || Date.now()),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      });
    }

    // Combine all URLs
    const allUrls = [...staticUrls, ...dynamicUrls];

    // Generate the sitemap XML
    const sitemapXML = generateSitemapXML(allUrls);

    // Ensure the public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write the sitemap to public/sitemap.xml
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');

    console.log(`✅ Sitemap generated successfully at: ${sitemapPath}`);
    console.log(`📊 Total URLs in sitemap: ${allUrls.length}`);
    console.log(`   - Static URLs: ${staticUrls.length}`);
    console.log(`   - Dynamic URLs: ${dynamicUrls.length}`);

    return true;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    return false;
  }
}

// Run the sitemap generation
if (require.main === module) {
  generateSitemap().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { generateSitemap };
