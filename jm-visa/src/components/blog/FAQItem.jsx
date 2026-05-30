"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const FAQItem = ({ faq, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
      <button
        type="button"
        className="flex justify-between items-center w-full text-left px-4 sm:px-6 py-3 sm:py-4 bg-white hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm sm:text-base lg:text-lg font-medium text-gray-800 pr-2 sm:pr-4 flex-1">
          Q: {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-blue-600 text-2xl font-light flex-shrink-0 w-8 h-8 flex items-center justify-center"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-gray-50"
          >
            <p className="text-gray-700 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base leading-relaxed border-t border-gray-200">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQItem;