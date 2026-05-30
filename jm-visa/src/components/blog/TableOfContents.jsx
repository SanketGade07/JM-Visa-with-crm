"use client";
import React, { useEffect, useState } from 'react';

const TableOfContents = ({
  title = "IN THIS ARTICLE",
  showInlineTOC = true,
  includeFAQSection = false,
  faqSectionTitle = "FAQ Section",
  excludedHeadings = []
}) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    // Find all headings in the current article
    const findHeadings = () => {
      const articleElement = document.querySelector('.article-blog');
      if (!articleElement) return [];

      const headingElements = articleElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingsList = Array.from(headingElements).map((heading, index) => {
        // Create an ID if it doesn't exist
        if (!heading.id) {
          const id = heading.textContent
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
          heading.id = `heading-${index}-${id}`;
        }

        return {
          id: heading.id,
          text: heading.textContent,
          level: parseInt(heading.tagName.charAt(1)),
          element: heading
        };
      });

      // Filter out headings that are in the excludedHeadings array
      return headingsList.filter(heading =>
        !excludedHeadings.includes(heading.text)
      );
    };

    // Wait for content to load, then find headings
    const timer = setTimeout(() => {
      const foundHeadings = findHeadings();
      setHeadings(foundHeadings);
    }, 100);

    return () => clearTimeout(timer);
  }, [excludedHeadings]);

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToFAQ = () => {
    const faqElement = document.querySelector('h2');
    const faqSection = Array.from(document.querySelectorAll('h2')).find(
      h2 => h2.textContent.toLowerCase().includes('frequently asked questions')
    );

    if (faqSection) {
      const offset = 100;
      const elementPosition = faqSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!showInlineTOC) {
    return null;
  }

  return (
    <div className="my-6 sm:my-8 bg-blue-50/30 border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="text-xs sm:text-sm font-medium text-black mb-3 sm:mb-4">
        {title}
      </div>

      {headings.length > 0 ? (
        <ul className="space-y-3">
          {headings.map((heading, index) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className="text-left hover:text-blue-600 transition-colors duration-200 text-gray-600 hover:underline underline-offset-2 text-sm leading-relaxed"
              >
                {heading.text}
              </button>
            </li>
          ))}

          {includeFAQSection && (
            <li>
              <button
                onClick={scrollToFAQ}
                className="text-left hover:text-blue-600 transition-colors duration-200 text-gray-600 hover:underline underline-offset-2 text-sm leading-relaxed"
              >
                {faqSectionTitle}
              </button>
            </li>
          )}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm italic">
          No headings found in this article.
        </p>
      )}
    </div>
  );
};

export default TableOfContents;