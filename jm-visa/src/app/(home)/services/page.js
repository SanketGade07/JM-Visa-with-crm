"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import services from "../../../data/ServicesData";


const ServicesPage = () => {
  return (
    <section className="relative py-16 px-3  mt-[60px] sm:px-6 md:px-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <motion.div
        className="text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
      >
        <div className="inline-block px-4 py-2 bg-blue-200/50 text-blue-600 font-medium rounded-full backdrop-blur-lg shadow-lg">
          🌟 Explore Our Services
        </div>
        <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
          Transforming Visa Assistance <br />
          <span className="text-blue-500">Into a Seamless Experience</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600">
          Comprehensive solutions for travel, education, work, and beyond.
        </p>
      </motion.div>

      {/* Services Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="relative p-6 bg-white/30 border border-white/20 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-transform overflow-hidden"
          >
            <Link href={`services/${service.url}`}>
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-200/50 blur-3xl rounded-full -z-10"></div>
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-blue-300/30 blur-2xl rounded-full -z-10"></div>

            {/* Service Image */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Service Content */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
              <p className="mt-2 text-gray-600">{service.description}</p>
            </div>

            {/* Learn More Link */}
            <div className="mt-6 flex items-center text-blue-500 font-medium cursor-pointer hover:text-blue-600 transition">
              Learn More
              <FiArrowRight className="ml-2" />
            </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full max-w-96 h-96 bg-blue-200/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-full max-w-96 h-96 bg-blue-300/50 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

export default ServicesPage;
