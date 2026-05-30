"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BiMessageDetail } from "react-icons/bi";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import services from "../../../../data/ServicesData";
import CountryListAboutPage from "../../../../components/about/CountryListAboutPage";
import VisaServicesAboutPage from "../../../../components/about/VisaServicesAboutPage";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const ServiceDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", success: false });
  const [isAccepted, setIsAccepted] = useState(false); // State to track checkbox
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (!params?.slug) return;
    const matchedService = services.find((s) => s.url === `/${params.slug}`);
    if (!matchedService) {
      router.push("/services");
    } else {
      setService(matchedService);
    }
  }, [params?.slug, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = () => {
    setIsAccepted(!isAccepted); // Toggle checkbox state
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
    if (!validateForm() || !isAccepted) return; // Prevent submission if validation fails

    setIsLoading(true);
    setPopup({ show: false });

    try {
      if (!captchaToken) {
        setCaptchaError("Please complete the reCAPTCHA verification.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/get-touch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, other: service?.title, recaptchaToken: captchaToken }),
      });

      const result = await response.json();
      if (result.success) {
        setPopup({ show: true, message: "Form submitted successfully!", success: true });
        setFormData({ name: "", email: "", phone: "" });
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
      }, 5000); // Auto-hide popup after 5 seconds
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

  if (!service) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading Service Details...</p>
      </div>
    );
  }

  return (
    <section className="relative mt-[60px] py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Popup Message */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 text-white ${
              popup.success ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {popup.message}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-[1280px] mx-auto">
        {/* Main Section: Image and Title Side by Side */}
        <div className="flex flex-col lg:flex-row gap-12 pl-4 sm:pl-8 items-center justify-between lg:items-start">
          <div className="lg:w-1/2 w-full text-center lg:text-left">
            {/* Back Button */}
            <div className="mb-4 hidden lg:block">
              <button
                onClick={() => router.push("/services")}
                className="py-3 text-blue-500 font-semibold transition"
              >
                ← Back to Services
              </button>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 leading-tight">
              {service.title}
            </h1>
            <p className="mt-6 text-lg text-gray-600">{service.description}</p>
            <p className="mt-4 text-gray-500 text-base">
              {service.content?.overview}
            </p>
          </div>
          <div className="lg:w-1/2 w-full max-w-[500px] mr-auto ml-auto md:mr-0 md:ml-auto h-[300px] rounded-lg overflow-hidden shadow-md">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content and Form Section */}
        <div className="mt-12 flex flex-col lg:flex-row gap-8">
          {/* Content Section */}
          <article className="lg:w-2/3 w-full bg-white bg-opacity-30 backdrop-blur-lg py-8 px-4 sm:px-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Why Choose {service.title}?
            </h2>
            <p className="text-gray-600 mb-6">{service.content?.overview}</p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Key Highlights:
            </h3>
            <ul className="list-disc list-inside text-gray-600 mb-8">
              {service.content?.highlights?.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">FAQs:</h3>
            <div className="space-y-4">
              {service.content?.faqs?.map((faq, index) => (
                <div key={index} className="border-b border-gray-300 pb-4">
                  <button
                    type="button"
                    className="flex justify-between items-center w-full text-left text-gray-800 font-medium py-3"
                    onClick={() =>
                      setExpandedFaqIndex(
                        expandedFaqIndex === index ? null : index
                      )
                    }
                  >
                    <span>{faq.question}</span>
                    {expandedFaqIndex === index ? (
                      <AiOutlineMinus className="text-blue-500" />
                    ) : (
                      <AiOutlinePlus className="text-blue-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFaqIndex === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-gray-600 mt-2"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </article>

          {/* Sticky Form Section */}
          <aside className="lg:w-1/3 w-full">
            <div className="sticky top-[90px] bg-white bg-opacity-30 backdrop-blur-lg py-8 px-4 sm:px-8 rounded-md shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <BiMessageDetail className="text-blue-500" /> Get in Touch
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className={`mt-2 p-3 w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className={`mt-2 p-3 w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your Phone Number"
                    className={`mt-2 p-3 w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={isAccepted}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    I accept the <a href="/terms-and-condition" className="text-blue-500">terms and conditions</a>.
                  </label>
                </div>

                {SITE_KEY ? (
                  <div className="mb-6">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={SITE_KEY}
                      onChange={(value) => {
                        setCaptchaToken(value);
                        setCaptchaError("");
                      }}
                    />
                    {captchaError && <p className="text-red-500 text-sm mt-2">{captchaError}</p>}
                  </div>
                ) : (
                  <p className="text-red-500 text-sm mb-6">
                    reCAPTCHA site key missing. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
                  </p>
                )}

                <button
                  type="submit"
                  className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md ${
                    isLoading || !isAccepted ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isLoading || !isAccepted}
                >
                  {isLoading ? "Sending..." : "Submit"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
      <CountryListAboutPage />
      <VisaServicesAboutPage />
    </section>
  );
};

export default ServiceDetails;
