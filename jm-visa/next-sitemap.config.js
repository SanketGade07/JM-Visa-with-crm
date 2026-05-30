const { createClient } = require('@sanity/client');

// Sanity client configuration
const sanityClient = createClient({
  projectId: 'gdey5o8v',
  dataset: 'production',
  apiVersion: '2024-03-13',
  useCdn: false,
});

// Function to fetch blog posts from Sanity
async function fetchBlogPosts() {
  try {
    const posts = await sanityClient.fetch(`
      *[_type == "post"] {
        "slug": slug.current,
        _updatedAt
      }
    `);

    console.log(`📝 Found ${posts.length} blog posts from Sanity`);
    return posts;
  } catch (error) {
    console.error('❌ Error fetching blog posts from Sanity:', error);
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

    console.log(`🏷️  Found ${categories.length} categories from Sanity`);
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories from Sanity:', error);
    return [];
  }
}

module.exports = {
  siteUrl: 'https://www.jmvisaservices.com',
  generateRobotsTxt: false,
  generateIndexSitemap: false,
  exclude: ['/studio/*'],

  // This is the key - we'll add all dynamic content here
  additionalPaths: async (config) => {
    const paths = [];

    // Add all blog posts
    const posts = await fetchBlogPosts();
    posts.forEach(post => {
      paths.push({
        loc: `/blog/${post.slug}`,
        lastmod: post._updatedAt || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });
    });

    // Add all categories
    const categories = await fetchCategories();
    categories.forEach(category => {
      paths.push({
        loc: `/blog/category/${category.slug}`,
        lastmod: category._updatedAt || new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      });
    });

    // Add main pages first
    const mainPages = [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/about', priority: 0.8, changefreq: 'monthly' },
      { loc: '/contact', priority: 0.8, changefreq: 'monthly' },
      { loc: '/services', priority: 0.8, changefreq: 'monthly' },
      { loc: '/blog', priority: 0.8, changefreq: 'weekly' },
      { loc: '/country', priority: 0.8, changefreq: 'monthly' },
      { loc: '/franchise', priority: 0.7, changefreq: 'monthly' },
      { loc: '/privacy-policy', priority: 0.5, changefreq: 'yearly' },
      { loc: '/terms-and-condition', priority: 0.5, changefreq: 'yearly' },
    ];

    mainPages.forEach(page => {
      paths.push({
        loc: page.loc,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority,
      });
    });

    // Add all static service pages
    const servicePages = [
      '/services/study-abroad',
      '/services/work-visa',
      '/services/tourist-visa',
      '/services/business-visa',
      '/services/residence-visa',
      '/services/overseas-education',
      '/services/dummy-ticket-booking',
      '/services/english-proficiency-test',
      '/services/foreign-exchange',
      '/services/passport-services',
      '/services/us-interview-dates',
    ];

    servicePages.forEach(service => {
      paths.push({
        loc: service,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      });
    });

    // Add country pages
    const countryPages = [
      '/country/oceania/australia',
      '/country/oceania/new-zealand',
      '/country/north-america/united-states',
      '/country/north-america/canada',
      '/country/europe/united-kingdom',
      '/country/europe/ireland',
      '/country/europe/austria',
      '/country/europe/belgium',
      '/country/europe/denmark',
      '/country/europe/finland',
      '/country/europe/france',
      '/country/europe/germany',
      '/country/europe/greece',
    ];

    countryPages.forEach(country => {
      paths.push({
        loc: country,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      });
    });

    console.log(`🚀 Added ${paths.length} total paths to sitemap`);
    return paths;
  },
};
