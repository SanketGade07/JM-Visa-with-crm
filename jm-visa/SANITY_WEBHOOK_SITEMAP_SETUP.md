# Sanity Webhook Sitemap Setup Guide

## 🎯 Overview

This guide will help you set up automatic sitemap updates using Sanity webhooks on Vercel's **FREE** plan. When you add, edit, or delete blog posts or categories in Sanity, the sitemap will automatically update in real-time.

## 📁 What's Included

Your project now has these essential files for the Sanity webhook solution:

- `src/app/api/webhook/sanity/route.js` - Webhook endpoint that receives Sanity updates
- `src/app/sitemap.xml/route.js` - Dynamic sitemap generator
- `sanity-webhook-setup.md` - Detailed webhook configuration guide

## 🚀 Step-by-Step Setup

### Step 1: Deploy to Vercel

1. **Commit your changes** to Git:
   ```bash
   git add .
   git commit -m "Add Sanity webhook sitemap automation"
   git push
   ```

2. **Deploy to Vercel**:
   - Connect your repository to Vercel
   - Deploy the project
   - Note your deployment URL (e.g., `https://your-project.vercel.app`)

### Step 2: Set Up Sanity Webhook

1. **Go to Sanity Management Console**:
   - Visit [https://www.sanity.io/manage](https://www.sanity.io/manage)
   - Select your project: `gdey5o8v`
   - Navigate to **API** → **Webhooks**

2. **Create New Webhook**:
   - Click **"Create webhook"**
   - **Name**: `Sitemap Auto-Update`
   - **URL**: `https://your-project.vercel.app/api/webhook/sanity`
   - **Method**: `POST`
   - **Dataset**: `production`

3. **Configure Trigger Filter**:
   ```groq
   _type == "post" || _type == "category"
   ```

4. **Select Events**:
   - ✅ Create
   - ✅ Update  
   - ✅ Delete

5. **Save the webhook**

### Step 3: Test the Setup

1. **Test Webhook Endpoint**:
   ```bash
   curl -X GET "https://your-project.vercel.app/api/webhook/sanity"
   ```
   Should return: `{"message": "Sanity webhook endpoint is active"}`

2. **Test Sitemap Generation**:
   ```bash
   curl "https://your-project.vercel.app/sitemap.xml"
   ```
   Should return XML sitemap with all your pages

3. **Test Real Content Update**:
   - Go to Sanity Studio
   - Edit any blog post (make a small change)
   - Save the post
   - Check sitemap again - it should update immediately

### Step 4: Verify Everything Works

1. **Check Webhook Delivery**:
   - In Sanity Console → API → Webhooks
   - Click your webhook → View delivery log
   - Should show successful deliveries (200 status)

2. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check logs for `/api/webhook/sanity`
   - Should show webhook processing messages

3. **Verify Sitemap Updates**:
   - Add a new blog post in Sanity
   - Visit `https://your-project.vercel.app/sitemap.xml`
   - New post should appear in sitemap immediately

## 🔧 How It Works

1. **Content Change**: You edit content in Sanity Studio
2. **Webhook Trigger**: Sanity sends POST request to your webhook
3. **Cache Invalidation**: Webhook invalidates Next.js cache for sitemap
4. **Automatic Regeneration**: Next request to sitemap.xml generates fresh content
5. **SEO Benefits**: Search engines get updated sitemap immediately

## ✅ Benefits of This Solution

- 🆓 **Completely FREE** - Works on Vercel free plan
- ⚡ **Real-time updates** - Sitemap updates immediately when content changes
- 🔄 **Automatic** - No manual intervention required
- 🎯 **Efficient** - Only updates when content actually changes
- 🚀 **Fast** - Uses Next.js revalidation for optimal performance
- 🔒 **Secure** - No external dependencies or third-party services

## 🛠️ Troubleshooting

### Webhook Not Triggering
- Check webhook URL is correct
- Verify GROQ filter syntax: `_type == "post" || _type == "category"`
- Ensure webhook is enabled in Sanity

### Sitemap Not Updating
- Check Vercel function logs for errors
- Test webhook endpoint manually
- Verify Sanity credentials in your environment

### 500 Errors
- Check Vercel function logs
- Ensure all dependencies are installed
- Verify Sanity project ID and dataset

## 📞 Support Commands

```bash
# Test webhook endpoint
curl -X GET "https://your-project.vercel.app/api/webhook/sanity"

# Check sitemap
curl "https://your-project.vercel.app/sitemap.xml"

# Test webhook with sample data
curl -X POST "https://your-project.vercel.app/api/webhook/sanity" \
  -H "Content-Type: application/json" \
  -d '{"_type":"post","_id":"test","slug":{"current":"test-post"}}'
```

## 🎉 You're All Set!

Your sitemap will now automatically update whenever you:
- ✅ Create new blog posts
- ✅ Edit existing posts  
- ✅ Delete posts
- ✅ Create/edit/delete categories

The sitemap is available at: `https://your-project.vercel.app/sitemap.xml`

Submit this URL to Google Search Console for optimal SEO performance!