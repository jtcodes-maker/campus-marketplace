"use client";

import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, X } from 'lucide-react'; 

const ReportButton = ({ sellerId, currentUserId }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleReportClick = () => {
    if (sellerId === currentUserId) {
      setFeedbackMessage("You cannot report yourself.");
      setTimeout(() => setFeedbackMessage(''), 3000); 
      return;
    }
    setShowModal(true);
  };

  const confirmReport = async () => {
    setIsReporting(true);
    setFeedbackMessage('');

    try {
      const token = localStorage.getItem('token'); 
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${sellerId}/report`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      setFeedbackMessage("Reported successfully. Our team has been notified.");
      setShowModal(false); 
      setTimeout(() => setFeedbackMessage(''), 4000);

    } catch (error) {
      //console.error(error);
      setFeedbackMessage(error.response?.data?.message || "An error occurred while reporting.");
      setShowModal(false); 
      setTimeout(() => setFeedbackMessage(''), 4000);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={handleReportClick} 
        disabled={isReporting}
        className="text-red-500 text-sm font-medium hover:text-red-700 hover:underline transition-colors flex items-center"
      >
        🚩 Report
      </button>

      {/* Subtle Inline Feedback Message */}
      {feedbackMessage && (
        <span className="ml-3 text-xs font-semibold text-orange-600 animate-pulse">
          {feedbackMessage}
        </span>
      )}

      {/* --- CUSTOM REACT MODAL --- */}
      {showModal && (
        // REPLACED 'bg-black bg-opacity-60' with 'bg-gray-900/40 backdrop-blur-sm'
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 transition-opacity">
          
          {/* Modal Container */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Report Suspicious User
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 bg-white">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to report this user? Our Trust & Safety AI and moderation team will review their account for suspicious activity.
              </p>
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isReporting}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                No, Cancel
              </button>
              
              <button 
                onClick={confirmReport}
                disabled={isReporting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center transition-colors shadow-sm"
              >
                {isReporting ? 'Reporting...' : 'Yes, Report'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportButton;