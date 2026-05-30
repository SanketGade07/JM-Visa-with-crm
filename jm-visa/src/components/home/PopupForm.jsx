"use client";

import { useState, useEffect, useRef } from 'react';
import { BiSupport, BiUser, BiEnvelope, BiPhone, BiCheckShield, BiTask, BiX } from 'react-icons/bi';
import { FiArrowRight } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CountryCodeDropdown from './CountryCodeDropdown';
import services from '../../data/ServicesData';
import ReCAPTCHA from "react-google-recaptcha";
import useGeoLocation from '../../hooks/useGeoLocation';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const PopupForm = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91', // Default to India
    service: '',
    formSource: 'homepage'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepted, setIsAccepted] = useState(true);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState('');
  const userGeo = useGeoLocation();
  const recaptchaRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  // Extract service titles from ServicesData
  const serviceOptions = services.map(service => service.title);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCountryCodeChange = (code) => {
    setFormData({
      ...formData,
      countryCode: code
    });
  };

  const handleCheckboxChange = () => {
    setIsAccepted(!isAccepted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAccepted) {
      toast.error('Please accept the terms and conditions', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Combine country code with phone number (with space)
      const fullPhoneNumber = `${formData.countryCode} ${formData.phone}`;

      if (!captchaToken) {
        setCaptchaError("Please complete the reCAPTCHA verification.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/get-touch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: fullPhoneNumber,
          other: `${formData.service} (Homepage Popup)`,
          recaptchaToken: captchaToken,
          userLocation: userGeo ? `${userGeo.city}, ${userGeo.region}, ${userGeo.country}` : "Unknown",
          userPincode: userGeo ? userGeo.pincode : "Unknown",
          userIp: userGeo ? userGeo.ip : "Unknown",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      // Show success message and close popup
      toast.success('Thank you! We will contact you shortly.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Close popup after successful submission
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);

    } catch (error) {
      toast.error(error.message || 'Failed to submit form. Please try again later.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        className={"mt-[70px]"}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] bg-opacity-20 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col lg:flex-row">
          {/* Close Button */}
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
          >
            <BiX className="text-2xl md:text-4xl bg-white rounded-full p-1" />
          </button>

          {/* Left Section - Blue Theme */}
          <div className="hidden lg:block lg:w-1/3 bg-gradient-to-br from-blue-600 to-blue-700 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/90 to-blue-700/90"></div>
            <div className="relative h-full p-8 flex flex-col justify-center text-white">
              <h3 className="text-2xl font-bold mb-4">Need Visa Assistance?</h3>
              <p className="mb-6 text-blue-100">Our experts will guide you through the entire visa application process.</p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-full mr-3">
                    <BiCheckShield className="text-lg" />
                  </div>
                  <span className="text-blue-50">100% Secure Process</span>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-full mr-3">
                    <BiSupport className="text-lg" />
                  </div>
                  <span className="text-blue-50">24/7 Customer Support</span>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-full mr-3">
                    <BiTask className="text-lg" />
                  </div>
                  <span className="text-blue-50">High Success Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:w-2/3 p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Free Visa Consultation</h3>
              <p className="text-gray-600 hidden lg:block">Fill out the form and our expert will contact you shortly</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="sr-only" htmlFor="firstName">First Name</label>
                  <div className="relative">
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      aria-label="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg ${errors.firstName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="First Name*"
                    />
                    <BiUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="sr-only" htmlFor="lastName">Last Name</label>
                  <div className="relative">
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      aria-label="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg ${errors.lastName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="Last Name*"
                    />
                    <BiUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    aria-label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    placeholder="Email Address*"
                  />
                  <BiEnvelope className="absolute left-3 top-3 text-gray-400 text-sm" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="sr-only" htmlFor="phone">Phone Number</label>
                <div className="flex">
                  <CountryCodeDropdown
                    value={formData.countryCode}
                    onChange={handleCountryCodeChange}
                    error={errors.phone}
                    height="h-10"
                    borderColor="border-gray-300"
                  />
                  <div className="relative flex-1">
                    <input
                      id="phone"
                      type="number"
                      name="phone"
                      aria-label="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2 text-sm border border-l-0 rounded-r-lg ${errors.phone ? "border-red-500" : "border-gray-300"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="Phone Number*"
                    />
                    <BiPhone className="absolute left-3 top-3 text-gray-400 text-sm" />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Service Field */}
              <div>
                <label className="sr-only" htmlFor="service">Service</label>
                <div className="relative">
                  <select
                    id="service"
                    name="service"
                    aria-label="Service"
                    value={formData.service}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-8 py-2 text-sm border rounded-lg appearance-none ${errors.service ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  >
                    <option value="">Select Service*</option>
                    {serviceOptions.map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                  </select>
                  <BiTask className="absolute left-3 top-3 text-gray-400 text-sm" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.service && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9 a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.service}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-1">
                <div className="flex items-center h-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={isAccepted}
                    onChange={handleCheckboxChange}
                    className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <label htmlFor="terms" className="ml-2 block text-xs text-gray-700">
                  <div className="flex items-center">
                    <BiCheckShield className="text-blue-600 mr-1 text-xs" />
                    <div>
                      I agreed to the{" "}
                      <a href="/terms-and-condition" className="text-blue-600 hover:underline ml-0.5">
                        terms and conditions
                      </a></div>
                  </div>
                </label>
              </div>

              {SITE_KEY ? (
                <div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={SITE_KEY}
                    onChange={(value) => {
                      setCaptchaToken(value);
                      setCaptchaError('');
                    }}
                  />
                  {captchaError && <p className="text-red-500 text-xs mt-2">{captchaError}</p>}
                </div>
              ) : (
                <p className="text-red-500 text-xs">
                  reCAPTCHA site key missing. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isAccepted}
                className={`w-full mt-4 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${isLoading || !isAccepted
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                  } transition-all duration-300`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Book now</span>
                    <FiArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopupForm;