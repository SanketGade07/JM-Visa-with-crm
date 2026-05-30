"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import { FaGlobeAmericas, FaPlaneDeparture, FaUser, FaEnvelope, FaPhone, FaPassport } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import useGeoLocation from "../../hooks/useGeoLocation";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const VisaForm = () => {
  const [formData, setFormData] = useState({
    citizen: "India",
    travellingTo: "",
    category: "Travel",
    firstName: "",
    email: "",
    phoneNumber: "",
    otherCitizen: "",
    otherTravellingTo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", success: false });
  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const userGeo = useGeoLocation();
  const recaptchaRef = useRef(null);

  // Function to detect current page source dynamically
  const getCurrentPageSource = () => {
    if (typeof window === 'undefined') return 'Visa Application - Server Side';

    const path = window.location.pathname;
    const title = document.title;

    // Home page
    if (path === '/') return 'Home Page - Visa Form';

    // Dynamic page detection based on URL structure
    const pathSegments = path.split('/').filter(segment => segment !== '');

    if (pathSegments.length === 0) {
      return 'Home Page - Visa Form';
    }

    // First segment determines the main section
    const mainSection = pathSegments[0];

    // Format section name (capitalize first letter, replace hyphens with spaces)
    const formatSectionName = (section) => {
      return section
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Handle different page structures
    switch (mainSection) {
      case 'blog':
        if (pathSegments.length === 1) {
          return 'Blog Page - Visa Form';
        } else {
          const articleSlug = pathSegments.slice(1).join('/');
          return `Blog Article (${articleSlug}) - Visa Form`;
        }

      case 'country':
        if (pathSegments.length === 1) {
          return 'Countries Page - Visa Form';
        } else {
          const countryName = formatSectionName(pathSegments[1]);
          return `${countryName} Country Page - Visa Form`;
        }

      case 'services':
        if (pathSegments.length === 1) {
          return 'Services Page - Visa Form';
        } else {
          const serviceName = formatSectionName(pathSegments[1]);
          return `${serviceName} Service Page - Visa Form`;
        }

      default:
        // For any other page, use the title if available, otherwise format the path
        if (title && title !== 'JM Visa Services') {
          return `${title} - Visa Form`;
        } else {
          const pageName = formatSectionName(mainSection);
          return `${pageName} Page - Visa Form`;
        }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required.";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Phone number must be 10 digits.";
    if (!formData.travellingTo) newErrors.travellingTo = "Please select a destination country.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPopup({ show: false });
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Please complete the reCAPTCHA verification.");
      setIsLoading(false);
      return;
    }

    try {
      // Add page source to form data
      const submissionData = {
        ...formData,
        pageSource: getCurrentPageSource(),
        recaptchaToken: captchaToken,
        userLocation: userGeo ? `${userGeo.city}, ${userGeo.region}, ${userGeo.country}` : "Unknown",
        userPincode: userGeo ? userGeo.pincode : "Unknown",
        userIp: userGeo ? userGeo.ip : "Unknown",
      };

      const response = await axios.post("/api/visa-form", submissionData);

      if (response.data.success) {
        setPopup({ show: true, message: "Form submitted successfully!", success: true });
        setFormData({
          citizen: "India",
          travellingTo: "",
          category: "Travel",
          firstName: "",
          email: "",
          phoneNumber: "",
          otherCitizen: "",
          otherTravellingTo: "",
        });
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
      } else {
        setPopup({
          show: true,
          message: response.data.message || "Submission failed. Try again!",
          success: false,
        });
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Server error! Please try later.";
      setPopup({ show: true, message, success: false });
    } finally {
      setIsLoading(false);
      setTimeout(() => setPopup({ show: false }), 5000); // Hide popup after 5 seconds
    }
  };

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-blue-500/30 to-cyan-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-tl from-purple-500/30 to-pink-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Success/Error Popup */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-50 text-white flex items-center gap-3 backdrop-blur-md border ${popup.success ? "bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-400/30" : "bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-400/30"
              }`}
          >
            <div className={`p-1.5 rounded-full ${popup.success ? "bg-green-400/30" : "bg-red-400/30"}`}>
              {popup.success ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            <span className="font-semibold">{popup.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] overflow-hidden group"
        >
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10" />

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl" />

          <div className="relative z-10">
            {/* Heading */}
            <div className="text-center mb-6">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2 tracking-tight"
              >
                Visa Application
              </motion.h2>
              <p className="text-blue-100/70 text-sm sm:text-base font-light">
                Check visa requirements for your journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Citizen */}
                <div className="space-y-1.5">
                  <label className="text-blue-100/90 text-xs font-semibold ml-1 flex items-center gap-1.5 tracking-wide">
                    <FaPassport className="text-blue-300 text-sm" /> CITIZEN OF
                  </label>
                  <div className="relative group/input">
                    <select
                      name="citizen"
                      value={formData.citizen}
                      onChange={handleChange}
                      style={{
                        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                      }}
                      className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent focus:bg-white/10 transition-all appearance-none cursor-pointer hover:bg-white/10 hover:border-white/30 shadow-inner"
                    >
                      <option className="text-gray-900" value="India">India</option>
                      <option className="text-gray-900" value="USA">Australia</option>
                      <option className="text-gray-900" value="New Zealand">New Zealand</option>
                      <option className="text-gray-900" value="USA">USA</option>
                      <option className="text-gray-900" value="Canada">Canada</option>
                      <option className="text-gray-900" value="UK">UK</option>
                      <option className="text-gray-900" value="Ireland">Ireland</option>
                      <option className="text-gray-900" value="Austria">Austria</option>
                      <option className="text-gray-900" value="Belgium">Belgium</option>
                      <option className="text-gray-900" value="Croatia">Croatia</option>
                      <option className="text-gray-900" value="Czech Republic">Czech Republic</option>
                      <option className="text-gray-900" value="Denmark">Denmark</option>
                      <option className="text-gray-900" value="Estonia">Estonia</option>
                      <option className="text-gray-900" value="Finland">Finland</option>
                      <option className="text-gray-900" value="France">France</option>
                      <option className="text-gray-900" value="Georgia">Georgia</option>
                      <option className="text-gray-900" value="Germany">Germany</option>
                      <option className="text-gray-900" value="Greece">Greece</option>
                      <option className="text-gray-900" value="other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-blue-300/70 group-hover/input:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {formData.citizen === "other" && (
                    <motion.input
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      type="text"
                      name="otherCitizen"
                      value={formData.otherCitizen}
                      onChange={handleChange}
                      placeholder="Please specify"
                      className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 placeholder:text-white/30 mt-2 shadow-inner"
                    />
                  )}
                  {errors.citizen && <p className="text-red-300 text-xs ml-1 mt-1">{errors.citizen}</p>}
                </div>

                {/* Travelling To */}
                <div className="space-y-1.5">
                  <label className="text-blue-100/90 text-xs font-semibold ml-1 flex items-center gap-1.5 tracking-wide">
                    <FaPlaneDeparture className="text-blue-300 text-sm" /> TRAVELLING TO
                  </label>
                  <div className="relative group/input">
                    <select
                      name="travellingTo"
                      value={formData.travellingTo}
                      onChange={handleChange}
                      style={{
                        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                      }}
                      className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent focus:bg-white/10 transition-all appearance-none cursor-pointer hover:bg-white/10 hover:border-white/30 shadow-inner"
                    >
                      <option className="text-gray-900" value="">Select Country</option>
                      <option className="text-gray-900" value="USA">Australia</option>
                      <option className="text-gray-900" value="New Zealand">New Zealand</option>
                      <option className="text-gray-900" value="USA">USA</option>
                      <option className="text-gray-900" value="Canada">Canada</option>
                      <option className="text-gray-900" value="UK">UK</option>
                      <option className="text-gray-900" value="Ireland">Ireland</option>
                      <option className="text-gray-900" value="Austria">Austria</option>
                      <option className="text-gray-900" value="Belgium">Belgium</option>
                      <option className="text-gray-900" value="Croatia">Croatia</option>
                      <option className="text-gray-900" value="Czech Republic">Czech Republic</option>
                      <option className="text-gray-900" value="Denmark">Denmark</option>
                      <option className="text-gray-900" value="Estonia">Estonia</option>
                      <option className="text-gray-900" value="Finland">Finland</option>
                      <option className="text-gray-900" value="France">France</option>
                      <option className="text-gray-900" value="Georgia">Georgia</option>
                      <option className="text-gray-900" value="Germany">Germany</option>
                      <option className="text-gray-900" value="Greece">Greece</option>
                      <option className="text-gray-900" value="India">India</option>
                      <option className="text-gray-900" value="other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-blue-300/70 group-hover/input:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {formData.travellingTo === "other" && (
                    <motion.input
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      type="text"
                      name="otherTravellingTo"
                      value={formData.otherTravellingTo}
                      onChange={handleChange}
                      placeholder="Please specify"
                      className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 placeholder:text-white/30 mt-2 shadow-inner"
                    />
                  )}
                  {errors.travellingTo && <p className="text-red-300 text-xs ml-1 mt-1">{errors.travellingTo}</p>}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-blue-100/90 text-xs font-semibold ml-1 flex items-center gap-1.5 tracking-wide">
                  <BiCategory className="text-blue-300 text-sm" /> CATEGORY
                </label>
                <div className="relative group/input">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                    }}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent focus:bg-white/10 transition-all appearance-none cursor-pointer hover:bg-white/10 hover:border-white/30 shadow-inner"
                  >
                    <option className="text-gray-900" value="Travel">Travel</option>
                    <option className="text-gray-900" value="Business">Business</option>
                    <option className="text-gray-900" value="Study">Study</option>
                    <option className="text-gray-900" value="Work">Work</option>
                    <option className="text-gray-900" value="Residence">Residence</option>
                    <option className="text-gray-900" value="Tourist">Tourist</option>
                    <option className="text-gray-900" value="other">Other</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-blue-300/70 group-hover/input:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-blue-100/90 text-xs font-semibold ml-1 flex items-center gap-1.5 tracking-wide">
                    <FaUser className="text-blue-300 text-sm" /> NAME
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                    }}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:bg-white/10 placeholder:text-white/40 transition-all hover:border-white/30 shadow-inner"
                    placeholder="Enter your name"
                    required
                  />
                  {errors.firstName && <p className="text-red-300 text-xs ml-1 mt-1">{errors.firstName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-blue-100/90 text-xs font-semibold ml-1 flex items-center gap-1.5 tracking-wide">
                    <FaEnvelope className="text-blue-300 text-sm" /> EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                    }}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:bg-white/10 placeholder:text-white/40 transition-all hover:border-white/30 shadow-inner"
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && <p className="text-red-300 text-xs ml-1 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-blue-100/90 text-xs font-semibold ml-1 flex items-center gap-1.5 tracking-wide">
                  <FaPhone className="text-blue-300 text-sm" /> PHONE NUMBER
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                  }}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:bg-white/10 placeholder:text-white/40 transition-all hover:border-white/30 shadow-inner"
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && <p className="text-red-300 text-xs ml-1 mt-1">{errors.phoneNumber}</p>}
              </div>

              {/* Submit Section */}
              <div className="pt-3 space-y-3">
                {SITE_KEY ? (
                  <div className="flex justify-center">
                    <div className="transform scale-[0.85] sm:scale-90 origin-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={SITE_KEY}
                        onChange={(value) => {
                          setCaptchaToken(value);
                          setCaptchaError("");
                        }}
                        theme="light"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-red-300 text-xs text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    reCAPTCHA site key missing.
                  </p>
                )}
                {captchaError && <p className="text-red-300 text-xs text-center">{captchaError}</p>}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/10"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Check Requirements
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Google Map Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative h-[450px] lg:h-[650px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:opacity-0 transition-opacity duration-700 pointer-events-none z-10" />
          <iframe
            title="Google Map"
            className="w-full h-full saturate-[0.8] group-hover:saturate-100 contrast-[1.1] transition-all duration-700"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4020.27545473824!2d73.006725!3d19.1107866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4f174af374b22233%3A0x39a66841cc7cfdd5!2sJM%20Visa%20Services!5e1!3m2!1sen!2sin!4v1734419571115!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </motion.div>
      </div>
    </div>
  );
};

export default VisaForm;
