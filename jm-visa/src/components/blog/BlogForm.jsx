"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BiMessageDetail } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { urlFor } from "../../sanity/lib/client";
import CountryCodeDropdown from "../home/CountryCodeDropdown";
import ReCAPTCHA from "react-google-recaptcha";
import useGeoLocation from "../../hooks/useGeoLocation";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const BlogForm = ({ blog, relatedBlogs }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    countryCode: "+91"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", success: false });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const userGeo = useGeoLocation();
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryCodeChange = (code) => {
    setFormData({
      ...formData,
      countryCode: code
    });
  };

  const validateForm = () => {
    const newErrors = { name: "", email: "", phone: "" };
    let isValid = true;

    if (!formData.name) {
      newErrors.name = "Name is required.";
      isValid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required.";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setPopup({ show: false });

    try {
      // Combine country code with phone number
      const fullPhoneNumber = `${formData.countryCode} ${formData.phone}`;

      if (!captchaToken) {
        setCaptchaError("Please complete the reCAPTCHA verification.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/get-touch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: fullPhoneNumber,
          other: "From Blog Page",
          recaptchaToken: captchaToken,
          userLocation: userGeo ? `${userGeo.city}, ${userGeo.region}, ${userGeo.country}` : "Unknown",
          userPincode: userGeo ? userGeo.pincode : "Unknown",
          userIp: userGeo ? userGeo.ip : "Unknown",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPopup({ show: true, message: "Form submitted successfully!", success: true });
        setFormData({ name: "", lastName: "", email: "", phone: "", service: "", countryCode: "+91" });
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
      } else {
        setPopup({
          show: true,
          message: result.message || "Failed to send the message. Try again.",
          success: false,
        });
      }

      setTimeout(() => {
        setPopup({ show: false });
      }, 5000);
    } catch (error) {
      setPopup({
        show: true,
        message: error?.message || "Server error! Please try later.",
        success: false,
      });
      setTimeout(() => {
        setPopup({ show: false });
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Popup Message */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 text-white ${popup.success ? "bg-green-500" : "bg-red-500"
              }`}
          >
            {popup.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Blogs and Contact Form */}
      <aside className="lg:w-1/3 w-full mt-8 lg:mt-0">
        <div className="lg:sticky lg:top-[100px] space-y-6 sm:space-y-8">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 lg:p-8 w-full max-w-full sm:max-w-sm mx-auto border border-blue-700/60">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 space-y-1">
              <div className="mx-auto flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 text-white">
                <BiMessageDetail className="text-lg sm:text-xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Free Visa Consultation</h3>
              <p className="text-blue-100 text-xs sm:text-sm">Get expert advice for your visa application</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="First Name*"
                    className="w-full rounded-lg border border-white/20 bg-white/15 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-blue-200 focus:border-blue-300 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-300">{errors.name}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full rounded-lg border border-white/20 bg-white/15 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-blue-200 focus:border-blue-300 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address*"
                  className="w-full rounded-lg border border-white/20 bg-white/15 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-blue-200 focus:border-blue-300 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-300">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <div className="flex rounded-lg border border-white/20 bg-white/15">
                  <CountryCodeDropdown
                    value={formData.countryCode}
                    onChange={handleCountryCodeChange}
                    error={errors.phone}
                    height="h-10 sm:h-12"
                    bgColor="bg-transparent"
                    borderColor="border-transparent"
                    className="rounded-l-lg text-white"
                  />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number*"
                    className={`flex-1 rounded-r-lg border-l border-white/10 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-blue-200 focus:border-blue-300 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.phone ? "border-red-500" : ""
                      }`}
                    required
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs sm:text-sm text-red-300">{errors.phone}</p>}
              </div>

              {/* Service Selection */}
              <div>
                <div className="relative">
                  <select
                    id="service"
                    name="service"
                    value={formData.service || ""}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-lg border border-white/20 bg-white/15 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:border-blue-300 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="" className="text-gray-900">Select Service</option>
                    <option value="tourist-visa" className="text-gray-900">Tourist Visa</option>
                    <option value="business-visa" className="text-gray-900">Business Visa</option>
                    <option value="student-visa" className="text-gray-900">Student Visa</option>
                    <option value="work-visa" className="text-gray-900">Work Visa</option>
                    <option value="other" className="text-gray-900">Other</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 w-4 -translate-y-1/2 text-blue-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {SITE_KEY ? (
                <div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={SITE_KEY}
                    onChange={(value) => {
                      setCaptchaToken(value);
                      setCaptchaError("");
                    }}
                  />
                  {captchaError && <p className="text-red-300 text-sm mt-2">{captchaError}</p>}
                </div>
              ) : (
                <p className="text-red-300 text-sm">
                  reCAPTCHA site key missing. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  "Get Started"
                )}
              </button>
            </form>
          </div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Related Posts</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Discover more articles you might find interesting</p>
              </div>

              {/* Related Posts List */}
              <div className="space-y-4 sm:space-y-6">
                {relatedBlogs.map((relatedBlog, index) => (
                  <Link
                    key={relatedBlog._id}
                    href={`/blog/${relatedBlog.slug.current}`}
                    className="block group"
                  >
                    <div className="flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-xl bg-white/50 border border-white/20 hover:bg-white/70 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                      {relatedBlog.mainImage && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                          <img
                            src={urlFor(relatedBlog.mainImage).width(80).height(80).url()}
                            alt={relatedBlog.title}
                            className="w-full h-full object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 mb-1 sm:mb-2">
                          {relatedBlog.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(relatedBlog.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default BlogForm;
