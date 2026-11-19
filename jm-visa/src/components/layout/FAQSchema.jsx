import React from 'react';

const FAQSchema = ({ faqs = [] }) => {
  // Default FAQ data for visa-related topics if no FAQs are provided
  const defaultFAQs = [
    {
      question: "How long does visa processing take?",
      answer: "Visa processing times vary by country and visa type. Tourist visas typically take 5-15 working days, while student and work visas may take 2-8 weeks. We provide estimated processing times for each country and expedited services where available."
    },
    {
      question: "What documents are required for visa application?",
      answer: "Required documents vary by visa type and destination country. Common requirements include valid passport, photographs, application forms, financial statements, travel itinerary, and supporting documents specific to your visa category. We provide a complete checklist for each application."
    },
    {
      question: "Can I track my visa application status?",
      answer: "Yes, most countries provide online tracking systems for visa applications. We assist you in setting up tracking and provide regular updates on your application status throughout the process."
    },
    {
      question: "What if my visa application is rejected?",
      answer: "If your visa is rejected, we analyze the rejection reasons and help you understand the next steps. Depending on the country, you may be able to appeal, reapply with additional documentation, or apply for a different visa category."
    },
    {
      question: "Do you provide visa interview preparation?",
      answer: "Yes, we offer comprehensive visa interview preparation including mock interviews, document review, and guidance on common questions. Our success rate for visa interviews is over 95% due to thorough preparation."
    }
  ];

  // Use provided FAQs or default ones - handle null case
  const safeFaqs = faqs === null || faqs === undefined ? [] : faqs;
  const faqData = (Array.isArray(safeFaqs) && safeFaqs.length > 0) ? safeFaqs : defaultFAQs;

  // Only render if we have FAQ data
  if (!faqData || faqData.length === 0) {
    return null;
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map((faq, index) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default FAQSchema;