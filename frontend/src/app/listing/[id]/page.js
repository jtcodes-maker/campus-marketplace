"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Star, MessageSquare, MapPin, X } from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  // Listing State
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat Box State
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatSuccess, setChatSuccess] = useState(false);

  // Fetch the listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
        setListing(response.data);
      } catch (err) {
        setError('Failed to load this gig. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  // Handle sending the message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // 1. Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You need to be logged in to contact sellers!");
      router.push('/login');
      return;
    }

    setSending(true);
    try {
      // 2. Send the message to our new backend route
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        {
          receiverId: listing.seller._id,
          listingId: listing._id,
          text: message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // 3. Show a success message and close the box
      setChatSuccess(true);
      setMessage('');
      setTimeout(() => setShowChat(false), 3000); // Hide after 3 seconds
    } catch (err) {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-green-600 font-bold">Loading gig details...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!listing) return null;

  const imageUrl = listing.images?.length > 0 ? listing.images[0] : 'https://placehold.co/800x500/e2e8f0/475569?text=No+Image';

  return (
    <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-6">
      <div className="flex flex-col md:flex-row">
        
        {/* Left Side: Image */}
        <div className="md:w-3/5 bg-gray-100 min-h-[300px]">
          <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
        </div>

        {/* Right Side: Details & Action */}
        <div className="md:w-2/5 p-8 flex flex-col">
          
          <div className="uppercase tracking-wide text-sm text-green-600 font-bold mb-1">{listing.category}</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">{listing.title}</h1>

          <div className="flex items-center text-yellow-500 mb-6">
            <Star className="w-5 h-5 fill-current" /><span className="ml-1 font-bold text-gray-700">5.0</span>
          </div>

          <div className="text-4xl font-bold text-gray-900 mb-6 border-b pb-6">N${listing.price}</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 mb-8 whitespace-pre-line leading-relaxed">{listing.description}</p>

          {/* Seller Profile Box */}
          <div className="mt-auto bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">About the Seller</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xl font-bold">
                {listing.seller.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{listing.seller.name}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1"><MapPin className="w-3 h-3 mr-1" />{listing.seller.university}</div>
              </div>
            </div>
          </div>

          {/* --- THE CHAT INTERFACE --- */}
          {!showChat ? (
            <button 
              onClick={() => setShowChat(true)}
              className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center shadow-md"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Contact Seller
            </button>
          ) : (
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-inner relative mt-2">
              <button onClick={() => setShowChat(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
              
              {chatSuccess ? (
                <div className="text-center py-6 text-green-600 font-bold">Message sent to {listing.seller.name.split(' ')[0]}!</div>
              ) : (
                <form onSubmit={handleSendMessage}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message {listing.seller.name.split(' ')[0]}</label>
                  <textarea
                    required
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi, is this still available?"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3 text-sm"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gray-900 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-sm disabled:bg-gray-400"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          )}
          {/* -------------------------- */}
          
          <p className="text-center text-xs text-gray-400 mt-3">Never pay outside of the campus meet-up!</p>
        </div>
      </div>
    </div>
  );
}