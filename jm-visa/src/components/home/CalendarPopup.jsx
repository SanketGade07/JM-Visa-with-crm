"use client";

import { useState } from 'react';
import { BiX, BiCalendar, BiTime } from 'react-icons/bi';

const CalendarPopup = ({ isOpen, onClose, onDateSelect, formData }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  if (!isOpen) return null;

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const dateTime = {
        date: selectedDate,
        time: selectedTime,
        dateString: selectedDate.toDateString(),
        timeString: selectedTime
      };
      onDateSelect(selectedDate, dateTime);
    }
  };

  const dates = generateDates();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Select Consultation Date & Time</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <BiX className="text-2xl" />
          </button>
        </div>

        <div className="p-4">
          {/* Date Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <BiCalendar className="mr-2" />
              Select Date
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {dates.slice(0, 21).map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-500">
                    {date.toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="font-medium">
                    {date.getDate()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <BiTime className="mr-2" />
                Select Time
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeClick(time)}
                    className={`p-3 text-sm rounded-lg border transition-all ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime}
              className={`flex-1 py-2 px-4 rounded-lg text-white font-medium ${
                selectedDate && selectedTime
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPopup;