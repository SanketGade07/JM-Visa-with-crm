"use client";

import { useState } from 'react';
import { BiX, BiCreditCard, BiShield, BiCheckCircle } from 'react-icons/bi';

const PaymentGateway = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  paymentData 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Secure Payment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <BiX className="text-2xl" />
          </button>
        </div>

        <div className="p-4">
          {/* Payment Amount */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-gray-800">
              ₹{paymentData?.total || 550}
            </div>
            <p className="text-sm text-gray-600">Total Amount</p>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h4>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <BiCreditCard className="mr-2 text-blue-500" />
                <span className="text-sm">Credit/Debit Card</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="mr-2 text-blue-500">💳</span>
                <span className="text-sm">UPI Payment</span>
              </label>
            </div>
          </div>

          {/* Card Details Form */}
          {paymentMethod === 'card' && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* UPI Payment */}
          {paymentMethod === 'upi' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID
              </label>
              <input
                type="text"
                placeholder="yourname@paytm"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center text-sm text-green-700">
              <BiShield className="mr-2" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <BiCheckCircle className="mr-2" />
                Pay ₹{paymentData?.total || 550}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            By clicking &quot;Pay&quot;, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;