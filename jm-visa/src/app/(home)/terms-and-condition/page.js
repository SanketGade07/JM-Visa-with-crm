"use client";

import TermsAndConditionsPopup from "../../../components/TandC/TermsAndConditionsPopup";
import React from "react";

const TermsAndConditions = () => {
  return (
    <section className="bg-gradient-to-br mt-[60px] from-blue-50 via-white to-blue-100 py-16 px-4 sm:px-12">
      <div className="container mx-auto max-w-4xl">
        {/* Heading Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-blue-200/50 text-blue-600 font-medium rounded-full backdrop-blur-lg shadow-md">
            📜 Terms and Conditions
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mt-4">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            These terms govern the use of our website and services. Please read
            them carefully.
          </p>
        </div>

        {/* Content Section */}
        <div className=" p-4 sm:p-8">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dear Applicant,</h2>
            <p className="text-gray-600 leading-relaxed">
              Thank you for choosing JM Visa Services for your visa assistance. We value your trust and are committed to providing professional guidance throughout the visa application process. Kindly review the following consent statement carefully:
            </p>
          </section>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              By using JM Visa Services, you agree to our terms. We assist with visa applications but do not guarantee approval.
            </p>
          </section>

          {/* Services Provided */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Services Provided</h2>
            <p className="text-gray-600 leading-relaxed">
              We process tourist, business, and student visas. The final decision is made by the immigration authorities. We also process every visa for which the client is eligible and in accordance with the rules.
            </p>
          </section>

          {/* Client Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Client Responsibilities</h2>
            <ul className="list-disc ml-4 text-gray-600 leading-relaxed space-y-2">
              <li className="ml-1 [&>*]:ml-[-1.25rem]">Clients must provide accurate documents and comply with visa rules.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">We process and hand over your visa but are not responsible for your actions afterward.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">We issue tourist visa, if you do any illegal activities on this visa at any country, we are not responsible.</li>
            </ul>
          </section>

          {/* Fees and Payments */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Fees and Payments</h2>
            <ul className="list-disc ml-4 text-gray-600 leading-relaxed space-y-2">
              <li className="ml-1 [&>*]:ml-[-1.25rem]">Service fees cover processing and consultation only; embassy fees are separate.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">Our Service Fees are non-refundable once processing begins.</li>
            </ul>
          </section>

          {/* No Guarantee of Approval */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. No Guarantee of Approval</h2>
            <p className="text-gray-600 leading-relaxed">
              The visa decision rests solely with the consulate/embassy, and we have no control or influence over their decision.
            </p>
          </section>

          {/* Confidentiality */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Confidentiality</h2>
            <p className="text-gray-600 leading-relaxed">
              We protect your data but are not liable for breaches beyond our control.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              We are not responsible for delays, rejections, or policy changes by immigration authorities.
            </p>
          </section>

          {/* Refund Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Refund Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              No refunds are issued after submission, even if the visa is rejected.
            </p>
          </section>

          {/* Termination of Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Termination of Services</h2>
            <p className="text-gray-600 leading-relaxed">
              We may refuse service for false information, non-payment, or unethical conduct.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms are governed by the laws of our country.
            </p>
          </section>

          {/* Additional Terms and Conditions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Terms and Conditions:</h2>
            <ul className="list-disc ml-4 text-gray-600 leading-relaxed space-y-2">
              <li className="ml-1 [&>*]:ml-[-1.25rem]">This is a basic document list; the Embassy reserves the right to request additional documents after submission. These must be provided for further processing.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">Confirmed air tickets and hotel bookings are not mandatory for the visa process.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">JM Visa Services is not responsible for the cost of confirmed air tickets and hotel bookings purchased before or during the visa process and decision.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">We cannot influence visa decisions or processing times in any manner.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">Visa fees are non-refundable once paid to the authorities under any circumstances.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">JM Visa Services charges and air ticket blocking charges are non-refundable once the application is submitted, regardless of the circumstances.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">We do not have any influence over visa processing and decision-making processes.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">We cannot expedite the visa process once an application is submitted.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">All communications will be conducted via our company landline and email address only.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">Document exchange will occur via email only.</li>
              <li className="ml-1 [&>*]:ml-[-1.25rem]">Documents in regional languages must be duly translated into English.</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              For any questions regarding these Terms and Conditions, you can
              reach us at:
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:info@jmvisaservices.com"
                className="text-blue-500 hover:underline"
              >
                info@jmvisaservices.com
              </a>
            </p>
            <p className="text-gray-600 flex gap-1 items-center flex-wrap">
              <strong>Phone:</strong>{" "}
              <a
                href="tel:+919321315524"
                className="text-blue-500 hover:underline"
              >
                +91 9321315524
              </a>

              <a
                href="tel:+918591070718"
                className="text-blue-500 hover:underline"
              >
                +91 8591070718
              </a>
            </p>
            <p className="text-gray-600">
              <strong>Head Office:</strong> Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1, Kopar Khairane, Navi Mumbai, Maharashtra 400709
            </p>
            <p className="text-gray-600">
              <strong>Branch Office:</strong> Ballal Sankul, 3rd Floor, Charwark, Chowk, Indira Nagar, Nashik, Maharashtra - 422009
            </p>
          </section>
        </div>
      </div>
      <TermsAndConditionsPopup/>
    </section>
  );
};

export default TermsAndConditions;
