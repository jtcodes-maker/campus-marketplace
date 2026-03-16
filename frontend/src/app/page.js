"use client";

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import GigCard from '@/components/GigCard';
import { useSearchParams, useRouter } from 'next/navigation';

// 1. We move the main logic into its own component
function MarketplaceFeed() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const router = useRouter();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // The dynamic endpoint!
        const endpoint = searchQuery 
          ? `${process.env.NEXT_PUBLIC_API_URL}/listings?search=${searchQuery}`
          : `${process.env.NEXT_PUBLIC_API_URL}/listings`;

        const response = await axios.get(endpoint);
        setListings(response.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to load marketplace items. Is your backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500 p-4 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* DYNAMIC HEADER WITH CLEAR BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular on Campus Right Now'}
        </h1>
        
        {searchQuery && (
          <button 
            onClick={() => router.push('/')} 
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>
      
      {listings.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No items found matching your search.</p>
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

// 2. We wrap it in Suspense to keep Next.js happy during the cloud build!
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <MarketplaceFeed />
    </Suspense>
  );
}