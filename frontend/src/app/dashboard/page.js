"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listings/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyListings(response.data);
      } catch (err) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [router]);

  // Handle the Delete Action
  const handleDelete = async (listingId) => {
    // Standard browser confirmation popup
    if (!window.confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted item from the screen instantly without refreshing the page!
      setMyListings(myListings.filter(listing => listing._id !== listingId));
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-green-600">Loading Dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <Link 
          href="/create-listing" 
          className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
        >
          Post New Gig
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {myListings.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            You haven't posted any items yet. 
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {myListings.map((listing) => (
              <li key={listing._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                
                {/* Left Side: Image & Info */}
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={listing.images?.length > 0 ? listing.images[0] : 'https://placehold.co/100x100?text=No+Image'} 
                      alt={listing.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Link href={`/listing/${listing._id}`} className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors">
                      {listing.title}
                    </Link>
                    <div className="text-sm text-gray-500 flex space-x-3 mt-1">
                      <span className="font-semibold text-gray-700">N${listing.price}</span>
                      <span>•</span>
                      <span>{listing.category}</span>
                      <span>•</span>
                      <span className={listing.status === 'Active' ? 'text-green-600' : 'text-red-500'}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Link href={`/listing/${listing._id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Listing">
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                  <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors" title="Edit Listing (Coming Soon)">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(listing._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Listing">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}