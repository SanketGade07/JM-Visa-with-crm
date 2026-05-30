import dynamic from "next/dynamic";

const skeletonBlock = (height = "200px") => (
  <div
    className="w-full rounded-2xl bg-gray-100 animate-pulse"
    style={{ minHeight: height }}
  />
);

const HeroSection = dynamic(() => import("../components/home/Hero"), {
  loading: () => skeletonBlock("520px")
});
const VisaCategories = dynamic(() => import("../components/home/VisaCategories"), {
  loading: () => skeletonBlock("280px")
});
const HorizontalScrollSection = dynamic(
  () => import("../components/home/HorizontalScrollSection"),
  {
    loading: () => skeletonBlock("260px")
  }
);
const AboutUs = dynamic(() => import("../components/home/AboutUs"), {
  loading: () => skeletonBlock("320px")
});
const PromoSection = dynamic(() => import("../components/home/PromoSection"), {
  loading: () => skeletonBlock("260px")
});
const FeedbackReviewComponent = dynamic(
  () => import("../components/home/FeedbackReviewComponent"),
  {
    loading: () => skeletonBlock("300px")
  }
);
const VideoTestimonial = dynamic(() => import("../components/home/VideoTestimonial"), {
  loading: () => skeletonBlock("360px")
});
const BlogComponent = dynamic(() => import("../components/home/BlogComponent"), {
  loading: () => skeletonBlock("320px")
});
const VisaForm = dynamic(() => import("../components/home/VisaForm"), {
  loading: () => skeletonBlock("360px")
});
const Footer = dynamic(() => import("../components/layout/Footer"), {
  loading: () => skeletonBlock("200px")
});
import PopupForm from "../components/home/PopupFormLazy";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <VisaCategories />
      <HorizontalScrollSection />
      <div className="relative ">

        <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
          <AboutUs />
          <PromoSection />
        </div>
        <div className="absolute bottom-20 bg-gradient-to-br from-white via-white to-blue-200 blur-2xl bg-opacity-60  w-full min-h-full h-[500px] -z-10"> </div>

        <div className="absolute top-20 left-0 bg-gradient-to-br from-blue-200 via-white to-white blur-2xl bg-opacity-60   w-full  h-[500px] -z-10"> </div>
      </div>
      <VideoTestimonial />
      {/* <FeedbackReviewComponent /> */}
      <BlogComponent />
      <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
        <VisaForm />

        <Footer />
        <PopupForm />
      </div>
    </div>
  );
}
