"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountryCodeDropdown from "../home/CountryCodeDropdown";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const TermsAndConditionsPopup = () => {
  const [showPopup, setShowPopup] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", countryCode: "+91" });
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [hideButton, setHideButton] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const recaptchaRef = useRef(null);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryCodeChange = (code) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: code,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHideButton(true);
    setIsLoading(true);
    setPopupMessage("Submitting...");

    try {
      const fullPhoneNumber = formData.phone ? `${formData.countryCode} ${formData.phone}` : "";

      if (!captchaToken) {
        setCaptchaError("Please verify you are not a robot.");
        setIsLoading(false);
        setHideButton(false);
        return;
      }

      const response = await fetch("/api/termsform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, phone: fullPhoneNumber, recaptchaToken: captchaToken }),
      });

      const result = await response.json();
      if (result.success) {
        setPopupMessage("Form submitted successfully!");
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
        // Close the popup after 2 seconds
        setTimeout(() => {
          setShowPopup(false);
        }, 600);
      } else {
        setPopupMessage(result.message || "Failed to submit. Please try again.");
        setHideButton(false);
      }
    } catch (error) {
      setPopupMessage(error?.message || "Error occurred. Please try again.");
      setHideButton(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-72 sm:w-80 lg:w-[400px] mx-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Terms & Conditions</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Your Phone
                  </label>
                  <div className="flex gap-0 border-2 border-gray-300 rounded-md focus-within:border-blue-500 transition-colors">
                    <div className="flex-shrink-0">
                      <CountryCodeDropdown
                        value={formData.countryCode}
                        onChange={handleCountryCodeChange}
                        height="h-[50px]"
                        bgColor="bg-white"
                        borderColor="border-transparent"
                        className="!rounded-l-md !border-0 !border-r !border-gray-200"
                      />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9321315524"
                      pattern="[0-9]{6,15}"
                      className="flex-1 h-[50px] px-3 border-0 rounded-r-md focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                {SITE_KEY ? (
                  <div className="mb-4">
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
                  <p className="text-red-500 text-sm mb-4">
                    reCAPTCHA site key missing. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
                  </p>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ display: hideButton ? "none" : "block" }}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold transition-all duration-200 transform disabled:bg-blue-300"
                  >
                    {isLoading ? "Submitting..." : "Agree and Submit"}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center text-gray-600 text-sm">
                <p>{popupMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TermsAndConditionsPopup;
