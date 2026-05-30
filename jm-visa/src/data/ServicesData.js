const services = [
  {
    title: "Study Abroad",
    description: "Guidance for your education abroad.",
    image: "/images/student-visa.jpg",
    url: "/study-abroad",
    content: {
      overview:
        "Our Study Abroad services help students achieve their dream of pursuing education in top universities globally. From application to visa processing, we guide you through every step.",
      highlights: [
        "Comprehensive guidance for university selection.",
        "Support for admission applications and financial planning.",
        "Pre-departure orientation and visa assistance.",
        "Scholarship advice tailored to your profile.",
      ],
      faqs: [
        {
          question: "What is the process for applying to a foreign university?",
          answer: "The process includes application submission, document preparation, and securing a student visa.",
        },
        {
          question: "Do you assist with scholarships?",
          answer: "Yes, we guide students on scholarships that match their eligibility.",
        },
      ],
    },
  },
  {
    title: "Work Visa",
    description: "Get your dream job in another country.",
    image: "/images/work-visa.jpg",
    url: "/work-visa",
    content: {
      overview:
        "Our Work Visa services simplify the process of securing employment abroad. We provide expert assistance from documentation to visa approvals.",
      highlights: [
        "Job-specific visa guidance for multiple countries.",
        "Complete support with documentation and visa applications.",
        "Mock interviews to prepare for visa success.",
        "Guidance on latest work visa policies.",
      ],
      faqs: [
        {
          question: "What documents are required for a work visa?",
          answer: "Documents include employment offer letters, financial proof, and a valid passport.",
        },
        {
          question: "Can my family join me on a work visa?",
          answer: "In most cases, family members can apply for dependent visas.",
        },
      ],
    },
  },
  {
    title: "Tourist Visa",
    description: "Travel hassle-free to your favorite destinations.",
    image: "/images/tourist-visa.webp",
    url: "/tourist-visa",
    content: {
      overview:
        "Plan your dream vacation with our Tourist Visa services. We make it easy to apply for and secure your travel permits.",
      highlights: [
        "Quick and easy tourist visa processing.",
        "Guidance on required travel documents.",
        "Support for travel insurance and itineraries.",
        "Tips for a smooth travel experience.",
      ],
      faqs: [
        {
          question: "How long is a tourist visa valid?",
          answer: "Tourist visas are generally valid for 30 to 90 days depending on the country.",
        },
        {
          question: "Do you help with last-minute visa applications?",
          answer: "Yes, we assist with urgent visa applications for specific countries.",
        },
      ],
    },
  },
  {
    title: "Business Visa",
    description: "Expand your business internationally.",
    image: "/images/business-visa.png",
    url: "/business-visa",
    content: {
      overview:
        "Our Business Visa services cater to entrepreneurs and professionals seeking global opportunities.",
      highlights: [
        "Expert guidance on business-specific visas.",
        "Assistance with invitation letters and documentation.",
        "Fast-track processing options.",
        "Support for attending international conferences.",
      ],
      faqs: [
        {
          question: "What is required for a business visa application?",
          answer: "You will need an invitation letter, business registration, and proof of financial stability.",
        },
        {
          question: "Can I combine business and leisure on a business visa?",
          answer: "Some countries allow limited leisure activities on business visas.",
        },
      ],
    },
  },
  {
    title: "Residence Visa",
    description: "Simplify settling in a new country.",
    image: "/images/residence-visa.png",
    url: "/residence-visa",
    content: {
      overview:
        "Our Residence Visa services help individuals and families settle in their chosen country with ease.",
      highlights: [
        "Complete guidance for residency permit applications.",
        "Support with family and dependent visas.",
        "Step-by-step assistance for permanent residency.",
        "Advice on legal and financial requirements.",
      ],
      faqs: [
        {
          question: "How long does a residence visa take to process?",
          answer: "It varies by country, typically taking 3 to 12 months.",
        },
        {
          question: "Can dependents apply for residence visas together?",
          answer: "Yes, family members can apply as dependents in most cases.",
        },
      ],
    },
  },
  {
    title: "Overseas Education",
    description: "Pursue education in top universities.",
    image: "/images/overseas-edu.png",
    url: "/overseas-education",
    content: {
      overview:
        "Explore global education opportunities with our Overseas Education services. We ensure a smooth application process for top universities.",
      highlights: [
        "Guidance on program selection and eligibility.",
        "Support for applications and recommendation letters.",
        "Visa assistance and pre-departure preparation.",
        "Tips on settling in a new country.",
      ],
      faqs: [
        {
          question: "What is the benefit of overseas education?",
          answer: "Overseas education offers global exposure, top-notch education, and career opportunities.",
        },
        {
          question: "Do you assist with visa interviews?",
          answer: "Yes, we provide mock interviews to prepare students for visa success.",
        },
      ],
    },
  },
  {
    title: "Dummy Booking",
    description: "Book dummy tickets and hotel reservations for visa processing.",
    image: "/images/dummy-ticket-booking.png",
    url: "/dummy-ticket-booking",
    content: {
      overview: "Our Dummy Booking service provides verified itineraries and hotel reservations for visa processing without actual bookings.",
      highlights: [
        "Genuine ticket confirmations for visa applications.",
        "Verified hotel reservations for travel plans.",
        "Cost-effective solutions for travel requirements.",
        "Flexible dates for rescheduling as needed.",
        "Quick turnaround times."
      ],
      faqs: [
        {
          "question": "Are dummy tickets acceptable for visa processing?",
          "answer": "Yes, they are widely accepted as proof of travel plans."
        },
        {
          "question": "Can I convert a dummy ticket into a real booking?",
          "answer": "No, a dummy ticket is only for visa processing purposes."
        },
        {
          "question": "Are dummy hotel reservations necessary for visa applications?",
          "answer": "Many visa applications require proof of accommodation, and dummy hotel reservations serve this purpose."
        },
        {
          "question": "How long does it take to receive a dummy hotel reservation?",
          "answer": "Our team provides dummy hotel reservations within 24 hours."
        }
      ]
    }
  },  
  {
    title: "English Proficiency Test",
    description: "Prepare for TOEFL, IELTS, and more.",
    image: "/images/english-proficiency-test.png",
    url: "/english-proficiency-test",
    content: {
      overview:
        "Ace your TOEFL, IELTS, and other English proficiency tests with our expert guidance and preparation resources.",
      highlights: [
        "Comprehensive test preparation material.",
        "Mock tests and practice sessions.",
        "Individual feedback to improve performance.",
        "Tips and strategies for scoring high.",
      ],
      faqs: [
        {
          question: "Do you offer personalized coaching?",
          answer: "Yes, we provide one-on-one coaching for test preparation.",
        },
        {
          question: "Can I prepare online?",
          answer: "Yes, we offer online courses and resources.",
        },
      ],
    },
  },
  {
    title: "Foreign Exchange",
    description: "Easily exchange currency for travel.",
    image: "/images/foreign-exchange.jpg",
    url: "/foreign-exchange",
    content: {
      overview:
        "Our Foreign Exchange services ensure you get the best rates for your travel currency needs.",
      highlights: [
        "Competitive exchange rates.",
        "Support for multiple currencies.",
        "Safe and secure transactions.",
        "Quick service and delivery options.",
      ],
      faqs: [
        {
          question: "What currencies can I exchange?",
          answer: "We support all major currencies for exchange.",
        },
        {
          question: "Do you offer home delivery of foreign currency?",
          answer: "Yes, home delivery is available in select locations.",
        },
      ],
    },
  },
  {
    title: "Passport Services",
    description: "Hassle-free passport application assistance.",
    image: "/images/passport-services.jpg",
    url: "/passport-services",
    content: {
      overview:
        "Our Passport Services simplify the process of applying for or renewing your passport with expert guidance.",
      highlights: [
        "Step-by-step guidance for passport applications.",
        "Support for lost or damaged passport reissuance.",
        "Updates on the latest passport regulations.",
        "Document checklist for seamless application.",
      ],
      faqs: [
        {
          question: "How long does it take to get a new passport?",
          answer: "It usually takes 2 to 4 weeks for processing.",
        },
        {
          question: "Do you assist with tatkal passports?",
          answer: "Yes, we provide assistance for expedited passport applications.",
        },
      ],
    },
  },
  {
    title: "US Interview Dates",
    description: "Get the earliest interview dates for the US.",
    image: "/images/us-interview-dates.jpg",
    url: "/us-interview-dates",
    content: {
      overview:
        "Our US Interview Date services help you secure the earliest available appointment for your visa interview.",
      highlights: [
        "Real-time updates on interview slots.",
        "Guidance for booking and rescheduling appointments.",
        "Tips for successful visa interviews.",
        "24/7 support for any issues.",
      ],
      faqs: [
        {
          question: "How do I book a US visa interview?",
          answer: "You can book through the US consulate’s official website, and we assist with the process.",
        },
        {
          question: "Can I reschedule my interview date?",
          answer: "Yes, rescheduling is allowed based on slot availability.",
        },
      ],
    },
  },
];

export default services;
