"use client";
import React, { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import testimonials from "../../components/home/VideoTestimonialData";

const TestimonialsPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const mediaContainerRef = useRef(null);

  return (
    <section className="bg-white py-16 min-h-screen">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 mt-24">
          All <span className="text-blue-500">Testimonials</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative h-[500px] hover:shadow-md rounded-lg overflow-hidden shadow-md transition-transform cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              {testimonial.type === "video" ? (
                <video
                  src={testimonial.mediaUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                ></video>
              ) : (
                <img
                  src={testimonial.mediaUrl}
                  alt={testimonial.description}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
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
      </div>
    </section>
  );
};

export default TestimonialsPage; 