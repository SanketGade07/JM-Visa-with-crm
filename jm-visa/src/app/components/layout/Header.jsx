"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import Container from "./Container";
import Image from "next/image";
import { MdLocalPhone } from "react-icons/md";

const Header = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = usePathname(); // Get current route

  const navLinks = [
    // { name: "About", href: "/about" },npm
    { name: "Visa", href: "/services" },
    { name: "Study Abroad", href: "/services/study-abroad" },
    // {name: "Dummy Bookings", href: "/services/dummy-ticket-booking"},
    { name: "Country", href: "/country" },
    { name: "Franchise", href: "/franchise" },
    { name: "Blog", href: "/blog" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-lg shadow-sm z-50">
      <Container className="flex items-center justify-between h-[80px]">
        {/* Logo */}
        <Link
          href={"/"}
          className="text-2xl flex flex-row items-center gap-2 font-bold tracking-wide"
        >
          <Image
            src="/logo/logo.png"
            alt="JM VISA"
            width={35}
            height={35}
            className="object-cover"
          />
          <span className="text-white">JM VISA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-md font-bold transition-colors duration-300 ${
                currentPath === link.href
                  ? "text-blue-500"
                  : "text-white hover:text-blue-400"
              }`}
            >
              {link.name.toUpperCase()}
            </Link>
          ))}

          {/* CTA Button */}
          <Link
            href="/contact"
            className="px-5 booty-animation py-2 flex items-center gap-1 text-sm bg-[#FF7043] text-white rounded-full font-semibold duration-300 shadow-md hover:shadow-lg"
          >
            <span>{("Free Counselling").toUpperCase()}</span> <MdLocalPhone />
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-2xl text-gray-100 focus:outline-none"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </Container>

      {/* Sidebar for Mobile */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 min-h-screen left-0 w-[300px] sm:w-[350px] bg-white shadow-lg z-50 flex flex-col items-start pt-7 px-6 space-y-6"
      >
        {/* Sidebar Logo */}
        <Link
          href={"/"}
          className="text-2xl mb-6 flex flex-row items-center gap-2 font-bold tracking-wide"
          onClick={toggleSidebar}
        >
          <Image
            src="/logo/logo.png"
            alt="JM VISA"
            width={35}
            height={35}
            className="object-cover"
          />
          <span className="text-gray-900">JM VISA</span>
        </Link>

        {/* Sidebar Links */}
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`text-md block w-full py-1 font-bold transition-colors duration-300 ${
              currentPath === link.href
                ? "text-blue-400 border-l-4 border-blue-400 pl-2"
                : "text-gray-600 hover:text-blue-400"
            }`}
            onClick={toggleSidebar}
          >
            {link.name.toUpperCase()}
          </Link>
        ))}

        {/* CTA Button */}
        <Link
          href="/contact"
          className="mt-4 booty-animation px-6 py-2 bg-[#FF7043] text-white rounded-full font-semibold hover:scale-105 flex gap-2 items-center transition-transform duration-300 shadow-md"
          onClick={toggleSidebar}
        >
          <span>{("Free Counselling").toUpperCase()}</span> <MdLocalPhone />
        </Link>
      </motion.div>
    </header>
  );
};

export default Header;
