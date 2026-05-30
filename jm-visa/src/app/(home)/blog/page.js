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
                    className="w-full h-56 sm:h-60 object-cover group-hover:scale-105 transition-transform"
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
                      {blog.categories.map((category) => (
                        <span
                          key={category}
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
