"use client";

import { BiX, BiCalendar, BiUser, BiEnvelope, BiPhone, BiWorld } from 'react-icons/bi';

const InvoicePopup = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  formData, 
  selectedDate, 
  selectedDateTime 
}) => {
  if (!isOpen) return null;

  const consultationFee = 500; // Base consultation fee
  const serviceFee = 50;
  const total = consultationFee + serviceFee;

  const handleConfirm = () => {
    const invoiceData = {
      ...formData,
      selectedDate,
      selectedDateTime,
      consultationFee,
      serviceFee,
      total,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString()
    };
    onConfirm(invoiceData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Booking Summary</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <BiX className="text-2xl" />
          </button>
        </div>

        <div className="p-4">
          {/* Customer Details */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <BiUser className="mr-2 text-gray-400" />
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex items-center">
                <BiEnvelope className="mr-2 text-gray-400" />
                <span>{formData.email}</span>
              </div>
              <div className="flex items-center">
                <BiPhone className="mr-2 text-gray-400" />
                <span>{formData.countryCode} {formData.phone}</span>
              </div>
              <div className="flex items-center">
                <BiWorld className="mr-2 text-gray-400" />
                <span>{formData.country} - {formData.visaType}</span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Appointment Details</h4>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center text-sm">
                <BiCalendar className="mr-2 text-blue-500" />
                <span className="font-medium">
                  {selectedDateTime?.dateString} at {selectedDateTime?.timeString}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Free visa consultation with our expert
              </p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Pricing Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Consultation Fee</span>
                <span>₹{consultationFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>₹{serviceFee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Proceed to Payment
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            By proceeding, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePopup;