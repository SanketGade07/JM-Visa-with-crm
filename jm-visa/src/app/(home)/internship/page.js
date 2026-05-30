"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    FiArrowRight,
    FiArrowUp,
    FiBriefcase,
    FiGlobe,
    FiUsers,
    FiCheckCircle,
    FiSend,
    FiBookOpen,
    FiAward,
    FiHeart,
    FiCode,
    FiTrendingUp,
    FiCoffee,
    FiActivity,
    FiDollarSign,
    FiHome,
    FiStar,
} from "react-icons/fi";
import { MdLocalPhone, MdSupportAgent } from "react-icons/md";

const destinations = [
    {
        name: "Japan",
        city: "Tokyo, Osaka & more",
        image: "/images/landmarks/Mount Fuji in Japan Visa.webp",
        flag: "/images/internship/japan-flag.svg",
    },
    {
        name: "South Korea",
        city: "Seoul, Busan & more",
        image: "/images/landmarks/Gyeongbokgung Palace in South Korea Visa.webp",
        flag: "/images/internship/south-korea-flag.svg",
    },
    {
        name: "Singapore",
        city: "Singapore City",
        image: "/images/landmarks/Marina Bay Sands tourist places in Singapore Visa.webp",
        flag: "/images/internship/singapore-flag.svg",
    },
    {
        name: "Thailand",
        city: "Bangkok, Phuket & more",
        image: "/images/landmarks/Grand Palace tourist places in Thailand Visa.webp",
        flag: "/images/internship/thailand-flag.svg",
    },
    {
        name: "Spain",
        city: "Madrid, Barcelona & more",
        image: "/images/landmarks/Sagrada Familia tourist places in Spain Visa.webp",
        flag: "/images/internship/spain-flag.svg",
    },
    {
        name: "Nepal",
        city: "Kathmandu, Pokhara",
        image: "/images/landmarks/Mount Everest tourist places in Nepal Visa.webp",
        flag: "/images/internship/nepal-flag.png",
    },
    {
        name: "Australia",
        city: "Sydney, Melbourne & more",
        image: "/images/landmarks/Sydney Opera House in Australia Visa.webp",
        flag: "/images/flags/au.webp",
    },
    {
        name: "Canada",
        city: "Toronto, Vancouver & more",
        image: "/images/landmarks/Tourist Places in Canada Visa.webp",
        flag: "/images/flags/ca.webp",
    },
    {
        name: "United Kingdom",
        city: "London, Manchester & more",
        image: "/images/landmarks/Big Ben tourist places in United Kingdom UK Visa.webp",
        flag: "/images/flags/uk.webp",
    },
    {
        name: "Germany",
        city: "Berlin, Munich & more",
        image: "/images/landmarks/Brandenburg Gate in Germany Visa.webp",
        flag: "/images/flags/de.webp",
    },
];

const industries = [
    { name: "Business Development", icon: FiBriefcase, desc: "Strategy, operations & growth" },
    { name: "Marketing & PR", icon: FiTrendingUp, desc: "Digital marketing & communications" },
    { name: "Information Technology", icon: FiCode, desc: "Software, data & cloud computing" },
    { name: "Engineering", icon: FiStar, desc: "Mechanical, civil & electrical" },
    { name: "Finance & Accounting", icon: FiDollarSign, desc: "Banking, auditing & fintech" },
    { name: "Hospitality & Tourism", icon: FiCoffee, desc: "Hotels, events & travel" },
    { name: "Healthcare & Medical", icon: FiActivity, desc: "Clinical, pharma & research" },
    { name: "Education & Training", icon: FiBookOpen, desc: "Teaching, EdTech & mentoring" },
];

const steps = [
    {
        step: "01",
        title: "Apply Online",
        desc: "Fill out our simple application form with your interests and preferred destination.",
        icon: FiSend,
    },
    {
        step: "02",
        title: "Get Matched",
        desc: "Our team matches you with the ideal company based on your profile and career goals.",
        icon: FiUsers,
    },
    {
        step: "03",
        title: "Visa & Preparation",
        desc: "We handle your visa application, accommodation, and pre-departure orientation.",
        icon: FiGlobe,
    },
    {
        step: "04",
        title: "Start Interning",
        desc: "Begin your international internship adventure with ongoing support from our team.",
        icon: FiCheckCircle,
    },
];

const benefits = [
    {
        title: "Visa Support",
        desc: "End-to-end visa processing and documentation assistance for a smooth experience.",
        icon: FiGlobe,
    },
    {
        title: "Accommodation Help",
        desc: "We arrange safe, affordable accommodation near your internship workplace.",
        icon: FiHome,
    },
    {
        title: "24/7 Support",
        desc: "Round-the-clock assistance throughout your internship journey abroad.",
        icon: MdSupportAgent,
    },
    {
        title: "Career Mentoring",
        desc: "Guidance from industry professionals to maximize your internship experience.",
        icon: FiAward,
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.1 },
    }),
};

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12 },
    },
};

const ScrollingColumn = ({ images, duration, offset = 0 }) => {
    // For seamless looping, we duplicate the images
    const displayImages = [...images, ...images];

    return (
        <div className="flex flex-col gap-4 overflow-hidden h-full relative">
            <motion.div
                className="flex flex-col gap-4"
                animate={{
                    y: [`${-offset}%`, `${-offset - 50}%`],
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {displayImages.map((src, i) => (
                    <div
                        key={i}
                        className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-white/20"
                    >
                        <Image
                            src={src}
                            alt="Internship"
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

const ScrollingRow = ({ images, duration, reverse = false }) => {
    // Duplicate images for horizontal looping
    const displayImages = [...images, ...images, ...images];

    return (
        <div className="flex overflow-hidden w-full relative">
            <motion.div
                className="flex gap-4 px-2"
                animate={{
                    x: reverse ? ["-33.33%", "0%"] : ["0%", "-33.33%"],
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ width: "fit-content" }}
            >
                {displayImages.map((src, i) => (
                    <div
                        key={i}
                        className="relative w-40 sm:w-56 aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-white/20 flex-shrink-0"
                    >
                        <Image
                            src={src}
                            alt="Internship"
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

const InternshipPage = () => {
    const [showAll, setShowAll] = React.useState(false);
    const displayedDestinations = showAll ? destinations : destinations.slice(0, 6);

    return (
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen overflow-hidden">
            {/* ── HERO SECTION ── */}
            <section className="relative pt-0 pb-0 overflow-hidden">
                {/* Decorative blurs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl -z-10" />

                <motion.div
                    className="container mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-12"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 space-y-6 pt-24 sm:pt-20 lg:pt-32 px-4 sm:px-6 lg:px-8 lg:pl-12 text-center lg:text-left">


                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight"
                            variants={fadeUp}
                        >
                            Internships{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                with a Purpose
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg text-gray-600 max-w-lg"
                            variants={fadeUp}
                        >
                            Launch your global career with JM Visa&apos;s curated internship
                            program. Gain real-world experience in culturally diverse
                            destinations across Asia, Europe, and beyond.
                        </motion.p>

                        <motion.div className="flex flex-row justify-center lg:justify-start flex-wrap gap-4" variants={fadeUp}>
                            <Link
                                href="/contact"
                                className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                            >
                                Apply Now <FiArrowRight className="hidden sm:inline" />
                            </Link>
                            <Link
                                href="/contact"
                                className="px-6 sm:px-8 py-3.5 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                            >
                                <MdLocalPhone /> <span className="hidden sm:inline">Have Questions?</span><span className="sm:hidden">Help</span>
                            </Link>
                        </motion.div>

                        {/* Trust badges */}
                        <motion.div
                            className="flex items-center justify-center lg:justify-start gap-6 pt-4"
                            variants={fadeUp}
                        >
                            {[
                                { val: "500+", label: "Interns Placed" },
                                { val: "20+", label: "Countries" },
                                { val: "98%", label: "Satisfaction" },
                            ].map((b) => (
                                <div key={b.label} className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{b.val}</p>
                                    <p className="text-xs text-gray-500">{b.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right — Hero Image Collage (Desktop) */}
                    <motion.div
                        className="hidden lg:block lg:w-1/2 relative lg:h-[700px] overflow-hidden lg:mr-12"
                        variants={fadeUp}
                        custom={0.3}
                    >
                        <div className="grid grid-cols-2 gap-4 h-full relative z-0">
                            <ScrollingColumn
                                images={destinations.slice(0, 3).map((d) => d.image)}
                                duration={20}
                                offset={0}
                            />
                            <ScrollingColumn
                                images={destinations.slice(3, 6).map((d) => d.image)}
                                duration={20}
                                offset={25}
                            />
                        </div>
                    </motion.div>

                    {/* Mobile Horizontal Scrolling Collage */}
                    <motion.div
                        className="block lg:hidden w-full overflow-hidden py-4 space-y-4 -mx-4 px-4"
                        variants={fadeUp}
                        custom={0.4}
                    >
                        <ScrollingRow
                            images={destinations.slice(0, 5).map((d) => d.image)}
                            duration={25}
                        />
                        <ScrollingRow
                            images={destinations.slice(5, 10).map((d) => d.image)}
                            duration={30}
                            reverse={true}
                        />
                    </motion.div>
                </motion.div>
            </section>

            {/* ── DESTINATIONS ── */}
            <section id="destinations-section" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 text-left">
                        <div className="lg:max-w-xl">
                            <h2 className="text-3xl sm:text-5xl font-extrabold text-blue-950 leading-tight whitespace-normal sm:whitespace-pre-line">
                                Where Do You Want to <span className="text-blue-600">Intern Abroad?</span>
                            </h2>
                        </div>
                        <div className="lg:max-w-lg pb-1">
                            <p className="text-xl font-bold text-blue-950 mb-3">
                                Explore Our Destinations
                            </p>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                From bustling metropolises to serene historical towns — your
                                adventure awaits in one of our exciting destinations.
                            </p>
                        </div>
                    </div>


                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 lg:gap-8 pb-6 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
                        {displayedDestinations.map((dest, i) => (
                            <div
                                key={dest.name}
                                className="flex-shrink-0 w-[280px] sm:w-[350px] lg:w-auto group relative bg-white rounded-[2rem] overflow-hidden cursor-pointer flex flex-col transition-all duration-300 border-2 border-transparent hover:border-blue-600 snap-center"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image
                                        src={dest.image}
                                        alt={dest.name}
                                        fill
                                        className="object-cover transition-transform duration-700"
                                    />
                                </div>

                                {/* Content Area - Initially with black side/bottom borders */}
                                <div className="p-5 bg-white flex items-center gap-3 border-x-2 border-b-2 border-gray-400 group-hover:border-transparent transition-colors duration-300 rounded-b-[2rem]">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 overflow-hidden shadow-sm flex-shrink-0 relative">
                                        {dest.flag ? (
                                            <Image
                                                src={dest.flag}
                                                alt={`${dest.name} flag`}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-700">
                                                {dest.name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-gray-800 font-semibold text-[16px] truncate">
                                        {dest.name} - {dest.city}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>


                    {destinations.length > 6 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => {
                                    setShowAll(!showAll);
                                    if (showAll) {
                                        const destinationsSection = document.getElementById('destinations-section');
                                        if (destinationsSection) {
                                            destinationsSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                }}
                                className="group inline-flex items-center gap-3 px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-full text-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-300"
                            >
                                {showAll ? (
                                    <>Show Less <FiArrowUp className="transition-transform group-hover:-translate-y-1" /></>
                                ) : (
                                    <>View All Destinations <FiArrowRight className="transition-transform group-hover:translate-x-1" /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>

            </section>

            {/* ── INTERNSHIP FIELDS ── */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 text-left">
                        <div className="lg:max-w-xl">
                            <h2 className="text-3xl sm:text-5xl font-extrabold text-blue-950 leading-tight">
                                Your Ideal <span className="text-blue-600">Internship</span>
                            </h2>
                        </div>
                        <div className="lg:max-w-lg pb-1">
                            <p className="text-gray-500 leading-relaxed text-lg">
                                We partner with a broad array of companies and organizations, ensuring we find
                                the best fit for your career interests and academic/professional background.
                            </p>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 lg:gap-8 pb-6 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
                        {industries.map((ind, i) => (
                            <div
                                key={ind.name}
                                className="flex-shrink-0 w-[220px] sm:w-[280px] lg:w-auto group p-8 bg-white border-2 border-gray-400 rounded-[2rem] hover:border-blue-600 transition-all duration-300 cursor-pointer flex flex-col items-center text-center shadow-sm snap-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center mb-6 relative">
                                    {/* Circular decorative ring similar to reference */}
                                    <div className="absolute inset-[-4px] rounded-full border border-gray-100/50" />
                                    <ind.icon className="text-blue-600 text-3xl group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {ind.name}
                                </h3>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
                        >
                            Explore All Fields <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 text-left">
                        <div className="lg:max-w-xl">
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-950 leading-tight">
                                How Does Our<br />
                                <span className="text-blue-600">Program Work?</span>
                            </h2>
                        </div>
                        <div className="lg:max-w-lg pb-1">
                            <p className="text-gray-500 leading-relaxed text-lg">
                                Four simple steps to launch your international career journey with
                                JM Visa Services.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((s, i) => (
                            <div
                                key={s.step}
                                className="relative p-8 bg-white border-2 border-gray-400 rounded-[2rem] shadow-sm hover:border-blue-600 transition-all duration-300 text-center group"
                            >
                                {/* Step number */}
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                    {s.step}
                                </div>
                                <div className="w-16 h-16 mx-auto mt-4 mb-5 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                                    <s.icon className="text-blue-600 text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {s.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE JM VISA ── */}
            {/* <section className="py-20 px-6 sm:px-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 text-left">
                        <div className="lg:max-w-xl">
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-950 leading-tight">
                                Why Choose<br />
                                <span className="text-blue-600">JM Visa Services?</span>
                            </h2>
                        </div>
                        <div className="lg:max-w-lg pb-1">
                            <p className="text-gray-500 leading-relaxed text-lg">
                                With over a decade of experience, we provide end-to-end support
                                for your international career aspirations.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((r, i) => (
                            <div
                                key={r.title}
                                className="group p-8 bg-white border-2 border-gray-400 rounded-[2rem] shadow-sm hover:border-blue-600 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors duration-300">
                                    <r.icon className="text-blue-600 text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {r.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {r.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* ── UNIVERSITY & EMPLOYER PARTNERSHIP ── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* University Partnership */}
                    <div className="p-10 bg-[#1D144A] rounded-[2.5rem] shadow-xl text-white overflow-hidden relative group min-h-[400px] flex flex-col justify-center">
                        {/* Background Image Overlay */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/internship/japan.png"
                                alt="University"
                                fill
                                className="object-cover opacity-20 grayscale"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1D144A] via-transparent to-transparent opacity-80" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg">
                                <FiBookOpen className="text-3xl text-blue-900" />
                            </div>
                            <h3 className="text-4xl font-bold mb-4">University Partnership</h3>
                            <p className="text-gray-300 text-lg mb-8 max-w-md">
                                Is your university seeking a high-quality international internship
                                program for students? Let&apos;s connect!
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white hover:text-blue-900 hover:border-white transition-all duration-300"
                            >
                                Contact us <FiArrowRight />
                            </Link>
                        </div>
                    </div>

                    {/* Hire Interns */}
                    <div className="p-10 bg-[#1D144A] rounded-[2.5rem] shadow-xl text-white overflow-hidden relative group min-h-[400px] flex flex-col justify-center">
                        {/* Background Image Overlay */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/internship/germany.png"
                                alt="Hire Interns"
                                fill
                                className="object-cover opacity-20 grayscale"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1D144A] via-transparent to-transparent opacity-80" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg">
                                <FiUsers className="text-3xl text-blue-900" />
                            </div>
                            <h3 className="text-4xl font-bold mb-4">Hire Interns</h3>
                            <p className="text-gray-300 text-lg mb-8 max-w-md">
                                Hi employers! Are you looking for the right interns for
                                your business or organization?
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white hover:text-blue-900 hover:border-white transition-all duration-300"
                            >
                                Contact us <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="py-10 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="relative bg-white rounded-[2.5rem] shadow-xl border border-blue-100 overflow-hidden flex flex-col-reverse lg:flex-row items-center p-8 lg:p-12 gap-12">
                        <div className="absolute -bottom-80 left-0 w-[140%] h-[140%] pointer-events-none z-0">
                            <Image
                                src="/images/internship/apply-banner-Background.svg"
                                alt="Background Pattern"
                                fill
                                className="object-contain object-left-bottom opacity-40 scale-110 translate-y-10"
                                style={{ filter: 'brightness(0) saturate(100%) invert(43%) sepia(97%) saturate(2335%) hue-rotate(209deg) brightness(96%) contrast(92%)' }}
                            />
                        </div>

                        <div className="relative z-10 lg:w-3/5 space-y-8 text-center lg:text-left">
                            <h2 className="text-3xl sm:text-6xl font-extrabold text-blue-950 leading-tight tracking-tight">
                                Ready to Start Your <span className="text-blue-600">Internship Journey?</span>
                            </h2>
                            <p className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                Ignite your global career with JM Visa Services and embark on
                                an unforgettable professional adventure abroad.
                            </p>
                            <div className="flex flex-row justify-center lg:justify-start gap-4">
                                <Link
                                    href="/contact"
                                    className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-100 text-sm sm:text-base"
                                >
                                    Apply Now
                                </Link>
                                <Link
                                    href="/contact"
                                    className="group px-6 sm:px-8 py-3 border-[1.5px] border-gray-900 text-blue-950 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                                >
                                    Talk to Us <FiArrowRight className="hidden sm:inline group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <div className="relative z-10 lg:w-2/5 w-full h-[300px] sm:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl">
                            <Image
                                src="/images/landmarks/Mount Fuji in Japan Visa.webp"
                                alt="Join JM Visa"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default InternshipPage;
