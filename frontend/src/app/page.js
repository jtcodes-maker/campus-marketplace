"use client"; // This tells Next.js we need to use React state and effects here

import { useState, useEffect } from 'react';
import axios from 'axios';
import GigCard from '@/components/GigCard';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search'); // This grabs "?search=xyz" from the URL
  const router = useRouter();
  // 1. Set up state to hold our data
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch the data when the page loads
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Create the endpoint URL. If there is a search query, attach it!
      const endpoint = searchQuery 
        ? `${process.env.NEXT_PUBLIC_API_URL}/listings?search=${searchQuery}`
        : `${process.env.NEXT_PUBLIC_API_URL}/listings`;
        // We use the environment variable we set up earlier!
        const response = await axios.get(endpoint);
        setListings(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to load marketplace items. Is your backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery]); // The empty array means this only runs once when the page loads

  // 3. Show a loading spinner while fetching
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // 4. Show an error message if the backend is down
  if (error) {
    return (
      <div className="text-center mt-10 text-red-500 p-4 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  // 5. Render the actual marketplace feed!
  return (
    <div>
      {/* --- DYNAMIC HEADER WITH CLEAR BUTTON --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular on Campus Right Now'}
        </h1>
        {/* Only show the Clear Search button if they actually searched for something */}
        {searchQuery && (
          <button 
            onClick={() => router.push('/')} 
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>
      {/* -------------------------------------- */}
      
      {listings.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No items for sale yet. Be the first to post!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Loop through every listing in the database and create a GigCard for it */}
          {listings.map((listing) => (
            <GigCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}