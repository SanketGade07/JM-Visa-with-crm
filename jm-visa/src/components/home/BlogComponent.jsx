"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { MdFormatListBulleted } from "react-icons/md";
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
        setBlogs(posts);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Improved Smooth Scroll Function with Dynamic Width
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      // Get the first card to calculate its width dynamically
      const cards = container.querySelectorAll('a');
      if (cards.length === 0) return;
      
      // Calculate actual card width including margin/gap
      const cardRect = cards[0].getBoundingClientRect();
      const cardWidth = cardRect.width;
      const containerWidth = container.clientWidth;
      
      // Scroll by approximately 1 card width, but make sure we don't scroll too much
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="bg-white py-16 relative z-10">
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Explore Our <span className="text-blue-500">Blog</span>
          </h2>
          <Link
            href={"/blog"}
            className="py-2 self-end text-blue-500 min-w-fit flex gap-1 items-center justify-center font-semibold"
          >
            <MdFormatListBulleted className="text-4" /> <span>View All</span>
          </Link>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          Stay updated with the latest travel tips, visa guides, and destination
          recommendations.
        </p>

        {/* Horizontal Scroll Section */}
        {loading ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="relative">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white h-[40px] w-[40px] rounded-full hidden sm:flex items-center justify-center shadow-lg z-10"
            >
              <FaAngleLeft size={20} className="text-white self-center" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scroll-smooth"
              style={{
                scrollbarWidth: "none", // Hide scrollbar in Firefox
                msOverflowStyle: "none", // Hide scrollbar in Internet Explorer
              }}
            >
              {blogs.map((blog) => (
                <Link
                  href={`/blog/${blog.slug.current}`}
                  key={blog._id}
                  className="w-[280px] min-w-[280px] sm:w-[300px] sm:min-w-[300px] lg:w-[340px] lg:min-w-[340px] mb-3  bg-white flex flex-col gap-3 p-5 border  rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  {/* Blog Image */}
                  {blog.mainImage && (
                    <img
                      src={urlFor(blog.mainImage).url()}
                      alt={blog.title}
                      className="w-full h-48 object-cover rounded-xl  transition duration-300"
                    />
                  )}
                  {/* Blog Content */}
                  <h3 className="text-xl line-clamp-2 font-semibold text-gray-800 ">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white h-[40px] w-[40px] rounded-full hidden sm:flex items-center justify-center shadow-lg z-10"
            >
              <FaAngleRight size={20} className="text-white self-center" />
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">No blogs available at the moment.</p>
        )}
      </div>
    </section>
  );
};

export default BlogComponent;
