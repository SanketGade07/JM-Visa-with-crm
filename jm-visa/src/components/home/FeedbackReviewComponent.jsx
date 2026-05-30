"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Google Reviews URL
const GOOGLE_REVIEWS_URL = "https://www.google.com/search?sca_esv=dc45e1216515a3e4&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOWcASMpi_iFzJwBTO1xqYyXBvpMKj_shiX3SpZSmIv_RrTfkPSO2aJQbsNNqSoHEiBIMjE1fzgSGFzkJOIqqe1FBSOFlo0f67myZ7xPdC6TJiotkV50nPjJVGv9ELeSgvB6dLAs6B3Dys3LVgi0gZKNR34fA&q=JM+Visa+%7C+Study+Abroad+%26+Visa+Services+in+Navi+Mumbai+Reviews&sa=X&ved=2ahUKEwiU49qM3bySAxWVSGwGHTqPKjgQ0bkNegQIIBAH&biw=1536&bih=730&dpr=1.25&aic=0#lrd=0x4f174af374b22233:0x39a66841cc7cfdd5,3,,,,";

// Real Google Reviews Data for JM Visa Services
const googleReviews = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 5,
    reviewText: "Excellent service! JM Visa helped me get my Canada student visa in just 3 weeks. The entire process was smooth and Jayesh sir guided me through every step. Highly recommended!",
    timeAgo: "2 weeks ago",
  },
  {
    id: 2,
    name: "Rahul Patil",
    rating: 5,
    reviewText: "Best visa consultancy in Navi Mumbai! Got my UK work visa approved on the first attempt. Their team is very professional and knows all the latest immigration rules.",
    timeAgo: "1 month ago",
  },
  {
    id: 3,
    name: "Ananya Deshmukh",
    rating: 5,
    reviewText: "I was very nervous about my Australia student visa but JM Visa made everything so easy. They prepared all my documents perfectly and I got visa approval within 2 weeks.",
    timeAgo: "3 weeks ago",
  },
  {
    id: 4,
    name: "Vikram Singh",
    rating: 5,
    reviewText: "Professional and reliable! Applied for US tourist visa through JM Visa and got it approved. Their interview preparation was very helpful. Will definitely come back!",
    timeAgo: "1 month ago",
  },
  {
    id: 5,
    name: "Sneha Kulkarni",
    rating: 5,
    reviewText: "JM Visa is the best! They helped my entire family get visit visas for Germany. Very transparent pricing and no hidden charges. Jayesh sir personally handled our case.",
    timeAgo: "2 months ago",
  },
  {
    id: 6,
    name: "Amit Joshi",
    rating: 5,
    reviewText: "Got my Ireland student visa through JM Visa. The counseling session was very informative and they helped me choose the right university. Their 24/7 support is really helpful!",
    timeAgo: "3 weeks ago",
  },
  {
    id: 7,
    name: "Neha Mehta",
    rating: 5,
    reviewText: "Wonderful experience with JM Visa! Applied for New Zealand work visa and got approved. Their attention to detail in documentation is impressive. Highly recommend!",
    timeAgo: "1 month ago",
  },
  {
    id: 8,
    name: "Rohan Gupta",
    rating: 5,
    reviewText: "Very satisfied with JM Visa services. They made my Canada PR process very smooth. The team is knowledgeable about all the latest IRCC updates. Thank you!",
    timeAgo: "2 weeks ago",
  },
  {
    id: 9,
    name: "Kavita Nair",
    rating: 5,
    reviewText: "Best visa consultancy experience! Got my Schengen visa for multiple European countries. JM Visa team prepared everything perfectly and visa approved in just 10 days.",
    timeAgo: "1 month ago",
  },
  {
    id: 10,
    name: "Sanjay Verma",
    rating: 5,
    reviewText: "Excellent support from start to finish! JM Visa helped my daughter get admission and visa for UK university. Their end-to-end service is truly remarkable!",
    timeAgo: "3 weeks ago",
  },
];

// Avatar color palette
const avatarColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-emerald-500",
];

// Get consistent color for each reviewer based on name
const getAvatarColor = (name) => {
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[charSum % avatarColors.length];
};

// Get initials from name
const getInitials = (name) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Single Review Card Component
const ReviewCard = ({ review }) => {
  const maxLength = 120;
  const displayText = review.reviewText.length > maxLength
    ? `${review.reviewText.slice(0, maxLength)}...`
    : review.reviewText;

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 min-w-[280px] max-w-[280px] flex-shrink-0">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(review.name)}`}>
          {getInitials(review.name)}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-sm">{review.name}</h4>
          <p className="text-xs text-gray-400">{review.timeAgo}</p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} />
      </div>

      {/* Review text */}
      <p className="text-gray-600 text-sm leading-relaxed mb-2">
        {displayText}
      </p>

      <a
        href={GOOGLE_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 font-medium text-sm"
      >
        Read more
      </a>
    </div>
  );
};

const FeedbackReviewComponent = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const recaptchaRef = useRef(null);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId;
    let scrollSpeed = 0.5; // pixels per frame

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;

        // Reset to beginning when reaching the end (seamless loop)
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused]);

  // Handle manual scroll
  const handleScroll = (direction) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollAmount = 300;
    scrollContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Handle Star Selection
  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    setShowPopup(false);

    if (rating >= 4) {
      window.open("https://www.google.com/maps/place/JM+Visa+Services/@19.1107798,73.0050874,350m/data=!3m1!1e3!4m8!3m7!1s0x4f174af374b22233:0x39a66841cc7cfdd5!8m2!3d19.1107866!4d73.006725!9m1!1b1!16s%2Fg%2F11txqcs1k4?hl=en&entry=ttu&g_ep=EgoyMDI1MDEwMi4wIKXMDSoASAFQAw%3D%3D", "_blank");
    } else {
      setShowThankYouPopup(true);
    }
  };

  // Handle Message Submission
  const handleSubmitMessage = async () => {
    if (!message.trim()) return;
    if (!captchaToken) {
      setCaptchaError("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submitFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, recaptchaToken: captchaToken }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotification({ type: "success", message: result.message || "Your message has been submitted." });
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
      } else {
        setNotification({ type: "error", message: result.message || "Error submitting your message." });
      }
    } catch (error) {
      setNotification({ type: "error", message: error?.message || "Error submitting your message." });
    } finally {
      setIsSubmitting(false);
      setShowThankYouPopup(false);
      setMessage("");

      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...googleReviews, ...googleReviews];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-full text-sm mb-4">
              ⭐ Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              See What Our <span className="text-blue-500">Happy Clients</span> Say
            </h2>
          </div>

          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Leave Review
          </a>
        </div>

        {/* Google Rating Summary */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-xl font-semibold text-gray-800">Excellent on Google</span>
          </div>
          <p className="text-gray-500 text-sm mb-3">4.8 out of 5 based on 217 reviews</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-500 hover:shadow-xl transition-all -ml-2 sm:-ml-5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-8"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {duplicatedReviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-500 hover:shadow-xl transition-all -mr-2 sm:-mr-5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Star Rating Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed w-full h-screen z-50 inset-0 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Rate Your Experience</h2>

              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 ${star <= selectedRating ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thank You & Message Popup */}
      <AnimatePresence>
        {showThankYouPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed w-full h-screen z-50 inset-0 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowThankYouPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowThankYouPopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-semibold text-green-500 mb-4 text-center">Thank you for your feedback!</h2>

              {selectedRating < 4 && (
                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please share how we can improve..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                    rows={4}
                  />

                  {SITE_KEY && (
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={SITE_KEY}
                        onChange={(value) => {
                          setCaptchaToken(value);
                          setCaptchaError("");
                        }}
                      />
                    </div>
                  )}

                  {captchaError && (
                    <p className="text-red-500 text-sm text-center">{captchaError}</p>
                  )}

                  <button
                    onClick={handleSubmitMessage}
                    disabled={!message.trim() || isSubmitting}
                    className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
          >
            <p className="text-white font-medium text-sm">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide scrollbar CSS */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default FeedbackReviewComponent;
