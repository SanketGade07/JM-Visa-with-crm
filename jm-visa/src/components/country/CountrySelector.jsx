"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CountryData from "../../data/CountryData";
import Link from "next/link";

const CountrySelector = () => {
  const categories = CountryData;
  const [activeCategory, setActiveCategory] = useState("All");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Create a flat list of countries with their category included for the "All" view
    const allCountries = Object.entries(categories).flatMap(([category, countries]) =>
      countries.map((country) => ({ ...country, category }))
    );

    if (activeCategory === "All") {
      setFilteredCountries(allCountries);
    } else {
      const specificCategoryCountries =
        categories[activeCategory]?.map((country) => ({
          ...country,
          category: activeCategory,
        })) || [];
      setFilteredCountries(specificCategoryCountries);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    // Filter based on search term and active category
    const allCountries =
      activeCategory === "All"
        ? Object.entries(categories).flatMap(([category, countries]) =>
            countries.map((country) => ({ ...country, category }))
          )
        : categories[activeCategory]?.map((country) => ({
            ...country,
            category: activeCategory,
          })) || [];

    const filtered = allCountries.filter((country) =>
      country.searchName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchTerm, activeCategory, categories]);

  return (
    <section className="relative py-16 px-3 sm:px-6 md:px-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-blue-200/50 text-blue-600 font-medium rounded-full backdrop-blur-lg shadow-md">
              🌍 Explore Countries
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-800 leading-snug">
              Discover Famous Landmarks by <br />
              <span className="text-blue-500">Region and Countries</span>
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Select a region to explore popular countries and their landmarks.
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search for a country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-lg px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-md"
          />
        </div>

        {/* Categories */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {["All", "Asia","MiddleEast", "Europe", "NorthAmerica","SouthAmerica","Africa","Oceania"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full border font-medium text-sm transition ${
                activeCategory === category
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white/30 text-gray-600 backdrop-blur-md hover:bg-white/50 hover:shadow-md"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Country Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country, index) => (
              <Link
                href={`/country/${country.category}/${country.name}`}
                key={index}
                className="relative flex flex-col items-center bg-white/30 border border-white/30 backdrop-blur-lg rounded-lg shadow-md hover:shadow-xl transition-transform hover:scale-105 overflow-hidden"
              >
                {/* Landmark Image */}
                <img
                  src={country.landmark}
                  alt={country.altName}
                  className="w-full h-32 md:h-[190px] object-cover"
                />
                <div className="absolute top-2 left-0 bg-white/50 backdrop-blur-sm text-gray-600 px-2 py-1 rounded-r-full text-xs font-medium">
                  {country.landmarkName}
                </div>

                {/* Country Info */}
                <div className="flex flex-col items-center p-4">
                  {/* Flag */}
                  <img
                    src={country.flag}
                    alt={`${country.name} flag`}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  {/* Country Name */}
                  <span className="mt-2 font-medium text-gray-800 text-lg">
                    {country.name}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No countries found for your search or selection.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CountrySelector;
