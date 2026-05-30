"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const HeroSection = () => {
  const backgroundImages = [
    "/images/bg1.png", // Replace with your actual image paths
    "/images/bg-2.png",
    "/images/bg2.png",
    "/images/bg3.png",
    "/images/bg4.png",
    "/images/bg5.png",
  ];



  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, [ backgroundImages.length]);

  return (
    <section className="relative  h-screen lg:min-h-none flex items-center lg:pt-0 sm:h-[730px] overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute -z-40 inset-0 overflow-hidden">
        <div
          className="flex w-full h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentBgIndex * 100}%)` }}
        >
          {backgroundImages.map((bg, index) => (
            <Image
              key={index}
              src={bg}
              alt={`Background ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
              style={{ width: "100%" }}
              width={1920}
              height={1080}
              priority={index === 0}
            />
          ))}
        </div>
      </div>

      {/* bakground overlay */}

      <div className="bg-gradient-to-r from-black  to-transparent bg-opacity-70 opacity-70 absolute w-full top-0 h-full -z-30 "/>

      <div className="container relative z-10 mx-auto px-4 lg:px-12 flex flex-row items-center justify-between h-full">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className=" lg:lg:w-1/2 text-center lg:text-left"
        >
          {/* Badge */}
          <div className="inline-block px-4 py-2 bg-white bg-opacity-20 text-gray-50 border-blue-500 border-[1px] font-medium rounded-full backdrop-blur-lg shadow-md">
            ✈️ Simplifying Your Travel Plans!
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-2xl sm:text-4xl md:text-5xl font-bold text-gray-100 leading-tight">STRESS-FREE 
            <span className="text-blue-500"> VISA SERVICES</span> AT
            <span className="text-blue-500">  YOUR DOOR STEPS</span> 🌴
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-lg text-gray-200">
          Our responsibility is to address all your VISA concerns
          </p>

          {/* Buttons */}
          <Link href={"/contact"} className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-2xl shadow-blue-500 hover:bg-blue-600 transition-transform">
              Enquire Now ➔
            </button>
            <Link href={"/services"} className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-10 border border-blue-500 text-blue-100 font-semibold rounded-lg shadow-lg hover:bg-blue-500 hover:text-white  transition-transform backdrop-blur-lg">
              <span>➔</span> Our Services
            </Link>
          </Link>
        </motion.div>
      </div>



      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {backgroundImages.map((_, index) => (
          <span
            key={index}
            onClick={() => setCurrentBgIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              currentBgIndex === index ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
