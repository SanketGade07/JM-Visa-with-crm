"use client";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPhone, FiMail, FiMapPin, FiUser, FiMessageSquare, FiSend } from "react-icons/fi";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import useGeoLocation from "../../../hooks/useGeoLocation";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", success: false });
  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const userGeo = useGeoLocation();
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    let validationErrors = {};
    if (!formData.name) validationErrors.name = "Name is required";
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      validationErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.message) validationErrors.message = "Message is required";
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPopup({ show: false });
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    if (!captchaToken) {
      setErrors((prev) => ({ ...prev, captcha: "Please complete the reCAPTCHA challenge" }));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: captchaToken,
          userLocation: userGeo
            ? `${userGeo.city}, ${userGeo.region}, ${userGeo.country}`
            : "Unknown",
          userPincode: userGeo ? userGeo.pincode : "Unknown",
          userIp: userGeo ? userGeo.ip : "Unknown",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPopup({ show: true, message: "Message sent successfully! We'll get back to you soon.", success: true });
        setFormData({ name: "", email: "", phone: "", message: "" });
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
    <section className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      {/* Decorative Background Elements - Theme Colors Only */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-cyan-400/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-cyan-500/10 to-blue-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Success/Error Popup */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-24 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 text-white flex items-center gap-3 backdrop-blur-md border ${popup.success ? "bg-emerald-500/95 border-emerald-400/30" : "bg-red-500/95 border-red-400/30"
              }`}
          >
            <div className={`p-1.5 rounded-full ${popup.success ? "bg-white/20" : "bg-white/20"}`}>
              {popup.success ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            <span className="font-medium tracking-wide">{popup.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-3 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100"
          >
            <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">Contact Us</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Let&apos;s Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Conversation</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Whether you have questions about visa requirements or need assistance with your application, our team is ready to help you every step of the way.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative bg-white rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Send a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border ${errors.name ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-2xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 font-medium text-gray-700`}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs ml-1 font-medium mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border ${errors.phone ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-2xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 font-medium text-gray-700`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs ml-1 font-medium mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-2xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 font-medium text-gray-700`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs ml-1 font-medium mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="relative group">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                      <FiMessageSquare className="text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                    </div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      rows="5"
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border ${errors.message ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} rounded-2xl focus:outline-none focus:ring-4 transition-all resize-none placeholder:text-gray-400 font-medium text-gray-700`}
                    ></textarea>
                  </div>
                  {errors.message && <p className="text-red-500 text-xs ml-1 font-medium mt-1">{errors.message}</p>}
                </div>

                {SITE_KEY ? (
                  <div className="transform scale-[0.9] origin-left sm:scale-100">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={SITE_KEY}
                      onChange={(value) => {
                        setCaptchaToken(value);
                        setErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.captcha;
                          return updated;
                        });
                      }}
                    />
                    {errors.captcha && <p className="text-red-500 text-xs mt-1 font-medium">{errors.captcha}</p>}
                  </div>
                ) : (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                    reCAPTCHA configuration missing.
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.01, translateY: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all ${isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <FiSend className="text-xl" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info & Map */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <FiPhone className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Call Us</h3>
                    <div className="space-y-1">
                      <Link href="tel:+919321315524" className="block text-gray-600 hover:text-blue-600 transition-colors font-medium">+91 93213 15524</Link>
                      <Link href="tel:+918591070718" className="block text-gray-600 hover:text-blue-600 transition-colors font-medium">+91 85910 70718</Link>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-cyan-100 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-cyan-50 rounded-2xl text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                    <FiMail className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Email Us</h3>
                    <Link href="mailto:info@jmvisaservices.com" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                      info@jmvisaservices.com
                    </Link>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <FiMapPin className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Visit Us</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">Head Office:</p>
                        <p className="text-gray-600 leading-relaxed font-medium">
                          Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1, Kopar Khairane, Navi Mumbai, Maharashtra - 400709
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">Branch Office:</p>
                        <p className="text-gray-600 leading-relaxed font-medium">
                          Ballal Sankul, 3rd Floor, Charwark, Chowk, Indira Nagar, Nashik, Maharashtra - 422009
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="w-full h-[300px] lg:h-auto lg:flex-1 overflow-hidden rounded-3xl shadow-lg border-4 border-white relative group"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4020.27545473824!2d73.006725!3d19.1107866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4f174af374b22233%3A0x39a66841cc7cfdd5!2sJM%20Visa%20Services!5e1!3m2!1sen!2sin!4v1734419571115!5m2!1sen!2sin"
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
                title="Google Map"
                className="grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsPage;
