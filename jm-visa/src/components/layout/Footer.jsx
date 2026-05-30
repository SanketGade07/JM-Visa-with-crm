"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaInstagram , FaFacebook, FaXTwitter, FaLinkedin} from "react-icons/fa6";


const Footer = () => {
  const [isQuickLinksOpen, setQuickLinksOpen] = useState(false);
  const [isServicesOpen, setServicesOpen] = useState(false);

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Countries", href: "/country" },
    { name: "Contact Us", href: "/contact" },
  ];

  const servicesLinks = [
    { name: "Visa", href: "/services" },
    { name: "Study Abroad", href: "/services/study-abroad" },
    {name: "Overseas Education", href: "/services/overseas-education"},
    { name: "Dummy Tickets", href: "/services/dummy-ticket-booking" },
    {name: "English Proficiency Test", href: "/services/english-proficiency-test"},
    {name: "Foreign Exchange", href: "/services/foreign-exchange"},
    {name: "Passport Services", href: "/services/passport-services"},
    {name: "US Interview Dates", href: "/services/us-interview-dates"},
    
  ];

  const footerLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Service", href: "/terms-and-condition" },
  ];

  return (
    <footer className="relative text-gray-200 py-16 px-3 sm:px-6">
      <div className="container mx-auto md:px-12 bg-white/10 backdrop-blur-md border border-gray-200/20 rounded-3xl py-10 px-4 sm:px-10 shadow-lg">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div>
            <Link href={"/"} className="flex flex-row items-center gap-2">
              <Image
                src={"/logo/logo.png"}
                alt="JM Visa Services Logo"
                width={50}
                height={50}
              />
              <h2 className="text-3xl font-bold text-white">JM Visa</h2>
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-gray-300">
              Simplify your immigration journey with our expert assistance for
              student, family, and business visas.
            </p>
            <div className="mt-6">
              <p className="font-semibold text-white">Call Us</p>
              <Link
                href="tel:+919321315524"
                className="text-blue-50 font-medium hover:text-blue-100 transition"
              >
                +91 9321315524
              </Link>
              <br />
              <Link
                href="tel:+918591070718"
                className="text-blue-50 font-medium hover:text-blue-100 transition"
              >
                +91 8591070718
              </Link>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-white">Email Us</p>
              <Link
                href="mailto:info@jmvisaservices.com"
                className="text-blue-50 font-medium hover:text-blue-100 transition"
              >
                info@jmvisaservices.com
              </Link>
            </div>
            {/* follow social link */}
            <div className="mt-4 flex gap-4">
              <Link href={"https://www.instagram.com/jmvisaservices"} target="_blank">
              <FaInstagram className="text-blue-50 hover:text-blue-100 text-2xl hover:scale-110 duration-200" />
              </Link>
              <Link href={"https://www.facebook.com/p/JM-Visa-Services"} target="_blank">
              <FaFacebook className="text-blue-50 hover:text-blue-100 text-2xl hover:scale-110 duration-200" />
              </Link>
              <Link href={"https://www.linkedin.com/company/jmvisa-services/"} target="_blank">
              <FaLinkedin className="text-blue-50 hover:text-blue-100 text-2xl hover:scale-110 duration-200" />
              </Link>
              </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-xl font-semibold text-white mb-4 cursor-pointer sm:mb-0"
              onClick={() => setQuickLinksOpen(!isQuickLinksOpen)}
            >
              Quick Links
              <span className="sm:hidden ml-2 text-sm">
                {isQuickLinksOpen ? "▲" : "▼"}
              </span>
            </h3>
            <ul
              className={`space-y-3 mt-3 sm:block ${
                isQuickLinksOpen ? "block" : "hidden"
              }`}
            >
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3
              className="text-xl font-semibold text-white mb-4 cursor-pointer sm:mb-0"
              onClick={() => setServicesOpen(!isServicesOpen)}
            >
             More Services
              <span className="sm:hidden ml-2 text-sm">
                {isServicesOpen ? "▲" : "▼"}
              </span>
            </h3>
            <ul
              className={`space-y-3 mt-3 sm:block ${
                isServicesOpen ? "block" : "hidden"
              }`}
            >
              {servicesLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Working Hours
            </h3>
            <ul className="text-sm space-y-3 text-white">
              <li>
                Mon - Fri: <span className="text-gray-100">10 AM - 8 PM</span>
              </li>
              <li>
                Sat: <span className="text-gray-100">10 AM - 5 PM</span>
              </li>
              <li>
                Sun: <span className="text-gray-100"> on requirement based</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Jurisdictional Clause */}
        <div className="border-t border-gray-400 mt-12 pt-6">
          <p className="text-xs text-gray-300 leading-relaxed text-center md:text-left">
            <span className="font-semibold text-gray-100">Jurisdictional Clause:</span>{" "}
            Notwithstanding anything contained, any dispute, claim or controversy
            arising out of or relating to the services shall be subject only to
            the exclusive jurisdiction of the Courts at Navi Mumbai and Thane
            District.
          </p>
        </div>

        {/* Divider */}
        <div className="mt-6 pt-6 border-t border-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-100">
            Copyright © {new Date().getFullYear()} JM Visa Services. All rights reserved.
          </p>
          <ul className="flex space-x-6 mt-3 sm:mt-0">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="hover:text-blue-400 text-gray-100 transition-colors text-sm"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 sm:mt-1 md:mt-0">
            Design & Managed by{" "}
            <Link
              href={"https://www.aneeverse.com/"}
              target="_blank"
              className="hover:underline inline-flex flex-row items-center gap-2 min-h-fit"
            >
              <span>Aneeverse</span>
              <Image
                src={"/logo/aneeverse-logo.png"}
                alt="Aneeverse Logo"
                width={20}
                height={20}
                className="inline-block"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>




























  );
};

export default Footer;



