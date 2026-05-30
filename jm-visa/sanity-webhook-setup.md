# Sanity Webhook Setup Guide

This guide explains how to set up Sanity webhooks to automatically trigger sitemap updates when your blog content changes.

## 🎯 Overview

When you add, edit, or delete blog posts or categories in Sanity, the webhook will automatically:
- Trigger sitemap regeneration
- Revalidate cached pages
- Update search engine indexing

## 🔧 Setup Steps

### 1. Access Sanity Management Console

1. Go to [Sanity Management Console](https://www.sanity.io/manage)
2. Select your project: `gdey5o8v`
3. Navigate to **API** → **Webhooks**

### 2. Create New Webhook

Click **"Create webhook"** and configure:

**Basic Settings:**
- **Name**: `Sitemap Auto-Update`
- **Description**: `Automatically update sitemap when blog content changes`

**URL Configuration:**
- **URL**: `https://www.jmvisaservices.com/api/webhook/sanity`
- **Method**: `POST`

**Trigger Configuration:**
- **Dataset**: `production`
- **Filter**: 
  ```groq
  _type == "post" || _type == "category"
  ```

**HTTP Headers** (Optional but recommended):
```
Content-Type: application/json
User-Agent: Sanity-Webhook/1.0
```

**Secret** (Optional but recommended):
- Generate a secure secret token
- Add it as `SANITY_WEBHOOK_SECRET` in your Vercel environment variables

### 3. Configure Webhook Events

Select the following events to trigger the webhook:

- ✅ **Create** - When new posts/categories are created
- ✅ **Update** - When posts/categories are updated
- ✅ **Delete** - When posts/categories are deleted

### 4. Test the Webhook

After creating the webhook:

1. **Test Connection**: Use Sanity's built-in test feature
2. **Create Test Content**: Add a new blog post in Sanity Studio
3. **Verify Response**: Check that the webhook receives a 200 OK response
4. **Check Sitemap**: Visit `https://www.jmvisaservices.com/sitemap.xml` to verify updates

## 🔍 Webhook Payload Example

When content changes, Sanity sends a payload like this:

```json
{
  "_type": "post",
  "_id": "drafts.post-123",
  "_rev": "abc123",
  "slug": {
    "current": "my-new-blog-post"
  },
  "title": "My New Blog Post",
  "publishedAt": "2024-01-15T10:00:00Z",
  "_updatedAt": "2024-01-15T10:30:00Z"
}
```

## 🛠️ Environment Variables

Add these to your Vercel project:

```bash
# Optional: Webhook security
SANITY_WEBHOOK_SECRET=your-secure-secret-token

# Sanity credentials (if not already set)
SANITY_PROJECT_ID=gdey5o8v
SANITY_DATASET=production
SANITY_API_VERSION=2024-03-13
```

## 📊 Monitoring Webhook Activity

### In Sanity Console:
1. Go to **API** → **Webhooks**
2. Click on your webhook
3. View **Delivery Log** to see recent triggers

### In Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Functions** tab
4. Check logs for `/api/webhook/sanity`

## 🔧 Troubleshooting

### Common Issues:

**1. Webhook not triggering:**
- Check the GROQ filter syntax
- Verify the webhook URL is correct
- Ensure the webhook is enabled

**2. 500 errors in webhook:**
- Check Vercel function logs
- Verify environment variables are set
- Test the endpoint manually

**3. Sitemap not updating:**
- Check if revalidation is working
- Verify the sitemap endpoint is accessible
- Test manual sitemap generation

### Debug Commands:

```bash
# Test webhook endpoint manually
curl -X POST "https://www.jmvisaservices.com/api/webhook/sanity" \
  -H "Content-Type: application/json" \
  -d '{"_type":"post","_id":"test","slug":{"current":"test"}}'

# Check sitemap directly
curl "https://www.jmvisaservices.com/sitemap.xml"
```

## 🎯 Benefits of Webhook Approach

- ✅ **Real-time updates** - Sitemap updates immediately when content changes
- ✅ **Free on Vercel** - No paid plan required
- ✅ **Efficient** - Only updates when needed, not on schedule
- ✅ **Automatic** - No manual intervention required
- ✅ **SEO friendly** - Search engines get fresh content faster

## 🔄 Alternative: Manual Webhook Testing

If you want to test without changing content:

1. Go to Sanity Studio
2. Edit any blog post (make a small change)
3. Save the post
4. Check Vercel function logs
5. Verify sitemap was updated

## 📝 Next Steps

After setting up the webhook:

1. **Test thoroughly** with different content types
2. **Monitor webhook delivery logs** for the first few days
3. **Set up alerts** if webhook failures occur frequently
4. **Document the process** for your team

---

**Note**: This webhook approach works perfectly with Vercel's free plan and provides real-time sitemap updates without requiring cron jobs or paid features.