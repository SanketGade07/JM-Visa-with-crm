import VisaForm from "../../components/home/VisaForm";
import Footer from "../../components/layout/Footer";
import React from "react";

const layout = ({ children }) => {
  return (
    <div>
      {children}
      <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <VisaForm/>
      <Footer/>
      </div>
    </div>
  );
};

export default layout;
