"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import { MdFormatListBulleted } from "react-icons/md";
import testimonials from "./VideoTestimonialData";

const MediaTestimonials = () => {
  const [selectedIndex, setSelectedIndex] = useState(null); // Track selected media index
  const mediaContainerRef = useRef(null); // Ref for the popup media container
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Lazy render the section when it enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Reset scroll position when media changes
  useEffect(() => {
    if (mediaContainerRef.current && selectedIndex !== null) {
      mediaContainerRef.current.scrollTo(0, 0);
    }
  }, [selectedIndex]);

  const videoTestimonials = testimonials.filter((item) => item.type === "video");
  const initialTestimonials = videoTestimonials.slice(0, 5);
  const displayedTestimonials = initialTestimonials;
  const hasMoreTestimonials = testimonials.length > initialTestimonials.length;

  const getOriginalIndex = (testimonialId) =>
    testimonials.findIndex((item) => item.id === testimonialId);

  return (
    <section ref={sectionRef} className="relative pt-16 pb-16">
      {!isVisible ? (
        <div className="container mx-auto px-5 sm:px-6 lg:px-12">
          <div className="h-[360px] w-full rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      ) : (
        <div className="container mx-auto px-5 sm:px-6 lg:px-12">
          {/* Heading and View All */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Client <span className="text-blue-500">Testimonials</span>
            </h2>
            {hasMoreTestimonials && (
              <Link
                href="/testimonials"
                className="py-2 self-end text-blue-500 min-w-fit flex gap-1 items-center justify-center font-semibold"
              >
                <MdFormatListBulleted className="text-4" /> <span>View All</span>
              </Link>
            )}
          </div>
          {/* Highlight grid - horizontal scroll on mobile */}
          <div 
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 overflow-x-auto pb-4 sm:pb-0 scroll-smooth -mx-5 sm:mx-0 px-5 sm:px-0 hide-scrollbar"
            style={{
              scrollbarWidth: "none", // Hide scrollbar in Firefox
              msOverflowStyle: "none", // Hide scrollbar in IE/Edge
            }}
          >
            {displayedTestimonials.map((testimonial) => {
              const originalIndex = getOriginalIndex(testimonial.id);
              return (
                <div
                  key={testimonial.id}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-md bg-black/80 cursor-pointer transition-transform hover:scale-[1.01] flex-shrink-0 w-[140px] sm:w-full"
                  onClick={() => setSelectedIndex(originalIndex)}
                >
                  <video
                    src={testimonial.mediaUrl}
                    muted
                    loop
                    playsInline
                    autoPlay={isVisible}
                    preload={isVisible ? "metadata" : "none"}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Popup for selected media */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white z-50 bg-black/50 p-2 rounded-full"
              onClick={() => setSelectedIndex(null)}
            >
              <IoClose className="w-6 h-6" />
            </button>
            {/* Left navigation button */}
            <button
              onClick={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
              disabled={selectedIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white h-10 w-10 rounded-full flex items-center justify-center shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaAngleLeft size={20} />
            </button>
            {/* Right navigation button */}
            <button
              onClick={() => setSelectedIndex((prev) => Math.min(prev + 1, testimonials.length - 1))}
              disabled={selectedIndex === testimonials.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white h-10 w-10 rounded-full flex items-center justify-center shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaAngleRight size={20} />
            </button>
            {/* Media container */}
            <div
              ref={mediaContainerRef}
              className="relative max-w-3xl rounded-xl w-full h-full max-h-[90vh]"
            >
              {testimonials[selectedIndex].type === "video" ? (
                <video
                  src={testimonials[selectedIndex].mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full rounded-xl object-contain"
                />
              ) : (
                <img
                  src={testimonials[selectedIndex].mediaUrl}
                  alt={testimonials[selectedIndex].description}
                  className="w-full h-full max-w-fit rounded-xl mx-auto object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaTestimonials;