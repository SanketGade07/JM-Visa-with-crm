"use client";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { MdFormatListBulleted } from "react-icons/md";

const CountryListAboutPage = () => {
  const scrollContainerRef = useRef(null);

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
      
      // Scroll by one full card width for smoother experience
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    }
  };
  
  // Add touch scroll support
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let startX, startScrollLeft;
    
    const touchStart = (e) => {
      startX = e.touches[0].pageX;
      startScrollLeft = container.scrollLeft;
    };
    
    const touchMove = (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX;
      const distance = startX - x;
      container.scrollLeft = startScrollLeft + distance;
    };
    
    const touchEnd = () => {
      startX = null;
    };
    
    container.addEventListener('touchstart', touchStart);
    container.addEventListener('touchmove', touchMove);
    container.addEventListener('touchend', touchEnd);
    
    return () => {
      container.removeEventListener('touchstart', touchStart);
      container.removeEventListener('touchmove', touchMove);
      container.removeEventListener('touchend', touchEnd);
    };
  }, []);

  const countries = [
    {
      name: "Australia",
      image: "/images/landmarks/Sydney Opera House in Australia Visa.webp",
      flag: "/images/flags/au.webp",
      altName: "Sydney Opera House in Australia Visa",
      continent: "Oceania",
    },
    {
      name: "New Zealand",
      image: "/images/landmarks/Milford Sound in New Zealand Visa.webp",
      flag: "/images/flags/nz.webp",
      altName: "Milford Sound in New Zealand Visa",
      continent: "Oceania",
    },
    {
      name: "United States",
      image: "/images/landmarks/Tourist Places in United States Visa.webp",
      flag: "/images/flags/us.webp",
      altName: "Tourist Places in United States Visa",
      continent: "NorthAmerica",
    },
    {
      name: "Canada",
      image: "/images/landmarks/Tourist Places in Canada Visa.webp",
      flag: "/images/flags/ca.webp",
      altName: "Tourist Places in Canada Visa",
      continent: "NorthAmerica",
    },
    {
      name: "United Kingdom",
      image:
        "/images/landmarks/Big Ben tourist places in United Kingdom UK Visa.webp",
      flag: "/images/flags/uk.webp",
      altName: "Big Ben tourist places in United Kingdom UK Visa",
      continent: "Europe",
    },
    {
      name: "Ireland",
      image: "/images/landmarks/Cliffs of Moher in Ireland Visa.webp",
      flag: "/images/flags/ie.webp",
      altName: "Cliffs of Moher in Ireland Visa",
      continent: "Europe",
    },
    {
      name: "Austria",
      image:
        "/images/landmarks/Schonbrunn Palace tourist places in Austria Visa.webp",
      flag: "/images/flags/at.webp",
      altName: "Schonbrunn Palace tourist places in Austria Visa",
      continent: "Europe",
    },
    {
      name: "Belgium",
      image: "/images/landmarks/Atomium in Belgium Visa.webp",
      flag: "/images/flags/be.webp",
      altName: "Atomium in Belgium Visa",
      continent: "Europe",
    },
    {
      name: "Denmark",
      image:
        "/images/landmarks/Little Mermaid Statue tourist places in Denmark visa.webp",
      flag: "/images/flags/dk.webp",
      altName: "Little Mermaid Statue tourist places in Denmark visa",
      continent: "Europe",
    },
    {
      name: "Finland",
      image:
        "/images/landmarks/Helsinki Cathedral tourist places in Finland Visa.webp",
      flag: "/images/flags/fi.webp",
      altName: "Helsinki Cathedral tourist places in Finland Visa",
      continent: "Europe",
    },
    {
      name: "France",
      image: "/images/landmarks/Eiffel Tower in France Visa.webp",
      flag: "/images/flags/fr.webp",
      altName: "Eiffel Tower in France Visa",
      continent: "Europe",
    },
    {
      name: "Germany",
      image: "/images/landmarks/Brandenburg Gate in Germany Visa.webp",
      flag: "/images/flags/de.webp",
      altName: "Brandenburg Gate in Germany Visa",
      continent: "Europe",
    },
    {
      name: "Greece",
      image: "/images/landmarks/Parthenon in Greece Visa.webp",
      flag: "/images/flags/gr.webp",
      altName: "Parthenon in Greece Visa",
      continent: "Europe",
    },
  ];



  return (
    <section className=" py-12 relative">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex justify-between gap-2 items-center">
            <p className="inline-block px-4 py-2 bg-blue-100/50 text-blue-500 font-medium rounded-full backdrop-blur-lg shadow-md">
              ✈️ Discover Destinations
            </p>
            <Link
              href={"/country"}
              className="py-2 self-end text-blue-500 min-w-fit flex gap-1 items-center justify-center font-semibold"
            >
              <MdFormatListBulleted className="text-4" /> <span>View All</span>
            </Link>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 leading-tight mt-2">
            Explore Top Countries
          </h2>
        </div>

        <div className="relative">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 md:left-0 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white h-[40px] w-[40px] rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300"
          >
            <FaAngleLeft size={20} className="text-white self-center" />
          </button>

          {/* Horizontal Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scroll-smooth gap-6 pb-4 py-2"
            style={{
              scrollbarWidth: "none", // Hide scrollbar in Firefox
              msOverflowStyle: "none", // Hide scrollbar in IE/Edge
              WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
            }}
          >
            {countries.map((country, index) => (
              <Link
                href={`/country/${country.continent}/${country.name}`}
                key={index}
                className="relative h-[330px] pb-[12px] w-[250px] flex-shrink-0 group"
              >
                {/* Country Image */}
                <img
                  src={country.image}
                  alt={country.name}
                  className="rounded-lg h-full w-full object-cover shadow-lg"
                />
                <div className="absolute top-0 pb-3 rounded-[10px] h-[318px] w-full bg-black/40 group-hover:bg-black/60 transition-all duration-300"></div>
                {/* Country Name */}
                <h3 className="absolute top-3 left-0 text-gray-300 px-8 rounded-r-full py-[5px] bg-white/10 backdrop-blur-sm font-semibold text-lg">
                  {country.name}
                </h3>
                {/* Flag Overlay */}
                <div className="absolute -bottom-[16px] left-1/2 transform -translate-x-1/2">
                  <img
                    src={country.flag}
                    alt={`${country.altName} Flag`}
                    className="w-14 h-14 object-cover rounded-full shadow-md border-2 border-white"
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 md:right-0 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white h-[40px] w-[40px] rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300"
          >
            <FaAngleRight size={20} className="text-white self-center" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CountryListAboutPage;

