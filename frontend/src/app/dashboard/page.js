"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch the user's items when the page loads
  useEffect(() => {
    const fetchMyListings = async () => {
      // Security Check: Grab the user's secret token
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If they aren't logged in, kick them to the login page!
        router.push('/login');
        return;
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

                {/* Delete Button */}
                <button 
                  onClick={() => handleDelete(listing._id)}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>

              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}