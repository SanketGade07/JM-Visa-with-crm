"use client";
import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiShareFatFill } from "react-icons/pi";
import { GoOrganization } from "react-icons/go";
import { CiHeart } from "react-icons/ci";
import Link from "next/link";
import { MdFormatListBulleted } from "react-icons/md";
import Image from "next/image";


const points = [
  {
    icon: "🔍",
    title: "Find the Right Visa",
    description:
      "Discover visa options tailored to your travel, education, and work needs with JM Visa Services.",
  },
  {
    icon: "📋",
    title: "Fast processing, 99% visa approval rate",
    description:
      "Provide accurate information and complete your visa application seamlessly.",
  },
  {
    icon: "🌍",
    title: "Travel Hassle-Free",
    description:
      "Enjoy stress-free travel with our expert guidance and fast-track support.",
  },
];



const CountryList =[
  {
    name: "Japan",
    flag: "/images/flags/jp.webp",
    landmark: "/images/landmarks/Mount Fuji in Japan Visa.webp",
    landmarkName: "Mount Fuji",
    altName: "Mount Fuji in Japan Visa",
  },
  {
    name: "China",
    flag: "/images/flags/cn.webp",
    landmark: "/images/landmarks/Great Wall of China in China Visa.webp",
    landmarkName: "Great Wall of China",
    altName: "Great Wall of China in China Visa",
  },
  {
    name: "South Korea",
    flag: "/images/flags/kr.webp",
    landmark:
      "/images/landmarks/Gyeongbokgung Palace in South Korea Visa.webp",
    landmarkName: "Gyeongbokgung Palace",
    altName: "Gyeongbokgung Palace in South Korea Visa",
  },
  {
    name: "India",
    flag: "/images/flags/in.webp",
    landmark: "/images/landmarks/Taj_Mahal.jpg",
    landmarkName: "Taj Mahal",
    altName: "Taj Mahal in India Visa",
  },
  {
    name: "UAE",
    flag: "/images/flags/ae.webp",
    landmark: "/images/landmarks/Burj Khalifa tourist places in UAE Visa.webp",
    landmarkName: "Burj Khalifa",
    altName: "Burj Khalifa tourist places in UAE Visa",
  },
  {
    name: "Saudi Arabia",
    flag: "/images/flags/sa.webp",
    landmark: "/images/landmarks/Kaaba tourist places in Saudi Arabia Visa.webp",
    landmarkName: "Kaaba",
    altName: "Kaaba tourist places in Saudi Arabia Visa",
  },
  {
    name: "Qatar",
    flag: "/images/flags/qa.webp",
    landmark: "/images/landmarks/Museum of Islamic Art tourist places in Qatar Visa.webp",
    landmarkName: "Museum of Islamic Art",
    altName: "Museum of Islamic Art tourist places in Qatar Visa",
  },
]
const AboutUs = () => {

  const [countryIndex, setCountryIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountryIndex((prevIndex) => (prevIndex + 1) % CountryList.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  // Memoize stats section to prevent re-renders when countryIndex changes
  const statsSection = useMemo(() => (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GoOrganization className="text-xl text-white flex-shrink-0" />
        <p className="text-white text-sm font-semibold whitespace-nowrap">
          40<span className="text-xl align-super">+</span> Countries
        </p>
      </div>
      <Link href={"/country"} className="px-4 py-2 text-sm border-[1px] bg-white bg-opacity-10 backdrop-blur-lg border-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition flex-shrink-0">
        Explore Countries
      </Link>
    </div>
  ), []); // Empty dependency array means it never re-renders

  

  return (
    <section className="relative py-16 px-4 sm:px-12">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-6">
          {/* Subheading */}
          <div className="flex flex-row justify-between items-center gap-2">
            
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-2 bg-white bg-opacity-10 text-white font-medium rounded-full backdrop-blur-lg shadow-md"
          >
            ✈️ About Us
          </motion.div>

          <Link href={"/about"} className="py-2 self-end  text-white hover:text-gray-300 min-w-fit flex gap-1 items-center justify-center font-semibold">
              <MdFormatListBulleted className="text-4" /> <span>Read More</span>
            </Link>

          </div>
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-extrabold text-white leading-snug"
          >
            Making Visa Applications <br />
            <span className="text-blue-200">Simple and Efficient</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white text-lg"
          >
            At JM Visa, we specialize in offering personalized visa services for
            travel, education, and work. Our expert team ensures a smooth and
            efficient process, helping you achieve your dreams hassle-free.
          </motion.p>

          {/* Key Points */}
          <div className="space-y-6">
            {points.map((point, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-4 bg-white bg-opacity-10 border border-white/30 backdrop-blur-md rounded-lg hover:shadow-sm transition-all"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <div className="text-3xl">{point.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {point.title}
                  </h3>
                  <p className="text-sm text-white">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-1/2 py-8 px-4 sm:px-8 relative bg-white bg-opacity-10 border-gray-200 border-[1px] backdrop-blur-lg  rounded-2xl hover:shadow-xl transition-all"
        >
          {/* <div className="absolute bg-gradient-to-br -z-20 w-full from-blue-50  h-[400px] to-blue-400 blur-2xl p-2 rounded-full bottom-10 right-4"/> */}
          {/* Main Image */}
            {/* Main Image */}
            <Image
              key={CountryList[countryIndex].landmark}
              src={CountryList[countryIndex].landmark}
              alt={CountryList[countryIndex].landmarkName}
              className="w-full h-[330px] object-cover rounded-lg mb-6 shadow-md"
              width={500}
              height={330}
            />

          {/* Details Section */}
          <div className="space-y-4">
            {/* Trip Info */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                Discover Your Next Destination
              </h3>
             
            </div>
            {/* <p className="text-white text-sm">14-29 July | by JM Visa</p> */}

            {/* Progress Section */}
            <AnimatePresence mode="wait">
              <div key={countryIndex} className="mt-4 flex items-center gap-4">
                <motion.img
                  key={`flag-${countryIndex}`}
                  src={CountryList[countryIndex].flag}
                  alt={CountryList[countryIndex].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="w-full min-w-0">
                  <p className="text-sm text-white font-semibold">Explore</p>
                  <motion.p
                    key={`name-${countryIndex}`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-white"
                  >
                    {CountryList[countryIndex].name}
                  </motion.p>
                </div>
              </div>
            </AnimatePresence>

            {/* Stats - Memoized to prevent re-renders */}
            {statsSection}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
