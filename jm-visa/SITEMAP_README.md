# Sitemap Generation for JM Visa Services

This project now automatically generates a `sitemap.xml` file in the `public` directory during every build.

## How It Works

### 1. Build Process Integration
The sitemap generation is automatically integrated into the build process. When you run:
```bash
npm run build
```

It will:
1. First run `node scripts/generate-sitemap-advanced.js` to generate the sitemap
2. Then run `next build` to build your Next.js application

### 2. Sitemap Files

#### `scripts/generate-sitemap-advanced.js`
- **Purpose**: Generates a physical `sitemap.xml` file in the `public` directory
- **Features**: 
  - Includes all static pages with proper priorities and change frequencies
  - Can optionally fetch dynamic content from Sanity CMS
  - Generates proper XML format with all required sitemap attributes
- **Output**: Creates `public/sitemap.xml` with all your website URLs

#### `src/app/sitemap.ts`
- **Purpose**: Provides a basic sitemap for the dynamic `/sitemap.xml` route
- **Note**: This is now simplified since the main sitemap is generated during build

### 3. Sitemap Content

The generated sitemap includes:

#### Static Pages
- Homepage (priority: 1.0, daily updates)
- About, Services, Contact (priority: 0.8, monthly updates)
- Privacy Policy, Terms (priority: 0.5, yearly updates)
- All service-specific pages
- Country-specific pages
- Blog and other main sections

#### Dynamic Content (Optional)
- Blog posts from Sanity CMS
- Categories from Sanity CMS
- Can be enabled by uncommenting the Sanity client code

### 4. Manual Sitemap Generation

You can manually generate the sitemap anytime by running:
```bash
npm run generate-sitemap
```

This will create/update the `public/sitemap.xml` file without building the entire application.

### 5. File Structure

```
jm-visa/
├── scripts/
│   ├── generate-sitemap.js          # Basic sitemap generator
│   └── generate-sitemap-advanced.js # Advanced generator with Sanity support
├── public/
│   └── sitemap.xml                  # Generated sitemap file (created during build)
└── src/app/
    └── sitemap.ts                   # Dynamic sitemap route handler
```

### 6. Benefits

✅ **Always Up-to-Date**: Sitemap is regenerated on every build
✅ **SEO Optimized**: Proper priorities and change frequencies for all pages
✅ **Search Engine Friendly**: Standard XML format that search engines can easily parse
✅ **Performance**: Physical file in public directory, no runtime generation needed
✅ **Flexible**: Can include both static and dynamic content

### 7. Customization

To add new pages to the sitemap:
1. Edit `scripts/generate-sitemap-advanced.js`
2. Add new URL objects to the `staticUrls` array
3. Set appropriate `changeFrequency` and `priority` values

### 8. Environment Variables

If you want to enable dynamic content from Sanity, ensure these environment variables are set:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

Then uncomment the Sanity client code in the advanced sitemap generator.

## Troubleshooting

### Sitemap not generating during build
- Check that the scripts directory exists
- Ensure Node.js can execute the script
- Check console output for any error messages

### Sitemap is empty or missing URLs
- Verify the `baseUrl` is correct in the script
- Check that all static URLs are properly defined
- Ensure the script has write permissions to the public directory

### Build fails with sitemap generation
- The build will continue even if sitemap generation fails
- Check the script for syntax errors
- Verify all required dependencies are available
