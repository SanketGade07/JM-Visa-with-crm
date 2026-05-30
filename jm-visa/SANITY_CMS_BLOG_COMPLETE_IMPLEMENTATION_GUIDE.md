# Complete Sanity CMS Blog Implementation Guide

This comprehensive guide will walk you through implementing a complete Sanity CMS blog system in a Next.js application, including blog cards, individual blog pages, Sanity Studio setup, and all related functionality.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Sanity Account Setup](#sanity-account-setup)
3. [Create a Sanity Project](#create-a-sanity-project)
4. [Install Dependencies](#install-dependencies)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Sanity Studio Configuration](#sanity-studio-configuration)
7. [Schema Definitions](#schema-definitions)
8. [Sanity Client Setup](#sanity-client-setup)
9. [Blog Listing Page](#blog-listing-page)
10. [Individual Blog Post Page](#individual-blog-post-page)
11. [Blog Cards Component](#blog-cards-component)
12. [Additional Components](#additional-components)
13. [Testing the Implementation](#testing-the-implementation)
14. [Deployment](#deployment)

---

## Prerequisites

- Node.js 18+ installed
- Next.js 13+ application (App Router)
- Basic knowledge of React and Next.js
- Git repository (for deployment)

---

## Sanity Account Setup

### Step 1: Create a Sanity Account

1. **Visit Sanity.io**: Go to [https://www.sanity.io](https://www.sanity.io)
2. **Sign Up**: Click "Get Started" or "Sign Up"
3. **Choose Sign-up Method**:
   - Sign up with GitHub (recommended)
   - Sign up with Google
   - Sign up with email

### Step 2: Verify Your Account

- Check your email for verification link (if using email signup)
- Complete the account verification process

### Step 3: Access Sanity Management Console

- Go to [https://www.sanity.io/manage](https://www.sanity.io/manage)
- You'll see your dashboard where you can manage projects

---

## Create a Sanity Project

### Option 1: Create via Sanity Management Console (Web UI)

1. **Go to Management Console**: [https://www.sanity.io/manage](https://www.sanity.io/manage)
2. **Click "Create project"**
3. **Fill in Project Details**:
   - **Project name**: Your project name (e.g., "My Blog")
   - **Organization**: Select your organization (or create one)
   - **Plan**: Select "Free" (or your preferred plan)
4. **Create Project**: Click "Create project"
5. **Note Your Project ID**: You'll see a project ID (e.g., `abc123xyz`) - save this!
6. **Select Dataset**: Choose "production" (default dataset name)

### Option 2: Create via CLI (Recommended for Developers)

```bash
# Install Sanity CLI globally
npm install -g @sanity/cli

# Login to Sanity
sanity login

# Initialize Sanity in your project (in your Next.js project root)
cd /path/to/your/nextjs/project
sanity init --env

# Follow the prompts:
# - Create new project
# - Project name: Your project name
# - Dataset name: production (default)
# - Output path: ./ (current directory)
```

**Important Values to Save**:
- **Project ID**: Found in project settings (e.g., `gdey5o8v`)
- **Dataset**: Usually `production`
- **API Version**: Use `2024-03-13` (or latest stable version)

---

## Install Dependencies

Run these commands in your Next.js project root:

```bash
# Core Sanity packages
npm install next-sanity @sanity/client @sanity/image-url

# Sanity Studio packages
npm install sanity @sanity/vision @sanity/table @sanity/icons

# Portable Text for rendering rich content
npm install @portabletext/react

# Markdown support (optional but recommended)
npm install sanity-plugin-markdown react-markdown remark-gfm

# SEO support (optional)
npm install next-seo

# Development dependencies
npm install --save-dev typescript @types/node
```

---

## Environment Variables Setup

### Step 1: Create `.env.local` File

Create a `.env.local` file in your project root:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-03-13
```

**Replace `your-project-id-here` with your actual Sanity project ID**

### Step 2: Create Environment Config File

Create `src/config/env.js`:

```javascript
// Environment variables with fallback values
const env = {
  // Sanity CMS
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-13',
  
  // Node Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Helper function to get environment variables with fallback
export const getEnv = (key) => {
  if (!(key in env)) {
    console.warn(`Environment variable ${key} is not defined in config`);
    return process.env[key];
  }
  return env[key];
};

// Export all environment variables
export default env;
```

### Step 3: Create Sanity Environment File

Create `src/sanity/env.ts`:

```typescript
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-13'

export const dataset = 
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = 
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
```

---

## Sanity Studio Configuration

### Step 1: Create Studio Configuration

Create `sanity.config.ts` in project root:

```typescript
'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { table } from '@sanity/table'
import { markdownSchema } from 'sanity-plugin-markdown'

import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    table(),
    markdownSchema(),
  ],
})
```

### Step 2: Create CLI Configuration

Create `sanity.cli.ts` in project root:

```typescript
import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({ api: { projectId, dataset } })
```

### Step 3: Create Studio Route

Create `src/app/studio/[[...tool]]/page.tsx`:

```typescript
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

### Step 4: Create Studio Structure

Create `src/sanity/structure.ts`:

```typescript
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Posts')
        .schemaType('post')
        .child(S.documentTypeList('post').title('Posts')),
      S.listItem()
        .title('Authors')
        .schemaType('author')
        .child(S.documentTypeList('author').title('Authors')),
      S.listItem()
        .title('Categories')
        .schemaType('category')
        .child(S.documentTypeList('category').title('Categories')),
    ])
```

---

## Schema Definitions

### Step 1: Create Schema Index

Create `src/sanity/schemaTypes/index.ts`:

```typescript
import { type SchemaTypeDefinition } from 'sanity'

import { blockContentType } from './blockContentType'
import { postType } from './postType'
import { authorType } from './authorType'
import { categoryType } from './categoryType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, postType, authorType, categoryType],
}
```

### Step 2: Create Author Schema

Create `src/sanity/schemaTypes/authorType.ts`:

```typescript
import {UserIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'name',
      },
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})
```

### Step 3: Create Category Schema

Create `src/sanity/schemaTypes/categoryType.ts`:

```typescript
import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
  ],
})
```

### Step 4: Create Block Content Schema

Create `src/sanity/schemaTypes/blockContentType.ts`:

```typescript
import { defineType, defineArrayMember, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
  ],
})
```

### Step 5: Create Post Schema

Create `src/sanity/schemaTypes/postType.ts`:

```typescript
import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'SEO description for this post (keep under 160 characters).',
      validation: (Rule) => Rule.max(160).warning('Keep under ~155–160 characters for best SEO.'),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: {type: 'author'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ]
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 4,
      description: 'Brief summary of the post (used in blog listings).',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: {type: 'category'},
        }),
      ],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              title: 'Question',
            }),
            defineField({
              name: 'answer',
              type: 'text',
              title: 'Answer',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
```

---

## Sanity Client Setup

### Step 1: Create Sanity Client

Create `src/sanity/lib/client.ts`:

```typescript
import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import env from '../../config/env'

export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: env.NODE_ENV === 'production',
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// Helper function to fetch all posts
export async function getAllPosts() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      "author": author->name,
      "categories": categories[]->title
    }
  `)
}

// Helper function to fetch a single post by slug
export async function getPostBySlug(slug: string) {
  return client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      body,
      excerpt,
      faqs,
      "author": author->name,
      "authorImage": author->image,
      "categories": categories[]->title
    }
  `, { slug })
}
```

---

## Blog Listing Page

### Create Blog Listing Page

Create `src/app/(home)/blog/page.js`:

```javascript
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAllPosts } from "../../../sanity/lib/client";
import { urlFor } from "../../../sanity/lib/client";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const posts = await getAllPosts();
        setBlogs(posts);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="relative mt-[70px] py-16 bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-blue-200/50 text-blue-600 font-medium rounded-full backdrop-blur-lg shadow-md">
              📰 Explore Our Blogs
            </div>
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-800">
              Stay Updated with <span className="text-blue-500">Insights</span>
            </h1>
            <p className="mt-2 text-base sm:text-lg text-gray-600 px-2">
              Browse through our latest articles and updates tailored for you.
            </p>
          </div>
        </motion.div>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link 
                href={`/blog/${blog.slug.current}`} 
                key={blog._id}
                className="relative group bg-white/20 border border-white/30 backdrop-blur-md rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                {/* Blog Image */}
                {blog.mainImage && (
                  <img
                    src={urlFor(blog.mainImage).url()}
                    alt={blog.title}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                {/* Blog Content */}
                <div className="p-4">
                  <h3 className="text-lg line-clamp-2 font-semibold text-gray-800">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-blue-500 font-medium hover:underline">
                      Read More ➔
                    </span>
                  </div>
                  {blog.categories && blog.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {blog.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No blogs available at the moment.
          </p>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
```

---

## Individual Blog Post Page

### Create Individual Blog Post Page

Create `src/app/(home)/blog/[slug]/page.js`:

```javascript
import React from "react";
import { PortableText } from '@portabletext/react';
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPosts, client } from "../../../../sanity/lib/client";
import { urlFor } from "../../../../sanity/lib/client";

export const revalidate = 60;

// Generate Dynamic Metadata
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    metaDescription,
    "slug": slug.current,
    "thumbnail": mainImage.asset->url,
    excerpt,
    "date": publishedAt,
    "author": author->name,
  }`;
  
  const post = await client.fetch(query, { slug: slugParam });
  
  if (!post) {
    return { title: "Blog | Your Site", description: "This blog post does not exist." };
  }

  return {
    title: post.title,
    description: post.metaDescription || post.excerpt || "Read this article on our blog.",
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.thumbnail],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

const portableTextComponents = {
  types: {
    image: ({ value }) => (
      value && value.asset ? (
        <img
          src={urlFor(value).url()}
          alt={value.alt || 'Blog image'}
          className="my-6 rounded-lg shadow-md w-full h-auto object-contain"
        />
      ) : null
    ),
  },
  block: {
    h1: ({ children }) => <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold mt-6 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold mt-4 mb-2">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-bold mt-3 mb-2">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a href={value?.href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
  },
};

async function BlogDetailsPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const blog = await getPostBySlug(slug);
    const allPosts = await getAllPosts();
    const relatedBlogs = allPosts
      .filter(post => post.slug.current !== slug)
      .slice(0, 3);

    if (!blog) {
      return (
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500">Blog not found. Please check the URL.</p>
        </div>
      );
    }

    return (
      <section className="relative mt-[60px] py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="max-w-[1280px] mx-auto">
          {/* Blog Header */}
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-1/2 w-full">
              {/* Back Button */}
              <div className="mb-4 hidden lg:block">
                <Link
                  href="/blog"
                  className="py-3 text-blue-500 font-semibold transition hover:underline"
                >
                  ← Back to Blogs
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-800 leading-tight px-2 sm:px-0">
                {blog.title}
              </h1>
              <div className="mt-4 sm:mt-6 text-gray-600 flex gap-2 sm:gap-3 items-center px-2 sm:px-0">
                {blog.authorImage && (
                  <Image
                    src={urlFor(blog.authorImage).url()}
                    alt={blog.author}
                    width={50}
                    height={50}
                    className="rounded-full min-w-fit w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] self-center object-cover"
                  />
                )}
                <div className="flex flex-col text-xs sm:text-sm">
                  <span className="font-semibold">{blog.author}</span>
                  <span>
                    Date: {new Date(blog.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              {blog.mainImage && (
                <div className="aspect-w-16 max-w-[500px] aspect-h-9 rounded-lg h-[200px] sm:h-[250px] lg:h-[300px] mr-auto ml-auto lg:mr-0 lg:ml-auto overflow-hidden shadow-md">
                  <img
                    src={urlFor(blog.mainImage).url()}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-16 flex flex-col lg:flex-row gap-12">
            {/* Blog Content */}
            <div className="lg:w-3/4 w-full">
              <article className="prose prose-lg max-w-none article-blog bg-white bg-opacity-50 p-4 sm:p-6 lg:p-8 xl:p-10 rounded-md shadow-sm">
                <PortableText value={blog.body} components={portableTextComponents} />
              </article>

              {/* FAQ Section */}
              {blog.faqs && blog.faqs.length > 0 && (
                <div className="mt-8 sm:mt-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {blog.faqs.map((faq, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Blogs Sidebar */}
            <div className="lg:w-1/4 w-full">
              {relatedBlogs.length > 0 && (
                <div className="sticky top-[100px]">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog._id}
                        href={`/blog/${relatedBlog.slug.current}`}
                        className="block bg-white/50 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        {relatedBlog.mainImage && (
                          <img
                            src={urlFor(relatedBlog.mainImage).url()}
                            alt={relatedBlog.title}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <h4 className="font-semibold text-gray-800 line-clamp-2">
                          {relatedBlog.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Error loading blog post. Please try again later.</p>
      </div>
    );
  }
}

export default BlogDetailsPage;
```

---

## Blog Cards Component

### Create Blog Cards Component

Create `src/components/home/BlogComponent.jsx`:

```javascript
"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { getAllPosts, urlFor } from "../../sanity/lib/client";

const BlogComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  // Fetch Blogs from Sanity
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const posts = await getAllPosts();
        setBlogs(posts.slice(0, 6)); // Show only first 6 blogs
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Smooth Scroll Function
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const cards = container.querySelectorAll('a');
      if (cards.length === 0) return;
      
      const cardRect = cards[0].getBoundingClientRect();
      const cardWidth = cardRect.width;
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="bg-white py-16 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-full mb-4">
            📰 Latest Blog Posts
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
            Stay Updated with Our <span className="text-blue-500">Blog</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read our latest articles, tips, and insights about visas, travel, and more.
          </p>
        </div>

        {/* Blog Cards Container */}
        {loading ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="relative">
            {/* Scroll Buttons */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition hidden lg:block"
              aria-label="Scroll left"
            >
              <FaAngleLeft className="text-2xl text-gray-700" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition hidden lg:block"
              aria-label="Scroll right"
            >
              <FaAngleRight className="text-2xl text-gray-700" />
            </button>

            {/* Blog Cards */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {blogs.map((blog) => (
                <Link
                  href={`/blog/${blog.slug.current}`}
                  key={blog._id}
                  className="flex-shrink-0 w-[300px] sm:w-[350px] bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                >
                  {/* Blog Image */}
                  {blog.mainImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={urlFor(blog.mainImage).url()}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Blog Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-500 transition">
                      {blog.title}
                    </h3>
                    {blog.excerpt && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-blue-500 font-medium text-sm group-hover:underline">
                        Read More →
                      </span>
                      {blog.publishedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(blog.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {blog.categories && blog.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {blog.categories.slice(0, 2).map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link
                href="/blog"
                className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-md hover:shadow-lg"
              >
                View All Blogs
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No blogs available at the moment.</p>
        )}
      </div>
    </section>
  );
};

export default BlogComponent;
```

---

## Additional Components

### FAQ Item Component (Optional)

Create `src/components/blog/FAQItem.jsx`:

```javascript
"use client";
import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { AnimatePresence, motion } from "framer-motion";

const FAQItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 pb-4">
      <button
        type="button"
        className="flex justify-between items-center w-full text-left text-gray-800 font-medium py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{faq.question}</span>
        {isOpen ? (
          <AiOutlineMinus className="text-blue-500" />
        ) : (
          <AiOutlinePlus className="text-blue-500" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 mt-2">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQItem;
```

---

## Testing the Implementation

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Access Sanity Studio

1. Navigate to: `http://localhost:3000/studio`
2. You should see the Sanity Studio interface

### Step 3: Create Content

1. **Create an Author**:
   - Click "Authors" → "Create new"
   - Add name, image, and bio
   - Publish

2. **Create a Category** (Optional):
   - Click "Categories" → "Create new"
   - Add title and description
   - Publish

3. **Create a Blog Post**:
   - Click "Posts" → "Create new"
   - Fill in:
     - Title
     - Slug (auto-generated from title)
     - Author (select the author you created)
     - Main Image
     - Published Date
     - Excerpt
     - Body (rich text content)
     - Categories (optional)
     - FAQs (optional)
   - Click "Publish"

### Step 4: View Blog Pages

1. **Blog Listing**: `http://localhost:3000/blog`
2. **Individual Post**: `http://localhost:3000/blog/your-post-slug`

---

## Deployment

### Step 1: Set Environment Variables in Vercel (or your hosting platform)

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add these variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`: Your Sanity project ID
   - `NEXT_PUBLIC_SANITY_DATASET`: `production`
   - `NEXT_PUBLIC_SANITY_API_VERSION`: `2024-03-13`

### Step 2: Configure CORS in Sanity

1. Go to [Sanity Management Console](https://www.sanity.io/manage)
2. Select your project
3. Go to **API** → **CORS origins**
4. Add your domain:
   - **Origin**: `https://yourdomain.com`
   - **Credentials**: ✅ Checked
   - Click "Save"

### Step 3: Deploy

```bash
# Push to your repository
git add .
git commit -m "Add Sanity CMS blog implementation"
git push

# Deploy to Vercel (if using Vercel CLI)
vercel --prod
```

---

## What to Provide to AI Agents

When giving this guide to an AI agent (like Cursor AI), provide the following context:

### Essential Information:
1. **Project Structure**: You have a Next.js 13+ application using App Router
2. **Goal**: Implement a complete Sanity CMS blog system
3. **Requirements**:
   - Blog listing page with cards
   - Individual blog post pages
   - Sanity Studio integration
   - Blog cards component for homepage
   - Author, Category, and Post schema types
   - Rich text content rendering
   - Image optimization
   - SEO metadata

### Key Files to Create/Modify:
- `sanity.config.ts` - Studio configuration
- `sanity.cli.ts` - CLI configuration
- `src/sanity/env.ts` - Environment variables
- `src/sanity/schemaTypes/` - All schema definitions
- `src/sanity/lib/client.ts` - Sanity client and queries
- `src/app/studio/[[...tool]]/page.tsx` - Studio route
- `src/app/(home)/blog/page.js` - Blog listing page
- `src/app/(home)/blog/[slug]/page.js` - Individual post page
- `src/components/home/BlogComponent.jsx` - Blog cards component
- `.env.local` - Environment variables file

### Instructions for AI:
1. Follow this guide step-by-step
2. Create all files as specified
3. Install all dependencies listed
4. Set up environment variables
5. Test the implementation locally
6. Ensure all paths and imports are correct
7. Verify Sanity Studio is accessible at `/studio`
8. Test blog pages render correctly

---

## Troubleshooting

### Common Issues:

1. **"Project ID not found"**:
   - Check `.env.local` file exists
   - Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` is set correctly
   - Restart development server

2. **Studio not loading**:
   - Check `sanity.config.ts` configuration
   - Verify all dependencies are installed
   - Check browser console for errors

3. **Blogs not showing**:
   - Verify content is published in Sanity Studio
   - Check GROQ queries in `client.ts`
   - Check browser console for API errors

4. **Images not displaying**:
   - Verify image fields are filled in Sanity
   - Check `urlFor` function is imported correctly
   - Verify `@sanity/image-url` is installed

5. **CORS errors**:
   - Add your domain to Sanity CORS settings
   - Include both `http://localhost:3000` (dev) and production URL

---

## Summary

This guide provides a complete implementation of a Sanity CMS blog system. The implementation includes:

✅ Sanity account setup
✅ Project creation
✅ Schema definitions (Post, Author, Category, Block Content)
✅ Sanity Studio integration
✅ Blog listing page with cards
✅ Individual blog post pages
✅ Blog cards component
✅ Image optimization
✅ SEO metadata
✅ Rich text content rendering
✅ FAQ support
✅ Deployment instructions

Follow this guide step-by-step, and you'll have a fully functional Sanity CMS blog system!

