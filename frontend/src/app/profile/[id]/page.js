"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import GigCard from '@/components/GigCard';
import { User as UserIcon, ShieldCheck, Package } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams(); // Grab the seller's ID from the URL
  const [profileData, setProfileData] = useState({ seller: null, listings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listings/seller/${id}`);
        setProfileData(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load this user's profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !profileData.seller) {
    return <div className="text-center mt-20 text-red-500 font-bold text-xl">{error || 'User not found'}</div>;
  }

  const { seller, listings } = profileData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Seller Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="h-32 bg-green-600 w-full"></div> {/* A nice green banner */}
        <div className="px-6 sm:px-8 pb-8">
          
          {/* Avatar and Stats Row (Uses negative margin instead of absolute positioning!) */}
          <div className="flex justify-between items-end -mt-12 mb-4 relative z-10">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md text-3xl text-green-700 font-bold">
              {seller.name.charAt(0)}
            </div>
            
            <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded-lg font-semibold flex items-center mb-1">
              <Package className="w-5 h-5 mr-2 text-green-600" />
              {listings.length} Active {listings.length === 1 ? 'Listing' : 'Listings'}
            </div>
          </div>
          
          {/* Seller Name and Verified Badge */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{seller.name}</h1>
            <div className="flex items-center mt-2 text-gray-600 font-medium">
              <ShieldCheck className="w-5 h-5 text-green-500 mr-1" /> Verified Student
            </div>
          </div>

        </div>
      </div>

      {/* Seller's Listings Grid */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">More from {seller.name.split(' ')[0]}</h2>
      
      {listings.length === 0 ? (
        <p className="text-gray-500 py-10">This user has no active listings.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <GigCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
      
    </div>
  );
}