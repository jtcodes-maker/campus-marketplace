"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, PlusCircle, Edit, Calendar, X } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NEW: Availability State ---
  const [isAvailable, setIsAvailable] = useState(true);
  const [awayMessage, setAwayMessage] = useState('');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // --- NEW: Fetch their current availability ---
  const fetchAvailability = async (userId) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listings/seller/${userId}`);
      if (res.data.seller) {
        setIsAvailable(res.data.seller.isAvailable !== false); // Defaults to true
        setAwayMessage(res.data.seller.awayMessage || '');
      }
    } catch (err) {
      console.error("Failed to load availability", err);
    }
  };

  // --- NEW: Save the availability to the backend ---
  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/availability`, {
        isAvailable,
        awayMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAvailabilityModal(false);
      alert("Availability updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update availability.");
    } finally {
      setSavingAvailability(false);
    }
  };

  // 1. Fetch the user's items when the page loads
  useEffect(() => {
    const fetchMyListings = async () => {
      // Security Check: Grab the user's secret token AND their user data
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        // If they aren't logged in, kick them to the login page!
        router.push('/login');
        return;
      }

      // --- NEW: Fetch their availability status using their ID! ---
      if (userStr) {
        const user = JSON.parse(userStr);
        fetchAvailability(user.id || user._id);
      }

      try {
        // Ask the backend for ONLY this user's items
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listings/me`, {
          headers: { Authorization: `Bearer ${token}` } // Show our ID badge to the backend
        });
        setMyListings(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load your items. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [router]);

  // 2. The Delete Function
  const handleDelete = async (listingId) => {
    // Double-check they actually want to delete it
    const confirmDelete = window.confirm("Are you sure you want to delete this listing? This cannot be undone.");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      
      // Tell the backend to delete it from MongoDB
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the screen instantly by filtering out the deleted item
      setMyListings(myListings.filter(listing => listing._id !== listingId));
      
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the listing. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <Link href="/create-listing" className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors">
          <PlusCircle className="w-5 h-5 mr-2" /> Post New Gig
        </Link>
      </div>

      {/* --- NEW: Availability Banner --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Seller Status</h2>
          <p className="text-sm text-gray-500">Let buyers know if you are available to respond to messages.</p>
        </div>
        <button 
          onClick={() => setShowAvailabilityModal(true)}
          className={`mt-4 sm:mt-0 flex items-center px-5 py-2 rounded-md font-bold border transition-colors ${isAvailable ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          {isAvailable ? 'Available' : 'Away'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 text-center font-medium">
          {error}
        </div>
      )}

      {myListings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">You haven't posted anything yet!</h2>
          <p className="text-gray-500 mb-6">Got old textbooks, a bike, or tutoring skills? Turn them into cash.</p>
          <Link href="/create-listing" className="text-green-600 font-semibold hover:underline">
            Click here to create your first listing →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {myListings.map((listing) => (
              <li key={listing._id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 transition-colors">
                
                {/* Item Info */}
                <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img 
                      src={listing.images[0] || 'https://via.placeholder.com/150'} 
                      alt={listing.title} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                    <p className="text-sm text-gray-500">{listing.category} • N${listing.price}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Link 
                    href={`/edit-listing/${listing._id}`}
                    className="flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(listing._id)}
                    className="flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>

              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- NEW: Availability Modal --- */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-2xl">
            
            {/* Close Button */}
            <button onClick={() => setShowAvailabilityModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit your availability</h3>

            {/* Toggle Switch Section */}
            <div className="mb-6 flex items-start justify-between">
              <div className="pr-4">
                <label className="font-bold text-gray-900 block mb-1">All buyers can contact me</label>
                <p className="text-sm text-gray-500">Turn this off if you are on vacation or have exams and cannot reply quickly.</p>
              </div>
              
              {/* Custom Animated Toggle Switch */}
              <div 
                onClick={() => {
                  setIsAvailable(!isAvailable);
                  if (isAvailable) setAwayMessage(''); // Clear message if turning back on
                }}
                className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isAvailable ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </div>
            </div>

            {/* Away Message Textbox */}
            <div className="mb-8">
              <label className="font-bold text-gray-900 block mb-1">Add a message (Optional)</label>
              <p className="text-sm text-gray-500 mb-2">Buyers will see this message on your profile and Gig pages.</p>
              <textarea
                value={awayMessage}
                onChange={(e) => setAwayMessage(e.target.value)}
                disabled={isAvailable}
                placeholder={isAvailable ? "Turn off availability to leave an away message." : "E.g., Studying for finals! I will reply to messages next Friday."}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:text-gray-400"
                rows="3"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAvailabilityModal(false)} 
                className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAvailability} 
                disabled={savingAvailability} 
                className="px-6 py-2 font-bold text-white bg-green-600 hover:bg-green-700 rounded-md disabled:bg-green-400 transition-colors"
              >
                {savingAvailability ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}