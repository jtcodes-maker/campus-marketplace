"use client";

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import GigCard from '@/components/GigCard';
import { useSearchParams, useRouter } from 'next/navigation';

// The categories for our filter buttons!
const CATEGORIES = ['All', 'Tutoring', 'Textbooks', 'Electronics', 'Clothing', 'Other'];

function MarketplaceFeed() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category'); // Grab the category from the URL
  const router = useRouter();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // Build the URL dynamically based on what filters are active
        let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/listings`;
        const params = [];
        
        if (searchQuery) params.push(`search=${searchQuery}`);
        if (categoryQuery && categoryQuery !== 'All') params.push(`category=${categoryQuery}`);
        
        // If we have filters, attach them to the endpoint!
        if (params.length > 0) {
          endpoint += `?${params.join('&')}`;
        }

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
  }, [searchQuery, categoryQuery]); // Re-run whenever the search OR category changes!

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500 p-4 bg-red-50 rounded-md">{error}</div>;
  }

  return (
    <div>
      {/* HEADER & CLEAR SEARCH BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular on Campus'}
        </h1>
        
        {searchQuery && (
          <button 
            onClick={() => router.push(categoryQuery ? `/?category=${categoryQuery}` : '/')} 
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          // Check if this specific button is the currently selected one
          const isActive = categoryQuery === cat || (!categoryQuery && cat === 'All');
          
          return (
            <button
              key={cat}
              onClick={() => {
                // If they click "All", just remove the category from the URL entirely
                if (cat === 'All') {
                  router.push(searchQuery ? `/?search=${searchQuery}` : '/');
                } else {
                  // Keep their search word if they have one, but switch the category
                  router.push(searchQuery ? `/?search=${searchQuery}&category=${cat}` : `/?category=${cat}`);
                }
              }}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors border ${
                isActive 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      
      {/* LISTINGS GRID */}
      {listings.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No items found matching your filters.</p>
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