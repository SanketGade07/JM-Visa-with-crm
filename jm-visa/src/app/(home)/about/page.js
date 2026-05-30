"use client";
import React from "react";
import { motion } from "framer-motion";
import { AiOutlineSolution, AiOutlineUser } from "react-icons/ai";
import { FiPhoneCall } from "react-icons/fi";
import FeedbackReviewComponent from "../../../components/home/FeedbackReviewComponent";
import VideoTestimonials from "../../../components/home/VideoTestimonial";
import OurTeam from "../../../components/about/OurTeam";
import Link from "next/link";

const AboutUsPage = () => {
  const points = [
    {
      icon: <AiOutlineSolution className="text-blue-500 text-3xl" />,
      title: "Comprehensive Visa Solutions",
      description:
        "We specialize in simplifying visa processes for education, travel, work, and permanent residency.",
    },
    {
      icon: <AiOutlineUser className="text-blue-500 text-3xl" />,
      title: "Personalized Assistance",
      description:
        "Our experts work closely with you to understand your requirements and guide you every step of the way.",
    },
    {
      icon: <FiPhoneCall className="text-blue-500 text-3xl" />,
      title: "Dedicated Support",
      description:
        "Enjoy seamless service with 24/7 customer support for all your visa-related queries.",
    },
  ];

  return (
    <div className="relative mt-[80px] bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen py-16 px-6 sm:px-12">
      {/* Hero Section */}
      <motion.div
        className="container mx-auto flex flex-col lg:flex-row items-center gap-16"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-6">
          <motion.div
            className="inline-block px-4 py-2 bg-blue-200/50 text-blue-600 font-medium rounded-full backdrop-blur-lg shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✈️ About JM Visa Services
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-gray-800 leading-snug"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Simplifying <span className="text-blue-500">Visa Applications</span> <br />
            for a Seamless Journey
          </motion.h1>

          <motion.p
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            JM Visa Services is a trusted partner for thousands of clients globally,
            offering tailored visa services for travel, education, and work. We
            take pride in our streamlined processes, transparent approach, and
            customer-centric service.
          </motion.p>
        </div>

        {/* Right Content */}
        <motion.div
          className="lg:w-1/2 relative bg-white/20 border border-white/30 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <img
            src="/images/business-visa.png" // Replace with your image path
            alt="Team at JM Visa"
            className="w-full h-[350px] object-cover"
          />
          <div className="p-8 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">
              Trusted by Thousands Worldwide
            </h3>
            <p className="text-gray-600 text-sm">
              Our team of dedicated professionals ensures a hassle-free visa
              experience for every client. With decades of expertise, we&apos;ve
              helped individuals achieve their travel and relocation dreams.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Key Features */}
      <div className="container mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {points.map((point, index) => (
          <motion.div
            key={index}
            className="p-6 bg-white/30 border border-white/20 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex items-center gap-4">
              {point.icon}
              <h3 className="text-lg font-bold text-gray-800">{point.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mt-2">{point.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Our Numbers Section */}
      <div className="container mx-auto mt-20 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { value: "500+", label: "Happy Clients" },
          { value: "4+", label: "Years of Experience" },
          { value: "200+", label: "Countries Covered" },
          { value: "7", label: "Industry Awards" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="p-6 bg-white/30 border border-white/20 backdrop-blur-lg rounded-lg shadow-lg hover:shadow-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <h3 className="text-4xl font-bold text-blue-500">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      <OurTeam/>
      <FeedbackReviewComponent/>
      <VideoTestimonials/>

      {/* Contact Section */}
      <div className="mt-20 p-10 bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-3xl shadow-lg">
  <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
    {/* Left Section */}
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="p-4 bg-white/20 rounded-full shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h18M3 21h18M3 3v18M21 3v18M7 6h10M7 12h4"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-4xl font-bold leading-tight">
          Ready to Explore the World?
        </h2>
        <p className="text-base text-white/80 mt-2">
          Connect with us to make your visa process effortless and stress-free.
        </p>
      </div>
    </div>

    {/* Right Section */}
    <Link
      href="/contact"
      className="flex items-center gap-4 px-8 py-4 bg-white text-blue-600 rounded-full shadow-sm hover:bg-blue-700 hover:text-white hover:shadow-md"
    >
      <div className="p-2 bg-blue-600 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8h18M3 16h18M3 8v8M21 8v8M7 12h10"
          />
        </svg>
      </div>
      <span className="text-lg font-bold">Contact Us</span>
    </Link>
  </div>
</div>

    </div>
  );
};

export default AboutUsPage;
